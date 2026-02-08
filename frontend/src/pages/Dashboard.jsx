import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { FiPackage, FiUsers, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!stats) return <p className="text-center text-gray-500 py-16">Failed to load statistics</p>;

  const categoryChartData = {
    labels: stats.byCategory.map((c) => c.category),
    datasets: [
      {
        label: 'Products per Category',
        data: stats.byCategory.map((c) => parseInt(c.count)),
        backgroundColor: [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
        ],
        borderWidth: 0,
      },
    ],
  };

  const priceChartData = {
    labels: stats.priceRanges.map((r) => `$${r.price_range}`),
    datasets: [
      {
        label: 'Products by Price Range',
        data: stats.priceRanges.map((r) => parseInt(r.count)),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold">${stats.inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiUsers className="text-purple-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiAlertTriangle className="text-orange-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold">{stats.lowStock.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Products by Category</h2>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Price Distribution</h2>
          <div className="h-64">
            <Bar data={priceChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-orange-500" /> Low Stock Alert
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">All products are well stocked!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-gray-500">Product</th>
                    <th className="pb-2 font-medium text-gray-500">Category</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStock.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link to={`/products/${p.id}`} className="text-primary-600 hover:underline">{p.name}</Link>
                      </td>
                      <td className="py-2 text-gray-500">{p.category}</td>
                      <td className="py-2 text-right">
                        <span className={`font-medium ${p.quantity < 10 ? 'text-red-600' : 'text-orange-500'}`}>
                          {p.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-gray-500">Product</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Price</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProducts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link to={`/products/${p.id}`} className="text-primary-600 hover:underline">{p.name}</Link>
                    </td>
                    <td className="py-2 text-right font-medium">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
