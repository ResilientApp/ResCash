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
        ctx.fillStyle = '#D4F6FF'; // Set background to white
        ctx.fillRect(0, 0, width, height);
        //draw a boarder
        const borderRadius = 20;
        const borderWidth = 3;

        ctx.strokeStyle = '#5DB9FF'; 
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
        ctx.strokeStyle = '#000000'; // White axis
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.stroke();


        // Draw line chart - Net Cash Flow
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 102, 204, 1)'; // Line color
        ctx.lineWidth = 2;

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

        // Draw markers for each data point on the line chart
        netWorth.forEach((value, index) => {
            const x = margin.left + index * xStep + xStep / 2;
            const y = margin.top + chartHeight - (value - minY) * yScale;
            ctx.fillStyle = 'rgba(0, 102, 204, 1)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Add X axis labels, rotate to avoid overlap
        ctx.fillStyle = '#000000'; // White text
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

    }, [data]);

    return <canvas ref={canvasRef}></canvas>;
};

export default NetWorthChart;

