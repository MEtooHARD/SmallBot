import chalk from "chalk";
import { BaseInteraction, Client, Colors, Guild, GuildMember, Message, MessageComponentInteraction, PermissionFlagsBits, PermissionsBitField, TextChannel, VoiceState } from "discord.js";
import { botConfig, Services, session, shouldLogIgnoredCustomID } from "../app";
import { tryCatch } from "../classes/Basic/GeneralTypes";
import { Manager } from "../classes/Basic/Manager";
import { MediaStorage } from "../classes/ImageStorage";
import { Grok } from "../classes/LLM/Grok_";
import { MessageCommand } from "../classes/MessageFeature";
import { fUCKoFF } from "../commands/msg/commands/fUCKoFF";
import { quit } from "../commands/msg/commands/quit";
import { say } from "../commands/msg/commands/say";
import { InmArchive } from "../features/InmArchive";
import { OrderList } from "../features/OrderList";
import { Referendum } from "../features/Referendum";
import { TimeStamp } from "../functions/discord/mention";
import { getSvcInfo } from "../functions/discord/service";
import { doAfterSec } from "../functions/general/delay";
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from "../utilities";
import { handleMessageContextMenuCommand } from "./interactionCreate/MessagContextMenu";
import { handleSlashCommand } from "./interactionCreate/SlashCommand";
import { handleUserContextMenuCommand } from "./interactionCreate/UserContextMenu";
import autocomplete from "./interactionCreate/autocomplete";
import button from "./interactionCreate/button";
import menu from "./interactionCreate/menu";
import modal from "./interactionCreate/modal";


const listCommand = (list: IterableIterator<string>) => [...list].map(name => chalk.blue(name)).join(', ');
export const handleClientReady = async (client: Client): Promise<void> => {
    console.log('[djs client] ' + chalk.green('ready'));
    console.log(`[djs client] logged in, ${chalk.bgGreen(session)}`);
    console.log(`[djs client] id: ${chalk.bgGreen(client.user?.id)}`);
    console.log(`[djs client] name: ${chalk.bgGreen(client.user?.username)}`);
    console.log(`${SlashCommands.size()} slsh cmd:`, `${listCommand(SlashCommands.keys())}`);
    console.log(`${MessageMenuCommands.size()} msg menu:`, `${listCommand(MessageMenuCommands.keys())}`);
    console.log(`${UserMenuCommands.size()} usr menu:`, `${listCommand(UserMenuCommands.keys())}`);

    if (Services.ImageStorage) MediaStorage.init();
    // if (Services.Grok) Grok.init();
}


const MCommands: MessageCommand[] = (() => {
    const list = [say];
    return list;
})();
const DMCommands: MessageCommand[] = [
    quit, fUCKoFF,
]
export const handleMessageCreate = async (message: Message) => {
    const [commandInfo, error] = MessageCommand.parseCommand(message.content);
    if (commandInfo === null) { // non-command
        return {
            handled: true,
            success: true
        }
    } else { // command
        const command = commandInfo.level === 'general'
            ? MCommands.find(cmd => cmd.name === commandInfo?.command)
            : DMCommands.find(cmd => cmd.name === commandInfo?.command);
        if (command) { // valid command
            if (command.param.required && commandInfo.params.length === 0) {
                tryCatch(message.reply({
                    content: `This command requires some parameters: \n${command.param.pattern}`
                }));
                return {
                    handled: true,
                    success: true,
                };
            }
            return command.exe(message, commandInfo);
        } else {  // invalid command
            tryCatch(message.reply({ content: `Unknown command: ${commandInfo.command}` }));
            return {
                handled: true,
                success: true,
            };

        }
    }
}


export const handleMessageDelete = async (message: Message): Promise<void> => {
    // console.log(message);
};


type FeatureHandler = (interaction: MessageComponentInteraction, svcInfo: string[]) => Promise<void>;
const FeatureManager = new Manager<FeatureHandler>([
    ['InmArchive', InmArchive],
    ['OrderList', OrderList],
    ['Referendum', Referendum],
]);
export const handleInteractionCreate = async (interaction: BaseInteraction): Promise<void> => {

    if (interaction.isChatInputCommand())
        handleSlashCommand(interaction);
    else if (interaction.isMessageContextMenuCommand())
        handleMessageContextMenuCommand(interaction);
    else if (interaction.isUserContextMenuCommand())
        handleUserContextMenuCommand(interaction);
    else if (interaction.isAutocomplete())
        autocomplete(interaction);
    else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        if (!interaction.customId.startsWith('$')) {
            console.log(interaction.customId);
            const svcInfo = getSvcInfo(interaction.customId);
            if (svcInfo.length) {
                const feature = FeatureManager.get(svcInfo[0]);
                if (feature)
                    feature(interaction as MessageComponentInteraction, svcInfo)
                else {
                    console.log('service failed: ' + interaction.customId);
                    await interaction.reply({ flags: 'Ephemeral', content: 'service not found' });
                }
            } else {
                if (interaction.isButton()) await button(interaction);
                else if (interaction.isModalSubmit()) await modal(interaction);
                else if (interaction.isAnySelectMenu()) await menu(interaction);
            }
        } else {
            if (shouldLogIgnoredCustomID) console.log(interaction.customId);
        }
    }
};


export const handleVoiceStateUpdate = async (oldState: VoiceState, newState: VoiceState): Promise<void> => {
    const newChPermissions = newState.channel?.permissionsFor(botConfig.id);
    const oldChPermissions = oldState.channel?.permissionsFor(botConfig.id);

    /* join */
    if (oldState.channel === null
        && newState.channel
        && newState.channel.members.size > 1
        && newChPermissions?.has(PermissionFlagsBits.SendMessages))
        newState.channel.send({
            embeds: [{
                color: Colors.Green,
                description: `${newState.member?.displayName} joined the voice.\nat ${TimeStamp.gen(Date.now())}`
            }]
        });

    /* left */
    if (newState.channel === null
        && oldState.channel
        && oldState.channel.members.size > 1
        && oldChPermissions?.has(PermissionFlagsBits.SendMessages))
        oldState.channel.send({
            embeds: [{
                color: Colors.Red,
                description: `${newState.member?.displayName} left the voice.\nat ${TimeStamp.gen(Date.now())}`
            }]
        });
}


export const handleGuildCreate = async (guild: Guild): Promise<void> => {
    const me = await guild.members.fetch(guild.client)
    if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {
        try {
            (guild.channels.cache
                .filter(ch => ch instanceof TextChannel && ch.permissionsFor(me)
                    .has(PermissionsBitField.Flags.SendMessages))
                .map(ch => ch)[0] as TextChannel)
                .send('再不給權限啊');
        } catch (e) { };
        guild.leave();
    }
}


export const handleGuildMemberAdd = (member: GuildMember) => {
    if (member.guild.systemChannel)
        member.guild.systemChannel.send('真真高興地見到你||（棒讀||');
}


export const handleGuildMemberRemove = async (member: GuildMember) => {
    console.log(`${member.user.username} left ${member.guild.name}`);
    if (member.guild.systemChannel) {
        // await member.guild.systemChannel.send('珍重再見');
        await member.guild.systemChannel.send(`輕輕的 ${member.user.username} 走了，有沒有一點尊嚴啊`);
        doAfterSec(async () => {
            await member.guild.systemChannel?.send('~~根本笑死~~');
        }, 10);
    }
}
