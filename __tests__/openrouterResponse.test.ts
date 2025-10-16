import { ReadableStream } from 'node:stream/web';
import { TextEncoder, TextDecoder } from 'node:util';
import {
  parseOpenRouterResponse,
  type OpenRouterResponsePayload,
} from '@/lib/openrouterResponse';

const createJsonResponse = (payload: OpenRouterResponsePayload): Response =>
  ({
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    text: async () => JSON.stringify(payload),
    body: null,
  }) as unknown as Response;

const createSseResponse = (content: string): Response =>
  ({
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'text/event-stream' : null,
    },
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(content));
        controller.close();
      },
    }),
    text: async () => content,
  }) as unknown as Response;

const createSseResponseFromChunks = (chunks: string[]): Response =>
  ({
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'text/event-stream' : null,
    },
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    }),
    text: async () => chunks.join(''),
  }) as unknown as Response;

if (!('TextEncoder' in globalThis)) {
  (globalThis as any).TextEncoder = TextEncoder;
}

if (!('TextDecoder' in globalThis)) {
  (globalThis as any).TextDecoder =
    TextDecoder as unknown as typeof globalThis.TextDecoder;
}

describe('parseOpenRouterResponse', () => {
  it('parses standard JSON payloads', async () => {
    const payload: OpenRouterResponsePayload = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: '{"stories":[]}',
          },
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 20 },
    };

    const response = createJsonResponse(payload);

    const result = await parseOpenRouterResponse(response);

    expect(result.mode).toBe('json');
    expect(result.payload.choices?.[0].message?.content).toBe('{"stories":[]}');
    expect(result.payload.usage?.prompt_tokens).toBe(10);
    expect(result.payload.usage?.completion_tokens).toBe(20);
  });

  it('parses streaming SSE payloads and captures usage', async () => {
    const ssePayload =
      'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n' +
      'data: {"choices":[{"message":{"content":"{\\"stories\\":[]}"},"finish_reason":"stop"}],"usage":{"prompt_tokens":4,"completion_tokens":6}}\n\n' +
      'data: [DONE]\n\n';

    const response = createSseResponse(ssePayload);

    const result = await parseOpenRouterResponse(response);

    expect(result.mode).toBe('stream');
    expect(result.payload.choices?.[0].message?.content).toBe('{"stories":[]}');
    expect(result.payload.usage?.prompt_tokens).toBe(4);
    expect(result.payload.usage?.completion_tokens).toBe(6);
  });

  it('parses streaming payloads that use CRLF separators and chunked delivery', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"partial"}}]}\r\n\r\n',
      'data: {"choices":[{"message":{"content":"{\\"stories\\":[]}"},"finish_reason":"stop"}],"usage":{"prompt_tokens":7,"completion_tokens":9}}\r\n',
      '\r\n',
      'data: [DONE]\r\n\r\n',
    ];

    const response = createSseResponseFromChunks(chunks);

    const result = await parseOpenRouterResponse(response);

    expect(result.mode).toBe('stream');
    expect(result.payload.choices?.[0].message?.content).toBe('{"stories":[]}');
    expect(result.payload.usage?.prompt_tokens).toBe(7);
    expect(result.payload.usage?.completion_tokens).toBe(9);
  });

  it('throws when streaming payload lacks completion data', async () => {
    const incompleteSse = 'data: {"foo":"bar"}\n\n';
    const response = createSseResponse(incompleteSse);

    await expect(parseOpenRouterResponse(response)).rejects.toThrow(
      'OpenRouter stream ended without a final completion payload.'
    );
  });
});
