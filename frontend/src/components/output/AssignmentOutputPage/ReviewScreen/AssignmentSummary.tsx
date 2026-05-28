import { FileText } from 'lucide-react'
import type { GeneratedAssignment } from '../../../../types/assignment'

export function AssignmentSummary({ assignment }: { assignment: GeneratedAssignment }) {
    const paper = assignment.generatedPaper
    const hasSourceFile = Boolean(paper.sourceFile && paper.sourceFile !== 'Uploaded material')

    return (
        <aside className="w-[270px] rounded-[14px] border border-[#dedede] pb-[32px] bg-white/45 p-[24px] max-xl:hidden">
            <h2 className="flex items-center gap-[12px] text-[16px] font-bold"><FileText className="h-[18px] w-[18px]" /> Assignment Summary</h2>
            <div className="mt-[22px] h-px bg-[#d5d5d5]" />
            {[
                ['Title', assignment.title],
                ['Due Date', paper.dueDate],
                ['Total Marks', String(paper.totalMarks)],
                ['Total Questions', String(paper.totalQuestions)],
                ['Question Types', paper.questionTypes.join(', ')],
            ].map(([label, value]) => (
                <div key={label} className="mt-[22px]">
                    <p className="text-[14px] text-muted-80">{label}</p>
                    <p className="mt-[8px] text-[14px] font-medium text-primary">{value}</p>
                </div>
            ))}
            {hasSourceFile ? (
                <div className="mt-[24px]">
                    <p className="text-[14px] text-muted-80">Source File</p>
                    <span className="mt-[8px] inline-flex h-[38px] items-center gap-[8px] rounded-[6px] border border-[#dedede] bg-white px-[12px] text-[13px] font-medium">
                        <FileText className="h-[16px] w-[16px]" /> {paper.sourceFile}
                    </span>
                </div>
            ) : null}
        </aside>
    )
}