import { IMessagesRepository } from './IMessagesRepository';

export class MessagesService {
  constructor(private repository: IMessagesRepository) {}

  async sendMessage(body: any) {
    const { message, clientPhone } = body;

    const wppMessageStructure = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15556266210',
                  phone_number_id: '987',
                },
                contacts: [
                  {
                    profile: {
                      name: 'Péri',
                    },
                    wa_id: '554792553527',
                  },
                ],
                messages: [
                  {
                    from: `${clientPhone}`,
                    id: 'wamid.HBgMNTU0NzkyNTUzNTI3FQIAEhgWM0VCMDMxMTVBMzgwQjRGNzAyMUU0OAA=',
                    timestamp: '1732843906',
                    text: {
                      body: `${message}`,
                    },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    return wppMessageStructure;
  }
}
