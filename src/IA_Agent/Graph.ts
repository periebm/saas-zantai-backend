import { END, START, StateGraph } from '@langchain/langgraph';
import { StateAnnotation } from './State';
import { make_doctor_appointment, search_available_appointment_date, tools } from './tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { receptionistAgent, routeReceptionistAgent } from './agents/receptionistAgent';
import { bookingAgent, routeBookingAgent } from './agents/bookingAgent';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { createEntryNode } from './entryNode';
import pg, { Pool } from 'pg';
import { envConfig } from '../config/config';

class GraphManager {
  private static instance: GraphManager;
  private static initializationPromise: Promise<GraphManager> | null = null;
  private graph: any;
  private checkpointer!: PostgresSaver;

  private constructor() {
    // Construtor privado para evitar novas instâncias
  }

  public static async getInstance(): Promise<GraphManager> {
    if (!GraphManager.instance) {
      if (!GraphManager.initializationPromise) {
        GraphManager.initializationPromise = (async () => {
          const instance = new GraphManager();
          await instance.initialize();
          GraphManager.instance = instance;
          return instance;
        })();
      }
      await GraphManager.initializationPromise;
    }
    return GraphManager.instance;
  }

  private async initialize(): Promise<void> {
    const toolPrimaryAssistant = new ToolNode([...tools]);
    const toolNodeBooking = new ToolNode([
      search_available_appointment_date,
      make_doctor_appointment,
      ...tools,
    ]);

    const builder = new StateGraph(StateAnnotation)
      .addNode('receptionist_agent', receptionistAgent)
      .addNode('booking_agent', bookingAgent)
      .addNode('primary_tools', toolPrimaryAssistant)
      .addNode('enter_booking_tools', createEntryNode('Booking Agent', 'booking_agent'))
/*       .addNode('booking_tools', toolNodeBooking)
 */
      /* RECEPTIONIST AGENT */
      .addEdge(START, 'receptionist_agent')
      .addConditionalEdges('receptionist_agent', routeReceptionistAgent, [
        'primary_tools',
        'enter_booking_tools',
        END,
      ])
      .addEdge('primary_tools', 'receptionist_agent')

      /* SPECIALIST AGENT */
      .addEdge('enter_booking_tools', 'booking_agent')
      /*       .addEdge('booking_tools', 'booking_agent')
       */ .addEdge('booking_agent', END);
    /*        .addConditionalEdges('booking_agent', routeBookingAgent, ['booking_tools', END]);
     */
    const pool = new Pool({
      connectionString: `postgresql://${envConfig.db.user}:${envConfig.db.password}@${envConfig.db.host}:${envConfig.db.port}/${envConfig.db.database}`,
    });

    this.checkpointer = new PostgresSaver(pool);
    await this.checkpointer.setup();

    this.graph = await builder.compile({
      checkpointer: this.checkpointer,
    });
  }

  public getGraph(): any {
    if (!this.graph) {
      throw new Error('Graph not initialized');
    }
    return this.graph;
  }

  public getCheckpointer(): PostgresSaver {
    if (!this.checkpointer) {
      throw new Error('Checkpointer not initialized');
    }
    return this.checkpointer;
  }
}

// Exportamos a instância como uma Promise que resolve para o GraphManager
export const graphManagerPromise = GraphManager.getInstance();
