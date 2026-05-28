import { useEffect, useMemo, useRef } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { GeneratedQuestionVisual } from '../../../../types/assignment'
import { deriveGraphBounds, normalizeDesmosExpression, normalizeGraphPoints } from './reviewScreenUtils'

export function GraphQuestionVisual({ visual }: { visual: GeneratedQuestionVisual }) {
    const chartData = useMemo(
        () => (visual.points ?? []).map((point, index) => ({
            x: point.x,
            y: point.y,
            label: String(point.x),
            index,
        })),
        [visual.points],
    )

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (visual.renderer !== 'desmos') {
            return
        }

        let mounted = true
        const containerElement = containerRef.current
        const plottedPoints = normalizeGraphPoints(visual)
        let calculator: {
            destroy?: () => void
            setMathBounds: (bounds: { left: number; right: number; bottom: number; top: number }) => void
            setExpression: (expression: { id: string; latex: string }) => void
        } | null = null

        async function renderGraph() {
            const { default: Desmos } = await import('desmos')
            if (!mounted || !containerElement) {
                return
            }

            containerElement.innerHTML = ''
            const graphCalculator = Desmos.GraphingCalculator(containerElement, {
                expressions: true,
                settingsMenu: false,
                keypad: false,
                zoomButtons: false,
                border: false,
                showResetButtonOnGraphpaper: false,
            })
            calculator = graphCalculator

            const { left, right } = deriveGraphBounds(visual)
            const yValues = plottedPoints.map((point) => point.y)
            const minY = yValues.length > 0 ? Math.min(...yValues) : -10
            const maxY = yValues.length > 0 ? Math.max(...yValues) : 10
            const ySpan = Math.max(maxY - minY, 1)
            const yPadding = Math.max(ySpan * 0.25, 1)

            graphCalculator.setMathBounds({
                left,
                right,
                bottom: minY - yPadding,
                top: maxY + yPadding,
            })

            if (visual.expression) {
                graphCalculator.setExpression({
                    id: 'graph-expression',
                    latex: normalizeDesmosExpression(visual.expression, visual.chartType),
                })
            }

            plottedPoints.forEach((point, index) => {
                graphCalculator.setExpression({
                    id: `graph-point-${index}`,
                    latex: `(${point.x}, ${point.y})`,
                })
            })

            if (visual.title) {
                graphCalculator.setExpression({
                    id: 'graph-label',
                    latex: `\\text{${visual.title.replace(/[^a-zA-Z0-9\s.,:;()-]/g, '')}}`,
                })
            }
        }

        void renderGraph()

        return () => {
            mounted = false
            if (calculator?.destroy) {
                calculator.destroy()
            }
            if (containerElement) {
                containerElement.innerHTML = ''
            }
        }
    }, [visual])

    if (visual.renderer === 'desmos') {
        return (
            <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#dedede] bg-white p-[10px]">
                <div ref={containerRef} className="h-[240px] w-full" />
                {visual.expression ? (
                    <p className="mt-[8px] text-[12px] text-[#666]">
                        {visual.expression}
                    </p>
                ) : null}
            </div>
        )
    }

    if (chartData.length === 0) {
        return (
            <div className="mt-[12px] rounded-[12px] border border-[#dedede] bg-white p-[12px] text-[13px] text-[#666]">
                Graph data is unavailable.
            </div>
        )
    }

    const chartType = visual.chartType ?? 'line'

    return (
        <div className="mt-[12px] h-[240px] overflow-hidden rounded-[12px] border border-[#dedede] bg-white p-[12px]">
            {visual.title ? <p className="mb-[10px] text-[13px] font-semibold text-primary">{visual.title}</p> : null}
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="y" fill="#ff6b3d" radius={[6, 6, 0, 0]} />
                    </BarChart>
                ) : chartType === 'scatter' ? (
                    <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" name={visual.xAxisLabel || 'X'} />
                        <YAxis dataKey="y" name={visual.yAxisLabel || 'Y'} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter data={chartData} fill="#1f6feb" />
                    </ScatterChart>
                ) : (
                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="y" stroke="#ff6b3d" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}