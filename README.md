# Meme'd Campaign Payout Tracker

A full-stack creator campaign management platform that tracks social media submission views and calculates creator payouts based on campaign milestones, while enforcing campaign budget limits.

## Live Demo

- **Frontend:** https://memed-payout-tracker-576oaat09-ml-e444.vercel.app/
- **Backend Health Check:** https://memed-payout-tracker-qv54.onrender.com/api/health
- **GitHub Repository:** https://github.com/acharikavya/memed-payout-tracker

## Overview

Meme'd Campaign Payout Tracker connects brands running marketing campaigns with creators who submit social media posts.

Brands can create campaigns with budgets and payout milestones. Creators can browse live campaigns, submit post URLs, and track views and earned payouts. The backend calculates payouts when view counts are updated and prevents campaign spending from exceeding the available budget.

## Features

### Brand Module
- Brand registration and login.
- Create campaigns with a social media platform, budget, and payout milestones.
- View created campaigns and their budget information.

### Creator Module
- Creator registration and login.
- Browse available live campaigns.
- Submit social media post URLs.
- Track submitted posts, view counts, and payouts.
- Update submission views through an authenticated API request.

### Payout Engine
- Calculate payouts based on the highest milestone reached.
- Support multiple view and payout thresholds per campaign.
- Prevent campaign spending from exceeding the configured budget.
- Reject invalid view updates, including decreasing view counts.

### Security
- Password hashing with bcrypt.
- JWT-based authentication.
- Role-based access control for brand and creator operations.
- Submission ownership checks to prevent creators from modifying other creators' submissions.
- Request validation and centralized error handling.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Validation | Zod |
| Testing | Jest, ts-jest, Supertest |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Project Structure

```text
memed-payout-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── .env.example
├── frontend/
│   ├── app/
│   ├── src/
│   │   └── lib/
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project locally:

- Node.js and npm
- A MongoDB Atlas cluster or another compatible MongoDB deployment
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/acharikavya/memed-payout-tracker.git
cd memed-payout-tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` and configure the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:3000
```

Use your own database connection string and a strong, unique JWT secret. Never commit `.env` files or credentials to GitHub.

### 3. Start the backend

For development:

```bash
npm run dev
```

The backend runs on port `5000` by default.

Check the health endpoint:

http://localhost:5000/api/health

### 4. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Start the frontend

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Overview

The backend exposes REST API endpoints under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/health` | Check backend health |
| GET | `/api/submissions/mine` | Retrieve the authenticated creator's submissions |
| POST | `/api/submissions` | Create a creator submission |
| PATCH | `/api/submissions/:id/views` | Update submission views and calculate payout |

Protected endpoints require a valid JWT in the `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Campaign endpoints are also implemented. Refer to the backend route files for their exact paths and request formats.

## Payout Calculation

Campaigns define milestones consisting of a minimum view threshold and its corresponding payout.

Example campaign milestones:

| Views | Payout |
|---:|---:|
| 10,000 | ₹500 |
| 50,000 | ₹2,000 |
| 100,000 | ₹5,000 |

The payout engine determines the highest milestone reached by a submission. The service accounts for previously paid amounts and checks the campaign's remaining budget before allocating additional payouts.

The payout cannot cause campaign spending to exceed the configured budget.

## Testing

Run the backend test suite:

```bash
cd backend
npm test
```

Check the test TypeScript configuration:

```bash
npx tsc -p tsconfig.test.json
```

Build the backend for production:

```bash
npm run build
```

The current test suite contains 13 passing tests across two test suites.

## Deployment

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
- **Database:** MongoDB Atlas.

The frontend's `NEXT_PUBLIC_API_URL` must point to the deployed backend API. The backend's `FRONTEND_URL` must match the intended frontend origin for CORS.

Configure environment variables in the respective hosting dashboards. Do not expose database credentials or JWT secrets in frontend environment variables.

## Security Verification

The deployed API has been tested for the following cases:

- Requests without authentication are rejected with `401 Unauthorized`.
- Attempts by one creator to update another creator's submission are rejected with `403 Forbidden`.
- The tested unauthorized update did not change the owner's submission views or payout.

These checks validate the tested scenarios and do not replace a comprehensive security audit.

## Future Improvements

- Add automated integration tests for concurrent payout updates and budget exhaustion.
- Improve monitoring and operational logging.
- Expand API documentation with complete request and response examples.
- Add further automated security and edge-case tests.

## License

No license has been specified for this repository. Add a license if you intend to permit reuse or redistribution of the project.
