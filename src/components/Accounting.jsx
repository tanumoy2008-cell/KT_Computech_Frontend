import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import 'chart.js/auto';


// Styles
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f7fa'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '20px 0',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
  },
  main: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto'
  },
  logo: {
    padding: '0 20px 20px',
    borderBottom: '1px solid #334155',
    marginBottom: '20px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  nav: {
    padding: '0 10px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: '#e2e8f0',
    textDecoration: 'none',
    borderRadius: '6px',
    marginBottom: '5px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#334155',
      color: 'white'
    }
  },
  navItemActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    '&:hover': {
      backgroundColor: '#2563eb'
    }
  },
  navIcon: {
    marginRight: '10px',
    fontSize: '1.2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e2e8f0'
  },
  pageTitle: {
    fontSize: '1.8rem',
    color: '#1e293b',
    margin: 0
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }
};

// Navigation items
const navItems = [
  { name: 'Dashboard', path: '/admin/accounting/erp', icon: '📊' },
  { name: 'Purchase', path: '/admin/accounting/erp/purchase', icon: '🛒' },
  { name: 'Sale', path: '/admin/accounting/erp/sale', icon: '💰' },
  { name: 'Expenses', path: '/admin/accounting/erp/expenses', icon: '💸' },
  { name: 'Profit/Loss', path: '/admin/accounting/erp/profit-loss', icon: '📈' },
  { name: 'Balance Sheet', path: '/admin/accounting/erp/balance-sheet', icon: '📋' },
  { name: 'Reports', path: '/admin/accounting/erp/reports', icon: '📑' }
];

const Accounting = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: sidebarOpen ? '250px' : '80px',
        transition: 'width 0.3s'
      }}>
        <div style={styles.logo}>
          {sidebarOpen ? 'ERP System' : 'ERP'}
        </div>
        
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {})
              }}
              title={!sidebarOpen ? item.name : ''}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && item.name}
            </Link>
          ))}
        </nav>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: sidebarOpen ? '220px' : '50px',
            background: 'white',
            border: 'none',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'left 0.3s',
            zIndex: 1000
          }}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default Accounting;
