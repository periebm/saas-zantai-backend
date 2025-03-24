import 'dotenv/config';

import { graph2 } from './IA_test_2/Graph';
import { printGraph } from './printGraph';

async function startAi2() {
  const threadId = 'refund_testing_id';
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  await printGraph();
  while (true) {
    const userInput = await new Promise<string>((resolve) => {
      const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Você: ', (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });

    messages.push({
      role: 'user',
      content: userInput,
    });

    const stream = await graph2.stream(
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
      if (value?.anime_support?.messages?.content) {
        assistantMessage.push(value.anime_support.messages.content);
      }
      if (value?.film_support?.messages?.content) {
        assistantMessage.push(value.film_support.messages.content);
      }
    }

    // Adiciona a mensagem da IA no histórico
    if (assistantMessage) {
      messages.push({
        role: 'assistant',
        content: assistantMessage[assistantMessage.length - 1],
      });

      console.log(`IA: ${assistantMessage}`);
    } else {
      console.error('Erro: Não foi possível obter a resposta da IA.');
    }
  }
}

(async function () {
  try {
    await startAi2();
    console.log('AI workflow started successfully.');
  } catch (error) {
    console.error('Error starting AI workflow:', error);
  }
})();
