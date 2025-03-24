import { HttpStatusCode } from 'axios';
import { databaseConnection } from '../config/database';
import { AppError } from '../errors/AppError';
import {
  FormattedWhatsAppMessage,
  IMessagesRepository,
} from '../features/messages/IMessagesRepository';
import { format } from 'date-fns'; // Biblioteca para formatação de datas

class MessageRepository implements IMessagesRepository {
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
            msg.number_to,
            msg.number,
            msg.message,
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
}

const messageRepository = new MessageRepository();

export default messageRepository;
