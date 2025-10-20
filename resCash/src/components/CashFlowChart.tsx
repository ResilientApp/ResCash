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
        ctx.fillStyle = '#ffffff'; // White background
        ctx.fillRect(0, 0, width, height);
        
        // Draw rounded border with gradient
        const borderRadius = 15;
        const borderWidth = 2;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#c6e7ff');
        gradient.addColorStop(1, '#80bdff');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, borderRadius);
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
        ctx.strokeStyle = 'rgba(198, 231, 255, 0.3)'; // Subtle grid lines
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            const yValue = minY + ((maxY - minY) / 5) * i;

            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.stroke();

            // Add Y axis labels with better styling
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`$${yValue.toFixed(0)}`, margin.left - 10, y + 4);
        }

        // Highlight the zero line
        const zeroY = margin.top + chartHeight + (minY * yScale);
        ctx.strokeStyle = '#4e4e68';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(margin.left, zeroY);
        ctx.lineTo(margin.left + chartWidth, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw combined bar chart with gradients
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 4;
            const barWidth = xStep / 2;

            const incomeHeight = incomes[index] * yScale;
            const expenseHeight = expenses[index] * yScale;

            // Draw income bar with gradient
            const incomeGradient = ctx.createLinearGradient(x, zeroY - incomeHeight, x, zeroY);
            incomeGradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
            incomeGradient.addColorStop(1, 'rgba(134, 239, 172, 0.7)');
            ctx.fillStyle = incomeGradient;
            ctx.fillRect(x, zeroY - incomeHeight, barWidth, incomeHeight);
            
            // Add border to income bar
            ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, zeroY - incomeHeight, barWidth, incomeHeight);

            // Draw expense bar with gradient
            const expenseGradient = ctx.createLinearGradient(x, zeroY, x, zeroY + expenseHeight);
            expenseGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
            expenseGradient.addColorStop(1, 'rgba(252, 165, 165, 0.7)');
            ctx.fillStyle = expenseGradient;
            ctx.fillRect(x, zeroY, barWidth, expenseHeight);
            
            // Add border to expense bar
            ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, zeroY, barWidth, expenseHeight);

            // Add income and expense labels with better styling
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            if (incomes[index] > 0) {
                // Background for label
                const text = `$${(incomes[index]).toFixed(0)}`;
                const textWidth = ctx.measureText(text).width;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(
                    x + barWidth / 2 - textWidth / 2 - 4,
                    zeroY - incomeHeight - 20,
                    textWidth + 8,
                    16
                );
                ctx.fillStyle = '#22c55e';
                ctx.fillText(text, x + barWidth / 2, zeroY - incomeHeight - 8);
            }
            if (expenses[index] > 0) {
                const text = `$${(expenses[index]).toFixed(0)}`;
                const textWidth = ctx.measureText(text).width;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(
                    x + barWidth / 2 - textWidth / 2 - 4,
                    zeroY + expenseHeight + 8,
                    textWidth + 8,
                    16
                );
                ctx.fillStyle = '#ef4444';
                ctx.fillText(text, x + barWidth / 2, zeroY + expenseHeight + 20);
            }
        });

        // Add X axis labels with better styling
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight + 30;
            ctx.fillText(label, x, y);
        });

        // Draw enhanced legend
        const legendX = width - 180;
        const legendY = margin.top + 10;
        
        // Legend background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = 'rgba(198, 231, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(legendX - 10, legendY - 10, 170, 90, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#1a1a2e';

        // Income (green)
        const incomeGradient = ctx.createLinearGradient(legendX, legendY + 5, legendX, legendY + 25);
        incomeGradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
        incomeGradient.addColorStop(1, 'rgba(134, 239, 172, 0.7)');
        ctx.fillStyle = incomeGradient;
        ctx.fillRect(legendX, legendY + 5, 25, 20);
        ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY + 5, 25, 20);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.textAlign = 'left';
        ctx.fillText('💰 Income', legendX + 35, legendY + 20);

        // Expense (red)
        const expenseGradient = ctx.createLinearGradient(legendX, legendY + 45, legendX, legendY + 65);
        expenseGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        expenseGradient.addColorStop(1, 'rgba(252, 165, 165, 0.7)');
        ctx.fillStyle = expenseGradient;
        ctx.fillRect(legendX, legendY + 45, 25, 20);
        ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY + 45, 25, 20);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillText('💳 Expense', legendX + 35, legendY + 60);
    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};

export default CashFlowChart;

