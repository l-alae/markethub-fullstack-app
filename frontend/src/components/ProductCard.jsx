import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProductCard({ product }) {
  const imageUrl = product.image_base64 || (product.image_url ? `${API_URL}${product.image_url}` : null);

  return (
    <Link to={`/products/${product.id}`} className="card group">
      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <FiPackage className="text-4xl text-gray-300" />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="text-primary-600 font-bold whitespace-nowrap ml-2">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {product.description || 'No description available'}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span className="bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
          <span>Stock: {product.quantity}</span>
        </div>
      </div>
    </Link>
  );
}
