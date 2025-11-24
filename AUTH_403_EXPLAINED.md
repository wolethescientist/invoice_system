# Understanding 403 Forbidden Responses

## Why You See 403 Forbidden

The 403 Forbidden responses in your logs are **normal and expected behavior**. Here's why:

### Your Log Pattern
```
INFO: 129.222.206.83:0 - "GET /api/metrics/dashboard HTTP/1.1" 403 Forbidden
INFO: 129.222.206.83:0 - "POST /api/auth/login HTTP/1.1" 200 OK
INFO: 129.222.206.83:0 - "GET /api/metrics/dashboard HTTP/1.1" 200 OK
```

This shows:
1. **403** - Request without authentication token (user not logged in yet)
2. **200** - User logs in successfully
3. **200** - Request with valid authentication token

## What Causes 403 Forbidden

The `/api/metrics/dashboard` endpoint requires authentication:

```python
@router.get("/dashboard")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Requires auth
):
```

You'll get 403 when:

### 1. No Authorization Header
```bash
# This will return 403
curl http://localhost:8000/api/metrics/dashboard
```

### 2. Invalid or Expired Token
```bash
# This will return 403
curl http://localhost:8000/api/metrics/dashboard \
  -H "Authorization: Bearer expired_or_invalid_token"
```

### 3. Missing "Bearer" Prefix
```bash
# This will return 403
curl http://localhost:8000/api/metrics/dashboard \
  -H "Authorization: your_token_here"
```

## Common Sources of 403 Responses

### Frontend Behavior
Your frontend might be making requests before the user is logged in:

```typescript
// Component mounts and tries to fetch data
useEffect(() => {
  fetchDashboardMetrics(); // ← Will fail if no token
}, []);
```

### Token Expiration
Tokens expire after a certain time. When they expire, requests return 403 until the user logs in again.

### Browser Preflight Requests
CORS preflight OPTIONS requests don't include auth headers and might show as 403 (though they should be OPTIONS, not GET).

### Health Checks / Monitoring
If you have monitoring tools or load balancers hitting your endpoints, they'll get 403 if they don't include auth tokens.

## How to Fix (If Needed)

### Option 1: Make Endpoint Public (Not Recommended)
Remove the `current_user` dependency:

```python
@router.get("/dashboard")
def get_dashboard_metrics(
    db: Session = Depends(get_db)
    # No current_user = no auth required
):
```

**⚠️ Warning**: This exposes data to anyone!

### Option 2: Add Optional Authentication
Make authentication optional:

```python
from typing import Optional

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    # ... rest of auth logic
```

### Option 3: Handle in Frontend (Recommended)
Only fetch protected data after login:

```typescript
const { user, token } = useAuth();

useEffect(() => {
  if (token) {
    fetchDashboardMetrics();
  }
}, [token]);
```

## Verify It's Working Correctly

### Test Without Auth (Should Get 403)
```bash
curl http://localhost:8000/api/metrics/dashboard
# Expected: 403 Forbidden
```

### Test With Auth (Should Get 200)
```bash
# 1. Login first
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Use token
curl http://localhost:8000/api/metrics/dashboard \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with data
```

## Should You Worry?

**No!** The 403 responses are the security system working correctly. They indicate:

✅ Your authentication is working  
✅ Protected endpoints are actually protected  
✅ Unauthorized requests are being rejected  

## When to Investigate

Only investigate if:

❌ You get 403 **with a valid token**  
❌ Login returns 200 but next request returns 403  
❌ All requests return 403 even after login  

Otherwise, these 403s are just noise in the logs from:
- Page loads before login
- Expired sessions
- Browser preflight requests
- Monitoring tools

## Reducing Log Noise

If the 403 logs bother you, you can filter them:

### Option 1: Custom Logging Middleware
```python
@app.middleware("http")
async def filter_403_logs(request: Request, call_next):
    response = await call_next(request)
    if response.status_code == 403:
        # Don't log or log at lower level
        pass
    return response
```

### Option 2: Configure Uvicorn Logging
```python
# In your uvicorn config
log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "no_403": {
            "()": "path.to.No403Filter"
        }
    }
}
```

## Summary

The 403 Forbidden responses you're seeing are **normal and expected**. They show your authentication is working correctly by rejecting unauthorized requests. No action needed unless you're getting 403 with valid tokens.
