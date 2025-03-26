import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { graphManagerPromise } from '../../IA_Agent/Graph';
import { FormattedWhatsAppMessage, IMessagesRepository } from './IMessagesRepository';

type FormattedMessage = {
  text: string;
  type: 'user' | 'bot' | 'config';
};
export class MessagesService {
  constructor(private repository: IMessagesRepository) {}

  private async processWhatsAppMessages(payload: any): Promise<FormattedWhatsAppMessage[]> {
    const formattedMessages: FormattedWhatsAppMessage[] = [];
    try {
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
                phone_number_client: msg.from,
                phone_number_to: value.metadata.display_phone_number,
                message_text: msg.text.body,
                timestamp: msg.timestamp,
              });
            } catch (error) {
              console.error('Erro ao formatar mensagem:', error);
            }
          }
        }
      }
      return formattedMessages;
    } catch (error) {
      console.error('Erro no processamento:', error);
      throw new Error('Falha ao processar mensagens');
    }
  }

  private formatCheckpointMessages(checkpointData: any): FormattedMessage[] {
    try {
      const formattedMessages: FormattedMessage[] = [];

      if (!checkpointData?.channel_values?.messages) {
        return [];
      }
      return checkpointData.channel_values.messages.map((message: any) => {
        if (message instanceof HumanMessage) {
          return {
            text:
              typeof message.content === 'string'
                ? message.content
                : JSON.stringify(message.content),
            type: 'user' as const,
          };
        } else if (message instanceof AIMessage) {
          return {
            text:
              typeof message.content === 'string'
                ? message.content
                : JSON.stringify(message.content),
            type: 'bot' as const,
          };
        }
        return {
          text:
            typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
          type: 'config' as const,
        };
      });

      return formattedMessages;
    } catch (error) {
      console.error('Error formatting checkpoint messages:', error);
      return [];
    }
  }

  async getPastMessages(thread: string) {
    const graphManager = await graphManagerPromise;

    const readConfig = {
      configurable: {
        thread_id: thread,
      },
    };

    const checkpointer = graphManager.getCheckpointer();
    const checkpointMessages = await checkpointer.get(readConfig);
    return this.formatCheckpointMessages(checkpointMessages);
  }

  async sendMessage(body: any) {
    const { message, clientNumber } = body;

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
                    from: `${clientNumber}`,
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

  async deleteMessagesByThread(thread: string) {
    return this.repository.deleteMessagesByThread(thread);
  }
}
