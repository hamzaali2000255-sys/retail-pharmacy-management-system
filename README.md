# PharmaPOS — Retail Pharmacy Management System

A modern, Windows-friendly retail pharmacy POS built with **Node.js, Express and MySQL**.

## Included in this release
- Dashboard with medicine count, tablet stock, daily sales and revenue
- Medicine inventory with batch and expiry tracking
- POS sales for **tablet, strip and box**
- Automatic unit conversion and stock deduction
- Sale validation against available stock
- Invoice number generation
- Cash/card/bank/credit payment selection
- Sales history
- Expiry watch for medicines due within 90 days
- Responsive interface suitable for Windows 10 desktop
- MySQL schema with sales, sale items and stock movement tables

## Requirements
- Windows 10 or later
- Node.js 18+
- XAMPP (MySQL) or MySQL 8-compatible server

## Installation
1. Install Node.js.
2. Start **MySQL** from XAMPP.
3. Import `database/schema.sql` in phpMyAdmin.
4. Copy `.env.example` to `.env` and set database credentials.
5. Open Command Prompt in this project folder.
6. Run `npm install` then `npm start`.
7. Open `http://localhost:3000`.

## Selling units
Stock is stored as the smallest unit: **tablets**. If a medicine has 10 tablets per strip and 10 strips per box:
- 1 tablet = 1 tablet deducted
- 1 strip = 10 tablets deducted
- 1 box = 100 tablets deducted

Prices are stored independently for tablet, strip and box sales.

## Next production hardening
Before live pharmacy deployment, add authentication/roles, purchase receiving, returns, prescription workflows where required, audit logging, automated backups, receipt printer configuration, tax/regulatory rules and more comprehensive tests.
