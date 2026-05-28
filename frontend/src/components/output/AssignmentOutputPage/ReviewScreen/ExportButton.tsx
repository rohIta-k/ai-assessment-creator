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
        <div style="margin-top:18px">
          <span style="display:inline-block;padding:6px 12px;background:#ffded6;color:#ff3f1d;font-weight:800;border-radius:8px;">${item.sectionTitle}</span>
        </div>
        ${includeAnswers ? '' : `<div style="margin-top:10px;color:#4d4d4d;font-weight:600;">Attempt all questions. Each question carries ${item.sectionMarks} mark${item.sectionMarks > 1 ? 's' : ''}.</div>`}
      ` : ''}
      <div style="border-bottom:1px solid #dedede;padding:14px 0;">
        <div style="display:flex;justify-content:space-between;gap:18px;font-size:13px;align-items:flex-start;">
          <div style="display:flex;gap:14px;min-width:0;flex:1;">
            <strong>${item.question.id}.</strong>
            <div style="min-width:0;flex:1;">
              ${item.question.visual ? buildStaticGraphHtml(item.question.visual) : ''}
              <div style="margin-top:10px;">
                ${item.question.text}
                ${includeAnswers ? `<span style="margin-left:6px;font-weight:700;color:${difficultyColor};">(${item.question.difficulty})</span>` : ''}
              </div>
            </div>
          </div>
          <div>[${item.question.marks} Mark${item.question.marks > 1 ? 's' : ''}]</div>
        </div>
        ${item.question.options ? `
          <div style="margin-top:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding-left:34px;">
            ${item.question.options.map((option, index) => `
              <div>${String.fromCharCode(65 + index)}. ${option}</div>
            `).join('')}
          </div>
        ` : ''}
        ${includeAnswers ? `
          <div style="margin-top:12px;padding:10px;background:#f5f5f5;border-radius:8px;">
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
    const totalPages = pages.length || 1

    const pageHtml = pages.map((pageItems, pageIndex) => {
        let lastSection = ''

        const content = pageItems.map((item) => {
            const isFirstInSection = item.sectionId !== lastSection
            lastSection = item.sectionId
            return renderQuestionHtml(item, includeAnswers, isFirstInSection)
        }).join('')

        return `
          <div class="page">
            <h1>${paper.title}</h1>

            <div class="meta">
              <div><strong>Total Marks:</strong> ${paper.totalMarks}</div>
              <div><strong>Total Questions:</strong> ${paper.totalQuestions}</div>
            </div>

            ${!includeAnswers ? `
              <div class="instructions"><strong>Instructions:</strong> All questions are compulsory unless stated otherwise.</div>
              <div class="student-meta">
                <div>Name: ______________________</div>
                <div>Roll Number: ______________________</div>
                <div>Class: ______________________</div>
              </div>
            ` : ''}

            <div class="content">${content}</div>

            <div class="footer">Page ${pageIndex + 1} / ${totalPages}</div>
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
            .page { box-sizing: border-box; width: 210mm; min-height: 297mm; padding: 18mm 15mm 20mm; position: relative; break-after: page; page-break-after: always; overflow: hidden; }
            .page:last-child { break-after: auto; page-break-after: auto; }
            h1 { text-align: center; font-size: 20px; margin: 0; text-transform: uppercase; }
            .meta { margin-top: 12px; display: flex; justify-content: space-between; font-size: 14px; }
            .instructions { margin-top: 12px; font-size: 14px; }
            .student-meta { margin-top: 12px; font-size: 14px; font-weight: 600; line-height: 1.9; }
            .content { margin-top: 18px; border-top: 1px solid #9e9e9e; padding-top: 18px; overflow: hidden; }
            .question-block { break-inside: avoid; page-break-inside: avoid; }
            .footer { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 12px; color: #666; }
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