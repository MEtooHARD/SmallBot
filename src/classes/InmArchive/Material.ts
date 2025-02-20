import { APIEmbed, ButtonStyle, Colors, InteractionUpdateOptions, MessageCreateOptions } from "discord.js";
import ButtonRow from "../ActionRow/ButtonRow";
import { InmArchive, MaterialSchema } from "./InmArchive";
import { atUser } from "../../functions/discord/mention";
import { PostgrestSingleResponse, RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { fetchChannel } from "../../functions/discord/fetch";
import { SupervisorGuildId } from "../../app";
import { supabaseClient } from "../../supabase";

export class Material {
    static readonly InsertRealtimeChannel = supabaseClient.channel('insert_review');
    static readonly DiscordInsertReviewChannelId = '1279438389506080872';

    readonly props: MaterialSchema['Row'];

    constructor(payload: MaterialSchema['Row']) {
        this.props = payload;
    };

    setStatus(status: Material.Status) { this.props.status = status; }

    static async upload(material: MaterialSchema['Insert']): Promise<boolean> {
        const { error } = await InmArchive.database
            .from('material')
            .insert({
                name: material.name,
                content: material.content,
                type: material.type,
                uploader: material.uploader
            });
        if (error) console.log(error);
        return !error;
    }

    static async fetch(uuid: string): Promise<PostgrestSingleResponse<MaterialSchema['Row']>> {
        return await InmArchive.database
            .from('material')
            .select('*')
            .eq('id', uuid)
            .limit(1)
            .single();
    }

    async update(): Promise<PostgrestSingleResponse<null>> {
        return await InmArchive.database
            .from('material')
            .update(this.props)
            .eq('id', this.props.id);
    };

    static OverviewCard = (props: Pick<MaterialSchema['Insert'], 'content' | 'type' | 'name'>)
        : APIEmbed => ({
            color: Colors.Aqua,
            author: { name: 'Inm Archive' },
            title: 'Overview',
            fields: [
                { name: 'name', value: props.name, inline: true },
                { name: 'type', value: props.type, inline: true },
                { name: 'content', value: props.content }
            ],
        });

    static RecievedCard = (): APIEmbed => ({ color: Colors.Green, title: 'Recieved' });

    Card = (): APIEmbed => ({
        color: Material.StatusColorMap[this.props.status as Material.Status] || Material.DefaultColor,
        author: { name: 'Inm Archive' },
        title: this.props.name,
        description: this.props.type === 'txt' ? this.props.content : undefined,
        fields: [
            { name: 'type', value: this.props.type, inline: true },
            { name: 'uplaoder', value: atUser(this.props.uploader), inline: true },
            { name: 'uuid', value: `\`${this.props.id}\``, inline: true }
        ],
        image: this.props.type === 'txt' ? undefined : { url: this.props.content },
    });

    ReviewMessage(): MessageCreateOptions & InteractionUpdateOptions {
        return {
            embeds: [this.Card()],
            components: this.ReviewComponents()
        };
    };

    ReviewComponents(): ButtonRow[] {
        if (this.props.status === Material.Status.Pending) {
            return [new ButtonRow([
                {
                    label: 'Approve', style: ButtonStyle.Success,
                    customId: Material.ReviewCustomId(Material.ReviewAction.Approve, this.props.id)
                },
                {
                    label: 'Reject', style: ButtonStyle.Danger,
                    customId: Material.ReviewCustomId(Material.ReviewAction.Reject, this.props.id)
                }
            ])];
        } else {
            return [];
        }
    };

    static async handleInsert(
        payload: RealtimePostgresInsertPayload<MaterialSchema['Row']>
    ): Promise<void> {
        const [error, channel] = await fetchChannel(
            SupervisorGuildId,
            InmArchive.DiscordMaterialAddCh);

        if (channel && channel.isTextBased() && !channel.isDMBased())
            channel.send(new Material(payload.new).ReviewMessage());
    };
};

export namespace Material {
    export enum ReviewAction { Approve, Reject };

    export enum Status {
        Approved = 0,
        Pending = 1,
        Rejected = 2
    };

    export const StatusColorMap = {
        [Status.Approved]: Colors.Green,
        [Status.Pending]: Colors.Yellow,
        [Status.Rejected]: Colors.Red
    };
    export const DefaultColor = Colors.LightGrey;

    export const ReviewCustomId =
        (action: ReviewAction, uuid: string) =>
            `[InmArchive][Review][${action}][${uuid}]`;
}
