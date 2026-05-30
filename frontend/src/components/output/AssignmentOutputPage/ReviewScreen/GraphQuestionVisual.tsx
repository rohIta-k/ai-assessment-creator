import { useMemo } from 'react'
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

    if (chartData.length === 0) {
        return null
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