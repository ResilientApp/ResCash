import React, { useEffect, useState } from 'react';
import NetWorthChart from './NetWorthChart'; 
import './CashFlowStyle.css';
import { buildApiUrl } from '../utils/api';


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
    const [stats, setStats] = useState({
        currentNetWorth: 0,
        totalIncome: 0,
        totalExpense: 0,
        growth: 0,
        growthPercent: 0,
        transactionCount: 0
    });

    useEffect(() => {
        const fetchNetWorthData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(buildApiUrl('/api/read/userTransactions'), {
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
                    setNetWorthData([]);
                } else {
                    setNetWorthData(result);
                    
                    // Calculate statistics
                    const income = result
                        .filter((t: Transaction) => t.transactionType === 'Income')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                    
                    const expense = result
                        .filter((t: Transaction) => t.transactionType === 'Expense')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                    
                    const netWorth = income - expense;
                    
                    // Calculate growth (comparing first half vs second half)
                    const mid = Math.floor(result.length / 2);
                    const firstHalfIncome = result.slice(0, mid)
                        .filter((t: Transaction) => t.transactionType === 'Income')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                    const firstHalfExpense = result.slice(0, mid)
                        .filter((t: Transaction) => t.transactionType === 'Expense')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                    const firstHalfNet = firstHalfIncome - firstHalfExpense;
                    
                    const growth = netWorth - firstHalfNet;
                    const growthPercent = firstHalfNet !== 0 ? (growth / Math.abs(firstHalfNet)) * 100 : 0;
                    
                    setStats({
                        currentNetWorth: netWorth,
                        totalIncome: income,
                        totalExpense: expense,
                        growth: growth,
                        growthPercent: growthPercent,
                        transactionCount: result.length
                    });
                }
            } catch (err: any) {
                console.error('Error fetching net worth data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNetWorthData();
    }, []);

    if (loading) {
        return (
            <div className="cashflow-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '20px' }}>Loading net worth data...</p>
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
            <h2 className="cashflow-title">Net Worth Tracker</h2>
            
            {cashFlowData.length === 0 ? (
                <div className="error-message">No transaction data available</div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="stats-container">
                        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                            <div className="stat-label">Current Net Worth</div>
                            <div className="stat-value" style={{ 
                                fontSize: '36px',
                                color: stats.currentNetWorth >= 0 ? '#28a745' : '#dc3545' 
                            }}>
                                ${stats.currentNetWorth.toFixed(2)}
                            </div>
                            <div className={`stat-change ${stats.growth >= 0 ? 'positive' : 'negative'}`}>
                                {stats.growth >= 0 ? '↑' : '↓'} ${Math.abs(stats.growth).toFixed(2)} 
                                ({stats.growthPercent >= 0 ? '+' : ''}{stats.growthPercent.toFixed(2)}%)
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Total Income</div>
                            <div className="stat-value" style={{ color: '#28a745' }}>
                                ${stats.totalIncome.toFixed(2)}
                            </div>
                            <div className="stat-change">
                                {cashFlowData.filter(t => t.transactionType === 'Income').length} transactions
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Total Expense</div>
                            <div className="stat-value" style={{ color: '#dc3545' }}>
                                ${stats.totalExpense.toFixed(2)}
                            </div>
                            <div className="stat-change">
                                {cashFlowData.filter(t => t.transactionType === 'Expense').length} transactions
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Savings Rate</div>
                            <div className="stat-value">
                                {stats.totalIncome > 0 
                                    ? ((stats.currentNetWorth / stats.totalIncome) * 100).toFixed(1)
                                    : '0'}%
                            </div>
                            <div className="stat-change">
                                Of total income
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-label">Total Transactions</div>
                            <div className="stat-value">
                                {stats.transactionCount}
                            </div>
                            <div className="stat-change">
                                Recorded activities
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="chart-wrapper">
                        <NetWorthChart data={cashFlowData} />
                    </div>
                </>
            )}
        </div>
    );
};

export default NetWorth;
