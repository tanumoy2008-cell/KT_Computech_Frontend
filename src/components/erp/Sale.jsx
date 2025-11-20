import React, { useState } from 'react';

const Sale = () => {
  const [sales, setSales] = useState([
    { id: 1, date: '2025-11-15', customer: 'John Doe', amount: 1250.00, status: 'Paid' },
    { id: 2, date: '2025-11-14', customer: 'Acme Corp', amount: 3250.75, status: 'Pending' },
    { id: 3, date: '2025-11-13', customer: 'XYZ Retail', amount: 850.00, status: 'Paid' },
  ]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sales Invoices</h1>
        <button style={buttonStyle}>
          + New Invoice
        </button>
      </div>
      
      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Invoice #</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Customer</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px' }}>INV-{sale.id}</td>
                  <td style={{ padding: '12px' }}>{sale.date}</td>
                  <td style={{ padding: '12px' }}>{sale.customer}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>${sale.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: sale.status === 'Paid' ? '#e8f5e9' : '#fff8e1',
                      color: sale.status === 'Paid' ? '#2e7d32' : '#ff8f00'
                    }}>
                      {sale.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button style={{ ...buttonStyle, marginRight: '5px', padding: '4px 8px', fontSize: '12px' }}>View</button>
                    <button style={{ ...buttonStyle, backgroundColor: '#f5f5f5', color: '#333', padding: '4px 8px', fontSize: '12px' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default Sale;
