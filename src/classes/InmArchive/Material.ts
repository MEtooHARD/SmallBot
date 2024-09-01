import { ButtonStyle, Colors, EmbedImageData, MessageCreateOptions } from "discord.js";
import ButtonRow from "../ActionRow/ButtonRow";
import { InmArchive, MaterialSchema } from "./InmArchive";
import { atUser } from "../../functions/discord/mention";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { fetchChannel } from "../../functions/discord/fetch";
import { SupervisorGuildId } from "../../app";
import { supabase } from "../../supabase";

export class Material {
    static readonly InsertRealtimeChannel = supabase.channel('insert_review');
    static readonly DiscordInsertReviewChannelId = '1279438389506080872';

    readonly props: MaterialSchema['Row'];

    constructor(payload: MaterialSchema['Row']) {
        this.props = payload;
    }

    ReviewMessage(): MessageCreateOptions {
        let description: string | undefined,
            image: EmbedImageData | undefined = undefined,
            color: number;

        if (this.props.type === 'txt')
            description = this.props.content;
        else
            image = { url: this.props.content };

        color = Material.StatusColorMap[this.props.status as Material.Status]
            || Material.DefaultColor;

        return {
            embeds: [{
                color: color,
                author: { name: 'Inm Archive' },
                title: this.props.name,
                description: description,
                fields: [
                    { name: 'type', value: this.props.type, inline: true },
                    { name: 'uplaoder', value: atUser(this.props.uploader), inline: true },
                    { name: 'uuid', value: `\`${this.props.id}\``, inline: true }
                ],
                image: image,
            }],
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

        if (channel?.isTextBased())
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
