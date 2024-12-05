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
        const margin = { top: 20, right: 30, bottom: 80, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Extract data
        const labels = filteredData.map((transaction) => {
            const date = new Date(transaction.timestamp);
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Format month as 2-digit
            const day = date.getDate().toString().padStart(2, '0'); // Format day as 2-digit
            return `${month}-${day}`; // Format as "MM-DD"
        });
        const incomes = filteredData.map((transaction) =>
            transaction.transactionType === 'Income' ? transaction.amount : 0
        );
        const expenses = filteredData.map((transaction) =>
            transaction.transactionType === 'Expense' ? transaction.amount : 0
        );
        const netCashFlow = incomes.map((income, index) => income - expenses[index]);

        // Set X and Y axis scales
        const maxY = Math.ceil(Math.max(...incomes, ...expenses, ...netCashFlow));
        const minY = Math.min(0, Math.floor(Math.min(...netCashFlow)));

        // X axis and Y axis scale calculations
        const xStep = chartWidth / labels.length;
        const yScale = chartHeight / (maxY - minY);

        // Set background color
        ctx.fillStyle = '#1e1e2f'; // Dark background
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines and Y axis ticks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Light grid lines
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.stroke();
        }

        // Draw X and Y axes
        ctx.strokeStyle = '#ffffff'; // White axis
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.stroke();

        // Draw bar chart - Income and Expense (wider bars)
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep;
            const barWidth = xStep / 3;
            const incomeHeight = incomes[index] * yScale;
            const expenseHeight = expenses[index] * yScale;

            // Draw income bar (green, with transparency)
            ctx.fillStyle = 'rgba(75, 192, 192, 0.5)';
            ctx.fillRect(x, margin.top + chartHeight - incomeHeight, barWidth, incomeHeight);

            // Draw expense bar (red, with transparency)
            ctx.fillStyle = 'rgba(255, 99, 132, 0.5)';
            ctx.fillRect(x + barWidth, margin.top + chartHeight - expenseHeight, barWidth, expenseHeight);
        });

        // Draw line chart - Net Cash Flow
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 102, 204, 1)'; // Line color
        ctx.lineWidth = 2;

        netCashFlow.forEach((value, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight - (value - minY) * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw markers for each data point on the line chart
        netCashFlow.forEach((value, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight - (value - minY) * yScale;
            ctx.fillStyle = 'rgba(0, 102, 204, 1)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Add X axis labels, rotate to avoid overlap
        ctx.fillStyle = '#ffffff'; // White text
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight + 40;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 4); // Rotate 45 degrees
            ctx.fillText(label, 0, 0);
            ctx.restore();
        });

        // Add Y axis labels (rounded to nearest integer)
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const yValue = Math.round(minY + ((maxY - minY) / 5) * i);
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            ctx.fillText(yValue.toString(), margin.left - 10, y + 4);
        }

        // Add legend to the right
        const legendX = width - 120; // Legend box X position
        const legendY = margin.top; // Legend box Y position
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

