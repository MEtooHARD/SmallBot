import { MessageComponentInteraction } from "discord.js";
import { Material } from "../classes/InmArchive/Material";

export const InmArchive = async (
    interaction: MessageComponentInteraction,
    svcInfo: string[]
) => {
    const action: Material.ReviewAction = Number(svcInfo[2]);
    const uuid: string = svcInfo[3];
    const { data, error } = await Material.fetch(uuid);
    if (data) {
        const material = new Material(data);
        if (action === Material.ReviewAction.Approve)
            material.setStatus(Material.Status.Approved);
        else if (action === Material.ReviewAction.Reject)
            material.setStatus(Material.Status.Rejected);

        const { error } = await material.update();

        if (!error)
            interaction.update(material.ReviewMessage());
        else
            console.log(error);
    } else {
        console.log(error);
    }
};