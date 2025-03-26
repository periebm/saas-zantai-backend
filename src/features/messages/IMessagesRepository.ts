import EMessageStatus from '../../Enums/EMessageStatus';

export type FormattedWhatsAppMessage = {
  phone_number_to: string;
  phone_number_client: string;
  message_text: string;
  timestamp: string;
};

export type MessageWithId = FormattedWhatsAppMessage & {
  id: number;
};

export interface IMessagesRepository {
  getNotAnsweredMessages(): Promise<MessageWithId[]>;

  saveMessages(messages: FormattedWhatsAppMessage[]): Promise<void>;
  setMessageStatus(messageId: number, status: EMessageStatus): Promise<void>;
  deleteMessagesByThread(thread: string): Promise<void>;
}
