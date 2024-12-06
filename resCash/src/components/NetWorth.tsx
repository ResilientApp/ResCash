import React, { useEffect, useState } from 'react';
import NetWorthChart from './NetWorthChart'; 
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

const NetWorth: React.FC = () => {
    const [cashFlowData, setNetWorthData] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNetWorthData = async () => {
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
                    setNetWorthData([]); //set empty data
                } else {
                    setNetWorthData(result); // fetch new data
                }
            } catch (err: any) {
                console.error('Error fetching cash flow data:', err);
                setError(err.message);
            } finally {
                setLoading(false); // end
            }
        };

        fetchNetWorthData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="cashflow-container">
            <h2 className="cashflow-title">Net Worth</h2>
            {cashFlowData.length === 0 ? (
                <div>No Data Found</div>
            ) : (
                <>
                <NetWorthChart data={cashFlowData} /></>
            )}
        </div>
    );
};

export default NetWorth;

