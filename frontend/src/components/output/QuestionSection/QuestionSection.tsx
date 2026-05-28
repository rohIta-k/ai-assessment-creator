import type { GeneratedQuestion } from '../../../types/assignment'
import { QuestionItem } from '../QuestionItem'

export function QuestionSection({ questions }: { questions: GeneratedQuestion[] }) {
  return (
    <section className="mt-[22px]">
      <h3 className="text-center text-[17px] font-bold max-lg:text-[11px]">Section A</h3>
      <div className="mt-[20px] max-lg:mt-[14px]">
        <h4 className="text-[13px] font-bold max-lg:text-[9px]">Short Answer Questions</h4>
        <p className="text-[11px] italic max-lg:text-[8px]">Attempt all questions. Each question carries 2 marks</p>
      </div>
      <ol className="mt-[18px] text-[11px] max-lg:mt-[12px] max-lg:text-[8px]">
        {questions.map((question) => (
          <QuestionItem key={question.id} question={question} />
        ))}
      </ol>
    </section>
  )
}
