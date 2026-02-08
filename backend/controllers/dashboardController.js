const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/dashboard/stats — Dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments();

    // Total inventory value
    const inventoryAgg = await Product.aggregate([
      { $group: { _id: null, total_value: { $sum: { $multiply: ['$price', '$quantity'] } } } },
    ]);
    const inventoryValue = inventoryAgg.length > 0 ? inventoryAgg[0].total_value : 0;

    // Products by category
    const byCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          total_quantity: { $sum: '$quantity' },
        },
      },
      { $project: { _id: 0, category: '$_id', count: 1, total_quantity: 1 } },
      { $sort: { count: -1 } },
    ]);

    // Low stock products (quantity < 20)
    const lowStock = await Product.find({ quantity: { $lt: 20 } })
      .select('name quantity category')
      .sort({ quantity: 1 })
      .limit(10)
      .lean();
    const lowStockMapped = lowStock.map((p) => ({ id: p._id, name: p.name, quantity: p.quantity, category: p.category }));

    // Recent products (last 10)
    const recentProducts = await Product.find()
      .select('name price category created_at')
      .sort({ created_at: -1 })
      .limit(10)
      .lean();
    const recentMapped = recentProducts.map((p) => ({ id: p._id, name: p.name, price: p.price, category: p.category, created_at: p.created_at }));

    // Price distribution
    const priceRanges = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 25, 50, 100, 250, 500, Infinity],
          default: '500+',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const priceLabels = ['0-25', '25-50', '50-100', '100-250', '250-500', '500+'];
    const priceRangesMapped = priceRanges.map((r, i) => ({
      price_range: priceLabels[i] || '500+',
      count: r.count,
    }));

    res.json({
      totalProducts,
      totalUsers,
      inventoryValue,
      byCategory,
      lowStock: lowStockMapped,
      recentProducts: recentMapped,
      priceRanges: priceRangesMapped,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error fetching statistics.' });
  }
};
