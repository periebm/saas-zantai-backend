import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const fetchUserFlightInformation = tool(
  () => {
    return [{ ticket: 'Voo para Natal' }];
  },
  {
    name: 'fetch_user_flight_information',
    description:
      'Fetch all tickets for the user along with corresponding flight information and seat assignments.',
    schema: z.object({}),
  },
);

export const searchFlights = tool(
  (input: {
    departure_airport?: string;
    arrival_airport?: string;
    start_time?: string; // ISO string for date/time
    end_time?: string; // ISO string for date/time
    limit?: number;
  }) => {
    const mockedResults = [
      {
        flight_id: 1,
        departure_airport: 'JFK',
        arrival_airport: 'LAX',
        scheduled_departure: '2024-12-26 08:00:00',
        scheduled_arrival: '2024-12-26 11:00:00',
        status: 'Scheduled',
        airline: 'Delta',
        price: 250.0,
      },
      {
        flight_id: 2,
        departure_airport: 'JFK',
        arrival_airport: 'LAX',
        scheduled_departure: '2024-12-26 10:00:00',
        scheduled_arrival: '2024-12-26 13:00:00',
        status: 'Scheduled',
        airline: 'American Airlines',
        price: 270.0,
      },
      {
        flight_id: 3,
        departure_airport: 'ORD',
        arrival_airport: 'SFO',
        scheduled_departure: '2024-12-26 09:30:00',
        scheduled_arrival: '2024-12-26 12:30:00',
        status: 'Delayed',
        airline: 'United Airlines',
        price: 300.0,
      },
    ];
    return mockedResults;
  },
  {
    name: 'search_flights',
    description:
      'Search for flights based on departure airport, arrival airport, and departure time range.',
    schema: z.object({
      departure_airport: z.string().optional().describe('Departure airport code.'),
      arrival_airport: z.string().optional().describe('Arrival airport code.'),
      start_time: z.string().optional().describe('Start of the departure time range (ISO format).'),
      end_time: z.string().optional().describe('End of the departure time range (ISO format).'),
      limit: z.number().optional().describe('Maximum number of results.'),
    }),
  },
);

export const updateTicketToNewFlight = tool(
  (input: { ticket_no: string; new_flight_id: number }) => {
    return 'Ticket successfully updated to new flight.';
  },
  {
    name: 'update_ticket_to_new_flight',
    description: "Update the user's ticket to a new valid flight.",
    schema: z.object({
      ticket_no: z.string().describe('The ticket number to update.'),
      new_flight_id: z.number().describe('The ID of the new flight.'),
    }),
  },
);

export const cancelTicket = tool(
  (input: { ticket_no: string }) => {
    return 'Ticket successfully cancelled.';
  },
  {
    name: 'cancel_ticket',
    description: "Cancel the user's ticket and remove it from the database.",
    schema: z.object({
      ticket_no: z.string().describe('The ticket number to cancel.'),
    }),
  },
);

export const updateFlightSafeTools = [searchFlights];
export const updateFlightSensitiveTools = [updateTicketToNewFlight, cancelTicket];
export const updateFlightTools = [...updateFlightSafeTools, ...updateFlightSensitiveTools];
