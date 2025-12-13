import { MessageCreateOptions, MessagePayload } from "discord.js";
import { FENCE_START_REGEX, LINE_START_HAS_NON_WHITESPACE_REGEX } from "../../utils/common_static";
import { StatefulProcessor } from "../../utils/StatefulProcessor";
import * as StatefulProcessors from "../../utils/StatefulProcessor";
import { UniLLM } from "./__Types";
import { balanced_halve, MD_dim } from "../../utils/common_fn";
import { dev_log } from "../../functions/general/log";

type ChunkTypeAndStage =
    | { chunk: UniLLM.ReasoningChunk, type: 'reasoning' }
    | { chunk: UniLLM.ContentChunk, type: 'content' }
    | { chunk: UniLLM.UsageChunk, type: 'usage' }
    | { chunk: UniLLM.RoleChunk, type: 'role' }
    | { chunk: UniLLM.FinishChunk, type: 'done' }

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
        return { chunk, type: 'role' };
    }
}

const chunk_text = (chunk: UniLLM.ContentChunk | UniLLM.ReasoningChunk): string =>
    ('content' in chunk) ? chunk.content : chunk.reasoning;

const text_chunk = (text: string, type: 'content' | 'reasoning',): UniLLM.ContentChunk | UniLLM.ReasoningChunk =>
    (type === 'content' ? { content: text } : { reasoning: text });


/**
 * Intercepts any reasoning chunks.
 */
export class ReasoningFilter extends StatefulProcessor<UniLLM.Chunk, Exclude<UniLLM.Chunk, UniLLM.ReasoningChunk>> {
    private count: number = 0;
    override * feed(
        item: UniLLM.Chunk
    ): Generator<Exclude<UniLLM.Chunk, UniLLM.ReasoningChunk>> {
        if ('reasoning' in item) {
            this.count += 1;
            dev_log('filtered reasoning', this.count);
            return;
        }
        yield item;
    }
    override * flush(): Generator<Exclude<UniLLM.Chunk, UniLLM.ReasoningChunk>> { }
}

/**
 * Collects data, e.g., usage, role, finish_reason, content  
 * use `get` functions to retrieve them
 */
export class DataCollector extends StatefulProcessor<UniLLM.Chunk, UniLLM.TextChunk> {
    private usage: UniLLM.Usage | null = null;
    private role: UniLLM.Role.SELF | null = null;
    private finish_reason: UniLLM.FinishChunk['finish_reason'] | null = null;
    private contents: string[] = [];

    override * feed(item: UniLLM.Chunk): Generator<UniLLM.TextChunk> {
        if ('usage' in item)
            this.usage = item.usage;
        else if ('role' in item)
            this.role = item.role;
        else if ('finish_reason' in item)
            this.finish_reason = item.finish_reason;
        else {
            if ('content' in item) this.contents.push(item.content);
            yield item;
        }
    }

    override * flush(): Generator<UniLLM.TextChunk> { }

    get_usage(): UniLLM.Usage | null { return this.usage; }
    get_role(): UniLLM.Role.SELF | null { return this.role; }
    get_finish_reason(): UniLLM.FinishChunk['finish_reason'] | null { return this.finish_reason; }
    get_full_content(): string { return this.contents.join(''); }
}

/**
 * Assembles text chunks into complete lines, based on the presence of newline(`\n`) characters.
 */
export class LineAssembler extends StatefulProcessor<UniLLM.TextChunk, UniLLM.TextChunk> {
    private readonly assembler = new StatefulProcessors.LineAssembler();
    private stored_type: 'content' | 'reasoning' | null = null;

    override * feed(
        item: UniLLM.TextChunk
    ): Generator<UniLLM.TextChunk> {
        const { chunk, type } = typed_chunk_and_type(item) as
            { chunk: UniLLM.ContentChunk, type: 'content' } | { chunk: UniLLM.ReasoningChunk, type: 'reasoning' };

        const type_change = this.stored_type !== type;

        if (type_change) {
            yield* this.flush();
            this.stored_type = type;
        }
        if (type === 'content') {
            yield* this.assembler.feed(chunk.content).map(text => {
                dev_log('LineAssembler out:', text);
                return { content: text }
            });
        } else if (type === 'reasoning') {
            yield* this.assembler.feed(chunk.reasoning).map(text => {
                dev_log('LineAssembler out:', text);
                return { reasoning: text }
            });
        }
    }

    override * flush(): Generator<UniLLM.TextChunk> {
        yield* this.assembler.flush().map(text => text_chunk(text, this.stored_type as 'content' | 'reasoning'));
    }
}

/**
 * Marks code segments in text chunks with code stage and language info.
 */
class CodeMarker extends StatefulProcessor<UniLLM.TextChunk, UniLLM.TextChunk> {
    private in_code_block: boolean = false;
    private lang: string = '';
    private stored_type: 'content' | 'reasoning' | null = null;

    override * feed(item: UniLLM.TextChunk): Generator<UniLLM.TextChunk> {
        const type = 'content' in item ? 'content' : 'reasoning';
        const text = 'content' in item ? item.content : item.reasoning;
        // content/reasoning switches, reset state
        if (this.stored_type !== type) {
            this.reset_code();
            this.stored_type = type;
        }
        // match start fence
        const match = text.match(FENCE_START_REGEX); // ```js -> ['```', 'js']

        if (match) {
            if (!this.in_code_block) { // not code meet fence => start
                this.in_code_block = true;
                this.lang = match[1] || '';
                yield this.mark_code(type, text, 'start', this.lang);
            } else { // code meet fence => end
                yield this.mark_code(type, text, 'end', this.lang);
                this.reset_code();
            }
        } else {
            if (this.in_code_block) { // middle
                yield this.mark_code(type, text, 'middle', this.lang);
            } else { // pass-through
                yield item;
            }
        }
    }

    override * flush(): Generator<UniLLM.TextChunk> {
        this.in_code_block = false;
        this.lang = '';
        this.stored_type = null;
    }

    private reset_code(): void {
        this.in_code_block = false;
        this.lang = '';
    }

    private mark_code(
        type: 'content' | 'reasoning',
        text: string,
        code_stage: UniLLM.CodeStage,
        lang: string
    ): UniLLM.TextChunk {
        const base = type === 'content' ? { content: text } : { reasoning: text };
        return { ...base, code: code_stage, lang: lang };
    }
}

/**
 * Assembles code chunks into complete code blocks.
 */
class CodeBlockAssembler extends StatefulProcessor<UniLLM.TextChunk, UniLLM.TextChunk> {
    private buffer: UniLLM.TextChunk[] = [];

    override * feed(item: UniLLM.TextChunk): Generator<UniLLM.TextChunk, any, any> {
        if (!('code' in item)) { // not code => flush + pass-through
            yield* this.flush();
            yield item;
            return;
        } // only code chunks below

        // content/reasoning switch, flush
        if (this.buffer[0] && ('content' in this.buffer[0]) !== ('content' in item))
            yield* this.flush();

        this.buffer.push(item); // add anyway

        // yield as code block (complete)
        if (item.code === 'end') {
            const buffer = this.buffer;
            const first = buffer[0];

            // 確保第一個元素有 code 和 lang（應該都有，因為上面已經檢查過 'code' in item）
            if (!('code' in first)) return; // 理論上不會發生

            if ('content' in first) {
                const text = buffer.slice(1, buffer.length - 1).map(c => 'content' in c ? c.content : '').join('\n');
                yield { content: text, lang: first.lang, code: 'complete' } as UniLLM.ContentChunk;
            } else {
                const text = buffer.map(c => 'reasoning' in c ? c.reasoning : '').join('\n');
                yield { reasoning: text, lang: first.lang, code: 'complete' } as UniLLM.ReasoningChunk;
            }
            this.buffer = [];
        }
    }

    override * flush(): Generator<UniLLM.TextChunk, any, any> {
        yield* this.buffer;
        this.buffer = [];
    }
}

/**
 * Makes any consecutive text chunks that confront code markers into one code blocks.  
 * 
 * example:  
 * \```  
 * some text...  
 * some text...  
 * \```  
 * will be outputted as a single content/reasoning chunk with code='complete'  
 * otherwise pass-through.
 */
export class CodeProcessor extends StatefulProcessors.ProcessorPipe<UniLLM.TextChunk, UniLLM.TextChunk, UniLLM.TextChunk> {
    constructor() { super(new CodeMarker(), new CodeBlockAssembler()); }
}

/**
 * Groups non-code-block text chunks into larger text chunks with give limit of length.
 */
export class PlainTextGroupifier extends StatefulProcessor<UniLLM.TextChunk, UniLLM.TextChunk> {
    private buffer: UniLLM.TextChunk[] = [];
    private stored_length: number = 0;
    private readonly limit: number;

    constructor(limit: number) {
        super();
        this.limit = limit;
    }

    override * feed(item: UniLLM.TextChunk): Generator<UniLLM.TextChunk, any, any> {
        // meet code block => flush & pass-through
        if ('code' in item && item.code === 'complete') {
            yield* this.flush();
            yield item;
            return;
        }

        // fluch on content/reasoning switch
        if (this.buffer.length > 0 && ('content' in this.buffer[0]) !== ('content' in item))
            yield* this.flush();

        // add to buffer
        this.buffer.push(item);
        const text = 'content' in item ? item.content : item.reasoning;
        this.stored_length += text.length;

        // 4. ★ 核心邏輯：檢查是否溢出 ★
        // 如果目前長度超過上限，我們必須進行 "切半並保留"
        while (this.stored_length > this.limit) {

            // 提取純文字內容
            const texts: string[] = this.buffer.map(chunk_text);
            const type = 'content' in this.buffer[0] ? 'content' : 'reasoning';

            // 執行平衡切割
            const [first_part, second_part] = balanced_halve(texts);

            // 狀況 A：切割失敗 (例如只有單一超長行)
            // 這種情況下 first_part 會是全部，second_part 是空
            if (second_part.length === 0) {
                // 沒辦法，單行就爆了，只能強制送出
                yield text_chunk(first_part.join('\n'), type);
                this.reset_buffer(); // 清空
                break; // 離開迴圈
            }

            // 狀況 B：成功切割成兩塊 [Part A, Part B]

            // 1. 發射 Part A (它是安全的、平衡的半塊)
            yield text_chunk(first_part.join('\n'), type);

            // 2. ★ 關鍵：將 Part B 設為新的 Buffer (延遲發送) ★
            // 我們不發送它，而是把它倒回去 Buffer，等待後續的 Line 11, 12...
            // this.rebuild_buffer(second_part, type);
            this.buffer = second_part.map(t => text_chunk(t, type));
            this.stored_length = this.buffer.reduce((acc, chunk) => acc + chunk_text(chunk).length, 0);

            // 迴圈繼續：
            // 如果 Part B 依然 > Limit (極少見，除非單一 Chunk 極巨)，
            // while 迴圈會再次執行，把 Part B 再切半。
        }
    }

    override * flush(): Generator<UniLLM.TextChunk, any, any> {
        if (this.buffer.length === 0) return;

        const texts = this.buffer.map(chunk_text);

        if (this.stored_length < this.limit)
            yield text_chunk(texts.join('\n'), 'content' in this.buffer[0] ? 'content' : 'reasoning');
        else {
            const [first, second] = balanced_halve(texts);
            yield text_chunk(first.join('\n'), 'content' in this.buffer[0] ? 'content' : 'reasoning');
            if (second.length > 0)
                yield text_chunk(second.join('\n'), 'content' in this.buffer[0] ? 'content' : 'reasoning');
        }
        this.reset_buffer();
    }

    private reset_buffer(): void {
        this.buffer = [];
        this.stored_length = 0;
    }
}


/**
 * Dims every reasoning chunk that isn't marked as `complete`
 */
export class ReasoningDimmer extends StatefulProcessor<UniLLM.TextChunk, UniLLM.TextChunk> {
    override * feed(item: UniLLM.TextChunk): Generator<UniLLM.TextChunk, any, any> {
        // non-code reasoning chunk => dim
        if ('reasoning' in item && (!('code' in item) || ('code' in item && item.code !== 'complete'))) {
            dev_log('dimming reasoning chunk');
            dev_log('input:', item.reasoning);
            const dimmed = MD_dim(item.reasoning);
            dev_log('dimmed:', dimmed);
            yield { reasoning: dimmed }
        }
        else
            yield item;
    }
    override * flush(): Generator<UniLLM.TextChunk, any, any> { }
}

/**
 * 
 */
export class Chunk2MessageTransformer extends StatefulProcessor<UniLLM.TextChunk, string | MessagePayload | MessageCreateOptions> {

    // Discord 訊息的硬上限
    private readonly DISCORD_LIMIT = 2000;

    override * feed(item: UniLLM.TextChunk): Generator<string | MessagePayload | MessageCreateOptions, any, any> {
        const isContent = 'content' in item;
        const text = isContent ? item.content : item.reasoning;

        // 檢查是否為標記為完成的 Code Block
        const isCompleteCode = 'code' in item && item.code === 'complete';

        // --- 決策邏輯 ---

        // 情況 1: 必須轉為檔案
        // 條件 A: 上游 (CodeProcessor) 明確標記這是完整的 Code Block
        // 條件 B: 純文字長度超過 Discord 2000 字限制 (Groupifier 放棄治療的巨型 Chunk)
        if (isCompleteCode || text.length > this.DISCORD_LIMIT) {

            // 決定檔名
            let fileName = 'message.txt';

            if (isCompleteCode) {
                // 如果是 Code Block，使用 lang (例如 code.ts, code.py)
                const lang = ('lang' in item && item.lang) ? item.lang : 'txt';
                fileName = `snippet.${lang}`;
            } else {
                // 如果是因為過長而轉檔，區分是內容還是推論
                fileName = isContent ? 'response.txt' : 'reasoning.txt';
            }

            // 轉成 Discord 附件格式
            yield {
                files: [{
                    attachment: Buffer.from(text),
                    name: fileName
                }]
            };

            return; // 處理完畢
        }

        // 情況 2: 一般文字訊息
        // 過濾掉空字串 (避免 Discord API 400 Error)
        if (text.trim().length > 0) {
            yield text;
        }
    }

    override * flush(): Generator<string | MessagePayload | MessageCreateOptions, any, any> { }
}