import React, { useState } from 'react';

const JournalEntryReport = () => {
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2025-11-18');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Sample journal entries data
  const journalEntries = [
    {
      id: 'JE-1001',
      date: '2025-11-15',
      type: 'Adjustment',
      reference: 'ADJ-001',
      description: 'Inventory adjustment for year-end',
      status: 'Posted',
      total: 1250.00,
      entries: [
        { account: 'Inventory', debit: 0, credit: 1250.00 },
        { account: 'Cost of Goods Sold', debit: 1250.00, credit: 0 }
      ]
    },
    {
      id: 'JE-1002',
      date: '2025-11-14',
      type: 'Depreciation',
      reference: 'DEP-001',
      description: 'Monthly equipment depreciation',
      status: 'Posted',
      total: 850.00,
      entries: [
        { account: 'Depreciation Expense', debit: 850.00, credit: 0 },
        { account: 'Accumulated Depreciation', debit: 0, credit: 850.00 }
      ]
    },
    {
      id: 'JE-1003',
      date: '2025-11-10',
      type: 'Accrual',
      reference: 'ACC-001',
      description: 'Accrued salaries for November',
      status: 'Draft',
      total: 5200.00,
      entries: [
        { account: 'Salaries Expense', debit: 5200.00, credit: 0 },
        { account: 'Accrued Salaries Payable', debit: 0, credit: 5200.00 }
      ]
    },
    {
      id: 'JE-1004',
      date: '2025-11-05',
      type: 'Reclassification',
      reference: 'RECL-001',
      description: 'Reclassify office supplies to expense',
      status: 'Posted',
      total: 450.00,
      entries: [
        { account: 'Office Supplies Expense', debit: 450.00, credit: 0 },
        { account: 'Prepaid Expenses', debit: 0, credit: 450.00 }
      ]
    },
  ];

  // Filter entries based on search and filters
  const filteredEntries = journalEntries.filter(entry => {
    const matchesDate = entry.date >= startDate && entry.date <= endDate;
    const matchesType = selectedType === 'all' || entry.type === selectedType;
    const matchesSearch = 
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesType && matchesSearch;
  });

  // Get unique entry types for filter dropdown
  const entryTypes = [...new Set(journalEntries.map(entry => entry.type))];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Journal Entries</h2>
        <div style={styles.actions}>
          <button style={styles.exportButton}>
            📄 Export to Excel
          </button>
          <button style={styles.printButton}>
            🖨️ Print
          </button>
          <button style={styles.newEntryButton}>
            + New Journal Entry
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
          <label style={styles.label}>Entry Type</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Types</option>
            {entryTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div style={{ ...styles.filterGroup, flex: 1, maxWidth: '300px' }}>
          <label style={styles.label}>Search</label>
          <input 
            type="text" 
            placeholder="Search by ID, reference, or description..."
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
            <span style={{ fontSize: '24px' }}>📋</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Entries</div>
            <div style={styles.summaryValue}>{filteredEntries.length}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>✅</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Posted</div>
            <div style={{ ...styles.summaryValue, color: '#2e7d32' }}>
              {filteredEntries.filter(e => e.status === 'Posted').length}
            </div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>📝</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Draft</div>
            <div style={{ ...styles.summaryValue, color: '#ed6c02' }}>
              {filteredEntries.filter(e => e.status === 'Draft').length}
            </div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <span style={{ fontSize: '24px' }}>💵</span>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Amount</div>
            <div style={{ ...styles.summaryValue, color: '#1976d2' }}>
              ${filteredEntries.reduce((sum, entry) => sum + entry.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry, index) => (
            <div key={entry.id} style={styles.journalEntry}>
              <div style={styles.journalHeader}>
                <div>
                  <span style={styles.journalId}>{entry.id}</span>
                  <span style={styles.journalDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: entry.status === 'Posted' ? '#e8f5e9' : '#fff3e0',
                    color: entry.status === 'Posted' ? '#2e7d32' : '#ed6c02'
                  }}>
                    {entry.status}
                  </span>
                </div>
                <div>
                  <span style={styles.journalType}>{entry.type}</span>
                  <span style={styles.journalRef}>Ref: {entry.reference}</span>
                  <button style={styles.viewButton} title="View">
                    👁️
                  </button>
                  <button style={styles.printButtonSmall} title="Print">
                    🖨️
                  </button>
                </div>
              </div>
              
              <div style={styles.journalDescription}>
                {entry.description}
              </div>
              
              <table style={styles.entriesTable}>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th style={{ textAlign: 'right' }}>Debit</th>
                    <th style={{ textAlign: 'right' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.entries.map((line, idx) => (
                    <tr key={idx}>
                      <td style={{ paddingLeft: '20px' }}>{line.account}</td>
                      <td style={{ textAlign: 'right', fontWeight: line.debit > 0 ? '500' : 'normal' }}>
                        {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: line.credit > 0 ? '500' : 'normal' }}>
                        {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      ${entry.entries.reduce((sum, line) => sum + line.debit, 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      ${entry.entries.reduce((sum, line) => sum + line.credit, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              
              {index < filteredEntries.length - 1 && <div style={styles.divider}></div>}
            </div>
          ))
        ) : (
          <div style={styles.noResults}>
            No journal entries found matching your criteria.
          </div>
        )}
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
  newEntryButton: {
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
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    overflow: 'hidden'
  },
  journalEntry: {
    padding: '20px',
    backgroundColor: 'white'
  },
  journalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  journalId: {
    fontWeight: 'bold',
    marginRight: '15px',
    fontSize: '16px'
  },
  journalDate: {
    color: '#666',
    marginRight: '15px',
    fontSize: '14px'
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
    minWidth: '70px',
    textAlign: 'center'
  },
  journalType: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    marginRight: '10px'
  },
  journalRef: {
    color: '#666',
    marginRight: '15px',
    fontSize: '13px'
  },
  journalDescription: {
    color: '#444',
    marginBottom: '15px',
    fontStyle: 'italic',
    paddingLeft: '5px'
  },
  entriesTable: {
    width: '100%',
    borderCollapse: 'collapse',
    '& th, & td': {
      padding: '10px',
      textAlign: 'left',
      borderBottom: '1px solid #f0f0f0'
    },
    '& th': {
      backgroundColor: '#f5f7fa',
      fontWeight: '600',
      color: '#555',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    '& tbody tr:hover': {
      backgroundColor: '#f9f9f9'
    },
    '& tfoot': {
      borderTop: '2px solid #e0e0e0',
      '& td': {
        paddingTop: '12px',
        paddingBottom: '5px'
      }
    }
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '15px 0',
    width: '100%'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
    fontSize: '16px'
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

export default JournalEntryReport;
