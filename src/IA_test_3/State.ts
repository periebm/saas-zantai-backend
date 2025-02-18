import { Annotation, BinaryOperatorAggregate, MessagesAnnotation } from '@langchain/langgraph';
import { AnnotationRoot, Messages } from '@langchain/langgraph/dist/graph';

export function updateDialogStack(left: string[], right: string | null): string[] {
  if (right === null) {
    return left;
  }
  if (right === 'pop') {
    return left.slice(0, -1);
  }
  return [...left, right];
}

export type StateType = {
  messages: AnnotationRoot<{
    messages: BinaryOperatorAggregate<any[], Messages>;
  }>; // Baseado no conteúdo do MessagesAnnotation.spec
  user_info: string; // Campo user_info é uma string
  dialog_state: string[]; // dialog_state é um array de strings
};

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  user_info: Annotation<string>,
  dialog_state: Annotation<string[]>,
});
