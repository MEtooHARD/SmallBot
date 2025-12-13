import chalk from "chalk";
import { BaseInteraction, Client, Colors, Guild, GuildMember, Message, MessageComponentInteraction, PermissionFlagsBits, PermissionsBitField, TextChannel, VoiceState } from "discord.js";
import { botConfig, client, Services, session, shouldLogIgnoredCustomID } from "../app";
import { ActivityManager } from "../classes/Activity";
import { tryCatch } from "../classes/Basic/GeneralTypes";
import { Manager } from "../classes/Basic/Manager";
import { MediaStorage } from "../classes/ImageStorage";
import { MessageCommand, Report } from "../classes/MessageFeature";
import { fUCKoFF } from "../commands/msg/commands/fUCKoFF";
import { quit } from "../commands/msg/commands/quit";
import { say } from "../commands/msg/commands/say";
import { t } from "../commands/msg/commands/t";
import { InmArchive } from "../features/InmArchive";
import { OrderList } from "../features/OrderList";
import { Referendum } from "../features/Referendum";
import { atUser, TimeStamp } from "../functions/discord/mention";
import { getSvcInfo } from "../functions/discord/service";
import { delaySec, doAfterSec } from "../functions/general/delay";
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from "../utilities";
import { handleAutoComplete } from "./interactionCreate/handleAutocomplete";
import { handleMessageContextMenuCommand, handleSlashCommand, handleUserContextMenuCommand } from "./interactionCreate/handleCommandInteractions";
import { handleButton, handleModal, handleSelectMenu } from "./interactionCreate/handleComponentInteractions";
import { reloadSC } from "../commands/msg/commands/reloadSC";


const listCommand = (list: IterableIterator<string>) => [...list].map(name => chalk.blue(name)).join(', ');
export const handleClientReady = async (client: Client): Promise<void> => {
    console.log('[djs client] ' + chalk.green('ready'));
    console.log(`[djs client] ${chalk.bgGreen(session)} session`);
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
    // list.push(reloadSC);
    if (session === 'dev') {
        list.push(t);
    }
    return list;
})();
const DMCommands: MessageCommand[] = [
    quit, fUCKoFF, reloadSC
]
export async function handleMessageCreate(message: Message): Promise<Report> {
    const activity = ActivityManager.getActivity(message.channel.id);
    if (activity) {
        activity.onMessage(message);
        return {
            success: true
        }
    }
    const [commandInfo, error] = MessageCommand.parseCommand(message.content);
    if (commandInfo === null) { // non-command
        return {
            handled: true,
            success: true
        }
    } else { // command
        const command = commandInfo.level === 'general'
            ? MCommands.find(cmd => cmd.name === commandInfo.command)
            : DMCommands.find(cmd => cmd.name === commandInfo.command);
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
        handleAutoComplete(interaction);
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
                if (interaction.isButton()) await handleButton(interaction);
                else if (interaction.isModalSubmit()) await handleModal(interaction);
                else if (interaction.isAnySelectMenu()) await handleSelectMenu(interaction);
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


export async function handleGuildMemberAdd(member: GuildMember) {
    if (member.guild.systemChannel) {
        const [msg1, error] = await tryCatch(member.guild.systemChannel.send('Some badass landed.'));
        if (msg1) {
            await member.guild.systemChannel.sendTyping();
            await delaySec(3);
            await tryCatch(member.guild.systemChannel.send(`Who is the badass? ||${atUser(member.id)}||`));
        }
    }
}


export const handleGuildMemberRemove = async (member: GuildMember) => {
    console.log(`${member.user.username} left ${member.guild.name}`);
    if (member.id !== member.client.user.id && member.guild.systemChannel) {
        // await member.guild.systemChannel.send('珍重再見');
        await member.guild.systemChannel.send(`輕輕的 ${member.user.username} 走了，有沒有一點尊嚴啊`);
        doAfterSec(async () => {
            await member.guild.systemChannel?.send('~~根本笑死~~');
        }, 10);
    }
}
