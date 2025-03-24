import { ToolMessage } from '@langchain/core/messages';
import { StateAnnotation } from './State';

// Função para criar um nó de entrada
function createEntryNode(
  assistantName: string,
  newDialogState: string,
): (state: typeof StateAnnotation.State) => any {
  return function entryNode(state: typeof StateAnnotation.State): {
    messages: ToolMessage[];
    nextRepresentative: string;
  } {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if (
      'tool_calls' in lastMessage &&
      Array.isArray(lastMessage.tool_calls) &&
      lastMessage.tool_calls?.length
    ) {
      const toolCallId = lastMessage.tool_calls[0].id;


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
        nextRepresentative: newDialogState,
      };
    }

    console.log('ERRO ESTRANHO')
    throw new Error('Aqui bateu erro Entry Node');
  };
}

export { createEntryNode };
