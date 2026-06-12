# Deployment Guide - EXIM System

## Overview
The EXIM System consists of a Node.js/Express backend, a React/Vite frontend, and a PostgreSQL database. It integrates with AWS S3 for storage.

## 1. Prerequisites
- **Docker & Docker Compose**: Recommended for containerized deployment.
- **Node.js (v18+)**: If deploying on a raw VPS.
- **PostgreSQL (v14+)**: External managed DB (AWS RDS, DigitalOcean Managed DB) or local.
- **AWS S3 Bucket**: For document storage with correct IAM roles (read/write objects).

## 2. Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/exim_db
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=exim-documents-bucket
```

### Frontend (`.env.production`)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

## 3. Deployment using Docker Compose

Create a `docker-compose.yml` in the root of the project:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      # ... other env vars
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    restart: always
```

## 4. Frontend Static Hosting (Alternative to Docker)
Since the frontend is a React SPA built with Vite, it can be hosted on a CDN for maximum performance:
1. Build the app: `cd frontend && npm install && npm run build`
2. The `dist` folder will be generated.
3. Upload `dist` to **AWS S3** and serve via **CloudFront**, or deploy directly via **Vercel**, **Netlify**, or **Cloudflare Pages**.
4. Configure routing to redirect all 404s to `index.html` (since React Router handles client-side routing).

## 5. Backend VPS Deployment (PM2)
If not using Docker:
1. `cd backend && npm install`
2. `npm run build` (transpiles TypeScript to JS in `dist/` directory)
3. Use PM2: `npm install -g pm2`
4. `pm2 start dist/index.js --name "exim-backend"`
5. Set up **Nginx** as a reverse proxy:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. Database Migrations
Run your SQL schema in your PostgreSQL instance:
```bash
psql -h <host> -U <user> -d <db_name> -f database/schema.sql
```

## 7. Security Best Practices
- Place the backend API and Database in a private subnet.
- Only expose ports 80/443 to the public via Load Balancer.
- Enforce SSL/TLS (HTTPS) using Let's Encrypt or AWS ACM.
- Implement rate limiting (already configured in Express helmet/rate-limit).
