import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { HiMiniArrowLeftOnRectangle } from "react-icons/hi2";
import { HiMiniArrowRightEndOnRectangle } from "react-icons/hi2";

const navItems = [
  { name: "Dashboard", path: "/admin/accounting/erp", icon: "📊" },
  { name: "Purchase", path: "/admin/accounting/erp/purchase", icon: "🛒" },
  { name: "Sale", path: "/admin/accounting/erp/billing", icon: "💰" },
  { name: "Expenses", path: "/admin/accounting/erp/expenses", icon: "💸" },
  { name: "Profit/Loss", path: "/admin/accounting/erp/profit-loss", icon: "📈" },
  { name: "Balance Sheet", path: "/admin/accounting/erp/balance-sheet", icon: "📋" },
  { name: "Reports", path: "/admin/accounting/erp/reports", icon: "📑" },
];

const Accounting = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <aside
        className={`
          relative transition-all duration-300 
          bg-emerald-900 text-emerald-100 shadow-xl
          ${sidebarOpen ? "w-64" : "w-20"}
        `}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-emerald-700">
          <h1 className="text-xl font-semibold tracking-wide">
            {sidebarOpen ? "ERP System" : "ERP"}
          </h1>
        </div>

        {/* Nav */}
        <nav className="px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.name : ""}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl
                  transition-all duration-200
                  ${
                    active
                      ? "bg-emerald-600/90 text-white shadow-md"
                      : "text-white hover:bg-emerald-700 hover:text-white"
                  }
                `}>
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
            bg-white text-black shadow-md border
            flex items-center justify-center cursor-pointer
            hover:bg-emerald-400 transition-all 
          ">
          {sidebarOpen ? (
            <HiMiniArrowLeftOnRectangle />
          ) : (
            <HiMiniArrowRightEndOnRectangle />
          )}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-black">Accounting ERP</h2>
          <p className="text-sm text-black">
            Manage finances comfortably & distraction-free
          </p>
        </div>

        {/* Page Wrapper */}
        <div
          className="
            bg-zinc-300 rounded-2xl shadow-lg shadow-zinc-400/60
            border border-zinc-400/50
            p-5
            md:p-6
          ">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Accounting;
