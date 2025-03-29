import { toolsCondition } from '@langchain/langgraph/prebuilt';
import { model } from '../model';
import { StateAnnotation } from '../State';
import { END } from '@langchain/langgraph';

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
  if (trimmedHistory.at(-1)!.getType() === 'ai') {
    trimmedHistory = trimmedHistory.slice(0, -1);
  }

  const billingRepResponse = await model.invoke([
    {
      role: 'system',
      content: SYSTEM_TEMPLATE,
    },
    ...trimmedHistory,
  ]);
  const CATEGORIZATION_SYSTEM_TEMPLATE = `Você é um sistema especialista em roteamento.
Seu trabalho é detectar se o primeiro agente precisa atuar sozinho ou passar para o agente de BOOKING`;
  const CATEGORIZATION_HUMAN_TEMPLATE = `A conversa anterior é uma interação entre o Agente  e um usuário.
Extraia se o agente está apenas respondendo de forma conversacional ou precisará utilizar uma TOOL.

Responda com um objeto JSON contendo uma única chave chamada "nextRepresentative" com um dos seguintes valores:

Se o representante deseja utilizar alguam ferramente para responder, responda apenas com a palavra "TOOL" e adicione no tool_calls, sendo que a tool que ele pode utilizar é a get_date_hour_now que retorna a data e hora atual.
Caso contrário, responda apenas com a palavra "RESPONDER"..
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
