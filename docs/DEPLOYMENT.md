# FestSphere Deployment Guide

## 1. Deployment Overview

FestSphere should be deployed as a distributed system with separate frontend and backend services plus managed database and media storage.

## 2. Frontend Deployment

### Platform
- Vercel

### Recommendations
- Deploy the frontend as a production build with environment variables configured.
- Enable preview deployments for pull requests.
- Configure custom domain and SSL automatically.
- Use static asset optimization and cache headers.

## 3. Backend Deployment

### Platform
- Render

### Recommendations
- Deploy the backend as a managed Node.js service.
- Configure health checks and automatic restarts.
- Use production environment variables and secrets storage.
- Set up logging and monitoring for API errors.

## 4. Database Deployment

### Platform
- MongoDB Atlas

### Recommendations
- Use a production cluster with replica sets.
- Enable backup and restore capabilities.
- Restrict network access to approved IPs or private networking.
- Use separate development and production databases.

## 5. Media Storage

### Platform
- Cloudinary

### Recommendations
- Store event banners, profile images, and certificates using Cloudinary.
- Optimize file sizes and use transformations where needed.
- Restrict upload permissions and validate file types.

## 6. Payment Provider

### Platform
- Razorpay

### Recommendations
- Configure production API keys separately from development keys.
- Enable webhook verification and signature validation.
- Test with sandbox before production rollout.

## 7. Environment Variables

| Variable | Purpose |
| --- | --- |
| MONGO_URI | Database connection string |
| JWT_SECRET | Access token secret |
| JWT_REFRESH_SECRET | Refresh token secret |
| RAZORPAY_KEY_ID | Razorpay public key |
| RAZORPAY_KEY_SECRET | Razorpay secret |
| CLOUDINARY_CLOUD_NAME | Cloudinary account name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| FRONTEND_URL | Allowed frontend origin |
| BACKEND_URL | API base URL |

## 8. CI/CD Recommendations

- Use GitHub Actions or similar CI/CD pipelines.
- Run linting, tests, and build checks on every pull request.
- Deploy preview builds for feature branches.
- Promote to production only after successful validation.
- Maintain environment-specific deployment pipelines.
