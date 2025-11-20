import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

const BalanceSheet = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Sample data for the balance sheet
  const assets = {
    current: [
      { name: 'Cash and Cash Equivalents', amount: 25000 },
      { name: 'Accounts Receivable', amount: 15000 },
      { name: 'Inventory', amount: 35000 },
      { name: 'Prepaid Expenses', amount: 5000 },
    ],
    fixed: [
      { name: 'Property, Plant & Equipment', amount: 100000 },
      { name: 'Less: Accumulated Depreciation', amount: -25000 },
    ],
    other: [
      { name: 'Intangible Assets', amount: 15000 },
      { name: 'Goodwill', amount: 10000 },
    ]
  };

  const liabilities = {
    current: [
      { name: 'Accounts Payable', amount: 18000 },
      { name: 'Short-term Loans', amount: 12000 },
      { name: 'Accrued Expenses', amount: 7000 },
    ],
    longTerm: [
      { name: 'Long-term Debt', amount: 50000 },
      { name: 'Deferred Tax Liabilities', amount: 5000 },
    ]
  };

  const equity = [
    { name: 'Common Stock', amount: 50000 },
    { name: 'Retained Earnings', amount: 45000 },
    { name: 'Other Comprehensive Income', amount: 3000 },
  ];

  // Calculate totals
  const totalCurrentAssets = assets.current.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedAssets = assets.fixed.reduce((sum, item) => sum + item.amount, 0);
  const totalOtherAssets = assets.other.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;

  const totalCurrentLiabilities = liabilities.current.reduce((sum, item) => sum + item.amount, 0);
  const totalLongTermLiabilities = liabilities.longTerm.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // Chart data
  const chartData = {
    labels: ['Assets', 'Liabilities', 'Equity'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [totalAssets, totalLiabilities, totalEquity],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Render a section of the balance sheet
  const renderSection = (title, items, showTotal = true, total = null) => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', color: '#334155' }}>{title}</h3>
      <table style={tableStyle}>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ paddingLeft: '20px' }}>{item.name}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {showTotal && (
            <tr style={{ borderTop: '2px solid #e2e8f0', fontWeight: 'bold' }}>
              <td>Total {title}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(total || items.reduce((sum, item) => sum + item.amount, 0))}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Balance Sheet</h1>
        <div>
          <label style={{ marginRight: '10px' }}>As of:</label>
          <input 
            type="date" 
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            style={inputStyle}
          />
          <button style={exportButtonStyle}>
            Export
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Balance Sheet as of {new Date(asOfDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Left Column - Assets */}
          <div>
            <h2 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '5px', marginBottom: '15px' }}>
              Assets
            </h2>
            
            {renderSection('Current Assets', assets.current, false)}
            {renderSection('Fixed Assets', assets.fixed, false)}
            {renderSection('Other Assets', assets.other, false)}
            
            <div style={{ marginTop: '20px', borderTop: '2px solid #e2e8f0', paddingTop: '10px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td>Total Assets</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(totalAssets)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Right Column - Liabilities & Equity */}
          <div>
            <h2 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '5px', marginBottom: '15px' }}>
              Liabilities & Equity
            </h2>
            
            {renderSection('Current Liabilities', liabilities.current, false)}
            {renderSection('Long-term Liabilities', liabilities.longTerm, false)}
            
            <div style={{ margin: '20px 0', borderTop: '2px solid #e2e8f0', paddingTop: '10px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td>Total Liabilities</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(totalLiabilities)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h3 style={{ margin: '20px 0 10px 0', color: '#334155' }}>Shareholders' Equity</h3>
            {renderSection('', equity, false)}
            
            <div style={{ marginTop: '20px', borderTop: '2px solid #e2e8f0', paddingTop: '10px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td>Total Equity</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(totalEquity)}</td>
                  </tr>
                  <tr style={{ borderTop: '2px solid #e2e8f0', fontWeight: 'bold', fontSize: '1.1em' }}>
                    <td>Total Liabilities & Equity</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(totalLiabilitiesAndEquity)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div style={cardStyle}>
        <h2>Financial Position Overview</h2>
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
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(context.parsed.y);
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
      
      <div style={{ ...cardStyle, marginTop: '20px', backgroundColor: '#f8fafc' }}>
        <h3>Key Financial Ratios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
          <div style={ratioCardStyle}>
            <div style={ratioLabel}>Current Ratio</div>
            <div style={ratioValue}>{(totalCurrentAssets / totalCurrentLiabilities).toFixed(2)}</div>
            <div style={ratioDescription}>
              Measures short-term liquidity. A ratio above 1 indicates good short-term financial health.
            </div>
          </div>
          
          <div style={ratioCardStyle}>
            <div style={ratioLabel}>Debt to Equity</div>
            <div style={ratioValue}>{(totalLiabilities / totalEquity).toFixed(2)}</div>
            <div style={ratioDescription}>
              Indicates the relative proportion of shareholders' equity and debt used to finance assets.
            </div>
          </div>
          
          <div style={ratioCardStyle}>
            <div style={ratioLabel}>Working Capital</div>
            <div style={ratioValue}>{formatCurrency(totalCurrentAssets - totalCurrentLiabilities)}</div>
            <div style={ratioDescription}>
              The difference between current assets and current liabilities.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '25px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  '& tr': {
    borderBottom: '1px solid #e2e8f0'
  },
  '& td': {
    padding: '8px 0',
    verticalAlign: 'top'
  }
};

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  marginRight: '10px',
  backgroundColor: 'white'
};

const exportButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px'
};

const ratioCardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const ratioLabel = {
  fontSize: '14px',
  color: '#64748b',
  marginBottom: '5px'
};

const ratioValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e293b',
  marginBottom: '10px'
};

const ratioDescription = {
  fontSize: '12px',
  color: '#64748b',
  lineHeight: '1.4'
};

export default BalanceSheet;
