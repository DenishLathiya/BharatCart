# BharatCart — Full-Stack (React + Express + MongoDB)

A complete e-commerce application with a React frontend and Express/MongoDB backend.

---

## Project Structure

```
BharatCart/
├── backend/                  # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT protect + adminOnly
│   │   ├── models/
│   │   │   ├── User.js        # Users table
│   │   │   ├── Product.js     # Products table
│   │   │   ├── Order.js       # Orders table
│   │   │   ├── Cart.js        # Carts table (per user)
│   │   │   ├── Wishlist.js    # Wishlists table
│   │   │   └── Coupon.js      # Coupons table
│   │   ├── routes/
│   │   │   ├── auth.js        # /api/auth/*
│   │   │   ├── products.js    # /api/products/*
│   │   │   ├── cart.js        # /api/cart/*
│   │   │   ├── orders.js      # /api/orders/*
│   │   │   ├── wishlist.js    # /api/wishlist/*
│   │   │   ├── coupons.js     # /api/coupons/*
│   │   │   └── admin.js       # /api/admin/*
│   │   ├── scripts/
│   │   │   └── seedAdmin.js   # Create admin user
│   │   └── server.js          # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # Vite + React
    ├── src/
    │   ├── components/
    │   │   ├── ui.jsx          # Design system (unchanged)
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── CartSidebar.jsx
    │   ├── context/
    │   │   └── AppContext.jsx  # State + API action hooks
    │   ├── services/
    │   │   └── api.js          # All HTTP calls (single source)
    │   ├── appReduce.jsx       # Reducer (extended for API)
    │   ├── App.jsx             # All pages/sections
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## MongoDB Collections (Tables)

| Collection  | Description                              |
|-------------|------------------------------------------|
| `users`     | Registered users + admin flag            |
| `products`  | Product catalog with stock & sales       |
| `carts`     | Per-user cart (server-persisted)         |
| `orders`    | Placed orders with items & address       |
| `wishlists` | Per-user wishlist of product IDs         |
| `coupons`   | Discount coupon codes                    |

---

## API Endpoints

### Auth
| Method | Path               | Auth   | Description          |
|--------|--------------------|--------|----------------------|
| POST   | /api/auth/register | —      | Register new user    |
| POST   | /api/auth/login    | —      | Login, get JWT token |
| GET    | /api/auth/me       | Bearer | Get current user     |
| PUT    | /api/auth/password | Bearer | Change password      |

### Products
| Method | Path               | Auth         | Description     |
|--------|--------------------|--------------|-----------------|
| GET    | /api/products      | —            | List products   |
| GET    | /api/products/:id  | —            | Get one product |
| POST   | /api/products      | Admin        | Create product  |
| PUT    | /api/products/:id  | Admin        | Update product  |
| DELETE | /api/products/:id  | Admin        | Delete product  |

### Cart
| Method | Path               | Auth   | Description         |
|--------|--------------------|--------|---------------------|
| GET    | /api/cart          | Bearer | Get user's cart     |
| POST   | /api/cart/add      | Bearer | Add item to cart    |
| PUT    | /api/cart/qty      | Bearer | Change item qty     |
| DELETE | /api/cart/:id      | Bearer | Remove item         |
| DELETE | /api/cart          | Bearer | Clear cart          |

### Orders
| Method | Path                    | Auth   | Description           |
|--------|-------------------------|--------|-----------------------|
| POST   | /api/orders             | Bearer | Place order           |
| GET    | /api/orders/my          | Bearer | My orders             |
| GET    | /api/orders             | Admin  | All orders            |
| PUT    | /api/orders/:id/status  | Admin  | Update order status   |

### Others
- `GET/POST /api/wishlist`, `POST /api/wishlist/toggle`
- `POST /api/coupons/validate` (user), full CRUD on `/api/coupons` (admin)
- `GET /api/admin/users`, `GET /api/admin/analytics`, `POST /api/admin/seed`

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Edit .env — set MONGODB_URI to your MongoDB connection string

# Seed the admin user (run once)
node src/scripts/seedAdmin.js

# Start dev server
npm run dev
# → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env (optional — Vite proxy handles /api in dev)
cp .env.example .env

# Start dev server
npm run dev
# → http://localhost:5173
```

### 3. Seed Products (via Admin UI)
1. Log in as admin (admin@BharatCart.com / admin123)
2. Go to Dashboard
3. Click **🌱 Seed Products** to populate the database

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/BharatCart
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

### frontend/.env (optional in dev)
```
VITE_API_URL=http://localhost:5000/api
```

---

## How It Works

1. **JWT Auth** — login returns a JWT token stored in `localStorage`. Every API request sends `Authorization: Bearer <token>`.
2. **Session restore** — on page load, the token is validated via `GET /api/auth/me`. If valid, cart/orders/wishlist are loaded from MongoDB.
3. **Cart is server-side** — every add/remove/qty change hits the API and updates MongoDB in real time.
4. **Orders** — placing an order deducts stock, records sales, creates the order document, and clears the user's cart.
5. **Admin** — any user with `isAdmin: true` in MongoDB sees the admin panel. Created via the seed script.
