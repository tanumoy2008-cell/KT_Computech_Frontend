import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';

const Expenses = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2025-11-15', category: 'Office Supplies', amount: 250.00, description: 'Printer paper and ink' },
    { id: 2, date: '2025-11-14', category: 'Utilities', amount: 350.00, description: 'Electricity bill' },
    { id: 3, date: '2025-11-13', category: 'Rent', amount: 2000.00, description: 'Office rent for November' },
  ]);

  const categories = ['Office Supplies', 'Utilities', 'Rent', 'Salaries', 'Marketing', 'Other'];
  
  const chartData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => 
        expenses
          .filter(exp => exp.category === cat)
          .reduce((sum, exp) => sum + exp.amount, 0)
      ),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Expense Tracking</h1>
        <button style={buttonStyle}>
          + Add Expense
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <h3>Recent Expenses</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px' }}>{expense.date}</td>
                    <td style={{ padding: '12px' }}>{expense.category}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#d32f2f', fontWeight: 'bold' }}>
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px' }}>{expense.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div style={cardStyle}>
          <h3>Expense Distribution</h3>
          <div style={{ height: '300px' }}>
            <Pie 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={cardStyle}>
        <h3>Expense Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {categories.map(category => {
            const total = expenses
              .filter(exp => exp.category === category)
              .reduce((sum, exp) => sum + exp.amount, 0);
              
            if (total === 0) return null;
            
            return (
              <div key={category} style={summaryCardStyle}>
                <div style={{ fontSize: '14px', color: '#666' }}>{category}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>
                  ${total.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
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

const summaryCardStyle = {
  ...cardStyle,
  padding: '15px',
  textAlign: 'center'
};

const buttonStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px'
};

export default Expenses;
