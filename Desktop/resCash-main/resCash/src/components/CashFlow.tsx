import React, { useEffect, useState } from 'react';
import CashFlowChart from './CashFlowChart'; // 导入图表组件
import './CashFlowStyle.css';
import NetWorthChart from './NetWorthChart';

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

const CashFlow: React.FC = () => {
    const [cashFlowData, setCashFlowData] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCashFlowData = async () => {
            try {
                const response = await fetch('http://localhost:8099/api/transactions/');
                if (!response.ok) {
                    throw new Error('Failed to fetch cash flow data');
                }
                const data = await response.json();
                if (data && data.transactions) {
                    setCashFlowData(data.transactions);
                } else {
                    setCashFlowData([]); // Fallback to an empty array
                }
            } catch (err) {
                setError('Failed to fetch data');
                setCashFlowData([]); // Fallback to an empty array
            }
        };

        fetchCashFlowData();
    }, []);

    // Ensure data is sorted chronologically
    cashFlowData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Prepare data for NetWorthChart
    const netCashFlow = cashFlowData.map((transaction) =>
        transaction.transactionType === 'Income' ? transaction.amount : -transaction.amount
    );

    const labels = cashFlowData.map((transaction) =>
        new Date(transaction.timestamp).toLocaleDateString()
    );

    const startingNetWorth = 0; // Set this to the user's actual starting net worth if available

    return (
        <div>
            <h2 className="cashflow-title">Cash Flow</h2>
            {error ? (
                <div className="error-message">Error: {error}</div>
            ) : (
                <CashFlowChart data={cashFlowData} />
            )}

            {error ? <p>{error}</p> : <NetWorthChart data={cashFlowData} startingNetWorth={startingNetWorth}/>}
        </div>
    );
};

export default CashFlow;