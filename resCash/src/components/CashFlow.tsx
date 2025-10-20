import React, { useEffect, useState } from 'react';
import CashFlowChart from './CashFlowChart';
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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netCashFlow: 0,
        avgDailyFlow: 0,
        largestIncome: 0,
        largestExpense: 0
    });

    useEffect(() => {
        const fetchCashFlowData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch('http://localhost:8099/api/read/userTransactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }

                const result = await response.json();
                if (result.message === 'No transactions found') {
                    setCashFlowData([]);
                } else {
                    const sortedData = result.sort(
                        (a: Transaction, b: Transaction) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                    setCashFlowData(sortedData);
                    
                    // Calculate statistics
                    const income = sortedData
                        .filter((t: Transaction) => t.transactionType === 'Income')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                    
                    const expense = sortedData
                        .filter((t: Transaction) => t.transactionType === 'Expense')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                    
                    const incomeAmounts = sortedData
                        .filter((t: Transaction) => t.transactionType === 'Income')
                        .map((t: Transaction) => t.amount);
                    
                    const expenseAmounts = sortedData
                        .filter((t: Transaction) => t.transactionType === 'Expense')
                        .map((t: Transaction) => t.amount);
                    
                    const days = sortedData.length > 0 ? 
                        Math.max(1, Math.ceil((new Date(sortedData[sortedData.length - 1].timestamp).getTime() - 
                        new Date(sortedData[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))) : 1;
                    
                    setStats({
                        totalIncome: income,
                        totalExpense: expense,
                        netCashFlow: income - expense,
                        avgDailyFlow: (income - expense) / days,
                        largestIncome: incomeAmounts.length > 0 ? Math.max(...incomeAmounts) : 0,
                        largestExpense: expenseAmounts.length > 0 ? Math.max(...expenseAmounts) : 0
                    });
                }
            } catch (err: any) {
                console.error('Error fetching cash flow data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCashFlowData();
    }, []);

    if (loading) {
        return (
            <div className="cashflow-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '20px' }}>Loading cash flow data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cashflow-container">
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="cashflow-container">
            <h2 className="cashflow-title">Cash Flow Analysis</h2>
            
            {cashFlowData.length === 0 ? (
                <div className="error-message">No transaction data available</div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-label">Total Income</div>
                            <div className="stat-value" style={{ color: '#28a745' }}>
                                ${stats.totalIncome.toFixed(2)}
                            </div>
                            <div className="stat-change positive">
                                ↑ {cashFlowData.filter(t => t.transactionType === 'Income').length} transactions
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Total Expense</div>
                            <div className="stat-value" style={{ color: '#dc3545' }}>
                                ${stats.totalExpense.toFixed(2)}
                            </div>
                            <div className="stat-change negative">
                                ↓ {cashFlowData.filter(t => t.transactionType === 'Expense').length} transactions
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Net Cash Flow</div>
                            <div className="stat-value" style={{ 
                                color: stats.netCashFlow >= 0 ? '#28a745' : '#dc3545' 
                            }}>
                                ${stats.netCashFlow.toFixed(2)}
                            </div>
                            <div className={`stat-change ${stats.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                                {stats.netCashFlow >= 0 ? '↑' : '↓'} {Math.abs(stats.netCashFlow).toFixed(2)}
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Avg Daily Flow</div>
                            <div className="stat-value">
                                ${Math.abs(stats.avgDailyFlow).toFixed(2)}
                            </div>
                            <div className={`stat-change ${stats.avgDailyFlow >= 0 ? 'positive' : 'negative'}`}>
                                {stats.avgDailyFlow >= 0 ? 'Surplus' : 'Deficit'}
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Largest Income</div>
                            <div className="stat-value" style={{ color: '#28a745' }}>
                                ${stats.largestIncome.toFixed(2)}
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Largest Expense</div>
                            <div className="stat-value" style={{ color: '#dc3545' }}>
                                ${stats.largestExpense.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="chart-wrapper">
                        <CashFlowChart data={cashFlowData} />
                    </div>
                </>
            )}
        </div>
    );
};

export default CashFlow;
