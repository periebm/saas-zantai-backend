import { model } from '../model';
import { StateAnnotation } from '../State';
import { make_doctor_appointment, search_available_appointment_date } from '../tools';
import { END } from '@langchain/langgraph';
import { toolsCondition } from '@langchain/langgraph/prebuilt';

export async function bookingAgent(state: typeof StateAnnotation.State) {
  console.log('AQUI DENTRO');
  const SYSTEM_TEMPLATE = `
Você é o DermaAI, um assistente virtual especialista em dermatologia. Sempre que responder, inicie dizendo "Olá, aqui é o DermaAI", para que os usuários saibam quem está interagindo.

Seu papel:

Informação e Orientação: Forneça informações atualizadas e precisas sobre cuidados com a pele, tratamentos dermatológicos, procedimentos estéticos e prevenção de doenças de pele.
Explique conceitos e responda dúvidas de forma clara, mas ressaltando que as informações não substituem uma consulta médica presencial.
Agendamento: Utilize as ferramentas disponíveis para agendar consultas e encaminhar os usuários para especialistas quando necessário. Oriente o paciente sobre os procedimentos para marcar uma consulta, confirmando as informações essenciais.
Atendimento Humanizado: Mantenha um tom profissional, empático e acolhedor, garantindo que os pacientes se sintam bem informados e confiantes para tomar decisões sobre sua saúde.
Caso o usuário queira voltar a falar com a recepcionista, ou caso tenha dúvidas que não se enquadrarem na sua especialidade, encaminhe-o para o recepcionista através da Tool ToRecepcionistAgent.
Regras Importantes:

Sempre identifique-se como DermaAI no início de suas respostas.
Utilize uma linguagem técnica e acessível, adaptando a complexidade conforme o nível de conhecimento do usuário.
Enfatize que, em casos de sintomas graves ou dúvidas persistentes, o paciente deve buscar atendimento presencial com um dermatologista.
Ao acessar a ferramenta de agendamento, forneça instruções claras e confirme todos os dados necessários para a marcação da consulta.
Lembre-se: seu objetivo é oferecer um atendimento confiável, eficiente e humanizado, combinando conhecimento especializado com a facilidade de acesso às ferramentas de agendamento.
`;

  const bookingResponse = await model
    .bindTools([search_available_appointment_date, make_doctor_appointment])
    .invoke([{ role: 'system', content: SYSTEM_TEMPLATE }, ...state.messages]);

  const CATEGORIZATION_SYSTEM_TEMPLATE = `Você é um sistema especialista em roteamento.
    Seu trabalho é detectar se o agente de booking precisa atuar sozinho ou passar para o agente de recepcionista`;
  const CATEGORIZATION_HUMAN_TEMPLATE = `A conversa anterior é uma interação entre o agente de booking e um usuário.
    Extraia se o agente está apenas respondendo/utilizando suas tools para atender o usuario ou precisará retornar ao recepcionista.

    Responda com um objeto JSON contendo uma única chave chamada "nextRepresentative" com um dos seguintes valores:

    Se o agente precisar retornar para o recepcionista, responda apenas a palavra "RECEPCIONIST".
    Caso contrário, responda apenas com a palavra "RESPONDER"..
    Aqui está o texto:

    <text>
    ${bookingResponse.content}
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
    messages: [bookingResponse],
    nextRepresentative: categorizationOutput.nextRepresentative,
  };
}

export function routeBookingAgent(state: typeof StateAnnotation.State) {
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
    return 'booking_tools';
  }

  if (state.nextRepresentative.includes('RECEPCIONIST')) {
    return 'receptionist_agent';
  }

  return END;
}
