const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');

const initDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB Atlas');

    // Seed admin user
    const adminExists = await User.findOne({ email: 'admin@markethub.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await User.create({
        username: 'admin',
        email: 'admin@markethub.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin user created (admin@markethub.com / Admin123!)');
    }

    // Seed sample products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const adminUser = await User.findOne({ email: 'admin@markethub.com' });

      const sampleProducts = [
        { name: 'Laptop Pro 15"', description: 'High-performance laptop with 16GB RAM and 512GB SSD', price: 1299.99, quantity: 25, category: 'Electronics', user_id: adminUser._id },
        { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', price: 29.99, quantity: 150, category: 'Electronics', user_id: adminUser._id },
        { name: 'Office Chair', description: 'Adjustable ergonomic office chair with lumbar support', price: 349.99, quantity: 40, category: 'Furniture', user_id: adminUser._id },
        { name: 'Standing Desk', description: 'Electric height-adjustable standing desk', price: 599.99, quantity: 15, category: 'Furniture', user_id: adminUser._id },
        { name: 'Noise Cancelling Headphones', description: 'Premium over-ear headphones with ANC', price: 249.99, quantity: 60, category: 'Electronics', user_id: adminUser._id },
        { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', price: 129.99, quantity: 80, category: 'Electronics', user_id: adminUser._id },
        { name: 'Monitor 27" 4K', description: 'Ultra HD IPS monitor with USB-C connectivity', price: 449.99, quantity: 30, category: 'Electronics', user_id: adminUser._id },
        { name: 'Webcam HD', description: '1080p webcam with built-in microphone', price: 79.99, quantity: 100, category: 'Electronics', user_id: adminUser._id },
        { name: 'Desk Lamp LED', description: 'Adjustable LED desk lamp with dimmer', price: 45.99, quantity: 200, category: 'Accessories', user_id: adminUser._id },
        { name: 'USB Hub 7-Port', description: 'Powered USB 3.0 hub with individual switches', price: 34.99, quantity: 120, category: 'Accessories', user_id: adminUser._id },
        { name: 'Backpack Laptop', description: 'Water-resistant laptop backpack 17"', price: 69.99, quantity: 75, category: 'Accessories', user_id: adminUser._id },
        { name: 'Whiteboard 90x60', description: 'Magnetic dry-erase whiteboard', price: 89.99, quantity: 50, category: 'Office Supplies', user_id: adminUser._id },
        { name: 'Notebook Set', description: 'Pack of 5 premium A5 notebooks', price: 19.99, quantity: 300, category: 'Office Supplies', user_id: adminUser._id },
        { name: 'Pen Set', description: 'Professional ballpoint pen set - 10 pack', price: 12.99, quantity: 500, category: 'Office Supplies', user_id: adminUser._id },
        { name: 'Cable Management Kit', description: 'Complete cable organizer kit for desk', price: 24.99, quantity: 180, category: 'Accessories', user_id: adminUser._id },
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products seeded');
    }

    console.log('\n🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initDb();
