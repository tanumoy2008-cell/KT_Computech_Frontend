import React from 'react';
import { Bar } from 'react-chartjs-2';

const ProfitLoss = () => {
  // Sample data for the last 6 months
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const revenue = [12500, 14300, 13800, 15700, 16800, 18200];
  const expenses = [9800, 10200, 11000, 10500, 11200, 12450];
  const profit = revenue.map((rev, i) => rev - expenses[i]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: revenue,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: profit,
        type: 'line',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
      },
    ],
  };

  const currentMonth = months[months.length - 1];
  const currentRevenue = revenue[revenue.length - 1];
  const currentExpenses = expenses[expenses.length - 1];
  const currentProfit = profit[profit.length - 1];
  const profitMargin = ((currentProfit / currentRevenue) * 100).toFixed(1);

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Profit & Loss Statement</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '30px' 
      }}>
        <div style={cardStyle}>
          <h3>Revenue (Nov 2025)</h3>
          <p style={{ fontSize: '24px', color: '#2e7d32', fontWeight: 'bold' }}>
            ${currentRevenue.toLocaleString()}
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            +12% from last month
          </p>
        </div>
        
        <div style={cardStyle}>
          <h3>Expenses (Nov 2025)</h3>
          <p style={{ fontSize: '24px', color: '#d32f2f', fontWeight: 'bold' }}>
            ${currentExpenses.toLocaleString()}
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            +8% from last month
          </p>
        </div>
        
        <div style={cardStyle}>
          <h3>Net Profit (Nov 2025)</h3>
          <p style={{ 
            fontSize: '24px', 
            color: currentProfit >= 0 ? '#2e7d32' : '#d32f2f', 
            fontWeight: 'bold' 
          }}>
            {currentProfit >= 0 ? '+' : '-'}${Math.abs(currentProfit).toLocaleString()}
          </p>
          <p style={{ 
            color: currentProfit >= 0 ? '#2e7d32' : '#d32f2f', 
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {profitMargin}% Profit Margin
          </p>
        </div>
      </div>
      
      <div style={{ ...cardStyle, marginBottom: '30px' }}>
        <h3>Profit & Loss Overview (Last 6 Months)</h3>
        <div style={{ height: '400px', marginTop: '20px' }}>
          <Bar 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += '$' + context.parsed.y.toLocaleString();
                      }
                      return label;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
      
      <div style={{ ...cardStyle, marginBottom: '30px' }}>
        <h3>Key Metrics</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          <div>
            <h4>Gross Profit Margin</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>42.5%</p>
            <p style={{ color: '#666', fontSize: '12px' }}>Industry Avg: 38%</p>
          </div>
          <div>
            <h4>Operating Margin</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>18.2%</p>
            <p style={{ color: '#666', fontSize: '12px' }}>Industry Avg: 15%</p>
          </div>
          <div>
            <h4>Net Profit Margin</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>{profitMargin}%</p>
            <p style={{ color: '#666', fontSize: '12px' }}>Industry Avg: 12%</p>
          </div>
          <div>
            <h4>Expense to Revenue</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>68.4%</p>
            <p style={{ color: '#666', fontSize: '12px' }}>Target: Below 75%</p>
          </div>
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

export default ProfitLoss;
