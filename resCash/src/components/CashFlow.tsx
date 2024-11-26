import React, { useEffect, useState } from 'react';
import CashFlowChart from './CashFlowChart'; // 导入图表组件
import './CashFlowStyle.css';

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
                setCashFlowData(data);
            } catch (error: any) {
                setError(error.message);
            }
        };

        fetchCashFlowData();
    }, []);

    return (
        <div className="cashflow-container">
            <h2 className="cashflow-title">Cash Flow</h2>
            {error ? (
                <div className="error-message">Error: {error}</div>
            ) : (
                <CashFlowChart data={cashFlowData} />
            )}
        </div>
    );
};

export default CashFlow;
