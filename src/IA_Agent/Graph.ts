import { END, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { StateAnnotation } from './State';
import { make_doctor_appointment, search_available_appointment_date, tools } from './tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { receptionistAgent, routeReceptionistAgent } from './agents/receptionistAgent';
import { bookingAgent, routeBookingAgent } from './agents/bookingAgent';
import { create } from 'domain';
import { createEntryNode } from './entryNode';

const toolPrimaryAssistant = new ToolNode([...tools]);
const toolNodeBooking = new ToolNode([
  search_available_appointment_date,
  make_doctor_appointment,
  ...tools,
]);

let builder = new StateGraph(StateAnnotation)
  .addNode('receptionist_agent', receptionistAgent)
  .addNode('booking_agent', bookingAgent)
  .addNode('primary_tools', toolPrimaryAssistant)
  .addNode('enter_booking_tools', createEntryNode('Booking Agent', 'booking_agent'))
  .addNode('booking_tools', toolNodeBooking)

  /* RECEPTIONIST AGENT */
  .addEdge(START, 'receptionist_agent')
  .addConditionalEdges('receptionist_agent', routeReceptionistAgent, [
    'primary_tools',
    'enter_booking_tools',
    END,
  ])
  .addEdge('primary_tools', 'receptionist_agent')

  /* SPECIALIST AGENT */
  .addEdge("enter_booking_tools", "booking_agent")
  .addConditionalEdges('booking_agent', routeBookingAgent, [
    'booking_tools',
    END,
  ]);

const checkpointer = new MemorySaver();

export const graph2 = builder.compile({
  checkpointer,
});
