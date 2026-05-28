import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, RefreshCcw } from 'lucide-react'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import type { GeneratedAssignment } from '../../../types/assignment'
import { ProgressStepper } from '../../../components/assignments/ProgressStepper'
import { PageTitle } from './PageTitle'
import { ActionButton } from './ReviewScreen/ActionButton'
import { AssignmentSummary } from './ReviewScreen/AssignmentSummary'
import { ExportButton } from './ReviewScreen/ExportButton'
import { QuestionPaperView } from './ReviewScreen/QuestionPaperView'
interface ReviewScreenProps {
    assignment: GeneratedAssignment
    onRegenerate: () => void
    onSave: () => void
    onGoToAssignments: () => void
    onGoToCreate: () => void
    toast: string
}

export function ReviewScreen({ assignment, onRegenerate, onSave, onGoToAssignments, onGoToCreate, toast }: ReviewScreenProps) {
    const [tab, setTab] = useState<'preview' | 'answers'>('preview')
    const paper = assignment.generatedPaper

    return (
        <>
            <div className="mt-[8px] flex items-center justify-between gap-[24px] max-xl:flex-col max-xl:items-center max-xl:gap-[18px] max-md:mt-[34px] max-md:gap-[28px]">
                <PageTitle />
                <div className="flex items-center justify-center gap-[28px] max-xl:w-full max-xl:justify-center max-sm:gap-[16px] max-sm:flex-wrap max-sm:center">
                    <ActionButton onClick={onRegenerate}><RefreshCcw className="h-[20px] w-[20px]" /> Regenerate</ActionButton>
                    <ActionButton onClick={onSave}><Bookmark className="h-[20px] w-[20px]" /> Save</ActionButton>
                    <ExportButton paper={paper} />
                </div>
            </div>

            <ProgressStepper firstLineClassName="bg-[#dadada]" secondLineClassName="bg-[#5d5d5d]" />

            <section className="mt-[28px] grid items-start grid-cols-[270px_1fr] gap-[18px] rounded-[14px] max-xl:grid-cols-1 max-xl:gap-0 max-md:mt-[38px]">
                <AssignmentSummary assignment={assignment} />
                <div className="rounded-[14px] border border-[#dedede] bg-white/42 p-[22px] max-md:rounded-[26px] max-md:p-[26px]">
                    <div className="flex items-center justify-between border-b border-[#d7d7d7] pb-[12px]">
                        <h2 className="flex items-center gap-[12px] text-[16px] font-bold ">
                            <FileText className="h-[18px] w-[18px] max-[655px]:h-[24px]" /> Preview
                        </h2>
                        <div className="grid w-[246px] grid-cols-2 text-center text-[14px]">
                            <button type="button" onClick={() => setTab('preview')} className={`pb-[4px] items-center ${tab === 'preview' ? 'border-b-2 border-[#111] font-semibold text-[#111]' : 'text-[#8a8a8a]'}`}>
                                Preview
                            </button>
                            <button type="button" onClick={() => setTab('answers')} className={`pb-[4px] items-center ${tab === 'answers' ? 'border-b-2 border-[#111] font-semibold text-[#111]' : 'text-[#8a8a8a]'}`}>
                                Answer Key
                            </button>
                        </div>
                    </div>
                    <div className="mt-[16px]">
                        <QuestionPaperView paper={paper} mode={tab} />
                    </div>
                </div>
            </section>

            <div className="mt-[18px] flex items-center justify-between max-md:mt-[22px]">
                <button type="button" onClick={onGoToCreate} className="h-[44px] rounded-full bg-white px-[24px] text-[16px] font-medium shadow-[0_10px_20px_rgba(0,0,0,0.04)] max-[655px]:h-[58px] max-[655px]:px-[34px]">
                    ← Previous
                </button>
                <button type="button" onClick={onGoToAssignments} className="h-[44px] rounded-full bg-[#151515] px-[26px] text-[16px] font-medium text-white shadow-[0_10px_20px_rgba(0,0,0,0.18)] max-[655px]:h-[58px] max-[655px]:px-[34px]">
                    Go to Assignments
                </button>
            </div>
            <AnimatePresence>
                {toast ? (
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="fixed bottom-[108px] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#202020] px-[22px] py-[12px] text-[14px] font-semibold text-white">
                        {toast}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    )
}