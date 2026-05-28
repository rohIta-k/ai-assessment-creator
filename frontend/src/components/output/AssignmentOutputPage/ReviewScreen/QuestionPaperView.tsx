import { useState, type ReactNode } from 'react'
import type { GeneratedPaper } from '../../../../types/assignment'
import { GraphQuestionVisual } from './GraphQuestionVisual'
import { buildQuestionPaperPages, type ReviewFlatItem } from './reviewScreenUtils'

export function QuestionPaperView({ paper, mode }: { paper: GeneratedPaper; mode: 'preview' | 'answers' }) {
    const getDifficultyClassName = (difficulty: string) => {
        if (difficulty === 'Hard') {
            return 'text-[#d92d20]'
        }

        if (difficulty === 'Medium') {
            return 'text-[#d7a100]'
        }

        return 'text-[#1a7f37]'
    }

    const renderQuestionModeInstructions = mode === 'preview'
    const sectionInstructionPrefix = 'Attempt all questions.'

    const flat: ReviewFlatItem[] = []

    paper.sections.forEach((section) => {
        section.questions.forEach((question) => {
            flat.push({
                sectionId: section.id,
                sectionTitle: section.title,
                sectionMarks: section.questions[0]?.marks ?? section.marks,
                question,
            })
        })
    })

    const pages = buildQuestionPaperPages(flat, mode)
    const [currentPage, setCurrentPage] = useState(0)
    const totalPages = pages.length || 1

    const goPrev = () => setCurrentPage((page) => Math.max(0, page - 1))
    const goNext = () => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))

    return (
        <div>
            <article id="assignment-printable" className="question-paper min-h-[820px] rounded-[8px] border border-[#ededed] bg-white px-[38px] py-[46px] text-[#111] shadow-[0_18px_35px_rgba(0,0,0,0.04)] max-md:px-[24px] max-md:py-[22px]">
                <h1 className="text-center text-[20px] font-extrabold uppercase tracking-[0] ">{paper.title}</h1>
                <div className="mt-[18px] flex items-center justify-between text-[14px] max-md:mt-[22px]"><p><strong>Total Marks:</strong> {paper.totalMarks}</p><p><strong>Total Questions:</strong> {paper.totalQuestions}</p></div>
                {renderQuestionModeInstructions ? (<div className="mt-[18px] space-y-[8px] text-[14px]"><p><strong>Instructions:</strong> All questions are compulsory unless stated otherwise.</p></div>) : null}
                {renderQuestionModeInstructions ? (<div className="mt-[18px] space-y-[10px] text-[14px] text-[#111]"><div className="space-y-[4px] font-medium"><p>Name: <span className="inline-block min-w-[180px] border-b border-[#111] align-baseline" /></p><p>Roll Number: <span className="inline-block min-w-[144px] border-b border-[#111] align-baseline" /></p><p>Class: <span className="inline-block min-w-[112px] border-b border-[#111] align-baseline" /></p></div></div>) : null}
                <div className="mt-[28px] h-px bg-[#9e9e9e]" />

                <div className="mt-[28px] space-y-[28px] max-md:space-y-[32px]">
                    {(pages[currentPage] || []).reduce<ReactNode[]>((acc, item, index) => {
                        const previousItem = (pages[currentPage] || [])[index - 1]
                        const showSectionHeader = index === 0 || previousItem?.sectionId !== item.sectionId

                        if (showSectionHeader) {
                            acc.push(
                                <section key={`${item.sectionId}-${index}`}>
                                    <span className="inline-flex h-[28px] items-center rounded-[8px] bg-[#ffded6] px-[12px] text-[13px] font-extrabold uppercase text-[#ff3f1d] max-md:h-[40px] max-md:px-[16px]">{item.sectionTitle}</span>
                                    {renderQuestionModeInstructions ? (<div className="mt-[10px] text-[13px] font-semibold leading-[1.5] text-[#4d4d4d]"><p>{sectionInstructionPrefix} Each question carries {item.sectionMarks} mark{item.sectionMarks > 1 ? 's' : ''}.</p></div>) : null}
                                </section>
                            )
                        }

                        acc.push(
                            <div key={item.question.id} className="border-b border-[#dedede] pb-[22px] last:border-b-0">
                                <div className="flex items-start justify-between gap-[18px] text-[13px] max-md:flex-col">
                                    <div className="flex min-w-0 flex-1 gap-[14px]">
                                        <strong>{item.question.id}.</strong>
                                        <div className="min-w-0 flex-1">
                                            {item.question.visual ? <GraphQuestionVisual visual={item.question.visual} /> : null}
                                            <p className="mt-[10px]">
                                                {item.question.text}{mode === 'answers' ? (<span className={`ml-[6px] font-semibold ${getDifficultyClassName(item.question.difficulty)}`}>({item.question.difficulty})</span>) : null}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0">[{item.question.marks} Mark{item.question.marks > 1 ? 's' : ''}]</span>
                                </div>
                                {item.question.options ? (<div className="mt-[18px] grid max-w-[430px] grid-cols-2 gap-x-[70px] gap-y-[14px] pl-[34px] text-[13px] max-md:max-w-none max-md:gap-x-[42px]">{item.question.options.map((option: string, optionIndex: number) => (<p key={`${item.question.id}-${optionIndex}`}>{String.fromCharCode(65 + optionIndex)}. {option}</p>))}</div>) : null}
                                {mode === 'answers' ? (<p className="answer-line mt-[14px] rounded-[8px] bg-[#f5f5f5] p-[10px] text-[13px] text-primary"><strong>Answer:</strong> {item.question.answer}</p>) : null}
                            </div>
                        )

                        return acc
                    }, [])}
                </div>
            </article>

            <div className="mt-[12px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={goPrev} className="h-[36px] w-[36px] rounded-full border border-[#dedede] bg-white">←</button>
                    <div className="px-3">Page {currentPage + 1} / {totalPages}</div>
                    <button type="button" onClick={goNext} className="h-[36px] w-[36px] rounded-full border border-[#dedede] bg-white">→</button>
                </div>
                <div />
            </div>
        </div>
    )
}