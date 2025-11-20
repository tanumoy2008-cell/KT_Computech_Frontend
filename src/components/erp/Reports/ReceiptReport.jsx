import React, { useState } from 'react';

const ReceiptReport = () => {
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2025-11-18');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample receipt data
  const receiptData = [
    {
      id: 'RCPT-1001',
      date: '2025-11-15',
      customer: 'John Doe',
      paymentMethod: 'Cash',
      reference: 'INV-1001',
      amount: 1500.00,
      status: 'Completed',
      receivedBy: 'Jane Smith'
    },
    {
      id: 'RCPT-1002',
      date: '2025-11-14',
      customer: 'Acme Corp',
      paymentMethod: 'Bank Transfer',
      reference: 'INV-1002',
      amount: 3250.50,
      status: 'Completed',
      receivedBy: 'Mike Johnson'
    },
    {
      id: 'RCPT-1003',
      date: '2025-11-12',
      customer: 'Global Tech',
      paymentMethod: 'Credit Card',
      reference: 'INV-1003',
      amount: 875.25,
      status: 'Completed',
      receivedBy: 'Sarah Williams'
    },
    {
      id: 'RCPT-1004',
      date: '2025-11-10',
      customer: 'Tech Solutions',
      paymentMethod: 'Bank Transfer',
      reference: 'INV-1004',
      amount: 4200.00,
      status: 'Pending',
      receivedBy: 'David Brown'
    },
  ];

  // Filter receipts based on search and filters
  const filteredReceipts = receiptData.filter(receipt => {
    const matchesDate = receipt.date >= startDate && receipt.date <= endDate;
    const matchesPayment = paymentMethod === 'all' || receipt.paymentMethod === paymentMethod;
    const matchesSearch = 
      receipt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesPayment && matchesSearch;
  });

  // Calculate totals
  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const completedReceipts = filteredReceipts.filter(r => r.status === 'Completed').length;
  const pendingReceipts = filteredReceipts.filter(r => r.status === 'Pending').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Receipt Vouchers</h2>
        <div style={styles.actions}>
          <button style={styles.exportButton}>
            📄 Export to Excel
          </button>
          <button style={styles.printButton}>
            🖨️ Print
          </button>
          <button style={styles.newReceiptButton}>
            + New Receipt
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
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
          </select>
        </div>
        
        <div style={{ ...styles.filterGroup, flex: 1, maxWidth: '300px' }}>
          <label style={styles.label}>Search</label>
          <input 
            type="text" 
            placeholder="Search by receipt #, customer, or reference..."
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
            <span style={{ fontSize: '24px' }}>💰</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Receipts</div>
            <div style={styles.summaryValue}>{filteredReceipts.length}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>✅</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Completed</div>
            <div style={{ ...styles.summaryValue, color: '#2e7d32' }}>{completedReceipts}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>⏳</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Pending</div>
            <div style={{ ...styles.summaryValue, color: '#ed6c02' }}>{pendingReceipts}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>💵</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Amount</div>
            <div style={{ ...styles.summaryValue, color: '#1976d2' }}>
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment Method</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Received By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td>{receipt.id}</td>
                  <td>{new Date(receipt.date).toLocaleDateString()}</td>
                  <td>{receipt.customer}</td>
                  <td>{receipt.paymentMethod}</td>
                  <td>{receipt.reference}</td>
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>
                    ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: receipt.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                      color: receipt.status === 'Completed' ? '#2e7d32' : '#ed6c02',
                      fontWeight: '500',
                      display: 'inline-block',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      {receipt.status}
                    </span>
                  </td>
                  <td>{receipt.receivedBy}</td>
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
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  No receipt vouchers found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  newReceiptButton: {
    padding: '8px 16px',
    backgroundColor: '#3f51b5',
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
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
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
    marginTop: '20px'
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
    '& tbody tr:last-child td': {
      borderBottom: 'none'
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
  }
};

export default ReceiptReport;
