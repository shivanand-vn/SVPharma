# 💊 SV Pharma  
### Order & Due Management Web Application

**SV Pharma** is a modern full-stack web application designed to manage pharmaceutical orders, customer balances, and administrative workflows efficiently.  

It provides a powerful admin dashboard, automated due tracking system, order status management, and secure authentication — all within a clean, responsive interface.

---

## 🌐 Live Application

🔗 **Access the App:**  
https://sv-pharma.vercel.app/

**Description:**  
SV Pharma enables pharmacy businesses to manage customer orders, monitor outstanding dues, and track payments in real time. The system ensures accurate financial calculations (no rounding errors), automated due adjustments, and seamless administrative control.

---

## 📌 Core Features

### 🔐 Authentication
- Secure Login & Registration
- JWT-based authentication
- Role-based access (Admin / User)
- Public access to:
  - Privacy Policy
  - Terms of Service
- No forced logout when viewing legal pages

---

### 📦 Order Management
- Create and manage orders
- Order history tracking
- Status workflow:
  - Pending
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- Time-based filters:
  - Weekly
  - Monthly
  - Yearly
- Status-based filtering
- Latest orders shown first

---

### 💰 Due Wallet System

- Automatically **increases** when:
  - A new order is placed
- Automatically **decreases** when:
  - A payment is recorded
- Exact calculation (No rounding applied)
- Accurate to ordered item totals
- Displayed with 2 decimal precision

---

### 📊 Admin Dashboard

Includes real-time overview cards:

- Total Orders  
- Total Revenue  
- Total Customers  
- **Total Due (Clickable Card)**  

Clicking the Due card displays:
- List of customers
- Individual due amounts
- Updated balances after payments

---

### 📜 Legal Pages

- Detailed Privacy Policy
- Detailed Terms of Service
- Open in the same window
- Accessible without login
- Single back button navigation
- No redirection issues
- No automatic logout

---

## 🛠 Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

## 📁 Project Structure

```
root/
│
├── client/              # Frontend (React + TypeScript)
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── ...
│
├── server/              # Backend (Node + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
│
└── README.md
```

---

## 🔐 Security & Data Protection

- Password hashing
- Secure token-based authentication
- Protected admin routes
- Role-based access control
- Public legal compliance pages
- Accurate financial computation without rounding manipulation

---

## 📈 Business Logic Highlights

- Due increases on order placement
- Due decreases on payment confirmation
- No rounding applied anywhere in the app
- Real-time balance updates
- Sorted order history (latest first)
- Dynamic dashboard statistics

---

## 🎯 Future Enhancements

- Payment gateway integration
- Email notifications
- Report export (PDF / Excel)
- Advanced analytics dashboard
- Multi-admin support
- Mobile app integration

---

## 📄 License

This software is proprietary and intended for authorized business use only.  
Unauthorized copying, modification, or redistribution is prohibited.

---

## 👨‍💻 Author

Developed for **SV Pharma**  
by **Shivanand VN**  
All rights reserved © 2026
