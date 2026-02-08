import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSave, FiImage, FiX } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          const p = data.product;
          setForm({
            name: p.name,
            description: p.description || '',
            price: p.price.toString(),
            quantity: p.quantity.toString(),
            category: p.category,
          });
          if (p.image_url) {
            setImagePreview(`${API_URL}${p.image_url}`);
          }
        } catch (error) {
          toast.error('Product not found');
          navigate('/products');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    else if (form.name.length < 2) errs.name = 'Name must be at least 2 characters';

    if (!form.price) errs.price = 'Price is required';
    else if (isNaN(form.price) || parseFloat(form.price) < 0) errs.price = 'Price must be a positive number';

    if (!form.quantity && form.quantity !== '0') errs.quantity = 'Quantity is required';
    else if (isNaN(form.quantity) || parseInt(form.quantity) < 0) errs.quantity = 'Quantity must be a non-negative integer';

    if (!form.category.trim()) errs.category = 'Category is required';

    if (form.description && form.description.length > 2000) errs.description = 'Description must not exceed 2000 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('quantity', form.quantity);
      formData.append('category', form.category);
      if (image) formData.append('image', image);

      let response;
      if (isEdit) {
        response = await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        response = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully');
      }

      navigate(`/products/${response.data.product.id}`);
    } catch (error) {
      const msg = error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} product`;
      if (error.response?.data?.details) {
        const fieldErrors = {};
        error.response.data.details.forEach((d) => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner message="Loading product..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g. Wireless Mouse"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="4"
            className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Product description..."
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={`input-field ${errors.price ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
              placeholder="0"
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={`input-field ${errors.category ? 'border-red-500' : ''}`}
            placeholder="e.g. Electronics"
            list="category-list"
          />
          <datalist id="category-list">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-40 w-40 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
              <FiImage className="text-3xl text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload image</span>
              <span className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP (max 5MB)</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <FiSave /> {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
