const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const AI_MODEL = process.env.AI_MODEL || 'qwen2.5:3b';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const MAX_ROUND_TRIPS = 3;

const tools = [
  {
    type: 'function',
    function: {
      name: 'filter_notes',
      description:
        'Search the notes collection by substring match on content. Returns up to 10 matches.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
          },
        },
        required: ['query'],
      },
    },
  },
];

type OllamaMessage = {
  role?: string;
  content?: string;
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: string | Record<string, unknown>;
    };
  }>;
};

type MessagesItem = {
  role: string;
  content: string;
};

const parseToolArguments = (
  raw: string | Record<string, unknown>
): { query: string } => {
  if (typeof raw === 'string') {
    return JSON.parse(raw) as { query: string };
  }

  return raw as { query: string };
};

export async function runAgent({ prompt }: { prompt: string }) {
  const messages: MessagesItem[] = [{ role: 'user', content: prompt }];

  for (let i = 0; i < MAX_ROUND_TRIPS; i += 1) {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        tools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const error = new Error(
        `Ollama request failed: ${response.status} ${bodyText}`
      ) as Error & { status?: number };
      error.status = 502;
      throw error;
    }

    const data = (await response.json()) as { message: OllamaMessage };
    const message = data.message;

    if (!message) {
      const error = new Error('Invalid response from Ollama') as Error & {
        status?: number;
      };
      error.status = 502;
      throw error;
    }

    messages.push({
      role: message.role ?? 'assistant',
      content: message.content ?? '',
    });

    const toolCalls = message.tool_calls ?? [];

    if (!toolCalls.length) {
      return { text: message.content ?? '' };
    }

    for (const call of toolCalls) {
      const args = parseToolArguments(call.function.arguments);

      if (call.function.name !== 'filter_notes') {
        const error = new Error(
          `Unsupported tool call: ${call.function.name}`
        ) as Error & { status?: number };
        error.status = 502;
        throw error;
      }

      const toolResponse = await fetch(
        `${BACKEND_URL}/notes/filter?query=${encodeURIComponent(args.query)}`
      );

      if (!toolResponse.ok) {
        const bodyText = await toolResponse.text();
        const error = new Error(
          `Notes filter request failed: ${toolResponse.status} ${bodyText}`
        ) as Error & { status?: number };
        error.status = 502;
        throw error;
      }

      const toolResultText = await toolResponse.text();
      messages.push({ role: 'tool', content: toolResultText });
    }
  }

  const error = new Error('Agent exceeded round-trip cap') as Error & {
    status?: number;
  };
  error.status = 504;
  throw error;
}
