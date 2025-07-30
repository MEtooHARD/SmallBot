export async function processStream<C>(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: C) => void,
    onError: (error: Error) => void
) {
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });

        // Process lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                // const jsonStr = line.slice(6); // Remove 'data: ' prefix
                if (line === '[DONE]') return;

                try {
                    // const chunk = JSON.parse(line) as C;
                    onChunk(line as C);
                } catch (e) {
                    //@ts-ignore
                    onError(new Error(`Failed to parse chunk: ${e.message}`));
                }
            }
        }
    }
}