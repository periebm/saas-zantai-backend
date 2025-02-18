import { model } from './model';
import { StateAnnotation } from './State';

export async function filmeSupport(state: typeof StateAnnotation.State) {
  const SYSTEM_TEMPLATE = `Você é um especialista em filmes altamente conhecedor.

LEMBRESE. TODA MENSAGEM QUE VC ENVIAR, INICIE DIZENDO "EU SOU O AGENTE DE FILMES"

Seu trabalho é ajudar os usuários com dúvidas sobre filmes, oferecendo recomendações, curiosidades e informações detalhadas sobre qualquer título.
Responda da melhor forma possível, mas seja conciso em suas respostas.

Você tem a capacidade de autorizar a devolução de filmes alugados, o que pode ser feito encaminhando o usuário para outro agente responsável por processar a devolução.

Se fizer isso, assuma que o outro agente já tem todas as informações necessárias sobre o usuário e o filme alugado.
Você não precisa pedir mais detalhes.

Ajude o usuário da melhor forma possível, mas mantenha suas respostas diretas e objetivas.`;

  let trimmedHistory = state.messages;
  // Make the user's question the most recent message in the history.
  // This helps small models stay focused.
  if (trimmedHistory.at(-1)!._getType() === 'ai') {
    trimmedHistory = trimmedHistory.slice(0, -1);
  }

  const billingRepResponse = await model.invoke([
    {
      role: 'system',
      content: SYSTEM_TEMPLATE,
    },
    ...trimmedHistory,
  ]);
  const CATEGORIZATION_SYSTEM_TEMPLATE = `Seu trabalho é detectar se um representante de suporte de filmes deseja autorizar a devolução de um filme alugado.`;
  const CATEGORIZATION_HUMAN_TEMPLATE = ` texto a seguir é uma resposta de um especialista de filmes.
Extraia se ele deseja autorizar a devolução de um filme alugado ou não.

Responda com um objeto JSON contendo uma única chave chamada "nextRepresentative" com um dos seguintes valores:

Se o representante deseja autorizar a devolução do filme, responda apenas com a palavra "DEVOLVER".
Caso contrário, responda apenas com a palavra "RESPONDER".
Aqui está o texto:

<text>
${billingRepResponse.content}
</text>.`;
  const categorizationResponse = await model.invoke(
    [
      {
        role: 'system',
        content: CATEGORIZATION_SYSTEM_TEMPLATE,
      },
      {
        role: 'user',
        content: CATEGORIZATION_HUMAN_TEMPLATE,
      },
    ],
    {
      response_format: {
        type: 'json_object',
      },
    },
  );
  const categorizationOutput = JSON.parse(categorizationResponse.content as string);
  return {
    messages: billingRepResponse,
    nextRepresentative: categorizationOutput.nextRepresentative,
  };
}

export async function animeSupport(state: typeof StateAnnotation.State) {
  const SYSTEM_TEMPLATE = `Você é um especialista em animes altamente conhecedor.

LEMBRESE TODA MENSAGEM QUE VC ENVIAR, INICIE DIZENDO "EU SOU O AGENTE DE ANIMES"
Seu trabalho é ajudar os usuários com dúvidas sobre animes, oferecendo respostas precisas e informativas.
Responda da melhor forma possível, mas seja conciso em suas respostas.

Você tem a capacidade de recomendar animes com base no gosto do usuário e de encaminhá-lo para um especialista mais avançado caso precise de informações extremamente detalhadas sobre um anime específico.

Se fizer isso, assuma que o outro especialista já tem todas as informações necessárias sobre o anime ou o interesse do usuário.
Você não precisa pedir mais detalhes.

Ajude o usuário da melhor forma possível, mas mantenha suas respostas diretas e objetivas.`;

  let trimmedHistory = state.messages;
  // Make the user's question the most recent message in the history.
  // This helps small models stay focused.
  if (trimmedHistory.at(-1)!.getType() === 'ai') {
    trimmedHistory = trimmedHistory.slice(0, -1);
  }

  const response = await model.invoke([
    {
      role: 'system',
      content: SYSTEM_TEMPLATE,
    },
    ...trimmedHistory,
  ]);

  return {
    messages: response,
  };
}
