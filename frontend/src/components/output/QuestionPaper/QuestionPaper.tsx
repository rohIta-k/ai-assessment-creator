import { useAssignmentStore } from '../../../store/assignmentStore'
import { QuestionSection } from '../QuestionSection'
import { StudentInfo } from '../StudentInfo'

export function QuestionPaper() {
  const questions = useAssignmentStore((state) => state.generatedQuestions)

  return (
    <article className="min-h-[980px] rounded-[18px] bg-white px-[50px] py-[34px] text-[#151515] shadow-[0_14px_28px_rgba(0,0,0,0.08)] max-lg:min-h-[900px] max-lg:rounded-[14px] max-lg:px-[24px] max-lg:py-[24px]">
      <header className="text-center">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] max-lg:text-[15px]">Delhi Public School, Sector-4, Bokaro</h1>
        <p className="mt-[8px] text-[15px] font-bold max-lg:text-[10px]">Subject: English</p>
        <p className="mt-[4px] text-[15px] font-bold max-lg:text-[10px]">Class: 5th</p>
      </header>

      <div className="mt-[32px] flex justify-between text-[12px] font-bold max-lg:mt-[22px] max-lg:block max-lg:space-y-[8px] max-lg:text-[8px]">
        <p>Time Allowed: 45 minutes</p>
        <p>Maximum Marks: 20</p>
      </div>

      <p className="mt-[24px] text-[12px] font-bold max-lg:mt-[18px] max-lg:text-[8px]">
        All questions are compulsory unless stated otherwise.
      </p>

      <StudentInfo />
      <QuestionSection questions={questions} />

      <p className="mt-[20px] text-[12px] font-bold max-lg:text-[8px]">End of Question Paper</p>

      <section className="mt-[36px] text-[11px] leading-[1.55] max-lg:mt-[24px] max-lg:text-[8px]">
        <h3 className="mb-[12px] text-[13px] font-bold max-lg:text-[9px]">Answer Key:</h3>
        <p>
          1. Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric
          current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.
        </p>
        <p className="mt-[10px]">2. A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.</p>
        <p className="mt-[10px]">3. Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.</p>
        <p className="mt-[10px]">4. An example is the electroplating of silver on jewellery to prevent tarnishing.</p>
        <p className="mt-[10px]">5. Electric current causes the movement of ions leading to chemical changes at the electrodes.</p>
      </section>
    </article>
  )
}
