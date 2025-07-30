import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import { Client, Events, Guild, GuildMember, Interaction, Message, VoiceState } from 'discord.js';
import path from 'node:path';
import { on } from "./app";
import { InmArchive, MaterialSchema } from "./classes/InmArchive/InmArchive";
import { Report } from './classes/MessageFeature';
import { getDirectories } from "./functions/general/path";
import { handleClientReady, handleGuildCreate, handleGuildMemberAdd, handleGuildMemberRemove, handleInteractionCreate, handleMessageCreate, handleMessageDelete, handleVoiceStateUpdate } from "./handleEvent/misc";
import { HelpCenter } from './utilities';

export const loadHelpCenter = () => {
    HelpCenter;
    console.log('[Help Center] loaded');
};

export const onDiscordEvents = () => {
    on(Events.ClientReady, async (client: Client): Promise<Report> => {
        await handleClientReady(client);
        return {
            handled: true,
            success: true,
        };
    });
    on(Events.MessageCreate,
        async (message: Message): Promise<Report> => handleMessageCreate(message));
    on(Events.MessageDelete, async (message: Message): Promise<Report> => {
        await handleMessageDelete(message);
        return {
            handled: true,
            success: true,
        }
    });
    on(Events.InteractionCreate, async (interaction: Interaction): Promise<Report> => {
        await handleInteractionCreate(interaction);
        return {
            handled: true,
            success: true,
        };
    });
    on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState): Promise<Report> => {
        await handleVoiceStateUpdate(oldState, newState);
        return {
            handled: true,
            success: true,
        };
    });
    on(Events.GuildCreate, async (guild: Guild): Promise<Report> => {
        await handleGuildCreate(guild);
        return {
            handled: true,
            success: true,
        };
    });
    on(Events.GuildMemberAdd, async (member: GuildMember): Promise<Report> => {
        await handleGuildMemberAdd(member);
        return {
            handled: true,
            success: true,
        };
    });
    on(Events.GuildMemberRemove, async (member: GuildMember): Promise<Report> => {
        await handleGuildMemberRemove(member);
        return {
            handled: true,
            success: true,
        };
    });
}

export const onMongoDBEvents = () => {
    getDirectories(path.join(__dirname, 'events', 'mongoose'), true)
        .forEach(dir => { require(dir)(); });
}

export const onInmMaterialInsert = () => {
    InmArchive.Material.InsertRealtimeChannel
        .on<MaterialSchema['Row']>(REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
            { event: "INSERT", schema: 'public', table: 'material' },
            InmArchive.Material.handleInsert
        )
        .subscribe();
};