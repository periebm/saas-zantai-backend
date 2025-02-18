import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const lookupPolicy = tool(
  (input: { query: string }) => {
    const mockedPolicyResponse = `
Policy Document 1:
Flight changes are permitted up to 24 hours before the scheduled departure. Changes made within 24 hours may incur a penalty fee. All flight changes must be made through the customer support portal.

Policy Document 2:
Tickets are non-refundable after the flight has departed. Passengers can request a refund up to 7 days prior to the departure date for fully refundable tickets only.
`;
    return mockedPolicyResponse;
  },
  {
    name: 'lookup_policy',
    description:
      "Consult the company policies to check whether certain options are permitted. Use this before making any flight changes or performing other 'write' events.",
    schema: z.object({
      query: z.string().describe('Query about company policies.'),
    }),
  },
);
