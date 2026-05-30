import type { GeneratedPaperQuestion, GeneratedQuestionVisual } from '../../../../types/assignment'

export type ReviewMode = 'preview' | 'answers'

export interface ReviewFlatItem {
    sectionId: string
    sectionTitle: string
    sectionMarks: number
    question: GeneratedPaperQuestion
}

export function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

export function normalizeGraphPoints(visual: GeneratedQuestionVisual) {
    return (visual.points ?? []).map((point, index) => ({
        index,
        x: typeof point.x === 'number' ? point.x : index,
        label: String(point.x),
        y: point.y,
    }))
}

export function hasRenderableGraph(visual: GeneratedQuestionVisual) {
    return (visual.points?.length ?? 0) > 0
}

export function deriveGraphBounds(visual: GeneratedQuestionVisual) {
    if (visual.domain) {
        return {
            left: visual.domain[0],
            right: visual.domain[1],
        }
    }

    const points = normalizeGraphPoints(visual)
    if (points.length === 0) {
        return {
            left: -10,
            right: 10,
        }
    }

    const xs = points.map((point) => point.x)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const span = Math.max(maxX - minX, 1)
    const padding = Math.max(span * 0.25, 1)

    return {
        left: minX - padding,
        right: maxX + padding,
    }
}

export function buildStaticGraphHtml(visual: GeneratedQuestionVisual) {
    if (!hasRenderableGraph(visual)) {
        return ''
    }

    const points = normalizeGraphPoints(visual)
    const width = 720
    const height = 240
    const padding = { top: 26, right: 24, bottom: 42, left: 52 }
    const innerWidth = width - padding.left - padding.right
    const innerHeight = height - padding.top - padding.bottom

    const xValues = points.map((point) => point.x)
    const yValues = points.map((point) => point.y)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)
    const xRange = maxX - minX || 1
    const yRange = maxY - minY || 1

    const scaleX = (value: number) => padding.left + ((value - minX) / xRange) * innerWidth
    const scaleY = (value: number) => padding.top + innerHeight - ((value - minY) / yRange) * innerHeight

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${scaleX(point.x)} ${scaleY(point.y)}`)
        .join(' ')

    const bars = points.map((point) => {
        const x = scaleX(point.x)
        const barWidth = Math.max(12, innerWidth / Math.max(points.length * 1.7, 1))
        const zeroY = scaleY(Math.min(0, minY))
        const valueY = scaleY(point.y)
        const barHeight = Math.abs(zeroY - valueY)
        const y = Math.min(zeroY, valueY)

        return `<rect x="${x - barWidth / 2}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#ff6b3d" opacity="0.85" />`
    }).join('')

    const scatterDots = points.map((point) => (
        `<circle cx="${scaleX(point.x)}" cy="${scaleY(point.y)}" r="5" fill="#1f6feb" />`
    )).join('')

    const content = visual.chartType === 'bar'
        ? bars
        : visual.chartType === 'scatter'
            ? scatterDots
            : `<path d="${linePath}" fill="none" stroke="#ff6b3d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />${scatterDots}`

    return `
        <div style="padding:14px 16px;border:1px solid #dedede;border-radius:12px;background:#fff;">
            ${visual.title ? `<div style="font-weight:700;margin-bottom:10px;">${escapeHtml(visual.title)}</div>` : ''}
            <svg viewBox="0 0 ${width} ${height}" width="100%" height="240" aria-label="${escapeHtml(visual.title || 'Graph')}" role="img">
                <rect x="0" y="0" width="${width}" height="${height}" fill="#fff" />
                <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${padding.left + innerWidth}" y2="${padding.top + innerHeight}" stroke="#8a8a8a" stroke-width="2" />
                <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#8a8a8a" stroke-width="2" />
                ${content}
                <text x="${padding.left + innerWidth / 2}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#444">${escapeHtml(visual.xAxisLabel || '')}</text>
                <text x="18" y="${padding.top + innerHeight / 2}" text-anchor="middle" transform="rotate(-90 18 ${padding.top + innerHeight / 2})" font-size="12" fill="#444">${escapeHtml(visual.yAxisLabel || '')}</text>
                ${points.map((point) => `<text x="${scaleX(point.x)}" y="${padding.top + innerHeight + 18}" text-anchor="middle" font-size="11" fill="#666">${escapeHtml(String(point.label))}</text>`).join('')}
            </svg>
        </div>
    `
}

export function buildQuestionPaperPages(items: ReviewFlatItem[], mode: ReviewMode) {
    const MAX_PAGE_HEIGHT = 620

    const estimateQuestionHeight = (item: ReviewFlatItem) => {
        let height = 90

        if (item.question.options?.length) {
            height += 90
        }

        if (item.question.visual && hasRenderableGraph(item.question.visual)) {
            height += 190
        }

        if (mode === 'answers') {
            height += 70
        }

        const textLength = item.question.text.length

        if (textLength > 120) {
            height += 28
        }

        if (textLength > 220) {
            height += 34
        }

        return height
    }

    const pages: ReviewFlatItem[][] = []
    let currentPageItems: ReviewFlatItem[] = []
    let currentHeight = 0
    let previousSection = ''

    items.forEach((item) => {
        let itemHeight = estimateQuestionHeight(item)

        if (item.sectionId !== previousSection) {
            itemHeight += 70
            previousSection = item.sectionId
        }

        if (currentHeight + itemHeight > MAX_PAGE_HEIGHT && currentPageItems.length > 0) {
            pages.push(currentPageItems)
            currentPageItems = []
            currentHeight = 0
        }

        currentPageItems.push(item)
        currentHeight += itemHeight
    })

    if (currentPageItems.length > 0) {
        pages.push(currentPageItems)
    }

    return pages
}