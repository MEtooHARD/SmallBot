/* 10/19 GatherLines
        const lines: string[] = [];
        let length_sum: number = 0;
        let prev_is_code: boolean = false;
        let prev_stage: StreamStage = 'role';
        let prev_chunk_was_code_end: boolean = false;
        let lang: string = '';

        for await (const chunk of stream) {
            const { chunk: typed_chunk, stage: this_stage } = ExtractTypedChunkAndStage(chunk);
            const is_text_chunk = (this_stage === 'content' || this_stage === 'reasoning');

            // Stage change: flush lines
            if (prev_stage !== this_stage) {
                // handle buffer
                if (prev_stage === 'content' || prev_stage === 'reasoning')
                    if (lines.length > 0) // flush lines if any
                        if (prev_is_code && prev_chunk_was_code_end)  // code and is complete
                            yield prev_stage === 'content'
                                ? { content: lines.join('\n'), code: 'complete', lang }
                                : { reasoning: lines.join('\n'), code: 'complete', lang };
                        else  // plain text
                            yield TextChunk(lines.join('\n'), prev_stage);
                // handle current chunk
                if (!is_text_chunk) // non-text chunk just yield
                    yield chunk;
                else { // text chunk start new buffer
                    lines.length = 0;
                    length_sum = 0;
                    prev_is_code = false;
                    lang = '';
                    if ('code' in typed_chunk && typed_chunk.code === 'start') {
                        prev_is_code = true;
                        lang = typed_chunk.lang;
                    }
                    lines.push(this_stage === 'content' ? typed_chunk.content : typed_chunk.reasoning);
                    length_sum += lines[0].length;
                }
                prev_stage = this_stage;
            } else {
                if (!is_text_chunk) {
                    yield chunk;
                } else {
                    // seek for code change
                    const this_is_code = 'code' in typed_chunk;

                    if (!this_is_code && prev_is_code) { // code -> text
                        // flush code buffer first
                        if (lines.length > 0)
                            if (prev_chunk_was_code_end)  // code and is complete
                                yield prev_stage === 'content'
                                    ? { content: lines.join('\n'), code: 'complete', lang }
                                    : { reasoning: lines.join('\n'), code: 'complete', lang };
                            else  // plain text
                                yield TextChunk(lines.join('\n'), prev_stage);

                    }
                }
            }

            // update
            prev_chunk_was_code_end = is_text_chunk && 'code' in typed_chunk && typed_chunk.code === 'end';
        }
*/