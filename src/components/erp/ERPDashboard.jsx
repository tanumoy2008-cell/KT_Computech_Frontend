import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

const ERPDashboard = () => {
  // Sample data for the dashboard
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales 2025',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const expenseData = {
    labels: ['Rent', 'Salaries', 'Utilities', 'Supplies', 'Marketing'],
    datasets: [
      {
        data: [3000, 10000, 2000, 1500, 3000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Dashboard</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>$24,780</p>
          <p style={{ color: '#666', fontSize: '14px' }}>+12% from last month</p>
        </div>
        
        <div style={cardStyle}>
          <h3>Total Expenses</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>$12,450</p>
          <p style={{ color: '#666', fontSize: '14px' }}>+5% from last month</p>
        </div>
        
        <div style={cardStyle}>
          <h3>Net Profit</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>$12,330</p>
          <p style={{ color: '#666', fontSize: '14px' }}>+18% from last month</p>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '20px',
        marginBottom: '30px' 
      }}>
        <div style={cardStyle}>
          <h3>Sales Overview</h3>
          <div style={{ height: '300px' }}>
            <Bar 
              data={salesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div style={cardStyle}>
          <h3>Expense Distribution</h3>
          <div style={{ height: '300px' }}>
            <Pie 
              data={expenseData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={cardStyle}>
        <h3>Recent Transactions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((txn, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px' }}>{txn.date}</td>
                <td style={{ padding: '12px' }}>{txn.description}</td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: txn.type === 'income' ? '#2e7d32' : '#d32f2f'
                }}>
                  {txn.type === 'income' ? '+' : '-'}${txn.amount}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: txn.status === 'completed' ? '#e8f5e9' : '#fff8e1',
                    color: txn.status === 'completed' ? '#2e7d32' : '#ff8f00'
                  }}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const recentTransactions = [
  { date: '2025-11-15', description: 'Product Sales', amount: '1,250.00', type: 'income', status: 'completed' },
  { date: '2025-11-14', description: 'Office Supplies', amount: '350.00', type: 'expense', status: 'completed' },
  { date: '2025-11-14', description: 'Client Payment', amount: '3,450.00', type: 'income', status: 'pending' },
  { date: '2025-11-13', description: 'Monthly Rent', amount: '2,000.00', type: 'expense', status: 'completed' },
  { date: '2025-11-12', description: 'Website Hosting', amount: '99.00', type: 'expense', status: 'completed' },
];

export default ERPDashboard;
