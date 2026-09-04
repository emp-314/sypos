
# 🏪 Point of Sale (POS) System

A complete web-based Point of Sale management system built with vanilla JavaScript, Node.js/Express, and MySQL. Perfect for retail stores, restaurants, and small businesses.

## 📋 Features

### ✅ Core Features
- **User Authentication**: Secure login with JWT tokens and role-based access control
- **Product Management**: Add, update, delete, and search products with barcode support
- **Inventory Management**: Real-time stock tracking with low stock alerts
- **Sales Processing**: Complete POS interface with cart management
- **Payment Processing**: Support for multiple payment methods (Cash, Card, Mobile Money, Check)
- **Customer Management**: Track customers and loyalty points
- **Receipt Generation**: Automated receipt printing
- **Reporting & Analytics**: Daily sales reports, top products, revenue tracking
- **Role-Based Access**: Admin, Manager, and Cashier roles with different permissions

### 🎨 UI/UX
- Clean and modern responsive design
- Intuitive navigation and workflow
- Real-time notifications
- Mobile-friendly interface
- Dark/Light mode ready

## 🏗️ Architecture

### Three-Tier Architecture
```
┌─────────────────────────────────────┐
│    Presentation Layer (Frontend)    │
│  HTML, CSS, Vanilla JavaScript      │
└──────────────┬──────────────────────┘
┌──────────────┴──────────────────────┐
│   Application Layer (Backend API)   │
│  Node.js + Express + Business Logic │
└──────────────┬──────────────────────┘
┌──────────────┴──────────────────────┐
│      Data Layer (MySQL Database)    │
│    Persistent Data Storage          │
└─────────────────────────────────────┘
```

## 📁 Project Structure

```
pos-system/
├── frontend/
│   ├── index.html              # Landing page
│   ├── css/
│   │   └── styles.css          # Global styles
│   ├── js/
│   │   └── api.js              # API client and utilities
│   └── pages/
│       ├── login.html          # Login page
│       ├── dashboard.html      # Dashboard
│       ├── pos.html            # POS/Cashier screen
│       ├── products.html       # Product management
│       ├── customers.html      # Customer management
│       ├── sales.html          # Sales history
│       └── reports.html        # Reports & Analytics
│
├── backend/
│   ├── server.js               # Entry point
│   ├── app.js                  # Express app setup
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   ├── config/
│   │   └── database.js         # MySQL connection
│   ├── middlewares/
│   │   └── authMiddleware.js   # JWT authentication
│   ├── models/
│   │   ├── UserModel.js
│   │   ├── ProductModel.js
│   │   ├── CustomerModel.js
│   │   └── SalesModel.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── customerController.js
│   │   └── salesController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── customerService.js
│   │   └── salesService.js
│   └── routes/
│       ├── authRoutes.js
│       ├── productRoutes.js
│       ├── customerRoutes.js
│       ├── salesRoutes.js
│       ├── paymentRoutes.js
│       ├── inventoryRoutes.js
│       ├── reportRoutes.js
│       └── userRoutes.js
│
└── database/
    └── schema.sql              # MySQL database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git (optional)
- A modern web browser

### Installation Steps

#### 1. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Execute the schema
SOURCE database/schema.sql;
```

This will create:
- Database: `pos_system`
- Tables: users, products, customers, sales, payments, inventory_logs, etc.
- Demo admin account (username: `admin`, password: `admin123`)

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (or copy existing .env)
# Update database credentials if needed
cat .env

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup
```bash
# Open the frontend in a browser
# Option 1: Using a simple HTTP server
cd frontend
python -m http.server 3000
# or for Python 3:
python3 -m http.server 3000

# Option 2: Using Node.js http-server
npx http-server frontend -p 3000

# Then visit: http://localhost:3000
```

## 🔑 Default Credentials

```
Username: admin
Password: admin123
Role: Admin
```

## 📖 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "username": "admin",
    "email": "admin@possystem.com",
    "role": "admin"
  }
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?limit=100&offset=0
```

#### Get Product by Barcode (POS Scanning)
```http
GET /api/products/barcode/scan?barcode=1234567890001
```

#### Search Products
```http
GET /api/products/search?q=iPhone
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "iPhone 13",
  "categoryId": 1,
  "barcode": "1234567890001",
  "price": 999.99,
  "quantity": 15,
  "reorderLevel": 5
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "iPhone 13 Pro",
  "price": 1099.99,
  "quantity": 20
}
```

### Sales Endpoints

#### Create Sale
```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": null,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ],
  "discountAmount": 10,
  "taxAmount": 20,
  "paymentData": {
    "method": "cash",
    "amount": 2000,
    "changeAmount": 100,
    "notes": "Sale completed"
  }
}

Response:
{
  "saleId": 1,
  "paymentId": 1,
  "totalAmount": 2015.97,
  "discountAmount": 10,
  "taxAmount": 20,
  "finalAmount": 2025.97,
  "itemCount": 2
}
```

#### Get Sale by ID
```http
GET /api/sales/{id}
Authorization: Bearer {token}

Response includes:
- Sale details
- Items purchased
- Payment information
```

### Customer Endpoints

#### Create Customer
```http
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "555-0001",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

#### Get Customer by Phone
```http
GET /api/customers/phone/lookup?phone=555-0001
Authorization: Bearer {token}
```

#### Search Customers
```http
GET /api/customers/search?q=John
Authorization: Bearer {token}
```

### Report Endpoints

#### Get Daily Sales Report
```http
GET /api/reports/daily/2024-03-17
Authorization: Bearer {token}
```

#### Get Sales by Date Range
```http
GET /api/reports/revenue/range?startDate=2024-01-01&endDate=2024-03-31
Authorization: Bearer {token}
```

#### Get Top Products
```http
GET /api/reports/products/top?startDate=2024-03-01&endDate=2024-03-31
Authorization: Bearer {token}
```

#### Get Sales Summary
```http
GET /api/reports/summary
Authorization: Bearer {token}

Response:
{
  "today": { "sales": 5, "revenue": 2500.00 },
  "thisMonth": { "sales": 150, "revenue": 75000.00 },
  "allTime": { "sales": 5000, "revenue": 2500000.00 },
  "topEmployee": { "username": "cashier1", "sales_count": 3, "total_revenue": 1500.00 }
}
```

## 🔐 Role-Based Access Control

### Admin
- Full access to all features
- User management
- Product management
- Report viewing
- System configuration

### Manager
- Dashboard and reports
- Product management (read/update)
- Inventory management
- Sales viewing
- No user management

### Cashier
- POS access
- Product search/scanning
- Sales creation
- Receipt printing
- No admin functions

## 🛒 POS Workflow

1. **Product Selection**: Search or scan barcode to add products
2. **Cart Management**: Adjust quantities, remove items
3. **Discounts**: Apply discount amounts if needed
4. **Customer Lookup**: Optional - link sale to customer
5. **Payment**: Select payment method and complete transaction
6. **Receipt**: Automatic receipt generation and printing

## 🔄 Sales Transaction Flow

```
1. Add Products to Cart
   ↓
2. Review Cart & Totals
   ↓
3. Select Payment Method
   ↓
4. Lookup/Create Customer (Optional)
   ↓
5. Process Payment
   ↓
6. Update Inventory
   ↓
7. Add Loyalty Points (if applicable)
   ↓
8. Generate Receipt
   ↓
9. Complete Sale
```

## 📊 Database Schema

### Users Table
- user_id (PK)
- username (UNIQUE)
- password (hashed)
- email (UNIQUE)
- role (admin, manager, cashier)
- active (BOOLEAN)

### Products Table
- product_id (PK)
- name
- category_id (FK)
- barcode (UNIQUE)
- price
- quantity
- reorder_level
- status (active, inactive)

### Sales Table
- sale_id (PK)
- user_id (FK)
- customer_id (FK)
- total_amount
- discount_amount
- tax_amount
- final_amount
- status (completed, cancelled, returned)
- sale_date (TIMESTAMP)

### Payments Table
- payment_id (PK)
- sale_id (FK, UNIQUE)
- method (cash, card, mobile_money, check)
- amount
- change_amount
- status (pending, completed, failed, refunded)

## 🧪 Testing the System

### Test Scenarios

**Scenario 1: Complete Sale**
1. Login as admin/cashier
2. Go to POS page
3. Search for "iPhone"
4. Click "Add" to add to cart
5. Adjust quantity
6. Click "Checkout"
7. Select payment method
8. Complete sale

**Scenario 2: Product Management**
1. Login as admin
2. Go to Products page
3. Click "+ Add Product"
4. Fill in product details
5. Save product
6. Search for created product
7. Edit product price
8. Delete product

**Scenario 3: View Reports**
1. Login as admin/manager
2. Go to Dashboard
3. View today's sales
4. View top products
5. Check low stock items

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Ensure MySQL is running and credentials in `.env` are correct.

### JWT Token Error
```
Error: Invalid or expired token
```
**Solution**: Login again to get a fresh token.

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Ensure `CORS_ORIGIN` in `.env` matches your frontend URL.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in `.env` or kill process using port 5000.

## 📝 Environment Variables

Create a `.env` file in the backend folder:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pos_system
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRY=7d

# API
API_BASE_URL=http://localhost:5000/api
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Production Deployment

### Before Deployment
1. Change `JWT_SECRET` to a strong random string
2. Update `NODE_ENV` to "production"
3. Use a proper database server (not localhost)
4. Enable HTTPS
5. Set up proper error logging
6. Configure backup strategy

### Deploy to Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-pos-app

# Add MySQL database
heroku addons:create cleardb:ignite

# Deploy code
git push heroku main

# Run migrations
heroku run node backend/server.js
```

## 📚 Dependencies

### Frontend
- Vanilla JavaScript (no framework)
- CSS 3 (Flexbox, Grid)
- Fetch API

### Backend
- **express**: Web framework
- **mysql2**: MySQL driver
- **jwt-simple**: JWT token management
- **bcryptjs**: Password hashing
- **dotenv**: Environment variables
- **cors**: Cross-origin requests
- **body-parser**: Request parsing

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🎓 Learning Resources

- Node.js Documentation: https://nodejs.org/docs/
- Express.js Guide: https://expressjs.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- JWT: https://jwt.io/
- RESTful API Design: https://restfulapi.net/

## 💡 Future Enhancements

- [ ] Multi-location support
- [ ] Advanced inventory management
- [ ] Tax calculations by region
- [ ] Customer feedback/ratings
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard enhancements
- [ ] Integration with payment gateways
- [ ] Supplier management
- [ ] Returns/Refunds processing
- [ ] SMS/Email notifications

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the documentation

---

**Built with ❤️ for modern retail businesses**
