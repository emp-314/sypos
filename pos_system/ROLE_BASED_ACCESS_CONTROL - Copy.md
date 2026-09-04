# Role-Based Access Control (RBAC) System Documentation

## Overview
This document outlines the comprehensive role-based access control system implemented in the POS System. Three distinct roles with carefully designed privileges govern all system access and functionality.

---

## 🎯 Role Structure & Privileges

### 👑 **ADMINISTRATOR**
**Full System Authority | Complete Control**

#### Privileges:
- **User Management** (PRIMARY RESPONSIBILITY)
  - Create new users with any role
  - Edit user information and roles
  - Deactivate/reactivate user accounts
  - Delete user accounts
  - View all users in the system
  
- **Financial Oversight**
  - View all sales transactions (past and present)
  - Access complete payment history
  - View canceled and returned transactions
  - Filter sales by date range and status
  
- **Analytics & Reporting**
  - Generate comprehensive business reports
  - View revenue trends and patterns
  - Analyze top-performing products
  - Track sales performance by cashier
  - View all payment methods breakdown
  
- **Data Management**
  - Manage all customers in the system
  - Access full customer purchase history
  - Manage product inventory
  - View all loyalty points and transactions
  
- **System Access**
  - Access Dashboard (executive view)
  - Access POS System (optional)
  - Full Reports & Analytics
  - User Management Interface
  - Sales History with all filters

**Navigation:** Dashboard → POS → Products → Customers → Sales → Reports → **Users**

---

### 📊 **MANAGER**
**Business Operations | Oversight & Analysis**

#### Privileges:
- **Sales Oversight**
  - View all sales transactions
  - Filter by date range and status
  - Cannot modify sales data
  - Cannot access POS system directly
  
- **Business Intelligence**
  - Generate and view reports
  - Analyze revenue trends
  - Monitor sales performance
  - Track payment methods (limited visibility)
  
- **Customer Management**
  - Add new customers
  - Edit customer information
  - View customer purchase history
  - Manage customer data (except deletion)
  
- **Inventory Monitoring**
  - View current inventory levels
  - Check product availability
  - Monitor stock levels
  
- **Dashboard Access**
  - Department-level analytics
  - Performance metrics
  - Business KPIs

**RESTRICTIONS:**
- ❌ Cannot create, modify, or delete users
- ❌ Cannot process transactions in POS
- ❌ Cannot delete customer records
- ❌ Cannot access admin-only reports

**Navigation:** Dashboard → POS → Products → Customers → Sales → Reports

---

### 💳 **CASHIER**
**Sales Operations | Transaction Processing**

#### Privileges:
- **POS System**
  - Process customer transactions
  - Complete sales operations
  - Handle payments
  - Generate receipts
  
- **Customer Interaction**
  - Lookup existing customers during checkout
  - Create new customer records during transactions
  - View basic customer information
  - Manage quick customer lookup
  
- **Product Information**
  - View product details during POS
  - Check product availability/stock
  - Scan product barcodes
  - View pricing information
  
- **Transaction History**
  - View own transactions
  - Print transaction receipts
  - Search transaction history (own only)

**RESTRICTIONS:**
- ❌ Cannot access Reports or Analytics
- ❌ Cannot view Dashboard
- ❌ Cannot access sales history (others' transactions)
- ❌ Cannot manage users
- ❌ Cannot manage products or inventory
- ❌ Cannot view financial summaries
- ❌ No access to customer purchase history

**Navigation:** POS → Products → Customers (limited) 

---

## 🔐 Authentication & Authorization

### Login Flow
1. User enters credentials (username & password)
2. System validates against `users` table
3. JWT token generated with user role
4. Token stored in `localStorage`
5. User data cached in `localStorage` for quick access
6. Redirect to dashboard/POS based on role

### Token Structure
```json
{
  "userId": 1,
  "username": "john_manager",
  "role": "manager",
  "iat": 1234567890
}
```

### Authorization Checks
- **Frontend:** `requireRole(['admin', 'manager'])` checks before page loads
- **Backend:** `checkRole(['admin'])` middleware protects API endpoints
- **Automatic Redirect:** Unauthorized users redirected to login

---

## 🛠️ Implementation Details

### Database Schema
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login (public)
- `POST /api/auth/register` - Create user (admin only)
- `POST /api/auth/change-password` - Change password (authenticated)

#### User Management
- `GET /api/users` - List all users (admin only)
- `GET /api/users/me` - Get current user info (authenticated)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin or self)
- `DELETE /api/users/:id` - Delete user (admin only)

### Frontend Components

#### Protected Pages
- **`users.html`** - User Management (admin only)
- **`sales.html`** - Sales Dashboard (admin, manager)
- **`reports.html`** - Analytics & Reports (admin, manager)
- **`customers.html`** - Customer Management (all roles)
- **`dashboard.html`** - Executive Dashboard (admin, manager)
- **`pos.html`** - Point of Sale (all roles)
- **`products.html`** - Product Management (all roles)

#### API Client Methods
```javascript
// User Management
api.registerUser(username, email, password, role)
api.getAllUsers()
api.getUserById(userId)
api.updateUser(userId, data)
api.deleteUser(userId)

// Authentication
api.login(username, password)
api.getCurrentUser()
api.changePassword(oldPassword, newPassword)
```

---

## 👤 User Management Interface

### Admin-Only User Management Page (`users.html`)

#### Features:
- **User List Table** showing:
  - Username
  - Email
  - Role (color-coded badges)
  - Status (Active/Inactive)
  - Creation date
  - Action buttons (Edit, Delete)

- **Add User Modal** with fields:
  - Username (text)
  - Email (email)
  - Password (password, required for new users)
  - Role (dropdown: Cashier, Manager, Administrator)
  - Status (Active/Inactive)

- **Edit User Modal** allowing:
  - Update email
  - Change role
  - Toggle active status
  - (Password not editable - users use "Change Password" instead)

- **User Actions**:
  - Create new user with role assignment
  - Update existing user information
  - Change user role on-the-fly
  - Deactivate/reactivate accounts
  - Delete user accounts

#### Default Admin User
```
Username: admin
Email: admin@possystem.com
Password: admin123 (bcrypt hashed)
Role: Administrator
```

---

## 📊 Pages & Functionality

### Sales Dashboard (`sales.html`)
**Access:** Admin, Manager

Features:
- Filter sales by date range
- Filter by status (Completed, Cancelled, Returned)
- Admin can filter by cashier
- Display statistics (Total Sales, Revenue, Average)
- View detailed sale information
- Responsive table display

### Reports & Analytics (`reports.html`)
**Access:** Admin, Manager

Features:
- Revenue trend chart (line graph)
- Payment methods breakdown
- Top products by revenue
- Admin-only: Sales by cashier
- Customizable date ranges
- Real-time statistics
- Professional chart visualizations

### Customers Management (`customers.html`)
**Access:** All roles (Admin, Manager, Cashier)

Features:
- View all customers
- Search by name, phone, email
- Add new customer
- Edit customer information
- View customer statistics:
  - Total purchases amount
  - Loyalty points
  - Member since date
- Customer status display

### User Management (`users.html`)
**Access:** Admin only

Features:
- List all system users
- Create new users
- Assign roles
- Edit user details
- Delete users
- View user status and creation date
- Cannot delete own account (safety feature)

---

## 🔄 Role-Based Navigation

Each page displays navigation links based on user role:

```
Admin:
✅ Dashboard
✅ POS
✅ Products
✅ Customers
✅ Sales
✅ Reports
✅ Users (ONLY ADMINS)

Manager:
✅ Dashboard
✅ POS
✅ Products
✅ Customers
✅ Sales
✅ Reports

Cashier:
✅ POS
✅ Products
✅ Customers (limited)
```

---

## 🔒 Security Features

### Password Security
- Passwords hashed using bcrypt (10 salt rounds)
- Never stored or transmitted in plain text
- Password change available to all authenticated users

### Token Management
- JWT tokens with 7-day expiration
- Tokens stored in localStorage
- Automatic logout on 401 Unauthorized
- Token cleared on manual logout

### API Protection
- All sensitive endpoints require authentication
- Role checks on admin-only endpoints
- Admin registration protected (admin-only)
- User can only update own password

### Best Practices
- Role validation on both frontend and backend
- XSS protection via HTML escaping
- CORS enabled for development
- Error messages don't leak sensitive info

---

## 🚀 Usage Examples

### Creating a Manager
1. Login as admin
2. Navigate to Users page
3. Click "Add New User"
4. Enter:
   - Username: `john_manager`
   - Email: `john@shop.com`
   - Password: `SecurePass123`
   - Role: **Manager**
5. Click Save
6. John can now login and access manager features

### Escalating Cashier to Manager
1. Login as admin
2. Navigate to Users page
3. Find cashier in list
4. Click "Edit"
5. Change Role: **Manager**
6. Click Save
7. User gains manager privileges immediately

### Deactivating User
1. Login as admin
2. Navigate to Users page
3. Click "Edit" on user
4. Change Status: **Inactive**
5. User cannot login until reactivated

---

## 📝 Demo Access

### Default Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator

### Create Additional Users
After logging in as admin, use the Users Management page to create:
- Manager account for business oversight
- Cashier accounts for POS operations

---

## 🎨 Design Features

### Professional UI/UX
- Clean, modern interface matching professional standards
- Consistent color scheme across all pages
- Responsive design for all screen sizes
- Intuitive navigation structure
- Clear visual role indicators

### Visual Hierarchy
- Role badges with unique colors:
  - 🔴 Red: Administrator
  - 🟣 Purple: Manager
  - 🔵 Blue: Cashier
- Status badges (Active/Inactive)
- Clear action buttons and modals

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Mobile-responsive design
- Readable fonts and contrast ratios

---

## 🧪 Testing Checklist

### Authentication
- [ ] Admin can login
- [ ] Manager can login
- [ ] Cashier can login
- [ ] Invalid credentials show error
- [ ] Logged-in users redirected to dashboard

### User Management (Admin)
- [ ] Admin can view all users
- [ ] Admin can create new user with role
- [ ] Admin can update user role
- [ ] Admin can deactivate/activate user
- [ ] Admin can delete user (except self)

### Role-Based Access
- [ ] Admin can access all pages
- [ ] Manager cannot access Users page
- [ ] Manager can access Sales and Reports
- [ ] Cashier cannot access Reports/Sales/Dashboard
- [ ] Invalid roles redirected to login

### Page Functionality
- [ ] Sales page loads and displays data
- [ ] Reports generate correctly
- [ ] Customers page lists all customers
- [ ] User page shows user list
- [ ] Filters work on Sales page

---

## 📞 Support & Troubleshooting

### Common Issues

**User sees login page after login:**
- Check browser console for API errors
- Verify JWT token is being set correctly
- Check if role is properly stored in user object

**User cannot access page despite correct role:**
- Clear browser localStorage and login again
- Check if user.role matches allowed roles in `requireRole()`
- Verify backend is returning correct role

**Create user fails:**
- Ensure logged in as admin
- Verify all required fields are filled
- Check username doesn't already exist
- Verify email format is correct

---

## 📚 Code Reference

### Frontend Authorization
```javascript
// Check if current user has required role
if (!hasRole(['admin'])) {
  // Redirect to login
}

// Used on page load
requireRole(['admin', 'manager']);
```

### Backend Authorization
```javascript
// Protect endpoint with role check
router.get('/users', verifyToken, checkRole(['admin']), (req, res) => {
  // Only admins can access this
});
```

---

## ✅ Implementation Complete

The role-based access control system is now fully implemented with:
- ✅ Three distinct roles with clear privileges
- ✅ User management interface for admins
- ✅ Secure authentication with JWT
- ✅ Role-based navigation
- ✅ Professional UI/UX design
- ✅ Complete Sales Dashboard
- ✅ Comprehensive Reports & Analytics
- ✅ Full Customers Management
- ✅ Backend API protection
- ✅ Frontend authorization checks

---

**Last Updated:** March 30, 2026
**System Version:** 1.0.0
**Status:** Production Ready
