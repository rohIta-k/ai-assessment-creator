import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../../common/Button'
import { Card } from '../../common/Card'
import { Modal } from '../../common/Modal/Modal'
import { useAssignmentStore } from '../../../store/assignmentStore'
import { useAuthStore } from '../../../store/authStore'
import { generateAssignment } from '../../../lib/api'
import { UploadBox } from '../UploadBox'
import { QuestionTypeRow } from '../QuestionTypeRow'

export function AssignmentForm() {
  const router = useRouter()
  const { form, setDueDate, addQuestionType, setInstructions, setTopicName, startGeneration, failGeneration, generatedAssignment } = useAssignmentStore()
  const token = useAuthStore((state) => state.token)
  const [validationIssues, setValidationIssues] = useState<string[]>([])
  const totalQuestions = form.questionTypes.reduce((sum, type) => sum + type.questions, 0)
  const totalMarks = form.questionTypes.reduce((sum, type) => sum + type.questions * type.marks, 0)

  const hydratedAssignmentMatchesCurrentForm = Boolean(
    generatedAssignment?.generatedPaper &&
    generatedAssignment.title === (form.topicName || '') &&
    generatedAssignment.dueDate === (form.dueDate || '') &&
    generatedAssignment.instructions === (form.instructions || '') &&
    generatedAssignment.uploadedMaterial === (form.uploadName || '') &&
    generatedAssignment.uploadedMaterialDataUrl === (form.uploadDataUrl || '') &&
    JSON.stringify(generatedAssignment.questionTypes ?? []) === JSON.stringify(form.questionTypes ?? []),
  )
  const activeAssignmentId = generatedAssignment?.id ?? ''

  const getValidationIssues = () => {
    const issues: string[] = []
    const parsedDueDate = (() => {
      if (!/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/.test(form.dueDate)) {
        return null
      }

      const [day, month, year] = form.dueDate.split('-').map(Number)
      return new Date(year, month - 1, day)
    })()

    if (!form.topicName.trim()) {
      issues.push('Topic Name')
    }

    if (!form.dueDate.trim()) {
      issues.push('Due Date')
    } else if (!parsedDueDate) {
      issues.push('Valid Due Date')
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      parsedDueDate.setHours(0, 0, 0, 0)

      if (parsedDueDate < today) {
        issues.push('Due Date must be today or a future date')
      }
    }

    if (form.questionTypes.length === 0) {
      issues.push('Question Type')
    } else {
      form.questionTypes.forEach((type, index) => {
        if (!type.label.trim()) {
          issues.push(`Question Type ${index + 1} label`)
        }
        if (type.questions < 1) {
          issues.push(`Question Type ${index + 1} questions`)
        }
        if (type.marks < 1) {
          issues.push(`Question Type ${index + 1} marks`)
        }
      })
    }

    return issues
  }

  const handleCreateAssignment = async () => {
    if (!token) {
      return
    }

    const issues = getValidationIssues()
    if (issues.length > 0) {
      setValidationIssues(issues)
      return
    }

    setValidationIssues([])

    if (hydratedAssignmentMatchesCurrentForm && generatedAssignment?.id) {
      router.push(`/output?assignmentId=${encodeURIComponent(generatedAssignment.id)}`)
      return
    }

    const title = form.topicName || form.uploadName || 'Data Structures and Algorithms'
    try {
      const response = await generateAssignment(token, {
        assignmentId: activeAssignmentId || undefined,
        title,
        dueDate: form.dueDate,
        questionTypes: form.questionTypes,
        additionalInstructions: form.instructions,
        uploadedMaterial: form.uploadName,
        uploadedMaterialDataUrl: form.uploadDataUrl,
      })
      startGeneration(response.assignmentId, response.jobId)
      router.push('/output?state=loading')
    } catch (error) {
      failGeneration(error instanceof Error ? error.message : 'Could not start generation.')
      router.push('/output?state=loading')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[810px] max-lg:max-w-none">
      <Card className="rounded-[28px] bg-[#eeeeee] p-[32px] max-lg:rounded-[24px] max-lg:px-[16px] max-lg:py-[32px]">
        <h2 className="text-[20px] max-h-[28px] font-bold tracking-[-0.025em] max-lg:text-[18px] text-primary">Assignment Details</h2>
        <p className="mt-[6px] text-[14px] font-regular text-muted-80">Basic information about your assignment</p>

        <div className="mt-[28px] max-lg:mt-[16px]">
          <UploadBox />
          <p className="mt-[11px] max-h-[22px] font-medium text-center text-[16px] text-[#30303099] max-lg:mt-[8px] max-lg:text-[16px] max-lg:leading-[1.35]">
            Upload images of your preferred document/image
          </p>
        </div>

        <label className="mt-[20px] block max-lg:mt-[12px]">
          <span className="mb-[8px] block text-[16px] font-bold text-primary">
            Topic Name
          </span>

          <input
            value={form.topicName}
            onChange={(event) => setTopicName(event.target.value)}
            placeholder="e.g Artificial Intelligence"
            className="h-[44px] w-full rounded-full border-[1.25px] border-[#DADADA] px-[16px] py-[11px] text-[16px] text-[#303030] outline-none transition placeholder:text-[#a9a9a9] focus:border-[#222] max-lg:h-[40px] max-lg:px-[14px] max-lg:py-[10px] max-lg:text-[14px]"
          />
        </label>
        <label className="mt-[20px] max-h-[90px] block max-lg:mt-[12px]">
          <span className="mb-[8px] max-h-[22px] block text-[16px] font-bold text-primary max-lg:text-[16px]">Due Date</span>
          <span className="relative block">
            <input
              value={form.dueDate}
              onChange={(event) => {
                let value = event.target.value.replace(/\D/g, '')
                if (value.length > 8) {
                  value = value.slice(0, 8)
                }
                let formatted = value
                if (value.length > 2) {
                  formatted =
                    value.slice(0, 2) + '-' + value.slice(2)
                }
                if (value.length > 4) {
                  formatted =
                    value.slice(0, 2) +
                    '-' +
                    value.slice(2, 4) +
                    '-' +
                    value.slice(4)
                }
                setDueDate(formatted)
              }}
              placeholder="DD-MM-YYYY"
              className="h-[44px] w-full rounded-full border-[1.25px] border-[#DADADA] px-[16px] py-[11px] pr-[44px] text-[16px] text-[#303030] outline-none transition placeholder:text-[#a9a9a9] focus:border-[#222] max-lg:h-[40px] max-lg:px-[14px] max-lg:py-[10px] max-lg:text-[14px]"
            />
            <img src="/calendar.svg" alt="Calendar" className="absolute right-[16px] top-1/2 h-[24px] w-[24px] -translate-y-1/2 max-lg:right-[14px] max-lg:h-[20px] max-lg:w-[20px]" />
          </span>
          {form.dueDate &&
            !/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/.test(
              form.dueDate
            ) ? (
            <span className="mt-[6px] mb-[10px] block text-[12px] text-red-500 leading-[-0.5]">
              Invalid date
            </span>
          ) : null}
        </label>

        <div className="mt-[18px] grid grid-cols-[500px_116px_100px] gap-[12px] px-[1px] text-[16px] max-lg:mt-[14px] max-lg:grid-cols-2 max-lg:gap-y-[12px] max-lg:text-[16px]">
          <span className="font-bold">Question Type</span>
          <span className="text-center font-medium max-lg:hidden">
            No. of Questions
          </span>
          <span className="text-center font-medium max-lg:hidden">
            Marks
          </span>
        </div>

        <div className="mt-[10px] flex flex-col gap-[12px] max-lg:mt-[8px] max-lg:gap-[12px]">
          {form.questionTypes.map((type) => (
            <QuestionTypeRow
              key={type.id}
              type={type}
              className="grid grid-cols-[471px_32px_116px_100px] gap-[12px]"
            />
          ))}
        </div>

        <button type="button" onClick={addQuestionType} className="mt-[14px] flex items-center gap-[10px] text-[13px] font-bold text-[#242424] max-lg:mt-[10px] max-lg:text-[12px]">
          <span className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#282828] text-white">
            <Plus className="h-[20px] w-[20px]" />
          </span>
          <span className="font-bold text-[14px] text-primary">Add Question Type</span>
        </button>

        <div className="mt-[12px] text-right text-[16px] leading-[1.7] max-lg:mt-[10px] max-lg:text-[13px]">
          <p className="font-medium text-[16px] max-h-[18px] mb-[6px] text-primary">Total Questions : {totalQuestions}</p>
          <p className="font-medium text-[16px] max-h-[18px] text-primary ">Total Marks : {totalMarks}</p>
        </div>

        <label className="mt-[16px] hidden md:block">
          <span className="mb-[9px] block text-[16px] font-bold text-primary max-lg:mb-[6px] max-lg:text-[14px]">Additional Information (For better output)</span>
          <span className="relative block h-[102px] w-full max-w-[746px] rounded-[16px] border-[1.25px] border-dashed border-[#DADADA] bg-[#FFFFFF40] p-[16px] max-lg:h-[92px] max-lg:max-w-none max-lg:p-[12px]">
            <textarea
              value={form.instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              className="h-full w-full resize-none bg-transparent pr-[42px] text-[14px] font-medium outline-none placeholder:text-[#a9a9a9] max-lg:pr-[34px] max-lg:text-[13px]"
            />
            <span className="absolute bottom-[16px] right-[17px] grid h-[36px] w-[36px] place-items-center rounded-full bg-[#f0f0f0] max-lg:bottom-[10px] max-lg:right-[10px] max-lg:h-[30px] max-lg:w-[30px]">
              <img src="/mic.svg" alt="Microphone" className="h-[16px] w-[16px] max-lg:h-[14px] max-lg:w-[14px]" />
            </span>
          </span>
        </label>
      </Card>

      <Modal open={validationIssues.length > 0}>
        <div className="text-left">
          <h3 className="text-[18px] font-semibold text-primary">Complete the required fields</h3>
          <p className="mt-3 text-[14px] text-muted-90">
            Upload file and additional information are optional. Fill the remaining fields before continuing.
          </p>
          <ul className="mt-4 space-y-2 text-[14px] text-[#c0350a]">
            {validationIssues.map((issue) => (
              <li key={issue} className="rounded-[10px] bg-[#fff3ef] px-3 py-2">
                {issue}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              onClick={() => setValidationIssues([])}
              className="px-4"
            >
              Okay
            </Button>
          </div>
        </div>
      </Modal>

      <div className="mt-[28px] flex items-center justify-between max-lg:mt-[16px] max-lg:justify-center max-lg:gap-[30px]">
        <Button variant="secondary" className="w-[120px]" onClick={() => router.push('/dashboard')}>
          <span className="flex items-center gap-[8px] font-medium text-[16px]">
            <img src="/previous.svg" alt="Previous" className="h-[13px] w-[16px]" />
            Previous
          </span>
        </Button>
        <Button className="w-[96px] max-lg:w-[88px]" onClick={handleCreateAssignment}>
          <span className="flex items-center gap-[8px] font-medium text-[16px]">
            Next
            <img src="/next.svg" alt="Next" className="h-[13px] w-[16px]" />
          </span>
        </Button>
      </div>
    </div>
  )
}
