import { APIEmbed, EmbedBuilder } from "discord.js";

class Embed extends EmbedBuilder {
    constructor(data: APIEmbed) {
        super();
        if (data.url) this.setURL(data.url);
        if (data.title) this.setTitle(data.title);
        if (data.color) this.setColor(data.color);
        if (data.author) this.setAuthor(data.author);
        if (data.fields) this.setFields(data.fields);
        if (data.footer) this.setFooter(data.footer);
        if (data.image) this.setImage(data.image.url);
        if (data.thumbnail) this.setThumbnail(data.thumbnail.url);
        if (data.description) this.setDescription(data.description);
        if (data.timestamp) this.setTimestamp(Number(data.timestamp));
    }
}

export = Embed;