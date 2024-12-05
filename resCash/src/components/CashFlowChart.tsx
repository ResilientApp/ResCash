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

        // Set canvas dimensions
        const width = 800;
        const height = 400;
        canvas.width = width;
        canvas.height = height;

        // Clear previous content
        ctx.clearRect(0, 0, width, height);

        // Limit data to the last 30 entries
        const filteredData = data.slice(-30);

        // Set margins
        const margin = { top: 20, right: 150, bottom: 80, left: 60 };
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
        const maxY = Math.ceil(Math.max(...incomes, ...expenses) * 1.2); // Add some padding to the max value for better visualization
        const minY = -Math.ceil(Math.max(...expenses) * 1.2); // Ensure negative range for expenses
        const xStep = chartWidth / labels.length;
        const yScale = chartHeight / (maxY - minY);

        // Set background color
        ctx.fillStyle = '#1e1e2f';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines and Y axis ticks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            const yValue = minY + ((maxY - minY) / 5) * i;

            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.stroke();

            // Add Y axis labels
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(yValue.toFixed(0), margin.left - 10, y + 4);
        }

        // Highlight the zero line
        const zeroY = margin.top + chartHeight + (minY * yScale);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, zeroY);
        ctx.lineTo(margin.left + chartWidth, zeroY);
        ctx.stroke();

        // Draw zero decomposition line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(margin.left, zeroY);
        ctx.lineTo(margin.left + chartWidth, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw X and Y axes
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
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
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            if (incomes[index] > 0) {
                ctx.fillText(
                    `$${(incomes[index] / 1000).toFixed(1)}k`,
                    x + barWidth / 2,
                    zeroY - incomeHeight - 5
                );
            }
            if (expenses[index] > 0) {
                ctx.fillText(
                    `$${(expenses[index] / 1000).toFixed(1)}k`,
                    x + barWidth / 2,
                    zeroY + expenseHeight + 15
                );
            }
        });

        // Add X axis labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight + 40;
            ctx.fillText(label, x, y);
        });

        // Draw legend in the top-right corner
        const legendX = width - 120;
        const legendY = margin.top;
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';

        // Income (green)
        ctx.fillStyle = 'rgba(75, 192, 192, 0.8)';
        ctx.fillRect(legendX, legendY, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Income', legendX + 30, legendY + 15);

        // Expense (red)
        ctx.fillStyle = 'rgba(255, 99, 132, 0.8)';
        ctx.fillRect(legendX, legendY + 30, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Expense', legendX + 30, legendY + 45);
    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};

export default CashFlowChart;


