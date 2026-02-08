# MarketHub - Full-Stack Product Marketplace

A modern full-stack web application for managing products with user authentication, CRUD operations, search/filter/sort capabilities, file uploads, and admin dashboard.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based registration and login with role-based access control (Admin/User)
- **Product Management**: Complete CRUD operations for products with image uploads
- **Advanced Search**: Filter by category, price range, search by name/description, sort by multiple fields
- **Pagination**: Efficient data loading with customizable page sizes
- **Dashboard**: Real-time statistics and analytics (inventory value, product distribution, low stock alerts)
- **Admin Panel**: User management (role assignment, user deletion)
- **Responsive Design**: Mobile-friendly UI built with TailwindCSS

### Security Features
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiry
- Protected routes and API endpoints
- Input validation on both frontend and backend
- CORS protection

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **Vite 5.4.4** - Build tool and dev server
- **React Router DOM 6.26.2** - Client-side routing
- **Axios 1.7.7** - HTTP client
- **TailwindCSS 3.4.10** - Utility-first CSS framework
- **React Toastify 10.0.5** - Toast notifications
- **Chart.js + React-Chartjs-2** - Data visualization
- **React Icons** - Icon library

### Backend
- **Node.js + Express 4.21.0** - Server framework
- **MongoDB + Mongoose 8.6.3** - Database and ODM
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 2.4.3** - Password hashing
- **Multer 1.4.5** - File upload handling
- **Express Validator** - Request validation
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

### Database
- **MongoDB Atlas** - Cloud-hosted MongoDB database

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (or local MongoDB instance)
- **Git**

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd full_stack_app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas - Replace with your credentials
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/markethub?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Server will run on `http://localhost:5000`

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` (or next available port)

## 🌱 Database Seeding

### Initial Setup (Admin User Only)
```bash
cd backend
node config/initDb.js
```

### Full Database Seeding (30 Products + 4 Users)
```bash
cd backend
node config/seedFull.js
```

This creates:
- **4 Users**: 1 admin + 3 regular users
- **30 Products**: Across 7 categories (Electronics, Furniture, Accessories, Office Supplies, Photography, Audio, Office Decor)
- **Product Images**: Downloaded from picsum.photos

## 🔑 Demo Credentials

### Admin Account
- **Email**: `admin@markethub.com`
- **Password**: `Admin123!`

### Regular Users
- **Email**: `alice_seller` / **Password**: `User123!`
- **Email**: `bob_shop` / **Password**: `User123!`
- **Email**: `carol_tech` / **Password**: `User123!`

## 📁 Project Structure

```
full_stack_app/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── initDb.js          # Basic database seeding
│   │   └── seedFull.js        # Full database seeding
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── productController.js # Product CRUD
│   │   ├── userController.js   # User management
│   │   └── dashboardController.js # Analytics
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Product.js         # Product schema
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── upload.js          # File upload handling
│   │   └── validate.js        # Validation error handler
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── products.js        # Product routes
│   │   ├── users.js           # User routes
│   │   └── dashboard.js       # Dashboard routes
│   ├── validators/
│   │   ├── authValidator.js    # Auth validation rules
│   │   └── productValidator.js # Product validation rules
│   ├── uploads/               # Uploaded product images
│   ├── .env                   # Environment variables
│   ├── server.js              # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with interceptors
    │   ├── components/
    │   │   ├── Navbar.jsx      # Navigation bar
    │   │   ├── Footer.jsx      # Page footer
    │   │   ├── ProductCard.jsx # Product display card
    │   │   ├── Pagination.jsx  # Pagination controls
    │   │   ├── LoadingSpinner.jsx
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   ├── pages/
    │   │   ├── Home.jsx        # Landing page
    │   │   ├── Login.jsx       # Login page
    │   │   ├── Register.jsx    # Registration page
    │   │   ├── Products.jsx    # Product list with filters
    │   │   ├── ProductDetail.jsx # Product details
    │   │   ├── ProductForm.jsx # Create/Edit product
    │   │   ├── Dashboard.jsx   # User dashboard
    │   │   ├── AdminUsers.jsx  # Admin user management
    │   │   └── NotFound.jsx    # 404 page
    │   ├── App.jsx             # Main app component
    │   ├── main.jsx            # React entry point
    │   └── index.css           # Global styles
    ├── .env                    # Environment variables
    ├── package.json
    ├── vite.config.js          # Vite configuration
    └── tailwind.config.js      # TailwindCSS configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - List all products (with filters, search, sort, pagination)
- `GET /api/products/categories` - Get all categories
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (protected, with image upload)
- `PUT /api/products/:id` - Update product (protected, owner or admin)
- `DELETE /api/products/:id` - Delete product (protected, owner or admin)

### Users (Admin Only)
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (protected)

### Query Parameters for Products
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `search` - Search in name/description
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort field (name, price, createdAt)
- `order` - Sort order (ASC, DESC)

## 🧪 Testing

Run the comprehensive API test suite:

```bash
cd backend
node test-api.js
```

This runs 35 automated tests covering all endpoints.

## 📦 Deployment

### Backend (Render/Heroku)
1. Set environment variables in hosting platform
2. Update `MONGODB_URI` with production database
3. Update `CLIENT_URL` with production frontend URL
4. Deploy from GitHub or direct upload

### Frontend (Netlify/Vercel)
1. Build the production bundle: `npm run build`
2. Set `VITE_API_URL` to production backend URL
3. Deploy the `dist` folder

### Environment Variables for Production

**Backend:**
```env
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
CLIENT_URL=<production-frontend-url>
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=<production-backend-url>
```

## 🎯 Key Features Demonstrated

1. **Client-Server Architecture**: Clean separation between React frontend and Express backend
2. **RESTful API Design**: Following REST principles with proper HTTP methods and status codes
3. **Database Management**: MongoDB with Mongoose ODM, proper schema design with indexes
4. **Authentication & Authorization**: JWT tokens with role-based access control
5. **File Handling**: Image upload with Multer, file validation, storage management
6. **Input Validation**: Both frontend and backend validation using express-validator
7. **Error Handling**: Comprehensive error handling with meaningful messages
8. **Security**: CORS, password hashing, token expiry, protected routes
9. **User Experience**: Toast notifications, loading states, responsive design
10. **Data Visualization**: Charts for dashboard analytics using Chart.js

## 📝 Development Notes

- Backend runs on port **5000**
- Frontend runs on port **5173** (or next available)
- Images stored in `backend/uploads/` directory
- JWT tokens expire after **7 days**
- Password requirements: Minimum 6 characters, at least 1 number
- Maximum file upload size: **5MB**
- Supported image formats: JPEG, JPG, PNG, GIF, WEBP

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify MongoDB connection string in `.env`
- Ensure all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend `server.js`

### Login returns 401
- Ensure email and password are trimmed (no spaces/tabs)
- Verify user exists in database
- Check JWT_SECRET is set in backend `.env`

### Images not uploading
- Check `uploads/` directory exists and has write permissions
- Verify file size is under 5MB
- Ensure file type is supported (jpg, png, gif, webp)

## 👥 Authors

- Full-Stack Application developed for academic project

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
