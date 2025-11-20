import React, { useState } from 'react';

const PaymentReport = () => {
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2025-11-18');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample payment data
  const paymentData = [
    {
      id: 'PAY-1001',
      date: '2025-11-15',
      vendor: 'Tech Supplies Inc.',
      paymentMethod: 'Bank Transfer',
      reference: 'INV-5001',
      amount: 1250.00,
      status: 'Completed',
      paidBy: 'John Smith',
      category: 'Office Supplies'
    },
    {
      id: 'PAY-1002',
      date: '2025-11-14',
      vendor: 'Cloud Services Ltd',
      paymentMethod: 'Credit Card',
      reference: 'INV-5002',
      amount: 299.99,
      status: 'Completed',
      paidBy: 'Sarah Johnson',
      category: 'Software Subscriptions'
    },
    {
      id: 'PAY-1003',
      date: '2025-11-12',
      vendor: 'Office Space Co.',
      paymentMethod: 'Check',
      reference: 'INV-5003',
      amount: 3500.00,
      status: 'Pending',
      paidBy: 'Mike Williams',
      category: 'Rent'
    },
    {
      id: 'PAY-1004',
      date: '2025-11-10',
      vendor: 'Utility Services',
      paymentMethod: 'Bank Transfer',
      reference: 'INV-5004',
      amount: 450.75,
      status: 'Completed',
      paidBy: 'Emily Davis',
      category: 'Utilities'
    },
  ];

  // Filter payments based on search and filters
  const filteredPayments = paymentData.filter(payment => {
    const matchesDate = payment.date >= startDate && payment.date <= endDate;
    const matchesPayment = paymentMethod === 'all' || payment.paymentMethod === paymentMethod;
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesPayment && matchesSearch;
  });

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = filteredPayments.filter(p => p.status === 'Completed').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'Pending').length;
  const paymentMethods = [...new Set(paymentData.map(p => p.paymentMethod))];
  const categories = [...new Set(paymentData.map(p => p.category))];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Payment Vouchers</h2>
        <div style={styles.actions}>
          <button style={styles.exportButton}>
            📄 Export to Excel
          </button>
          <button style={styles.printButton}>
            🖨️ Print
          </button>
          <button style={styles.newPaymentButton}>
            + New Payment
          </button>
        </div>
      </div>

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>From Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.label}>To Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.label}>Payment Method</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.label}>Category</label>
          <select 
            style={styles.select}
            defaultValue="all"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div style={{ ...styles.filterGroup, flex: 1, maxWidth: '300px' }}>
          <label style={styles.label}>Search</label>
          <input 
            type="text" 
            placeholder="Search by payment #, vendor, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...styles.input, width: '100%' }}
          />
        </div>
        
        <button style={styles.applyButton}>
          Apply Filters
        </button>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>💸</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Payments</div>
            <div style={styles.summaryValue}>{filteredPayments.length}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>✅</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Completed</div>
            <div style={{ ...styles.summaryValue, color: '#2e7d32' }}>{completedPayments}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>⏳</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Pending</div>
            <div style={{ ...styles.summaryValue, color: '#ed6c02' }}>{pendingPayments}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>💵</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Amount</div>
            <div style={{ ...styles.summaryValue, color: '#d32f2f' }}>
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Payment Method</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>{payment.vendor}</td>
                  <td>{payment.category}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.reference}</td>
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>
                    ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: payment.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                      color: payment.status === 'Completed' ? '#2e7d32' : '#ed6c02',
                      fontWeight: '500',
                      display: 'inline-block',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.paidBy}</td>
                  <td>
                    <button style={styles.viewButton} title="View">
                      👁️
                    </button>
                    <button style={styles.printButtonSmall} title="Print">
                      🖨️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                  No payment vouchers found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <td colSpan="6" style={{ textAlign: 'right' }}>Total:</td>
              <td style={{ textAlign: 'right' }}>
                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={styles.chartContainer}>
        <h3>Payments by Category</h3>
        <div style={styles.chart}>
          <div style={styles.chartLegend}>
            {categories.map((category, index) => (
              <div key={category} style={styles.legendItem}>
                <div style={{
                  ...styles.legendColor,
                  backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#607d8b'][index % 6]
                }}></div>
                <span>{category}</span>
              </div>
            ))}
          </div>
          <div style={styles.chartBars}>
            {categories.map((category, index) => {
              const categoryTotal = filteredPayments
                .filter(p => p.category === category)
                .reduce((sum, p) => sum + p.amount, 0);
              const percentage = (categoryTotal / (totalAmount || 1)) * 100;
              
              return (
                <div key={category} style={styles.chartBarContainer}>
                  <div style={styles.chartBarLabel}>{category}</div>
                  <div style={styles.chartBarTrack}>
                    <div 
                      style={{
                        ...styles.chartBarFill,
                        width: `${percentage}%`,
                        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#607d8b'][index % 6]
                      }}
                    ></div>
                  </div>
                  <div style={styles.chartBarValue}>
                    ${categoryTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px'
  },
  printButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px'
  },
  newPaymentButton: {
    padding: '8px 16px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    fontWeight: '500'
  },
  filters: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'flex-end'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: '150px'
  },
  label: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    minWidth: '100%'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    minWidth: '100%',
    backgroundColor: 'white'
  },
  applyButton: {
    padding: '8px 20px',
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    height: '36px',
    alignSelf: 'flex-end',
    marginBottom: '5px',
    whiteSpace: 'nowrap'
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  summaryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryLabel: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '2px'
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '30px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    '& th, & td': {
      padding: '12px',
      textAlign: 'left',
      borderBottom: '1px solid #e0e0e0',
      whiteSpace: 'nowrap'
    },
    '& th': {
      backgroundColor: '#f5f5f5',
      fontWeight: '600',
      color: '#333',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    '& tbody tr:hover': {
      backgroundColor: '#f9f9f9'
    },
    '& tfoot td': {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold'
    }
  },
  viewButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    marginRight: '5px',
    '&:hover': {
      backgroundColor: '#f0f0f0'
    }
  },
  printButtonSmall: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f0f0f0'
    }
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginTop: '20px'
  },
  chart: {
    display: 'flex',
    gap: '30px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  chartLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '200px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px'
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '4px'
  },
  chartBars: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  chartBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  chartBarLabel: {
    width: '150px',
    fontSize: '14px',
    fontWeight: '500'
  },
  chartBarTrack: {
    flex: 1,
    height: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  chartBarFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  chartBarValue: {
    width: '100px',
    textAlign: 'right',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default PaymentReport;
