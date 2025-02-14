import {
    ApplicationCommand,
    CacheTypeReducer,
    CommandInteraction,
    DMChannel,
    Guild,
    GuildMember,
    GuildResolvable,
    GuildTextBasedChannel,
    InteractionContextType,
    Message,
    Snowflake,
    TextBasedChannel,
    TextChannel
} from "discord.js";


export function isGuildMessage(msg: Message)
    : msg is Message & { guildId: string, channel: TextChannel } {
    return !!msg.guildId && msg.channel instanceof TextChannel;
}

export const CommandInteractionIn = {
    Guild: (interaction: CommandInteraction)
        : interaction is CommandInteraction & {
            command: ApplicationCommand | ApplicationCommand<{ guild: GuildResolvable }>,
            commandGuildId: Snowflake,
            context: InteractionContextType.Guild,
            ephemeral: boolean,
            guild: CacheTypeReducer<'cached', Guild, null> | null,
            guildId: Snowflake,
            channel: CacheTypeReducer<'cached', GuildTextBasedChannel | null, GuildTextBasedChannel | null, GuildTextBasedChannel | null, TextBasedChannel | null>,
            member: CacheTypeReducer<'cached', GuildMember>,
        } => {
        return interaction.context === InteractionContextType.Guild;
    },
    BotDM: (interaction: CommandInteraction)
        : interaction is CommandInteraction & {
            command: ApplicationCommand | ApplicationCommand<{ dm: boolean }>, // DM context
            context: InteractionContextType.BotDM,
            ephemeral: boolean,
            guild: null, // No guild in DM context
            guildId: null, // No guildId in DM context
            channel: CacheTypeReducer<'cached', DMChannel>, // DMChannel or null
            member: null, // No member in DM context
        } => {
        return interaction.context === InteractionContextType.BotDM;
    },
    PrivateChannel: (interaction: CommandInteraction)
        : interaction is CommandInteraction & {
            command: ApplicationCommand | ApplicationCommand<{ group: true }>, // Group context
            context: InteractionContextType.PrivateChannel,
            ephemeral: boolean,
            guild: null, // No guild in groups context
            guildId: null, // No guildId in groups context
            channel: CacheTypeReducer<'cached', TextChannel>, // TextChannel or null
            member: null, // No member in groups context
        } => {
        return interaction.context === InteractionContextType.PrivateChannel;
    }
};
