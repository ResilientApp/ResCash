import React, { useEffect, useState } from 'react';
import CashFlowChart from './CashFlowChart'; 
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCashFlowData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // 发起请求
                const response = await fetch('http://localhost:8099/api/read/userTransactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // 添加令牌到请求头
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }

                const result = await response.json();
                if (result.message === 'No transactions found') {
                    setCashFlowData([]); //set empty data
                } else {
                    setCashFlowData(result); // fetch new data
                }
            } catch (err: any) {
                console.error('Error fetching cash flow data:', err);
                setError(err.message);
            } finally {
                setLoading(false); // end
            }
        };

        fetchCashFlowData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="cashflow-container">
            <h2 className="cashflow-title">Cash Flow</h2>
            {cashFlowData.length === 0 ? (
                <div>No Data Found</div>
            ) : (
                <>
                <p>Cash Flow</p>
                <CashFlowChart data={cashFlowData} />
                <p>Net Worth</p>
                <NetWorthChart data={cashFlowData} /></>
            )}
        </div>
    );
};

export default CashFlow;

