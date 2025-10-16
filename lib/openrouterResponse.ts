export interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface OpenRouterChatMessage {
  role?: string;
  content?: string;
}

export interface OpenRouterChoice {
  message?: OpenRouterChatMessage;
  delta?: OpenRouterChatMessage;
  finish_reason?: string;
}

export interface OpenRouterErrorPayload {
  message?: string;
}

export interface OpenRouterResponsePayload {
  choices?: OpenRouterChoice[];
  usage?: OpenRouterUsage;
  error?: OpenRouterErrorPayload;
}

export type OpenRouterPayloadMode = 'json' | 'stream';

export interface ParsedOpenRouterResponse {
  payload: OpenRouterResponsePayload;
  mode: OpenRouterPayloadMode;
}

const DATA_PREFIX = 'data:';

const normaliseNewlines = (value: string) =>
  value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const decodeSseChunk = (chunk: string) =>
  normaliseNewlines(chunk)
    .split('\n')
    .filter(line => line.startsWith(DATA_PREFIX))
    .map(line => line.slice(DATA_PREFIX.length).trim())
    .filter(Boolean);

const parseJsonSafely = (snippet: string) => {
  try {
    return JSON.parse(snippet);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown JSON parse error';
    throw new Error(`Invalid streaming data chunk (${message}): ${snippet}`);
  }
};

const parseStreamingResponse = async (
  response: Response
): Promise<ParsedOpenRouterResponse> => {
  const body = response.body;
  if (!body) {
    throw new Error('Empty streaming payload from OpenRouter.');
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let latestPayload: OpenRouterResponsePayload | null = null;
  let latestUsage: OpenRouterUsage | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = normaliseNewlines(buffer);

    let boundaryIndex = buffer.indexOf('\n\n');
    while (boundaryIndex !== -1) {
      const rawChunk = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);

      const dataEntries = decodeSseChunk(rawChunk);
      for (const entry of dataEntries) {
        if (entry === '[DONE]') {
          continue;
        }

        const parsedEntry = parseJsonSafely(entry);
        if (parsedEntry.usage) {
          latestUsage = parsedEntry.usage;
        }
        if (parsedEntry.choices) {
          latestPayload = parsedEntry;
        }
      }

      boundaryIndex = buffer.indexOf('\n\n');
    }
  }

  // Process any trailing chunk left after stream completion
  buffer = normaliseNewlines(buffer);
  if (buffer.trim().length > 0) {
    const trailingEntries = decodeSseChunk(buffer);
    for (const entry of trailingEntries) {
      if (entry === '[DONE]') continue;
      const parsedEntry = parseJsonSafely(entry);
      if (parsedEntry.usage) {
        latestUsage = parsedEntry.usage;
      }
      if (parsedEntry.choices) {
        latestPayload = parsedEntry;
      }
    }
  }

  if (!latestPayload) {
    throw new Error(
      'OpenRouter stream ended without a final completion payload.'
    );
  }

  if (latestUsage && !latestPayload.usage) {
    latestPayload.usage = latestUsage;
  }

  return { payload: latestPayload, mode: 'stream' };
};

const parseJsonResponse = async (
  response: Response
): Promise<ParsedOpenRouterResponse> => {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as OpenRouterResponsePayload;
    return { payload: parsed, mode: 'json' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown JSON parse error';
    throw new Error(
      `Failed to decode JSON response (${message}). Body: ${text.slice(0, 200)}`
    );
  }
};

export const parseOpenRouterResponse = async (
  response: Response
): Promise<ParsedOpenRouterResponse> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/event-stream')) {
    return parseStreamingResponse(response);
  }
  return parseJsonResponse(response);
};
