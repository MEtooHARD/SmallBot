import { Colors, EmbedData } from "discord.js";
import {HelpCenter} from "../../../classes/HelpCenter";

const OrderList = (): EmbedData => {
    return {
        author: { name: HelpCenter.serviceName },
        color: Colors.DarkGreen,
        title: 'Order List',
        description: 'Welcome to Help Center! Here you can learn about some use of my functions. ',
        footer: { text: new Date().toLocaleDateString() }
    }
}

export = OrderList;