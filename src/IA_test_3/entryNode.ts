import { ToolMessage } from '@langchain/core/messages';

// Função para criar um nó de entrada
function createEntryNode(assistantName: string, newDialogState: string): (state: State) => any {
  return function entryNode(state: State): { messages: ToolMessage[]; dialog_state: string } {
    const toolCallId = state.messages[state.messages.length - 1].tool_calls[0].id;

    console.log('NOME DO ASSISTENTE: ', assistantName);
    console.log('TOOL CALL ID: ', toolCallId);

    return {
      messages: [
        new ToolMessage({
          content:
            `The assistant is now the ${assistantName}. Reflect on the above conversation between the host assistant and the user.` +
            ` The user's intent is unsatisfied. Use the provided tools to assist the user. Remember, you are ${assistantName},` +
            ' and the booking, update, or other action is not complete until after you have successfully invoked the appropriate tool.' +
            ' If the user changes their mind or needs help for other tasks, call the CompleteOrEscalate function to let the primary host assistant take control.' +
            ' Do not mention who you are - just act as the proxy for the assistant.',
          tool_call_id: toolCallId,
        }),
      ],
      dialog_state: newDialogState,
    };
  };
}

export { createEntryNode };
