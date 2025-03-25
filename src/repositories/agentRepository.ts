import { HttpStatusCode } from 'axios';
import { databaseConnection } from '../config/database';
import { AppError } from '../errors/AppError';
import {
  FormattedWhatsAppMessage,
  IMessagesRepository,
  MessageWithId,
} from '../features/messages/IMessagesRepository';
import { format } from 'date-fns'; // Biblioteca para formatação de datas
import EMessageStatus from '../Enums/EMessageStatus';
import { IAgentRepository } from '../features/agent/IAgentRepository';

class AgentRepository implements IAgentRepository {
  async getNotAnsweredMessages(): Promise<MessageWithId[]> {
    try {
      const response = await databaseConnection.query(
        `SELECT id, phone_number_to, phone_number_client, message_text, timestamp, message_sent_at
        FROM  messages
        WHERE responded = false`,
      );

      return response.rows;
    } catch (error) {
      throw new AppError(
        'Error on database.',
        HttpStatusCode.InternalServerError,
        'ERROR : Database > getNotAnsweredMessages',
        error,
      );
    }
  }

  async saveMessages(messages: FormattedWhatsAppMessage[]): Promise<void> {
    try {
      for (const msg of messages) {
        // Converte o timestamp string para número
        const timestampSec = parseInt(msg.timestamp);

        // Query que insere tanto o timestamp quanto a data convertida
        await databaseConnection.query(
          `INSERT INTO messages (
            phone_number_to,
            phone_number_client,
            message_text,
            timestamp,
            message_sent_at
          ) VALUES ($1, $2, $3, $4::BIGINT, $5)`,
          [
            msg.phone_number_to,
            msg.phone_number_client,
            msg.message_text,
            timestampSec, // timestampSec é um número, não precisa de conversão adicional
            format(new Date(timestampSec * 1000), 'yyyy-MM-dd HH:mm:ss'), // Converte timestampSec para string formatada
          ],
        );
      }

      await databaseConnection.query('COMMIT'); // Confirma transação
    } catch (error) {
      await databaseConnection.query('ROLLBACK'); // Reverte em caso de erro
      throw new AppError(
        'Error on database.',
        HttpStatusCode.InternalServerError,
        'ERROR : Database > saveMessages',
        error,
      );
    }
  }

  async setMessageStatus(messageId: number, status: EMessageStatus): Promise<void> {
    try {
      await databaseConnection.query(
        `UPDATE messages
           SET status = $1
           WHERE id = $2`,
        [status, messageId],
      );

      await databaseConnection.query('COMMIT'); // Confirma transação
    } catch (error) {
      await databaseConnection.query('ROLLBACK'); // Reverte em caso de erro
      throw new AppError(
        'Error on database.',
        HttpStatusCode.InternalServerError,
        'ERROR : Database > setMessageStatus',
        error,
      );
    }
  }
}

const agentRepository = new AgentRepository();

export default agentRepository;
