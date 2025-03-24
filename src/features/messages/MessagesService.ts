import { IMessagesRepository } from './IMessagesRepository';

export class MessagesService {
  constructor(private repository: IMessagesRepository) {}

  async sendMessage(body: any) {
    return body;
  }
}
