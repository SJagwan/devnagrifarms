# Infrastructure Decisions & Technical Debt

## 🌐 API Proxy via CloudFront (Implemented March 8, 2026)

**Current State:**
CloudFront is configured to act as a proxy for the Backend API. 
- Requests matching `/api/*` are forwarded to the EC2 instance origin.
- This was done to solve **Mixed Content** errors (HTTPS frontend vs HTTP backend) without requiring a custom domain/SSL certificate on the EC2 instance immediately.

**⚠️ TO UNDO / REFACTOR LATER:**
When we move to a custom domain (e.g., `api.devnagrifarms.com` and `admin.devnagrifarms.com`):
1.  **Remove the EC2 Origin** from the `s3_cloudfront` module.
2.  **Remove the `ordered_cache_behavior`** for `/api/*`.
3.  **Update GitHub Secrets:** Change `VITE_API_BASE_URL` from `/api` back to the full production API URL.
4.  **Reason for Undo:** A direct connection to a dedicated API domain is generally more flexible for load balancing and prevents CloudFront's extra layer of latency for API calls.
