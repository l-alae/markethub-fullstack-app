import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiEdit, FiTrash2, FiArrowLeft, FiPackage, FiUser, FiCalendar, FiTag, FiDollarSign, FiBox } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (error) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading product..." />;
  if (!product) return null;

  const canEdit = user && (user.id === product.user_id || isAdmin);
  const imageUrl = product.image_url ? `${API_URL}${product.image_url}` : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6">
        <FiArrowLeft /> Back to Products
      </Link>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <FiPackage className="text-6xl text-gray-300" />
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-4">
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <FiTag /> {product.category}
                </span>
                {canEdit && (
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit />
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-6">
                <FiDollarSign className="text-primary-600" />
                <span className="text-3xl font-bold text-primary-600">
                  {parseFloat(product.price).toFixed(2)}
                </span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiBox className="text-gray-400" />
                  <span>Stock: <strong className={product.quantity < 20 ? 'text-red-600' : 'text-green-600'}>{product.quantity} units</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FiUser className="text-gray-400" />
                  <span>Added by: <strong>{product.author || 'Unknown'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FiCalendar className="text-gray-400" />
                  <span>Added: {new Date(product.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {product.updated_at !== product.created_at && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <FiCalendar className="text-gray-400" />
                    <span>Updated: {new Date(product.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {product.quantity < 20 && (
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                ⚠️ Low stock alert — Only {product.quantity} units remaining
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
