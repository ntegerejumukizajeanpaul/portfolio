# ProFolio — Professional Portfolio Builder

Build, share, and verify professional portfolios with QR code verification.

## Features
- **Portfolio Builder**: Multi-step form to add personal info, skills, education & experience
- **Beautiful Portfolio View**: Professional dark-themed portfolio page
- **PDF Download**: Export portfolio as high-quality PDF
- **Social Sharing**: Share on LinkedIn, Facebook, Twitter, WhatsApp
- **QR Verification**: Every portfolio gets a QR code for authenticity verification
- **User Auth**: Secure JWT-based registration and login
- **SQLite Database**: Lightweight persistent storage

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Vite (port 3020)
- **Backend**: Node.js, Express, SQLite (port 5020)

## Quick Start

### Backend
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5020

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:3020

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST | /api/portfolios/create | Create portfolio |
| GET | /api/portfolios/my | User's portfolios |
| GET | /api/portfolios/:id | View portfolio |
| PUT | /api/portfolios/:id | Update portfolio |
| DELETE | /api/portfolios/:id | Delete portfolio |
| GET | /api/portfolios/verify/:id | Verify via QR |

## Security
- JWT authentication with bcrypt password hashing
- Rate limiting on auth endpoints
- Helmet security headers
- CORS protection
- Input validation with express-validator
