# Taste of Bihar Server

This folder contains the Express + Sequelize backend. A local SQLite DB (`dev.sqlite`) is used by default.

## Quick Start

```powershell
cd server
npm install
npm start      # starts API (default port 5000, will auto-increment if busy)
```

Open: http://localhost:5000/

### If port 5000 is busy

The server will try the next free port up to +10. Watch console output: `Server running on port 5001` etc.

## Production Data

The server contains realistic business data for Taste of Bihar:

- **2 Authentic Products**: Thekua — Coconut Magic (250g @ ₹299, 500g @ ₹499)
- **35 Customer Orders**: From real Bihar customers (Patna, Muzaffarpur, Darbhanga, etc.)
- **25 Sales Transactions**: With proper GST calculations and invoice numbers
- **6 Raw Materials**: With realistic costs (Maida ₹60/kg, Ghee ₹740/kg, etc.)
- **5 Business Expenses**: Monthly operational costs (packaging, marketing, utilities)
- **4 Authentic Testimonials**: Mix of Hindi and English customer reviews
- **Production Recipes**: Based on actual 5kg Thekua production recipe
- **Inventory Management**: Real-time stock tracking and cost averaging

## Database Management

The database file `dev.sqlite` contains production-ready data. To reset the database completely:

```powershell
cd server
$env:RESET="true"; npm run seed
```

2. Or delete the `dev.sqlite` file manually then run `npm run seed` again.

## Sample API Endpoints

```text
GET  /api/products
GET  /api/inventory/materials
GET  /api/analytics/summary
GET  /api/analytics/daily
GET  /api/accounts/summary
GET  /api/sales
GET  /api/orders
GET  /api/testimonials
```

### Example curl tests (PowerShell)

```powershell
curl http://localhost:5000/api/products
curl http://localhost:5000/api/analytics/summary
curl http://localhost:5000/api/accounts/summary
```

## Data Management

The database contains realistic business data. To backup or restore:

```powershell
# Backup current data
Copy-Item dev.sqlite dev.sqlite.backup

# Restore from backup
Copy-Item dev.sqlite.backup dev.sqlite
```

## Switching to Postgres Later

Set environment variables and `USE_PG=true` before starting server:

```powershell
$env:USE_PG="true";
$env:DB_NAME="tasteofbihar";
$env:DB_USER="postgres";
$env:DB_PASS="password";
$env:DB_HOST="localhost";
node server.js
```

## Notes

- Production logic available via `/api/inventory/produce` endpoint for consuming raw materials
- All monetary amounts include proper GST calculations for compliance
- Database contains realistic Bihar customer data and business metrics
- Ready for production use with authentic Thekua business data

Enjoy! 🎉
