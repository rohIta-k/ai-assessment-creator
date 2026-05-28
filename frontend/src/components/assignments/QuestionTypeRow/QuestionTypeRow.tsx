import { ChevronDown, Minus, Plus, X } from 'lucide-react'
import type { QuestionType } from '../../../types/assignment'
import { useAssignmentStore } from '../../../store/assignmentStore'
import { questionTypeOptions } from '../../../constants/assignments'

interface QuestionTypeRowProps {
  type: QuestionType,
  className?: string
}

export function QuestionTypeRow({ type, className }: QuestionTypeRowProps) {
  const updateQuestionType = useAssignmentStore((state) => state.updateQuestionType)
  const removeQuestionType = useAssignmentStore((state) => state.removeQuestionType)

  return (
    <>
      <div
        className={`grid grid-cols-[500px_116px_100px] items-center gap-[12px] max-lg:hidden ${className ?? ''}`}
      >
        <div className="flex items-center gap-[12px]">
          <div className="relative flex h-[40px] w-[456px] items-center rounded-full bg-white px-[16px] text-[14px] font-semibold text-[#282828]">
            <select
              value={type.label}
              onChange={(event) => updateQuestionType(type.id, { label: event.target.value })}
              className="h-full w-full appearance-none bg-transparent pr-[28px] text-[16px] font-medium text-primary outline-none"
            >
              {questionTypeOptions.map((option) => (
                <option key={option.id} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[16px] h-[16px] w-[16px]" />
          </div>

          <button
            type="button"
            onClick={() => removeQuestionType(type.id)}
            className="grid h-[32px] w-[32px] place-items-center rounded-full transition hover:bg-white"
          >
            <X className="h-[16px] w-[16px]" />
          </button>
        </div>
        <Counter
          value={type.questions}
          onMinus={() =>
            updateQuestionType(type.id, {
              questions: Math.max(1, type.questions - 1),
            })
          }
          onPlus={() =>
            updateQuestionType(type.id, {
              questions: type.questions + 1,
            })
          }
        />
        <Counter
          value={type.marks}
          onMinus={() =>
            updateQuestionType(type.id, {
              marks: Math.max(1, type.marks - 1),
            })
          }
          onPlus={() =>
            updateQuestionType(type.id, {
              marks: type.marks + 1,
            })
          }
        />
      </div>

      <div className="rounded-[16px] bg-white p-[12px] lg:hidden">
        <div className="flex h-[28px] justify-between items-center gap-[10px] text-[14px] font-medium">
          <div className="relative inline-flex items-center">
            <select
              value={type.label}
              onChange={(event) =>
                updateQuestionType(type.id, {
                  label: event.target.value,
                })
              }
              className="appearance-none bg-transparent pr-[18px] text-[14px] font-medium text-primary outline-none"
            >
              {questionTypeOptions.map((option) => (
                <option key={option.id} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-0 h-[14px] w-[14px] text-primary" />
          </div>

          <button
            type="button"
            onClick={() => removeQuestionType(type.id)}
            className="grid h-[24px] w-[24px] place-items-center rounded-full"
          >
            <X className="h-[14px] w-[14px]" />
          </button>
        </div>
        <div className="mt-[8px] grid grid-cols-2 gap-[10px] rounded-[18px] bg-[#eeeeee] p-[8px]">
          <div>
            <p className="mb-[6px] text-center text-[14px] font-medium">No. of Questions</p>
            <Counter
              value={type.questions}
              mobile
              onMinus={() => updateQuestionType(type.id, { questions: Math.max(1, type.questions - 1) })}
              onPlus={() => updateQuestionType(type.id, { questions: type.questions + 1 })}
            />
          </div>
          <div>
            <p className="mb-[6px] text-center text-[16px] font-medium">Marks</p>
            <Counter
              value={type.marks}
              mobile
              onMinus={() => updateQuestionType(type.id, { marks: Math.max(1, type.marks - 1) })}
              onPlus={() => updateQuestionType(type.id, { marks: type.marks + 1 })}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function Counter({
  value,
  onMinus,
  onPlus,
  mobile = false,
}: {
  value: number
  onMinus: () => void
  onPlus: () => void
  mobile?: boolean
}) {
  return (
    <div className={mobile ? 'flex h-[34px] items-center justify-between rounded-full bg-white px-[8px] text-[14px] font-bold' : 'flex h-[40px] items-center justify-between rounded-full bg-white px-[10px] text-[14px] font-bold'}>
      <button onClick={onMinus} className="grid h-[24px] w-[24px] place-items-center rounded-full text-[#c9c9c9] transition hover:bg-white hover:text-[#222]">
        <Minus className="h-[14px] w-[14px]" />
      </button>
      <span className="font-medium text-[16px] text-primary ">{value}</span>
      <button onClick={onPlus} className="grid h-[24px] w-[24px] place-items-center rounded-full text-[#c9c9c9] transition hover:bg-white hover:text-[#222]">
        <Plus className="h-[14px] w-[14px]" />
      </button>
    </div>
  )
}
