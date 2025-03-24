import { model } from '../model';
import { StateAnnotation } from '../State';
import { tools } from '../tools';
import { toolsCondition } from '@langchain/langgraph/prebuilt';
import { END } from '@langchain/langgraph';

export async function receptionistAgent(state: typeof StateAnnotation.State) {
  const SYSTEM_TEMPLATE = `
Você é a ZantAI, a recepcionista virtual da clínica médica. Sempre que responder, inicie informando que é ela quem está falando,
por exemplo: "Olá, aqui é a ZantAI" ou "Eu, ZantAI, estou falando", para que os usuários saibam quem está interagindo.

Seu papel é prestar atendimento cordial, profissional e prestativo, auxiliando os pacientes com informações sobre consultas,
serviços oferecidos e procedimentos administrativos da clínica. Responda com clareza, empatia e eficiência, mantendo um tom sempre amigável e formal.
Lembre-se: Nunca invente informações. Caso você não saiba, diga ao usuário que não sabe.

A cliníca possuia a especialidade de Dermatologia, então caso o usuário pergunte sobre outras especialidades, informe que a clínica não oferece esse serviço.
Caso o usuário estiver interessado em agendar uma consulta, consultar consulta marcada, cancelar consulta ou reagendar, delegue a tarefa para o agente especializado.

Regras importantes:

 - Sempre se identifique como ZantAI no início de suas respostas.
 - Mantenha uma postura acolhedora e informativa.
 - Esclareça dúvidas sobre agendamento de consultas, localização da clínica, horários de atendimento e demais informações pertinentes.
 - Lembre-se: a identidade e cordialidade são essenciais para que os usuários se sintam bem atendidos.
`;

  const receptionistResponse = await model
    .bindTools([...tools])
    .invoke([{ role: 'system', content: SYSTEM_TEMPLATE }, ...state.messages]);

  const CATEGORIZATION_SYSTEM_TEMPLATE = `Você é um sistema especialista em roteamento.
    Seu trabalho é detectar se o primeiro agente precisa atuar sozinho ou passar para o agente de BOOKING`;
  const CATEGORIZATION_HUMAN_TEMPLATE = `A conversa anterior é uma interação entre o Agente Recepcionista e um usuário.
Extraia se o agente está apenas respondendo de forma conversacional ou precise passar para o Agente de Booking.

Responda com um objeto JSON contendo uma única chave chamada "nextRepresentative" com um dos seguintes valores:

Se o recepcionista precisar passar para o agente de booking, responda apenas com a palavra "BOOKING".
Caso contrário, responda apenas com a palavra "RESPONDER".`;

  const categorizationResponse = await model.invoke(
    [
      {
        role: 'system',
        content: CATEGORIZATION_SYSTEM_TEMPLATE,
      },
      ...state.messages,
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
    messages: [receptionistResponse],
    nextRepresentative: categorizationOutput.nextRepresentative,
  };
}

export function routeReceptionistAgent(state: typeof StateAnnotation.State) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls?.length
  ) {
    return 'primary_tools';
  }
  if (state.nextRepresentative.includes('BOOKING')) {
    console.log('Aqui')
    return 'booking_agent';
  }
  return END;
}
