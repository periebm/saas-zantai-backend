import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

export type DadosDoPaciente = {
  nome: string;
  idade: number;
  telefone: string;
};

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  nextRepresentative: Annotation<string>,
  refundAuthorized: Annotation<boolean>,
  dadosDoPaciente: Annotation<DadosDoPaciente>,
});
