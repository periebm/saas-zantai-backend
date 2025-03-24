export interface FormattedWhatsAppMessage {
  number_to: string;
  number: string;
  message: string;
  timestamp: string;
}
export interface IMessagesRepository {
  saveMessages(messages: FormattedWhatsAppMessage[]): Promise<void>;
}
