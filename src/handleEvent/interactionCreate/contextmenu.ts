import { ContextMenuCommandInteraction } from "discord.js";

export const contextMenu = async (interaction: ContextMenuCommandInteraction) => {
  if (interaction.isUserContextMenuCommand()) {
    try {
      await interaction.deferReply({ ephemeral: true });
      await interaction.targetUser.send('👞🎙️');
      await interaction.editReply({ content: 'sent' });
    } catch (e) {
      await interaction.editReply({ content: 'failed' });
    }
  }
};