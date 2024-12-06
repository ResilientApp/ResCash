import React, { useEffect, useRef } from 'react';

interface Transaction {
    _id: string;
    transactionID: string;
    amount: number;
    category: string;
    currency: string;
    transactionType: string;
    timestamp: string;
    publicKey: string;
    notes: string;
    merchant: string;
    paymentMethod: string;
}

interface CashFlowChartProps {
    data: Transaction[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set larger canvas dimensions
        const width = 1200;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        // Clear previous content and set white background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#D4F6FF'; // Set background to white
        ctx.fillRect(0, 0, width, height);
        //draw a boarder
        const borderRadius = 20;
        const borderWidth = 3;

        ctx.strokeStyle = '#5DB9FF'; // 蓝色边框颜色
        ctx.lineWidth = borderWidth;

        ctx.beginPath();
        ctx.moveTo(borderRadius, borderWidth / 2);
        ctx.lineTo(width - borderRadius, borderWidth / 2);
        ctx.arcTo(width - borderWidth / 2, borderWidth / 2, width - borderWidth / 2, borderRadius, borderRadius);
        ctx.lineTo(width - borderWidth / 2, height - borderRadius);
        ctx.arcTo(width - borderWidth / 2, height - borderWidth / 2, width - borderRadius, height - borderWidth / 2, borderRadius);
        ctx.lineTo(borderRadius, height - borderWidth / 2);
        ctx.arcTo(borderWidth / 2, height - borderWidth / 2, borderWidth / 2, height - borderRadius, borderRadius);
        ctx.lineTo(borderWidth / 2, borderRadius);
        ctx.arcTo(borderWidth / 2, borderWidth / 2, borderRadius, borderWidth / 2, borderRadius);
        ctx.closePath();
        ctx.stroke();


        // Limit data to the last 30 entries
        const filteredData = data.slice(-30);

        // Set margins
        const margin = { top: 40, right: 200, bottom: 100, left: 80 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Extract data grouped by date
        const groupedData: { [date: string]: { income: number; expense: number } } = {};
        filteredData.forEach((transaction) => {
            const date = new Date(transaction.timestamp);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateKey = `${month}-${day}`;

            if (!groupedData[dateKey]) {
                groupedData[dateKey] = { income: 0, expense: 0 };
            }

            if (transaction.transactionType === 'Income') {
                groupedData[dateKey].income += transaction.amount;
            } else if (transaction.transactionType === 'Expense') {
                groupedData[dateKey].expense += transaction.amount;
            }
        });

        const labels = Object.keys(groupedData);
        const incomes = labels.map((label) => groupedData[label].income);
        const expenses = labels.map((label) => groupedData[label].expense);

        // Adjust Y axis range
        const maxY = Math.ceil(Math.max(...incomes, ...expenses) * 1.2);
        const minY = -Math.ceil(Math.max(...expenses) * 1.2);
        const xStep = chartWidth / labels.length;
        const yScale = chartHeight / (maxY - minY);

        // Draw grid lines and Y axis ticks
        ctx.strokeStyle = '#ccc'; // Light grid lines
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            const yValue = minY + ((maxY - minY) / 5) * i;

            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.stroke();

            // Add Y axis labels
            ctx.fillStyle = '#000'; // Black text for white background
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(yValue.toFixed(0), margin.left - 10, y + 4);
        }

        // Highlight the zero line
        const zeroY = margin.top + chartHeight + (minY * yScale);
        ctx.strokeStyle = '#000'; // Black zero line
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, zeroY);
        ctx.lineTo(margin.left + chartWidth, zeroY);
        ctx.stroke();

        // Draw combined bar chart
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 4;
            const barWidth = xStep / 2;

            const incomeHeight = incomes[index] * yScale;
            const expenseHeight = expenses[index] * yScale;

            // Draw income bar (green, starting from 0 upwards)
            ctx.fillStyle = 'rgba(75, 192, 192, 0.8)';
            ctx.fillRect(x, zeroY - incomeHeight, barWidth, incomeHeight);

            // Draw expense bar (red, starting from 0 downwards)
            ctx.fillStyle = 'rgba(255, 99, 132, 0.8)';
            ctx.fillRect(x, zeroY, barWidth, expenseHeight);

            // Add income and expense labels
            ctx.fillStyle = '#000'; // Black text for white background
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            if (incomes[index] > 0) {
                ctx.fillText(
                    `\$${(incomes[index]).toFixed(0)} USD`,
                    x + barWidth / 2,
                    zeroY - incomeHeight - 5
                );
            }
            if (expenses[index] > 0) {
                ctx.fillText(
                    `\$${(expenses[index]).toFixed(0)} USD`,
                    x + barWidth / 2,
                    zeroY + expenseHeight + 15
                );
            }
        });

        // Add X axis labels
        ctx.fillStyle = '#000'; // Black text for white background
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight + 60;
            ctx.fillText(label, x, y);
        });

        // Draw legend in the top-right corner
        const legendX = width - 150;
        const legendY = margin.top;
        ctx.fillStyle = '#000'; // Black text
        ctx.font = '16px Arial';

        // Income (green)
        ctx.fillStyle = 'rgba(75, 192, 192, 0.8)';
        ctx.fillRect(legendX, legendY, 20, 20);
        ctx.fillStyle = '#000';
        ctx.fillText('Income', legendX + 30, legendY + 15);

        // Expense (red)
        ctx.fillStyle = 'rgba(255, 99, 132, 0.8)';
        ctx.fillRect(legendX, legendY + 40, 20, 20);
        ctx.fillStyle = '#000';
        ctx.fillText('Expense', legendX + 30, legendY + 55);
    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};

export default CashFlowChart;

