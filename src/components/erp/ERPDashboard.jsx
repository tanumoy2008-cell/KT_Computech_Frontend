import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { LineElement, PointElement } from 'chart.js';
import Lottie from 'lottie-react';
import SandLoading from '../../assets/Sandy Loading.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

// Chart.js configuration
const currencyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: "#000",
        callback: (value) => formatCurrency(value)
      }
    }
  },
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          return `${label}: ${formatCurrency(context.parsed.y)}`;
        }
      }
    }
  }
};

const numbercurrencyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: "#000",
        callback: (value) => value.toLocaleString()
      }
    }
  },
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          return `${label}: ${context.parsed.y.toLocaleString()}`;
        }
      }
    }
  }
};


const ERPDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0
  });
  const [salesData, setSalesData] = useState({
    labels: [],
    monthlySales: [],
    orderCounts: []
  });
  const [inventoryData, setInventoryData] = useState({
    lowStockProducts: [],
    categories: []
  });
  const [inventoryChartType, setInventoryChartType] = useState('pie');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard stats
        const statsRes = await axios.get('/api/erp/dashboard/stats');
        setStats(statsRes.data.data);

        // Fetch sales data
        const salesRes = await axios.get('/api/erp/dashboard/sales');
        setSalesData(salesRes.data.data);

        // Fetch inventory data
        const inventoryRes = await axios.get('/api/erp/dashboard/inventory');
        setInventoryData(inventoryRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
const salesChartData = {
  labels: salesData.labels || [],
  datasets: [
    {
      label: "Monthly Sales",
      data: salesData.monthlySales || [],

      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) return null;

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

        gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)");

        return gradient;
      },

      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
    },
  ],
};


  const ordersChartData = {
    labels: salesData.labels || [],
    datasets: [
      {
        label: 'Orders',
        data: salesData.orderCounts || [],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.1)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0.9)");

          return gradient;
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

// Inventory chart data generator (supports Pie/Bar/Line)
const getInventoryChartData = () => {
  const cats = inventoryData.mainCategories || [];
  const labels = cats.map((cat) => cat.name || 'Uncategorized');
  const values = cats.map((cat) => Number(cat.totalStock || 0));

  // generate palette with enough colors
  const base = [
    'rgba(239, 68, 68, 0.9)',
    'rgba(59, 130, 246, 0.9)',
    'rgba(234, 179, 8, 0.9)',
    'rgba(16, 185, 129, 0.9)',
    'rgba(139, 92, 246, 0.9)',
    'rgba(6, 182, 212, 0.9)',
    'rgba(249, 115, 22, 0.9)'
  ];

  const backgroundColor = labels.map((_, i) => base[i % base.length]);

  const pieData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.6)',
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: 'Stock',
        data: values,
        backgroundColor: backgroundColor.map((c) => c.replace(/0\.9\)$/, '0.8)')),
        borderColor: backgroundColor,
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Stock',
        data: values,
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderColor: 'rgba(59,130,246,1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: backgroundColor,
        pointBorderColor: '#000',
      },
    ],
  };

  return { pieData, barData, lineData };
};


const inventoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#000",
        font: {
          size: 18
        }
      }
    },

    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || "";
          const value = Number(context.raw || 0);

          const total = context.dataset.data.reduce(
            (sum, v) => sum + Number(v || 0),
            0
          );

          const percentage = total ? Math.round((value / total) * 100) : 0;

          return `${label}: ${value} units (${percentage}%)`;
        },
      },
      titleColor: "#000",  
      bodyColor: "#dadada",  
    },
  },
};



  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Lottie
          animationData={SandLoading}
          loop={true}
          className="w-100 h-100 mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <h1 className="text-2xl font-bold text-black mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-4 2xl:p-6 border border-l-6 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs 2xl:text-base uppercase font-bold text-black font-PublicSans">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold text-black font-mono">
                {formatCurrency(stats.totalSales)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-200">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 5h10M7 9h10m0 0a5 5 0 01-5 5H9m3 0l4 5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-4 2xl:p-6 border border-l-6 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs 2xl:text-base uppercase font-bold text-black font-PublicSans">
                Total Orders
              </p>
              <p className="text-2xl font-semibold text-black font-mono">
                {stats.totalOrders}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-200">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-4 2xl:p-6 border border-l-6 border-cyan-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs 2xl:text-base uppercase font-bold text-black font-PublicSans">
                Total Products
              </p>
              <p className="text-2xl font-semibold text-black font-mono">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-3 rounded-full bg-cyan-200">
              <svg
                className="w-6 h-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow p-4 2xl:p-6 border border-l-6 border-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs 2xl:text-base uppercase font-bold text-black font-PublicSans">
                Low Stock Items
              </p>
              <p className="text-2xl font-semibold text-black font-mono">
                {stats.lowStockProducts}
              </p>
            </div>
            <div className="p-3 rounded-full bg-rose-200">
              <svg
                className="w-6 h-6 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-zinc-100 rounded-lg border border-zinc-500/50 shadow-lg shadow-zinc-500/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Sales Overview
            </h2>
          </div>
          <div className="h-80">
            <Bar data={salesChartData} options={currencyChartOptions} />
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg border border-zinc-500/50 shadow-lg shadow-zinc-500/60 lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Orders Overview
            </h2>
          </div>
          <div className="h-80">
            <Bar data={ordersChartData} options={numbercurrencyChartOptions} />
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory by Category */}
        <div className="bg-white border border-zinc-500/50 shadow-lg shadow-zinc-500/60 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">
              Inventory by Category
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInventoryChartType('pie')}
                className={`px-3 py-1 rounded text-sm cursor-pointer ${inventoryChartType === 'pie' ? 'bg-black text-white' : 'bg-black/20 text-black'}`}>
                Pie
              </button>
              <button
                onClick={() => setInventoryChartType('bar')}
                className={`px-3 py-1 rounded text-sm cursor-pointer ${inventoryChartType === 'bar' ? 'bg-black text-white' : 'bg-black/20 text-black'}`}>
                Bar
              </button>
              <button
                onClick={() => setInventoryChartType('line')}
                className={`px-3 py-1 rounded text-sm cursor-pointer ${inventoryChartType === 'line' ? 'bg-black text-white' : 'bg-black/20 text-black'}`}>
                Line
              </button>
            </div>
          </div>
          <div className="h-80">
            {(() => {
              const { pieData, barData, lineData } = getInventoryChartData();
              const labelsCount = pieData.labels.length;
              if (labelsCount === 0) {
                return <div className="flex items-center justify-center h-full text-white">No category data</div>;
              }

              if (inventoryChartType === 'pie') return <Pie data={pieData} options={inventoryChartOptions} />;
              if (inventoryChartType === 'bar') return <Bar data={barData} options={{ ...currencyChartOptions, scales: { y: { beginAtZero: true } } }} />;
              return <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />;
            })()}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-lg border border-zinc-500/50 shadow-lg shadow-zinc-500/60 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Low Stock Items
              </h2>
              <span className="px-3 py-1 text-sm text-amber-800 bg-amber-100 rounded-full">
                {inventoryData.lowStockProducts.length} items
              </span>
            </div>
            <div className="overflow-x-auto h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.lowStockProducts.length > 0 ? (
                    inventoryData.lowStockProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.Subcategory || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.stock < 5
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {product.stock < 5 ? "Very Low" : "Low"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-sm text-gray-500">
                        No low stock items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERPDashboard;