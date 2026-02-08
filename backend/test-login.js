const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ email: 'admin@markethub.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin NOT found');
      process.exit(1);
    }
    
    console.log('✅ Admin found');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Password hash exists:', !!admin.password);
    console.log('Hash preview:', admin.password.substring(0, 20) + '...');
    
    const match = await bcrypt.compare('Admin123!', admin.password);
    console.log('Password match result:', match);
    
    if (match) {
      console.log('\n✅ LOGIN SHOULD WORK!');
    } else {
      console.log('\n❌ PASSWORD DOES NOT MATCH');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
