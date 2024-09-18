import { Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

type ContextType = Message;

type ResponseType = MessageComponentInteraction | ModalSubmitInteraction;

interface Dialog<C extends ContextType, R extends ResponseType> {

}