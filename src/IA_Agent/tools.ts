import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getDateNow = tool(
  () => {
    return new Date().toISOString();
  },
  {
    name: 'get_date_hour_now',
    description: 'Get the current Time and Date',
    schema: z.object({
      noOp: z.string().optional().describe('No-op parameter.'),
    }),
  },
);

export const search_available_appointment_date = tool(
  () => {
    const mocked_results = [
      {
        date: '2024-12-26',
        hour: '15h00',
      },
      {
        date: '2024-12-26',
        hour: '15h30',
      },
      {
        date: '2024-12-26',
        hour: '16h00',
      },
    ];

    return mocked_results;
  },
  {
    name: 'search_for_appointment_date',
    description:
      'Check if date and hour are available for dental appointment, or send available days and hours for the user to decide.',
    schema: z.object({
      appointment_date: z.string().optional().describe('Date that the user wants the appointment.'),
      appointment_hour: z
        .string()
        .optional()
        .describe('Best hour for the appointment to the user.'),
    }),
  },
);

export const make_doctor_appointment = tool(
  () => {
    return "Appointment was successfully scheduled.";
  },
  {
    name: 'make_doctor_appointment',
    description:
      'Make doctor appointment if date is available.',
    schema: z.object({
      appointment_date: z.string().describe('Date that the user wants the appointment.'),
      appointment_hour: z
        .string()
        .describe('Best hour for the appointment to the user.'),
    }),
  },
);

export const tools = [getDateNow];
