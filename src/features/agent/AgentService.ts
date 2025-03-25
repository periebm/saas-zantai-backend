import { io } from '../..';
import EMessageStatus from '../../Enums/EMessageStatus';
import { graph } from '../../IA_Agent/Graph';
import {
  FormattedWhatsAppMessage,
  IMessagesRepository,
  MessageWithId,
} from '../messages/IMessagesRepository';
import { IAgentRepository } from './IAgentRepository';

export class AgentService {
  constructor(
    private agentRepository: IAgentRepository,
    private messageRepository: IMessagesRepository,
  ) {}

  async callAiAgent(message: MessageWithId) {
    const threadId = `${message.phone_number_client}`;
    await this.messageRepository.setMessageStatus(message.id, EMessageStatus.PROCESSING);
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    /*   await printGraph();
     */

    messages.push({
      role: 'user',
      content: message.message_text,
    });

    const stream = await graph.stream(
      {
        messages,
      },
      {
        configurable: {
          thread_id: threadId,
        },
      },
    );

    let assistantMessage = [];
    for await (const value of stream) {
      console.log(value);
      if (value?.receptionist_agent?.messages?.[0]?.content) {
        assistantMessage.push(value.receptionist_agent.messages[0].content);
      }
    }

    // Adiciona a mensagem da IA no histórico
    if (assistantMessage) {
      messages.push({
        role: 'assistant',
        content: assistantMessage[assistantMessage.length - 1],
      });

      console.log(`IA: ${assistantMessage}`);

      io.emit('new_message', {
        id: Date.now(),
        text: assistantMessage,
        type: 'bot',
        phoneNumber: message.phone_number_client,
      });

      await this.messageRepository.setMessageStatus(message.id, EMessageStatus.ANSWERED);
    } else {
      console.error('Erro: Não foi possível obter a resposta da IA.');
    }
  }
}
