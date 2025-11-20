import React, { useState } from 'react';

const LedgerReport = () => {
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2025-11-18');
  const [selectedAccount, setSelectedAccount] = useState('all');

  const accounts = [
    { id: 'cash', name: 'Cash Account' },
    { id: 'bank', name: 'Bank Account' },
    { id: 'ar', name: 'Accounts Receivable' },
    { id: 'ap', name: 'Accounts Payable' },
    { id: 'sales', name: 'Sales Revenue' },
    { id: 'expenses', name: 'Operating Expenses' },
  ];

  // Sample ledger data
  const ledgerData = [
    { 
      id: 1, 
      date: '2025-11-15', 
      account: 'Cash Account', 
      reference: 'INV-1001', 
      description: 'Payment received from customer',
      debit: 0,
      credit: 1500,
      balance: 25000
    },
    { 
      id: 2, 
      date: '2025-11-14', 
      account: 'Accounts Payable', 
      reference: 'PAY-1002', 
      description: 'Paid vendor for office supplies',
      debit: 350,
      credit: 0,
      balance: 18000
    },
    { 
      id: 3, 
      date: '2025-11-13', 
      account: 'Sales Revenue', 
      reference: 'INV-1001', 
      description: 'Product sale',
      debit: 0,
      credit: 1500,
      balance: 45000
    },
    { 
      id: 4, 
      date: '2025-11-12', 
      account: 'Operating Expenses', 
      reference: 'EXP-1003', 
      description: 'Office supplies',
      debit: 350,
      credit: 0,
      balance: 12000
    },
  ];

  const filteredData = selectedAccount === 'all' 
    ? ledgerData 
    : ledgerData.filter(entry => entry.account === selectedAccount);

  const totalDebit = filteredData.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredData.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>General Ledger</h2>
        <div style={styles.actions}>
          <button style={styles.exportButton}>
            📄 Export to Excel
          </button>
          <button style={styles.printButton}>
            🖨️ Print
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
          <label style={styles.label}>Account</label>
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        
        <button style={styles.applyButton}>
          Apply Filters
        </button>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>Opening Balance</div>
          <div style={styles.summaryValue}>$24,500.00</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>Total Debit</div>
          <div style={styles.summaryValue}>${totalDebit.toFixed(2)}</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>Total Credit</div>
          <div style={styles.summaryValue}>${totalCredit.toFixed(2)}</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>Closing Balance</div>
          <div style={{ ...styles.summaryValue, color: '#2e7d32' }}>
            ${(24500 - totalDebit + totalCredit).toFixed(2)}
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Account</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.account}</td>
                <td>{entry.reference}</td>
                <td>{entry.description}</td>
                <td style={{ textAlign: 'right' }}>
                  {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  ${entry.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <td colSpan="4" style={{ textAlign: 'right' }}>Totals:</td>
              <td style={{ textAlign: 'right' }}>${totalDebit.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>${totalCredit.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>
                ${(24500 - totalDebit + totalCredit).toFixed(2)}
              </td>
            </tr>
          </tfoot>
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
    gap: '5px'
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
    minWidth: '150px'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    minWidth: '200px',
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
    marginBottom: '5px'
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  summaryItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center'
  },
  summaryLabel: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '5px'
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
      borderBottom: '1px solid #e0e0e0'
    },
    '& th': {
      backgroundColor: '#f5f5f5',
      fontWeight: '600',
      color: '#333',
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    '& tbody tr:hover': {
      backgroundColor: '#f9f9f9'
    },
    '& tfoot': {
      fontWeight: 'bold',
      backgroundColor: '#f5f5f5'
    }
  }
};

export default LedgerReport;
