import React from 'react';
import { Link, Routes, Route, useParams, useLocation } from 'react-router-dom';
import StockReport from './StockReport';
import LedgerReport from './LedgerReport';
import ReceiptReport from './ReceiptReport';
import PaymentReport from './PaymentReport';
import JournalEntryReport from './JournalEntryReport';

const Reports = () => {
  const { reportType } = useParams();
  const location = useLocation();

  const reportTypes = [
    { 
      id: 'stock', 
      path: 'stock', 
      name: 'Stock Report', 
      icon: '📦', 
      component: <StockReport /> 
    },
    { 
      id: 'ledger', 
      path: 'ledger', 
      name: 'General Ledger', 
      icon: '📒', 
      component: <LedgerReport /> 
    },
    { 
      id: 'receipt', 
      path: 'receipt', 
      name: 'Receipt Vouchers', 
      icon: '📥', 
      component: <ReceiptReport /> 
    },
    { 
      id: 'payment', 
      path: 'payment', 
      name: 'Payment Vouchers', 
      icon: '📤', 
      component: <PaymentReport /> 
    },
    { 
      id: 'journal', 
      path: 'journal', 
      name: 'Journal Entries', 
      icon: '📝', 
      component: <JournalEntryReport /> 
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Reports</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {reportTypes.map(report => (
          <Link
            key={report.id}
            to={report.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              backgroundColor: location.pathname.endsWith(`/reports/${report.path}`) 
                ? '#e3f2fd' 
                : '#f5f5f5',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#333',
              transition: 'all 0.2s',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <span style={{ fontSize: '28px', marginBottom: '10px' }}>{report.icon}</span>
            <span style={{ textAlign: 'center' }}>{report.name}</span>
          </Link>
        ))}
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        minHeight: '300px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Routes>
          {reportTypes.map(report => (
            <Route
              key={report.id}
              path={report.path}
              element={report.component}
            />
          ))}
          <Route 
            index 
            element={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#666'
              }}>
                Select a report to view details
              </div>
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

export default Reports;