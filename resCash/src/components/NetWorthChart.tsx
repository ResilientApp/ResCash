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

interface NetWorthChartProps {
    data: Transaction[];
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ data }) => {
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
        ctx.fillStyle = '#ffffff';
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

        const netNetWorth = incomes.map((income, index) => income - expenses[index]);
        
        // Sort data by date
        const sortedLabels = labels.sort((a, b) => {
            const [aMonth, aDay] = a.split('-').map(Number);
            const [bMonth, bDay] = b.split('-').map(Number);
            const aDate = new Date(2023, aMonth - 1, aDay); // Assuming the year is 2023
            const bDate = new Date(2023, bMonth - 1, bDay);
            return aDate.getTime() - bDate.getTime();
        });

        const sortedIncomes = sortedLabels.map((label) => groupedData[label].income);
        const sortedExpenses = sortedLabels.map((label) => groupedData[label].expense);

        const netWorth = [];
        let cumulativeNetWorth = 0;
        for (let i = 0; i < sortedIncomes.length; i++) {
            cumulativeNetWorth += sortedIncomes[i] - sortedExpenses[i];
            netWorth.push(cumulativeNetWorth);
        }

        // Set X and Y axis scales
        const maxY = Math.ceil(Math.max(...incomes, ...expenses, ...netNetWorth));
        const minY = Math.min(0, Math.floor(Math.min(...netNetWorth)));

        // X axis and Y axis scale calculations
        const xStep = chartWidth / labels.length;
        const yScale = chartHeight / (maxY - minY);

        // Draw grid lines and Y axis ticks
        ctx.strokeStyle = 'rgba(198, 231, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.stroke();
        }

        // Draw X and Y axes
        ctx.strokeStyle = '#4e4e68';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.stroke();

        // Fill area under curve with gradient
        ctx.beginPath();
        const areaGradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
        areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
        
        netWorth.forEach((value, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight - (value - minY) * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        // Complete the area path
        const lastX = margin.left + (netWorth.length - 1) * xStep + xStep / 2;
        ctx.lineTo(lastX, margin.top + chartHeight);
        ctx.lineTo(margin.left + xStep / 2, margin.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = areaGradient;
        ctx.fill();

        // Draw line chart - Net Worth
        ctx.beginPath();
        const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
        lineGradient.addColorStop(1, 'rgba(96, 165, 250, 1)');
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = 8;

        netWorth.forEach((value, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight - (value - minY) * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw markers for each data point
        netWorth.forEach((value, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight - (value - minY) * yScale;
            
            // Outer circle
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Inner circle with gradient
            const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            dotGradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
            dotGradient.addColorStop(1, 'rgba(37, 99, 235, 1)');
            ctx.fillStyle = dotGradient;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add value label on hover (show every 3rd point to avoid clutter)
            if (index % 3 === 0) {
                ctx.fillStyle = '#1a1a2e';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                const labelY = y > chartHeight / 2 ? y - 15 : y + 20;
                
                // Background for label
                const text = `$${value.toFixed(0)}`;
                const textWidth = ctx.measureText(text).width;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(x - textWidth / 2 - 3, labelY - 10, textWidth + 6, 14);
                
                ctx.fillStyle = '#3b82f6';
                ctx.fillText(text, x, labelY);
            }
        });

        // Add X axis labels with rotation
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'right';
        labels.forEach((label, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight + 40;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(label, 0, 0);
            ctx.restore();
        });

        // Add Y axis labels
        ctx.textAlign = 'right';
        ctx.font = 'bold 12px Arial';
        for (let i = 0; i <= 5; i++) {
            const yValue = Math.round(minY + ((maxY - minY) / 5) * i);
            const y = margin.top + chartHeight - (chartHeight / 5) * i;
            ctx.fillText(`$${yValue.toString()}`, margin.left - 10, y + 4);
        }
        
        // Add chart title
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Net Worth Over Time', width / 2, 25);

    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};

export default NetWorthChart;

