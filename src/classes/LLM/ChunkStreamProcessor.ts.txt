import { FENCE_START_REGEX } from "../../utils/common_static";
import { UniLLM } from "./__Types";
import { MessagePayload, MessageCreateOptions } from "discord.js";

type ChunkTypeAndStage =
    | { chunk: UniLLM.ReasoningChunk, type: 'reasoning' }
    | { chunk: UniLLM.ContentChunk, type: 'content' }
    | { chunk: UniLLM.UsageChunk, type: 'usage' }
    | { chunk: UniLLM.RoleChunk, type: 'role' }
    | { chunk: UniLLM.FinishChunk, type: 'done' }
type CodeContext = null | {
    lang: string,
    chunk_type: 'content' | 'reasoning',
    code_stage: UniLLM.CodeStage
}

// #region Helpers
function typed_chunk_and_type(
    chunk: UniLLM.Chunk
): ChunkTypeAndStage {
    if ('reasoning' in chunk) {
        return { chunk, type: 'reasoning' };
    } else if ('content' in chunk) {
        return { chunk, type: 'content' };
    } else if ('usage' in chunk) {
        return { chunk, type: 'usage' };
    } else if ('finish_reason' in chunk) {
        return { chunk, type: 'done' };
    } else {
        // 'role' in chunk
        return { chunk, type: 'role' };
    }
}

function text_chunk(text: string, type: 'content' | 'reasoning',): UniLLM.ContentChunk | UniLLM.ReasoningChunk {
    return type === 'content' ? { content: text } : { reasoning: text };
}

function chunk_text(chunk: UniLLM.ContentChunk | UniLLM.ReasoningChunk): string {
    return ('content' in chunk) ? chunk.content : chunk.reasoning;
}

// #endregion


export class ChunkStreamProcessor {
    // #region GatherTextChunk
    /**
     * Gathers ContentChunk and ReasoningChunk into lines seperated by `\n`.
     * @param stream 
     */
    public static async * GatherWords(
        stream: AsyncIterable<UniLLM.Chunk>,
    ): AsyncGenerator<UniLLM.Chunk, void, unknown> {
        let prev_stage: UniLLM.ChunkType = 'role';
        let buffer = '';

        for await (const chunk of stream) {
            const { chunk: cur_chunk, type: cur_type } = typed_chunk_and_type(chunk);

            // Stage change: flush buffer BEFORE updating prev_stage
            if (prev_stage !== cur_type) {
                if ((prev_stage === 'content' || prev_stage === 'reasoning') && buffer.length > 0) {
                    yield text_chunk(buffer, prev_stage);
                    buffer = '';
                }
                prev_stage = cur_type;
            }

            // Pass through non-text chunks
            if (cur_type === 'done' || cur_type === 'usage' || cur_type === 'role') {
                yield cur_chunk;
                continue;
            }

            // Handle text chunks (content or reasoning)
            buffer += cur_type === 'content' ? cur_chunk.content : cur_chunk.reasoning;

            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep last incomplete line in buffer
            // Yield complete lines
            for (const line of lines)
                if (cur_type === 'content') yield { content: line };
                else yield { reasoning: line };
        }
    }
    // #endregion
    // #region MarkCode
    /**
     * marks lines as code: `start`/`middle`/`end` according to the presence of code fences(\`\`\`), otherwise just as it is
     * @param stream 
     */
    public static async * MarkCode(
        stream: AsyncIterable<UniLLM.Chunk>,
    ): AsyncGenerator<UniLLM.Chunk, void, unknown> {
        let prev_type: UniLLM.ChunkType = 'role';
        let code_block: boolean = false;
        let lang: string = '';

        for await (const chunk of stream) {
            // console.log('in mark code:', chunk);
            const { chunk: typed_chunk, type } = typed_chunk_and_type(chunk);
            const is_text_chunk = (type === 'content' || type === 'reasoning');
            // Stage change: reset code block state first
            if (prev_type !== type) {
                code_block = false;
                lang = '';
                prev_type = type;
                // Non-text chunks: yield as-is
                if (!is_text_chunk) {
                    yield chunk;
                    continue;
                }
                // Text chunks: check for start fence
                const text = type === 'content' ? typed_chunk.content : typed_chunk.reasoning;
                const start_fence = text.match(FENCE_START_REGEX);
                if (start_fence) {
                    lang = start_fence[1] || '';
                    code_block = true;
                    yield { ...text_chunk(text, type), code: 'start', lang };
                } else {
                    yield chunk;
                }
                continue;
            }
            // Stage continues: non-text chunks yield as-is
            if (!is_text_chunk) {
                yield chunk;
                continue;
            }

            const text = type === 'content' ? typed_chunk.content : typed_chunk.reasoning;
            // Stage continues: check for fence
            const fence = text.match(FENCE_START_REGEX);
            if (!fence) {
                yield code_block
                    ? { ...text_chunk(text, type), code: 'middle', lang }
                    : { ...text_chunk(text, type) };
            } else {
                if (fence[1]) { // start fence
                    lang = fence[1];
                    code_block = true;
                    yield { ...text_chunk(text, type), code: 'start', lang };
                } else if (code_block) { // end fence
                    yield { ...text_chunk(text, type), code: 'end', lang };
                    lang = '';
                    code_block = false;
                } else { // start fence without lang
                    lang = '';
                    code_block = true;
                    yield { ...text_chunk(text, type), code: 'start', lang };
                }
            }
        }
    }
    // #endregion

    // #region GatherCode
    /**
     * Gathers code chunks (start/middle/end) into complete code blocks.  
     * Non-code chunks or incomplete code blocks are left unchanged.
     * @param stream 
     */
    public static async * GatherCode(
        stream: AsyncIterable<UniLLM.Chunk>,
    ): AsyncGenerator<UniLLM.Chunk, void, unknown> {
        let buffer: (UniLLM.ContentChunk | UniLLM.ReasoningChunk)[] = [];
        let code_context: null | CodeContext = null;

        for await (const c of stream) {
            const { chunk, type } = typed_chunk_and_type(c);

            const is_non_code = type !== 'content' && type !== 'reasoning' || !('code' in chunk);
            const is_code_start = !is_non_code && chunk.code === 'start';

            // Flush incomplete code if: non-code chunk or new code block starts
            if ((is_non_code || is_code_start) && buffer.length > 0) {
                for (const c of buffer) yield c;
                buffer = [];
                code_context = null;
            }

            // Non-text or non-code chunks: pass through
            if (is_non_code) {
                yield c;
                continue;
            }

            // unexpected code chunk (direct mid/end chunk)
            if (!code_context && chunk.code !== 'start') {
                yield chunk;
                continue;
            }

            // handle code chunk
            switch (chunk.code) {
                case 'start':
                    code_context = {
                        lang: chunk.lang || '',
                        chunk_type: type,
                        code_stage: 'start'
                    }
                    buffer.push(chunk);
                    break;
                case 'middle':
                    buffer.push(chunk);
                    break;
                case 'end':
                    buffer.push(chunk);
                    // Combine and yield as 'complete'
                    yield {
                        ...text_chunk(buffer.map(chunk_text).join('\n'), code_context!.chunk_type),
                        code: 'complete',
                        lang: code_context!.lang
                    };
                    // Reset
                    buffer = [];
                    code_context = null;
                    break;
            }

        }

        // Flush incomplete code
        if (buffer.length > 0) {
            for (const c of buffer) yield c;
        }
    }
    // #endregion

    // #region GatherLines
    /**
     * Gathers plain text chunks to form bigger chunks based on threshold.  
     * Code chunks are passed through unchanged.
     * @param stream 
     */
    public static async * GatherTextLines(
        stream: AsyncIterable<UniLLM.Chunk>,
        len_limit: number
    ): AsyncGenerator<UniLLM.Chunk, void, unknown> {
        let buffer: (UniLLM.ContentChunk | UniLLM.ReasoningChunk)[] = [];
        let buffer_length = 0;
        let buffer_type: 'content' | 'reasoning' | null = null;

        for await (const chunk of stream) {
            const { chunk: typed_chunk, type } = typed_chunk_and_type(chunk);

            // Flush if: non-text/code chunk, stage change, or threshold exceeded
            const is_non_text_or_code = type !== 'content' && type !== 'reasoning' || ('code' in typed_chunk);
            const is_stage_change = buffer_type !== null && buffer_type !== type;
            const is_threshold_exceeded = buffer_length >= len_limit;

            if ((is_non_text_or_code || is_stage_change || is_threshold_exceeded) && buffer.length > 0) {
                yield text_chunk(buffer.map(chunk_text).join('\n'), buffer_type!);
                buffer = [];
                buffer_length = 0;
                buffer_type = null;
            }

            // Non-text or code chunks: pass through
            if (is_non_text_or_code) {
                yield chunk;
                continue;
            }

            // Update buffer type and add to buffer
            buffer_type = type;
            const text = type === 'content' ? typed_chunk.content : typed_chunk.reasoning;
            buffer.push(typed_chunk);
            buffer_length += text.length;
        }

        // Final flush
        if (buffer.length > 0)
            yield text_chunk(buffer.map(chunk_text).join('\n'), buffer_type!);
    }
    // #endregion

    // #region Filter
    public static async * Filter(
        stream: AsyncIterable<UniLLM.Chunk>,
        options: {
            include_reasoning: boolean
        }
    ): AsyncGenerator<UniLLM.Chunk, void, unknown> {
        for await (const c of stream) {
            const { chunk, type } = typed_chunk_and_type(c);

            switch (type) {
                case 'reasoning':
                    if (options.include_reasoning) yield chunk;
                    break;
                default:
                    yield chunk;
            }
        }
    }
    // #endregion

    // #region Finalize
    /**
     * Basically turns UniLLM Chunks into Discord message payloads.
     * @param stream 
     * @param collector 
     */
    public static async * Finalize(
        stream: AsyncIterable<UniLLM.Chunk>,
        collector: { content: string } | undefined
    ): AsyncGenerator<string | MessagePayload | MessageCreateOptions> {
        for await (const chunk of stream) {
            if ('content' in chunk && collector) // collect content
                collector.content += chunk.content + '\n';
            if ('code' in chunk) {
                // Complete code block: send as file
                if (chunk.code === 'complete') {
                    const text = 'content' in chunk ? chunk.content : chunk.reasoning;
                    const fileName = `code.${chunk.lang || 'txt'}`;
                    yield {
                        files: [{
                            attachment: Buffer.from(text),
                            name: fileName
                        }]
                    };
                    continue;
                }
            }
            if ('content' in chunk) {
                if (chunk.content.trim()) // Filter empty strings
                    yield chunk.content;
            }
            else if ('reasoning' in chunk) {
                const dimmed = chunk.reasoning
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => `-# ${line}`);
                if (dimmed.length > 0) // Filter empty messages
                    yield dimmed.join('\n');
            }
        }
    }
    // #endregion
}
