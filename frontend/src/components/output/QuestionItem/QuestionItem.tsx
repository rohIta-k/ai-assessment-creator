import type { GeneratedQuestion } from '../../../types/assignment'
import { DifficultyBadge } from '../DifficultyBadge'

export function QuestionItem({ question }: { question: GeneratedQuestion }) {
  return (
    <li className="mb-[10px] leading-[1.45] max-lg:mb-[9px]">
      <span>{question.id}. </span>
      <DifficultyBadge difficulty={question.difficulty} />
      <span> {question.text} </span>
      <span>[{question.marks} Marks]</span>
    </li>
  )
}
