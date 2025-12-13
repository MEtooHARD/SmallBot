import { AutocompleteInteraction, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { ActivityManager } from "../../../classes/Activity";
import { Result_ } from "../../../classes/Basic/GeneralTypes";
import { ChatInputValidator, SlashCommand } from "../../../classes/Command";
import { Chat, ChatOptions } from "../../../classes/LLM/__Chat";
import { UniLLM } from "../../../classes/LLM/__Types";
import { AdapterNameMapping, AdapterProviders, ModelNameList } from "../../../classes/LLM/AdapterRegistry";
import { Grok } from "../../../classes/LLM/Grok/GrokAdapter";
import { LLMKeyring } from "../../../classes/LLM/Keyring";

const start_cmd_name = 'setup';

export class test extends SlashCommand {
    override activated = true;

    override guilds: string[] = ['1213341621542719548', '1146136373225586828'];

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(c => c
            .setName(start_cmd_name)
            .setDescription('Start a chat or change settings.')
            .addStringOption(option => option
                .setAutocomplete(true)
                .setName('provider')
                .setDescription('the LLM provider to use')
            )
            .addStringOption(option => option
                .setAutocomplete(true)
                .setName('model')
                .setDescription('the model to use')
            )
            .addBooleanOption(option => option
                .setName('reasoning_content')
                .setDescription('Include reasoning content in responses.')
            )
            .addBooleanOption(o => o
                .setName('stream')
                .setDescription('Enable streaming mode.')
            )
            .addBooleanOption(option => option
                .setName('incremental_history')
                .setDescription('Enable incremental history mode.')
            )
            .addBooleanOption(o => o
                .setName('show_usage')
                .setDescription('Show usage information.')
            )
            .addBooleanOption(o => o
                .setName('web_search')
                .setDescription('Enable web search integration.')
            )
        )
        .addSubcommand(c => c
            .setName('stop')
            .setDescription('Stop the current chat.')
        )

    override async complete(interaction: AutocompleteInteraction): Promise<void> {
        const subcommand_name = interaction.options.getSubcommand(true);
        switch (subcommand_name) {
            case start_cmd_name:
                if (interaction.options.getFocused(true).name === 'provider') {
                    const choices = Object.keys(AdapterProviders);
                    const filtered = choices.filter(choice => choice.startsWith(interaction.options.getFocused()));
                    interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
                    return;
                }
                const provider = interaction.options.getString('provider');
                const model = interaction.options.getFocused(); // should be 'model'

                const choices = provider
                    ? (AdapterProviders[provider as UniLLM.Providers] || [])  // 只取特定 provider
                    : Object.values(AdapterProviders).flat();

                const filtered = choices
                    .filter(adapter => adapter.model_info.Name.startsWith(model))
                    .map(adapter => ({ name: adapter.model_info.Name, value: adapter.model_info.Name }));

                interaction.respond(filtered);
                break;
            // no need for stop autocomplete
            //case 'stop':
        }
    }

    override verify: ChatInputValidator =
        (interaction: ChatInputCommandInteraction): Result_<string, string> => {
            return [interaction.user.id === '732128546407055452', 'You are not allowed to use this command.'];
        };

    override executor = async (interaction: ChatInputCommandInteraction<'cached'>) => {
        if (!interaction.channel?.id) {
            await interaction.reply('This command can only be used in a server channel.');
            return;
        }

        const subcommand = interaction.options.getSubcommand(true);

        const activity = ActivityManager.getActivity(interaction.channelId);
        const chat = activity instanceof Chat ? activity : null;

        // check it's chat
        if (activity && !chat) {
            interaction.reply('Some other activity is active in this channel:' + activity.name);
            return
        }

        // stop
        if (subcommand === 'stop') {
            if (chat) {
                ActivityManager.revokeActivity(interaction.channel.id, chat);
                interaction.reply('Deactivated.');
            } else {
                interaction.reply('No active Chat in this channel.\n' + '');
            }
            return;
        }

        // #region Grab Options
        const op_model_ = interaction.options.getString('model') || '';
        const op_model = ModelNameList.includes(op_model_) ? op_model_ : '';
        const op_stream = interaction.options.getBoolean('stream');
        const op_incremental_history = interaction.options.getBoolean('incremental_history');
        const op_show_usage = interaction.options.getBoolean('show_usage');
        const op_web_search = interaction.options.getBoolean('web_search');
        const op_reasoning_content = interaction.options.getBoolean('reasoning_content');

        const messages: string[] = [];

        const new_options: Partial<ChatOptions> = {};

        // determine options
        let current_options: ChatOptions | null = null;
        if (chat) {
            // If activity exists, current_options definitely exists
            current_options = chat.settings();
            new_options.adapter = op_model ? AdapterNameMapping[op_model] : current_options.adapter;
            new_options.stream = op_stream ?? current_options.stream;
            new_options.incremental_history = op_incremental_history ?? current_options.incremental_history;
            new_options.show_usage = op_show_usage ?? current_options.show_usage;
            new_options.web_search = op_web_search ?? current_options.web_search;
            new_options.reasoning_content = op_reasoning_content ?? (current_options.reasoning_content ?? false);
        } else {
            new_options.adapter = AdapterNameMapping[op_model] || Grok._4_fast_reasoning;
            new_options.stream = op_stream ?? true;
            new_options.incremental_history = op_incremental_history ?? true;
            new_options.show_usage = op_show_usage ?? true;
            new_options.web_search = op_web_search ?? false;
            new_options.reasoning_content = op_reasoning_content ?? false;
        }
        // #endregion

        if (!chat) {
            // #region Start New Chat
            const token = LLMKeyring.acquire(UniLLM.Providers.XAI, interaction.channel!.id)
            if (!token) { // no valid token
                interaction.reply('Unable to start with selected model: ' + new_options.adapter!.model_info.Name);
                return;
            }

            const [new_chat, error] = ActivityManager.registerActivity(
                interaction.channel!, () => new Chat(
                    token, {
                    adapter: new_options.adapter!,
                    stream: new_options.stream!,
                    incremental_history: new_options.incremental_history!,
                    show_usage: new_options.show_usage!,
                    web_search: new_options.web_search!,
                    reasoning_content: new_options.reasoning_content!,
                })
            );
            if (!new_chat) {
                await interaction.reply({ content: 'Failed to start chat: ' + error });
                return;
            }
            current_options = new_chat.settings();
            messages.push('Activated.');
            // #endregion
        } else {
            // #region Change Settings
            messages.push('Condiguration changed:');
            const old_options = current_options!;
            if (new_options.adapter!.Provider !== old_options.adapter.Provider) {
                const token = LLMKeyring.acquire(UniLLM.Providers.XAI, interaction.channelId);
                if (!token) {
                    messages.push('Unable to switch to selected model: ' + new_options.adapter!.model_info.Name);
                    messages.push(`Model remains the same that there's no viable token for the provider of desired model: \`${old_options.adapter.model_info.Name}\``);
                } else {
                    chat.update_token(token);
                }
            }
            // Apply new options
            chat.set(new_options as ChatOptions);
            current_options = old_options; // Keep old values for comparison display
            // #endregion
        }

        try {

            messages.push(change_or_not(
                'Model',
                current_options!.adapter?.model_info.Name || new_options.adapter!.model_info.Name,
                new_options.adapter!.model_info.Name
            ));
            messages.push(change_or_not(
                'Stream mode',
                current_options!.stream ?? new_options.stream,
                new_options.stream
            ));
            messages.push(change_or_not(
                'Incremental chat history',
                current_options!.incremental_history ?? new_options.incremental_history,
                new_options.incremental_history
            ));
            if (new_options.incremental_history) messages.push('-# Enable incremental chat history may effect model\'s understanding to the chat behavior');
            messages.push(change_or_not(
                'Show token/search usage',
                current_options!.show_usage ?? new_options.show_usage,
                new_options.show_usage
            ));
            messages.push(change_or_not(
                'Enable web search',
                current_options!.web_search ?? new_options.web_search,
                new_options.web_search
            ));
            messages.push(change_or_not(
                'Show reasoning content',
                current_options!.reasoning_content ?? new_options.reasoning_content,
                new_options.reasoning_content
            ));
            messages.push('');
            messages.push('-# Some settings may be overwritten/ignored by model specifications.');
        } catch (e) { console.error(e); }

        interaction.reply(messages.join('\n'));
    }
}

function change_or_not(item_name: string, current_value: string, new_value: string): string;
function change_or_not(item_name: string, current_value: boolean, new_value: boolean): string;
function change_or_not(item_name: string, current_value: boolean | string, new_value: boolean | string): string {
    return (current_value !== new_value) ? `${item_name}: ${current_value} -> ${new_value}` : `${item_name}: ${current_value}`;
}