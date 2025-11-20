import React from 'react';

const StockReport = () => {
  const stockData = [
    { id: 1, product: 'Laptop X1', sku: 'LP-X1', category: 'Electronics', currentStock: 15, reorderLevel: 5, status: 'In Stock', value: 15000 },
    { id: 2, product: 'Wireless Mouse', sku: 'WM-100', category: 'Accessories', currentStock: 8, reorderLevel: 10, status: 'Low Stock', value: 800 },
    { id: 3, product: '4K Monitor', sku: 'MK-27UHD', category: 'Monitors', currentStock: 3, reorderLevel: 5, status: 'Low Stock', value: 1200 },
    { id: 4, product: 'USB-C Cable', sku: 'UC-1M', category: 'Cables', currentStock: 0, reorderLevel: 15, status: 'Out of Stock', value: 0 },
    { id: 5, product: 'Mechanical Keyboard', sku: 'MK-200', category: 'Accessories', currentStock: 12, reorderLevel: 5, status: 'In Stock', value: 2400 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock': return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'Low Stock': return { bg: '#fff8e1', text: '#ff8f00' };
      case 'Out of Stock': return { bg: '#ffebee', text: '#d32f2f' };
      default: return { bg: '#f5f5f5', text: '#333' };
    }
  };

  const totalValue = stockData.reduce((sum, item) => sum + item.value, 0);
  const totalItems = stockData.reduce((sum, item) => sum + item.currentStock, 0);
  const outOfStockItems = stockData.filter(item => item.status === 'Out of Stock').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Stock Report</h2>
        <div style={styles.actions}>
          <button style={styles.exportButton}>
            📄 Export to Excel
          </button>
          <button style={styles.printButton}>
            🖨️ Print
          </button>
        </div>
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Items</div>
          <div style={styles.cardValue}>{totalItems}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Value</div>
          <div style={styles.cardValue}>${totalValue.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Out of Stock</div>
          <div style={{ ...styles.cardValue, color: outOfStockItems > 0 ? '#d32f2f' : '#2e7d32' }}>
            {outOfStockItems}
          </div>
        </div>
      </div>

      <div style={styles.filters}>
        <select style={styles.select}>
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Accessories</option>
          <option>Monitors</option>
          <option>Cables</option>
        </select>
        <select style={styles.select}>
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
        <input 
          type="text" 
          placeholder="Search products..." 
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item) => {
              const statusColor = getStatusColor(item.status);
              return (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>{item.currentStock}</td>
                  <td>{item.reorderLevel}</td>
                  <td>${item.value.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      fontWeight: '500'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
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
    marginBottom: '20px'
  },
  actions: {
    display: 'flex',
    gap: '10px'
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
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center'
  },
  cardTitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '5px'
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    backgroundColor: 'white',
    minWidth: '150px'
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    minWidth: '250px',
    flex: 1,
    maxWidth: '400px'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
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
      whiteSpace: 'nowrap'
    },
    '& tbody tr:hover': {
      backgroundColor: '#f9f9f9'
    }
  }
};

export default StockReport;
