
import React from 'react';
import type { MarketPulseSummary } from '../types';

interface MarketPulseChartProps {
    summary: MarketPulseSummary;
}

const MarketPulseChart: React.FC<MarketPulseChartProps> = ({ summary }) => {
    const data = [
        { name: 'This Year', value: summary.thisYear?.length || 0 },
        { name: 'Last Qtr', value: summary.lastQuarter?.length || 0 },
        { name: 'Last Month', value: summary.lastMonth?.length || 0 },
        { name: 'Last Week', value: summary.lastWeek?.length || 0 },
        { name: 'Looking Ahead', value: summary.lookingAhead?.length || 0 },
    ];

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero, ensure at least a base value
    const chartHeight = 150;
    const barWidth = 40;
    const barMargin = 30;
    const svgWidth = data.length * (barWidth + barMargin) - barMargin;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Key Insights Count by Period</h3>
            <div className="flex justify-center overflow-x-auto">
                <svg width={svgWidth} height={chartHeight + 30} aria-label="Bar chart showing key insights count by period">
                    <g role="list" aria-label="Bars">
                    {data.map((d, i) => {
                        const barHeight = (d.value / maxValue) * chartHeight;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight;
                        return (
                            <g key={d.name} role="listitem" aria-label={`${d.name}: ${d.value} insights`}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx="4"
                                    ry="4"
                                    fill="currentColor"
                                    className="text-sky-400 hover:text-sky-500 transition-colors"
                                />
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 8}
                                    textAnchor="middle"
                                    fill="currentColor"
                                    className="text-slate-800 font-semibold text-sm"
                                >
                                    {d.value}
                                </text>
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    fill="currentColor"
                                    className="text-slate-500 text-xs font-medium"
                                >
                                    {d.name}
                                </text>
                            </g>
                        );
                    })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default MarketPulseChart;
