import { tool } from '@langchain/core/tools';
import { model } from '../model';
import { StateAnnotation } from '../State';
import { tools } from '../tools';
import { toolsCondition } from '@langchain/langgraph/prebuilt';
import { END } from '@langchain/langgraph';
import { z } from 'zod';

const toBookingAgent = tool(
  () => {
    return 'booking';
  },
  {
    name: 'to_booking_agent',
    description: 'Delegate to booking agent',
    schema: z.object({
      noOp: z.string().optional().describe('No-op parameter.'),
    }),
  },
);

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
    .bindTools([...tools, toBookingAgent])
    .invoke([{ role: 'system', content: SYSTEM_TEMPLATE }, ...state.messages]);

  return {
    messages: [receptionistResponse],
  };
}

export function routeReceptionistAgent(state: typeof StateAnnotation.State) {
  const route = toolsCondition(state);

  if (route === END) {
    return END;
  }

  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls?.length
  ) {
    if (lastMessage.tool_calls[0].name === 'to_booking_agent') {
      return 'enter_booking_tools';
    }

    return 'primary_tools';
  }

  return END;
}
