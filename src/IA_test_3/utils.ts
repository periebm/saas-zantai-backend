// Interface para representar o estado
interface State {
  error?: any;
  messages: { tool_calls: ToolCall[] }[];
}

// Interface para ToolCall
interface ToolCall {
  id: string;
}

// Interface para ToolMessage
interface ToolMessage {
  content: string;
  tool_call_id: string;
}

// Função para lidar com erros da ferramenta
function handleToolError(state: State): { messages: ToolMessage[] } {
  const error = state.error;
  const toolCalls = state.messages[state.messages.length - 1].tool_calls;
  return {
    messages: toolCalls.map((tc) => ({
      content: `Error: ${String(error)}\n please fix your mistakes.`,
      tool_call_id: tc.id,
    })),
  };
}

// Classe ToolNode simulada (pode ser substituída pela implementação específica do seu sistema)
class ToolNode {
  tools: any[];

  constructor(tools: any[]) {
    this.tools = tools;
  }

  withFallbacks(fallbacks: any[], exceptionKey: string): any {
    // Implementação da lógica do fallback aqui
    return {
      tools: this.tools,
      fallbacks,
      exceptionKey,
    };
  }
}

// Classe RunnableLambda simulada
class RunnableLambda {
  handler: (state: State) => any;

  constructor(handler: (state: State) => any) {
    this.handler = handler;
  }

  run(state: State): any {
    return this.handler(state);
  }
}

// Função para criar um nó de ferramenta com fallback
function createToolNodeWithFallback(tools: any[]): any {
  return new ToolNode(tools).withFallbacks([new RunnableLambda(handleToolError)], 'error');
}
