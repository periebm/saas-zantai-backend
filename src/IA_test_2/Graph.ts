import { END, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { StateAnnotation } from './State';
import { animeSupport, filmeSupport } from './Agents';
import { handleRefund } from './nodeInterrupt';
import { tools } from './tools';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { receptionistAgent } from './agents/receptionistAgent';

const toolNodeForGraph = new ToolNode(tools);

const shouldContinue = (state: typeof StateAnnotation.State) => {
  const route = toolsCondition(state);

  if (route === END) {
    return END;
  }

  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls?.length
  ) {
    return 'primary_tools';
  }
  if (state.nextRepresentative.includes('ANIME')) {
    return 'anime_support';
  } else if (state.nextRepresentative.includes('FILME')) {
    return 'film_support';
  }
  return END;
};

let builder = new StateGraph(StateAnnotation)
  .addNode('receptionist_agent', receptionistAgent)
  .addNode('anime_support', animeSupport)
  .addNode('film_support', filmeSupport)
  .addNode('handle_refund', handleRefund)
  .addNode('primary_tools', toolNodeForGraph)

  .addEdge(START, 'receptionist_agent')
  .addConditionalEdges('receptionist_agent', shouldContinue, [
    'primary_tools',
    'anime_support',
    'film_support',
    END,
  ])
  .addEdge('primary_tools', 'receptionist_agent')

  .addEdge('anime_support', END)
  .addConditionalEdges(
    'film_support',
    async (state) => {
      if (state.nextRepresentative.includes('DEVOLVER')) {
        return 'devolver';
      } else {
        return END;
      }
    },
    {
      refund: 'handle_refund',
      __end__: END,
    },
  )
  .addEdge('handle_refund', END);

const checkpointer = new MemorySaver();

export const graph2 = builder.compile({
  checkpointer,
});
