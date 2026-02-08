const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const https = require('https');
const http = require('http');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');

// Download image and convert to base64
function downloadImageBase64(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImageBase64(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        const contentType = response.headers['content-type'] || 'image/jpeg';
        resolve(`data:${contentType};base64,${base64}`);
      });
    }).on('error', (err) => {
      console.log(`   ⚠ Could not download image, using null`);
      resolve(null);
    });
  });
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB Atlas\n');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑  Cleared existing data');

    // ─── CREATE USERS ───
    const adminPass = await bcrypt.hash('Admin123!', 10);
    const userPass = await bcrypt.hash('User123!', 10);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@markethub.com',
      password: adminPass,
      role: 'admin',
    });

    const alice = await User.create({
      username: 'alice_seller',
      email: 'alice@example.com',
      password: userPass,
      role: 'user',
    });

    const bob = await User.create({
      username: 'bob_shop',
      email: 'bob@example.com',
      password: userPass,
      role: 'user',
    });

    const carol = await User.create({
      username: 'carol_tech',
      email: 'carol@example.com',
      password: userPass,
      role: 'user',
    });

    console.log('✅ Users created:');
    console.log('   admin@markethub.com / Admin123! (admin)');
    console.log('   alice@example.com / User123! (user)');
    console.log('   bob@example.com / User123! (user)');
    console.log('   carol@example.com / User123! (user)\n');

    // ─── DOWNLOAD IMAGES ───
    console.log('📸 Downloading product images as base64...');

    // Using picsum.photos for reliable placeholder images
    const imageBase64 = {};
    const imageItems = [
      { key: 'laptop', url: 'https://picsum.photos/seed/laptop/600/400' },
      { key: 'mouse', url: 'https://picsum.photos/seed/mouse/600/400' },
      { key: 'chair', url: 'https://picsum.photos/seed/chair/600/400' },
      { key: 'desk', url: 'https://picsum.photos/seed/desk/600/400' },
      { key: 'headphones', url: 'https://picsum.photos/seed/headphones/600/400' },
      { key: 'keyboard', url: 'https://picsum.photos/seed/keyboard/600/400' },
      { key: 'monitor', url: 'https://picsum.photos/seed/monitor4k/600/400' },
      { key: 'webcam', url: 'https://picsum.photos/seed/webcam/600/400' },
      { key: 'lamp', url: 'https://picsum.photos/seed/lamp/600/400' },
      { key: 'hub', url: 'https://picsum.photos/seed/usbhub/600/400' },
      { key: 'backpack', url: 'https://picsum.photos/seed/backpack/600/400' },
      { key: 'whiteboard', url: 'https://picsum.photos/seed/whiteboard/600/400' },
      { key: 'notebook', url: 'https://picsum.photos/seed/notebook/600/400' },
      { key: 'pens', url: 'https://picsum.photos/seed/pens/600/400' },
      { key: 'cables', url: 'https://picsum.photos/seed/cables/600/400' },
      { key: 'tablet', url: 'https://picsum.photos/seed/tablet/600/400' },
      { key: 'speaker', url: 'https://picsum.photos/seed/speaker/600/400' },
      { key: 'charger', url: 'https://picsum.photos/seed/charger/600/400' },
      { key: 'case', url: 'https://picsum.photos/seed/phonecase/600/400' },
      { key: 'ssd', url: 'https://picsum.photos/seed/ssd/600/400' },
      { key: 'router', url: 'https://picsum.photos/seed/router/600/400' },
      { key: 'printer', url: 'https://picsum.photos/seed/printer/600/400' },
      { key: 'camera', url: 'https://picsum.photos/seed/camera/600/400' },
      { key: 'tripod', url: 'https://picsum.photos/seed/tripod/600/400' },
      { key: 'microphone', url: 'https://picsum.photos/seed/microphone/600/400' },
      { key: 'mousepad', url: 'https://picsum.photos/seed/mousepad/600/400' },
      { key: 'hdmi', url: 'https://picsum.photos/seed/hdmi/600/400' },
      { key: 'shelf', url: 'https://picsum.photos/seed/shelf/600/400' },
      { key: 'clock', url: 'https://picsum.photos/seed/clock/600/400' },
      { key: 'plant', url: 'https://picsum.photos/seed/plant/600/400' },
    ];

    for (const item of imageItems) {
      imageBase64[item.key] = await downloadImageBase64(item.url);
      process.stdout.write(`   ✓ ${item.key}\n`);
    }

    console.log('\n📦 Creating products...');

    // ─── PRODUCTS ───
    const products = [
      // Electronics - admin
      { name: 'MacBook Pro 15"', description: 'Apple MacBook Pro with M3 Pro chip, 18GB unified memory, 512GB SSD. Features a stunning Liquid Retina XDR display, all-day battery life, and the power to handle demanding workflows like video editing and software development.', price: 1999.99, quantity: 15, category: 'Electronics', image_base64: imageBase64.laptop, user_id: admin._id },
      { name: 'Logitech MX Master 3S', description: 'Advanced wireless mouse with 8K DPI tracking, quiet clicks, ergonomic design, and MagSpeed electromagnetic scroll. Works on any surface including glass. USB-C rechargeable with 70-day battery life.', price: 99.99, quantity: 120, category: 'Electronics', image_base64: imageBase64.mouse, user_id: admin._id },
      { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones with Auto NC Optimizer, crystal-clear hands-free calling, and up to 30 hours of battery life. Lightweight design at just 250g with premium leather ear pads.', price: 349.99, quantity: 45, category: 'Electronics', image_base64: imageBase64.headphones, user_id: admin._id },
      { name: 'Keychron K8 Pro', description: 'Wireless mechanical keyboard with hot-swappable Gateron G Pro switches, RGB backlight, QMK/VIA support. Works with Mac, Windows, and Linux. USB-C wired mode available.', price: 109.99, quantity: 85, category: 'Electronics', image_base64: imageBase64.keyboard, user_id: admin._id },
      { name: 'Dell UltraSharp 27" 4K', description: 'Professional 27-inch 4K UHD monitor with IPS Black technology, USB-C hub with 90W power delivery, 100% sRGB and 98% DCI-P3 color coverage. Perfect for creative professionals.', price: 619.99, quantity: 22, category: 'Electronics', image_base64: imageBase64.monitor, user_id: admin._id },

      // Electronics - alice
      { name: 'Logitech C920 HD Webcam', description: 'Full HD 1080p webcam with dual stereo microphones, auto light correction, and 78° field of view. Plug-and-play USB connectivity for video calls and streaming.', price: 69.99, quantity: 90, category: 'Electronics', image_base64: imageBase64.webcam, user_id: alice._id },
      { name: 'Samsung T7 SSD 1TB', description: 'Portable solid state drive with read speeds up to 1,050 MB/s. Compact metal body with built-in AES 256-bit hardware encryption. USB 3.2 Gen 2 compatible.', price: 109.99, quantity: 60, category: 'Electronics', image_base64: imageBase64.ssd, user_id: alice._id },
      { name: 'TP-Link Archer AX73', description: 'WiFi 6 router with AX5400 dual-band speeds, 6 high-gain antennas, 1.5 GHz tri-core CPU. Covers up to 2,500 sq ft with reliable high-speed wireless connectivity.', price: 149.99, quantity: 35, category: 'Electronics', image_base64: imageBase64.router, user_id: alice._id },
      { name: 'iPad Air 11"', description: 'Apple iPad Air with M2 chip, 11-inch Liquid Retina display, 128GB storage. Supports Apple Pencil Pro and Magic Keyboard. Perfect for work, creativity and entertainment.', price: 599.99, quantity: 28, category: 'Electronics', image_base64: imageBase64.tablet, user_id: alice._id },
      { name: 'Anker 65W USB-C Charger', description: 'Compact GaN charger with 3 ports (2 USB-C + 1 USB-A), 65W total output. Charges laptops, tablets, and phones simultaneously. Foldable plug for travel.', price: 35.99, quantity: 200, category: 'Electronics', image_base64: imageBase64.charger, user_id: alice._id },

      // Furniture - bob
      { name: 'Herman Miller Aeron Chair', description: 'Iconic ergonomic office chair with PostureFit SL back support, 8Z Pellicle suspension, and fully adjustable arms. 12-year warranty. Available in Graphite finish.', price: 1395.00, quantity: 12, category: 'Furniture', image_base64: imageBase64.chair, user_id: bob._id },
      { name: 'FlexiSpot E7 Standing Desk', description: 'Electric height-adjustable standing desk with dual motors, 48"x24" bamboo desktop. Height range 22.8"-48.4" with 3 memory presets. Supports up to 355 lbs.', price: 479.99, quantity: 18, category: 'Furniture', image_base64: imageBase64.desk, user_id: bob._id },
      { name: 'VASAGLE Industrial Bookshelf', description: '5-tier tall bookcase with rustic brown shelves and black metal frame. Assembly required. Dimensions: 11.8"D x 31.5"W x 60.2"H. Anti-tip hardware included.', price: 89.99, quantity: 40, category: 'Furniture', image_base64: imageBase64.shelf, user_id: bob._id },

      // Accessories - carol
      { name: 'Peak Design Everyday Backpack V2', description: 'Premium 30L camera and laptop backpack with MagLatch access, weatherproof recycled nylon, and FlexFold dividers. Fits 16" laptop. Multiple carry options.', price: 289.99, quantity: 30, category: 'Accessories', image_base64: imageBase64.backpack, user_id: carol._id },
      { name: 'BenQ ScreenBar LED Lamp', description: 'Monitor light bar with auto-dimming sensor, asymmetric optical design to eliminate screen glare. USB powered, no desk space required. Color temperature adjustable.', price: 109.99, quantity: 65, category: 'Accessories', image_base64: imageBase64.lamp, user_id: carol._id },
      { name: 'Anker USB Hub 7-in-1', description: 'USB-C hub with 4K HDMI, 100W power delivery passthrough, 2x USB-A 3.0, SD/microSD card reader, and USB-C data port. Slim aluminum design.', price: 34.99, quantity: 150, category: 'Accessories', image_base64: imageBase64.hub, user_id: carol._id },
      { name: 'Razer Gigantus V2 XXL', description: 'Extra-large soft gaming mouse pad (940 x 410 x 4mm). Micro-textured cloth surface for pixel-precise tracking. Non-slip rubber base.', price: 29.99, quantity: 100, category: 'Accessories', image_base64: imageBase64.mousepad, user_id: carol._id },
      { name: 'Cable Management Tray', description: 'Under-desk cable management tray made of heavy-duty steel. Dimensions 16"L x 5.3"W x 5"H. No-drill clamp mount. Holds power strips and adapters neatly.', price: 24.99, quantity: 180, category: 'Accessories', image_base64: imageBase64.cables, user_id: carol._id },
      { name: 'UGREEN HDMI 2.1 Cable 6ft', description: '8K HDMI cable supporting 8K@60Hz, 4K@120Hz with eARC. 48Gbps bandwidth. Gold-plated connectors with braided nylon jacket for durability.', price: 12.99, quantity: 300, category: 'Accessories', image_base64: imageBase64.hdmi, user_id: carol._id },
      { name: 'Protective Laptop Sleeve 15"', description: 'Water-resistant neoprene laptop sleeve with extra accessory pocket. Fits 15-15.6 inch laptops. Ultra-slim design with YKK zipper and soft fleece interior.', price: 19.99, quantity: 110, category: 'Accessories', image_base64: imageBase64.case, user_id: carol._id },

      // Office Supplies - admin
      { name: 'Quartet Glass Whiteboard 36x24', description: 'Frameless tempered glass dry-erase board with InvisaMount system. Ghost-free surface ensures clean erasing every time. Includes mounting hardware and 1 marker.', price: 129.99, quantity: 25, category: 'Office Supplies', image_base64: imageBase64.whiteboard, user_id: admin._id },
      { name: 'Moleskine Classic Notebook Set', description: 'Set of 3 large hardcover notebooks (5x8.25") with ruled pages, ribbon bookmark, and expandable inner pocket. Acid-free 70gsm ivory paper.', price: 42.99, quantity: 80, category: 'Office Supplies', image_base64: imageBase64.notebook, user_id: admin._id },
      { name: 'Uni-ball Signo 307 Gel Pen 10-Pack', description: 'Retractable gel pens with ultra-micro 0.38mm tip. Fade-proof, water-resistant uni Super Ink. Available in black. Ideal for precise writing.', price: 18.99, quantity: 250, category: 'Office Supplies', image_base64: imageBase64.pens, user_id: admin._id },
      { name: 'HP LaserJet Pro M404dn', description: 'Monochrome laser printer with auto-duplex printing, ethernet, and up to 40 ppm. First page out in 6.3 seconds. 750-4,000 page monthly volume.', price: 299.99, quantity: 10, category: 'Office Supplies', image_base64: imageBase64.printer, user_id: admin._id },
      { name: 'Karlsson Minimal Wall Clock', description: 'Modern minimalist wall clock with silent sweep movement. 11-inch diameter, matte black finish. Requires 1 AA battery (not included).', price: 34.99, quantity: 45, category: 'Office Supplies', image_base64: imageBase64.clock, user_id: admin._id },

      // Photography - bob
      { name: 'Sony Alpha a7 IV', description: 'Full-frame mirrorless camera with 33MP Exmor R sensor, BIONZ XR processor, real-time eye AF for humans and animals. 4K 60p video recording with 10-bit 4:2:2.', price: 2498.00, quantity: 8, category: 'Photography', image_base64: imageBase64.camera, user_id: bob._id },
      { name: 'Manfrotto Befree Advanced Tripod', description: 'Compact travel tripod with ball head, 4 leg sections reaching 150cm. Folds to 40cm. Carbon fiber construction weighing only 1.25kg. 8kg max load.', price: 249.99, quantity: 20, category: 'Photography', image_base64: imageBase64.tripod, user_id: bob._id },

      // Audio - alice
      { name: 'Blue Yeti X Microphone', description: 'Professional USB condenser microphone with 4-capsule array, high-res LED metering, Blue VO!CE software. 4 pickup patterns. Perfect for streaming, podcasting, and recording.', price: 169.99, quantity: 40, category: 'Audio', image_base64: imageBase64.microphone, user_id: alice._id },
      { name: 'JBL Charge 5 Bluetooth Speaker', description: 'Portable Bluetooth speaker with IP67 waterproof/dustproof rating, 20 hours of playtime, built-in powerbank. PartyBoost for linking multiple speakers.', price: 179.99, quantity: 55, category: 'Audio', image_base64: imageBase64.speaker, user_id: alice._id },

      // Other - carol
      { name: 'Artificial Succulent Desk Plant Set', description: 'Set of 3 realistic faux succulents in minimalist ceramic pots. No maintenance required. Adds a touch of green to your workspace. Each pot is approximately 3" diameter.', price: 24.99, quantity: 70, category: 'Office Decor', image_base64: imageBase64.plant, user_id: carol._id },
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products created with images\n`);

    // Print summary
    const catSummary = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    console.log('📊 Products by category:');
    catSummary.forEach((c) => console.log(`   ${c._id}: ${c.count}`));

    const totalValue = await Product.aggregate([
      { $group: { _id: null, value: { $sum: { $multiply: ['$price', '$quantity'] } } } },
    ]);
    console.log(`\n💰 Total inventory value: $${totalValue[0]?.value?.toFixed(2)}`);
    console.log(`👥 Total users: 4`);
    console.log(`📦 Total products: ${products.length}`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
