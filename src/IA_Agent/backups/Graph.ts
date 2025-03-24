import { END, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { StateAnnotation } from './State';
import { make_doctor_appointment, search_available_appointment_date, tools } from './tools';
import { ToolNode} from '@langchain/langgraph/prebuilt';
import { receptionistAgent, routeReceptionistAgent } from './agents/receptionistAgent';
import { bookingAgent, routeBookingAgent } from './agents/bookingAgent';

const toolPrimaryAssistant = new ToolNode([...tools]);
const toolNodeBooking = new ToolNode([search_available_appointment_date, make_doctor_appointment, ...tools])

let builder = new StateGraph(StateAnnotation)
  .addNode('receptionist_agent', receptionistAgent)
  .addNode('booking_agent', bookingAgent)
  .addNode('primary_tools', toolPrimaryAssistant)
  .addNode('booking_tools', toolNodeBooking)

  /* RECEPTIONIST AGENT */
  .addEdge(START, 'receptionist_agent')
  .addConditionalEdges('receptionist_agent', routeReceptionistAgent, [
    'primary_tools',
    'booking_agent',
    END,
  ])
  .addEdge('primary_tools', 'receptionist_agent')

  /* SPECIALIST AGENT */
  .addConditionalEdges('booking_agent', routeBookingAgent, [
    'booking_tools',
    'receptionist_agent',
    END,
  ])

const checkpointer = new MemorySaver();

export const graph2 = builder.compile({
  checkpointer,
});
