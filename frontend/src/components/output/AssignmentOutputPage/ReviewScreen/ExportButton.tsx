import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { GeneratedPaper } from '../../../../types/assignment'
import { buildQuestionPaperPages, buildStaticGraphHtml, type ReviewFlatItem } from './reviewScreenUtils'

function renderQuestionHtml(item: ReviewFlatItem, includeAnswers: boolean, isFirstInSection: boolean) {
    const difficultyColor = item.question.difficulty === 'Hard'
        ? '#d92d20'
        : item.question.difficulty === 'Medium'
            ? '#d7a100'
            : '#1a7f37'

    return `
      <div class="question-block">
      ${isFirstInSection ? `
        <div class="section-title-wrap">
          <span style="display:inline-block;padding:6px 12px;background:#ffded6;color:#ff3f1d;font-weight:800;border-radius:8px;">${item.sectionTitle}</span>
          <div class="section-subtitle">Attempt all questions. Each question carries ${item.sectionMarks} mark${item.sectionMarks > 1 ? 's' : ''}.</div>
        </div>
      ` : ''}
      <div class="question-body">
        <div style="display:flex;justify-content:space-between;gap:18px;font-size:13px;align-items:flex-start;">
          <div style="display:flex;gap:14px;min-width:0;flex:1;">
            <strong>${item.question.id}.</strong>
            <div style="min-width:0;flex:1;">
              ${item.question.visual ? buildStaticGraphHtml(item.question.visual) : ''}
              <div class="question-text">
                ${item.question.text}
                ${includeAnswers ? `<span style="margin-left:6px;font-weight:700;color:${difficultyColor};">(${item.question.difficulty})</span>` : ''}
              </div>
            </div>
          </div>
          <div>[${item.question.marks} Mark${item.question.marks > 1 ? 's' : ''}]</div>
        </div>
        ${item.question.options ? `
          <div class="options-grid">
            ${item.question.options.map((option, index) => `
              <div>${String.fromCharCode(65 + index)}. ${option}</div>
            `).join('')}
          </div>
        ` : ''}
        ${includeAnswers ? `
          <div class="answer-box">
            <strong>Answer:</strong> ${item.question.answer}
          </div>
        ` : ''}
      </div>
      </div>
    `
}

function buildPaginatedHtml(paper: GeneratedPaper, includeAnswers: boolean) {
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

    const pages = buildQuestionPaperPages(flat, includeAnswers ? 'answers' : 'preview')
    const paperInstructions = paper.instructions || 'All questions are compulsory unless stated otherwise.'

    const pageHtml = pages.map((pageItems) => {
        let lastSection = ''

        const content = pageItems.map((item) => {
            const isFirstInSection = item.sectionId !== lastSection
            lastSection = item.sectionId
            return renderQuestionHtml(item, includeAnswers, isFirstInSection)
        }).join('')

        return `
          <div class="page">
            <div class="paper-title">${paper.title}</div>
            <div class="totals-row"><p><strong>Total Marks:</strong> ${paper.totalMarks}</p><p><strong>Total Questions:</strong> ${paper.totalQuestions}</p></div>
            <div class="instructions"><strong>Instructions:</strong> ${paperInstructions}</div>
            <div class="student-info">
              <div class="student-line"><strong>Name:</strong> ________________________________</div>
              <div class="student-line"><strong>Class:</strong> ____________________</div>
              <div class="student-line"><strong>Roll Number:</strong> ____________________</div>
            </div>
            <div class="divider"></div>

            <div class="content">${content}</div>
          </div>
        `
    }).join('\n')

    return `
      <html>
        <head>
          <title>${paper.title}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 0; }
            @page { size: A4 portrait; margin: 0; }
            .page { box-sizing: border-box; width: 210mm; min-height: 297mm; padding: 16mm 15mm 18mm; position: relative; break-after: page; page-break-after: always; overflow: hidden; }
            .page:last-child { break-after: auto; page-break-after: auto; }
            .paper-title { text-align: center; font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; }
            .totals-row { margin-top: 16px; display: flex; justify-content: space-between; gap: 16px; font-size: 14px; }
            .totals-row p { margin: 0; }
            .instructions { margin-top: 16px; font-size: 13px; line-height: 1.5; }
            .student-info { display: block; margin-top: 16px; font-size: 13px; }
            .student-line { margin-bottom: 8px; }
            .divider { margin-top: 18px; height: 1px; background: #9e9e9e; }
            .content { margin-top: 18px; overflow: hidden; }
            .question-block { break-inside: avoid; page-break-inside: avoid; margin: 0; }
            .question-block + .question-block { margin-top: 0; }
            .section-title-wrap { margin-top: 0; margin-bottom: 10px; }
            .section-subtitle { margin-top: 6px; font-size: 13px; font-weight: 600; line-height: 1.5; color: #4d4d4d; }
            .question-body { border-bottom: 1px solid #dedede; padding: 0 0 14px; }
            .question-block:last-child .question-body { border-bottom: none; }
            .question-text { margin-top: 10px; }
            .options-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 70px; padding-left: 34px; font-size: 13px; }
            .answer-box { margin-top: 12px; padding: 10px; background: #f5f5f5; border-radius: 8px; font-size: 13px; }
          </style>
        </head>
        <body>${pageHtml}</body>
      </html>
    `
}

export function ExportButton({ paper }: { paper: GeneratedPaper }) {
    const [open, setOpen] = useState(false)

    const exportPaper = (includeAnswers: boolean) => {
        setOpen(false)

        const printWindow = window.open('', '_blank', 'width=900,height=1100')
        if (!printWindow) return

        printWindow.document.write(buildPaginatedHtml(paper, includeAnswers))
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex h-[44px] overflow-hidden rounded-full bg-[linear-gradient(90deg,#ff7950_0%,#c0350a_100%)] text-[16px] font-medium text-white shadow-[0_10px_20px_rgba(255,73,30,0.18)]"
            >
                <span className="grid flex-1 place-items-center whitespace-nowrap pl-[16px] pr-[4px] text-[14px]">Export PDF</span>
                <span className="grid w-[46px] place-items-center bg-black/8"><ChevronDown className="h-[22px] w-[22px]" /></span>
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-[66px] z-30 w-[230px] overflow-hidden rounded-[12px] border border-[#e2e2e2] bg-white shadow-[0_18px_44px_rgba(0,0,0,0.12)]"
                    >
                        <button type="button" onClick={() => exportPaper(false)} className="block h-[46px] w-full px-[16px] text-left text-[15px] font-medium hover:bg-[#f5f5f5]">Questions Only</button>
                        <button type="button" onClick={() => exportPaper(true)} className="block h-[46px] w-full px-[16px] text-left text-[15px] font-medium hover:bg-[#f5f5f5]">Questions + Answers</button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}