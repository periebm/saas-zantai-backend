import { FormattedWhatsAppMessage, IMessagesRepository } from './IMessagesRepository';

export class MessagesService {
  constructor(private repository: IMessagesRepository) {}

  private async processWhatsAppMessages(payload: any): Promise<FormattedWhatsAppMessage[]> {
    const formattedMessages: FormattedWhatsAppMessage[] = [];

    try {
      // Verificação básica do payload
      if (!payload?.entry || !Array.isArray(payload.entry)) {
        throw new Error("Payload inválido: estrutura 'entry' não encontrada");
      }

      for (const entry of payload.entry) {
        if (!entry?.changes || !Array.isArray(entry.changes)) continue;

        for (const change of entry.changes) {
          const value = change.value;
          const messages = value?.messages || [];

          for (const msg of messages) {
            // Verifica se é mensagem de texto válida
            if (msg.type !== 'text' || !msg.from || !msg.text?.body || !msg.timestamp) {
              continue;
            }

            try {
              formattedMessages.push({
                phone_number_client: value.metadata.display_phone_number,
                phone_number_to: msg.from,
                message_text: msg.text.body,
                timestamp: msg.timestamp,
              });
            } catch (error) {
              console.error('Erro ao formatar mensagem:', error);
            }
          }
        }
      }

      // Salva todas as mensagens no banco
      return formattedMessages;
    } catch (error) {
      console.error('Erro no processamento:', error);
      throw new Error('Falha ao processar mensagens');
    }
  }

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

    const messages = await this.processWhatsAppMessages(wppMessageStructure);
    await this.repository.saveMessages(messages);

    return await this.processWhatsAppMessages(wppMessageStructure);
  }
}
