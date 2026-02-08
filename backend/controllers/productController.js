const Product = require('../models/Product');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// GET /api/products — List with search, filter, sort, pagination
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      sort = 'created_at',
      order = 'DESC',
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Allowed sort fields
    const allowedSorts = ['name', 'price', 'quantity', 'category', 'created_at', 'updated_at'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortDir = order.toUpperCase() === 'ASC' ? 1 : -1;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Count total
    const total = await Product.countDocuments(filter);

    // Fetch data with populate for author username
    const products = await Product.find(filter)
      .populate('user_id', 'username')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Map to add author field for frontend compatibility
    const mappedProducts = products.map((p) => ({
      ...p,
      id: p._id,
      author: p.user_id?.username || null,
      user_id: p.user_id?._id || p.user_id,
    }));

    res.json({
      products: mappedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('GetAll products error:', error);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
};

// GET /api/products/categories — Distinct categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    categories.sort();
    res.json({ categories });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
};

// GET /api/products/:id — Single product
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('user_id', 'username')
      .lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const mapped = {
      ...product,
      id: product._id,
      author: product.user_id?.username || null,
      user_id: product.user_id?._id || product.user_id,
    };

    res.json({ product: mapped });
  } catch (error) {
    console.error('GetById error:', error);
    res.status(500).json({ error: 'Server error fetching product.' });
  }
};

// POST /api/products — Create product
exports.create = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    let image_url = null;
    let image_base64 = null;

    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      image_base64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      image_url,
      image_base64,
      user_id: req.user._id,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error creating product.' });
  }
};

// PUT /api/products/:id — Update product
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, category } = req.body;

    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (existing.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this product.' });
    }

    let image_url = existing.image_url;
    let image_base64 = existing.image_base64;
    
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      image_base64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
      image_url = null;
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category,
        image_url,
        image_base64,
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error updating product.' });
  }
};

// DELETE /api/products/:id — Delete product
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (existing.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this product.' });
    }

    await Product.findByIdAndDelete(id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error deleting product.' });
  }
};
