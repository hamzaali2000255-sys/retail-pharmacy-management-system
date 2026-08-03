# PharmaPOS — One-Click Windows Setup

## First time

1. Download the `initial-pharmacy-pos` branch as ZIP and extract it.
2. Install Node.js 18+.
3. Start **MySQL** in XAMPP.
4. Import `database/schema.sql` once using phpMyAdmin.
5. Double-click **`install-pharmacy-pos.bat`**.
6. If required, edit `.env` with your MySQL password.

## Every time after installation

Double-click:

`start-pharmacy-pos.bat`

The script checks Node.js, installs dependencies if necessary, starts the Node server and opens `http://localhost:3000` in your browser.

## Notes

- Keep MySQL running while using PharmaPOS.
- If port 3000 is busy, change `PORT` in `.env`.
- The batch files are intended for Windows 10/11.
- This is a local application; it does not require internet access after dependencies have been installed.
