
# 🚀 Quick Start Guide

Get your POS System up and running in 5 minutes!

## Prerequisites
- Node.js v14+
- MySQL server
- Terminal/Command Prompt

## Step 1: Database Setup (2 minutes)

### Windows
```cmd
# Open Command Prompt and login to MySQL
mysql -u root -p

# Paste database password (press Enter if no password)
# Then run:
SOURCE database/schema.sql;
```

### Mac/Linux
```bash
# Login to MySQL
mysql -u root -p

# Enter password when prompted
# Then run:
SOURCE database/schema.sql;
```

✅ Database is now ready! Demo admin account created.

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start server
npm start
```

You should see:
```
✓ Database connected successfully
🚀 POS System Server running on port 5000
```

## Step 3: Frontend Setup (1 minute)

Open a new terminal window:

```bash
# Option 1: Using Python
cd frontend
python -m http.server 3000

# Or Python 3
python3 -m http.server 3000

# Option 2: Using Node.js
npx http-server frontend -p 3000
```

## Step 4: Access the System

Open your browser and go to:
```
http://localhost:3000
```

## Step 5: Login

Use these credentials:
- **Username**: `admin`
- **Password**: `admin123`

✅ You're in! Start using the POS system.

## 🎯 First Steps

1. **Dashboard** - View sales overview and real-time statistics
2. **POS** - Create your first sale
   - Search for "iPhone"
   - Add to cart
   - Complete checkout
3. **Products** - Manage your product catalog
4. **Reports** - View sales analytics

## 🔧 Troubleshooting Quick Tips

### "Can't connect to MySQL"
- Make sure MySQL is running
- Check username/password in `backend/.env`

### "Port 5000 already in use"
- Edit `backend/.env` and change PORT to 5001
- Restart the backend

### "Frontend won't load"
- Make sure you're running `http://` (not `file://`)
- Try different port: `python -m http.server 3001`

## 📂 Important Files

| File | Purpose |
|------|---------|
| `database/schema.sql` | Database setup |
| `backend/.env` | Backend configuration |
| `backend/server.js` | Start backend here |
| `frontend/pages/login.html` | Login entry point |
| `README.md` | Full documentation |

## 🎓 What You Can Do

### As Admin
- ✅ Manage all products
- ✅ View all sales
- ✅ Manage users
- ✅ View reports
- ✅ Process sales

### As Cashier
- ✅ Process sales
- ✅ Search products
- ✅ Print receipts
- ✅ Lookup customers

## 📊 Test Data Included

The system comes pre-loaded with:
- ✅ 10 sample products
- ✅ 5 sample customers
- ✅ 1 admin user

## 🔐 Production Checklist

Before going live:
- [ ] Change JWT_SECRET in `.env`
- [ ] Use a real MySQL database server
- [ ] Set NODE_ENV to "production"
- [ ] Enable HTTPS
- [ ] Setup regular backups
- [ ] Configure error logging

## 📞 Need Help?

1. Check `README.md` for full documentation
2. Review API endpoints in README
3. Check browser console for errors (F12)
4. Check backend console for server errors

## 🎉 What's Next?

- Explore the Dashboard
- Create your first sale
- Add more products
- Customize the system
- Read the full README.md

---

**Happy selling! 🛒**
