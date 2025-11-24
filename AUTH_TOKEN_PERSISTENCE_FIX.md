# Auth Token Persistence Fix

## The Problem

You were getting 403 Forbidden errors even after logging in because the authentication token was stored only in memory and was lost on:
- Page refresh
- Browser tab close/reopen
- Navigation between pages

## The Fix

Updated the token storage to use `localStorage` so it persists across page loads.

### Changes Made

#### 1. `frontend/src/lib/api.ts`
- ✅ Token now saved to `localStorage` when set
- ✅ Token loaded from `localStorage` on page load
- ✅ Token removed from `localStorage` on logout

**Before:**
```typescript
let accessToken: string | null = null  // Lost on refresh!
```

**After:**
```typescript
// Initialize from localStorage
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('access_token')
}

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('access_token', token)  // Persist it!
    } else {
      localStorage.removeItem('access_token')
    }
  }
}
```

#### 2. `frontend/src/lib/auth-context.tsx`
- ✅ Validates token on app load
- ✅ Automatically logs out if token is invalid
- ✅ Better loading state management

## How It Works Now

### Login Flow
1. User enters credentials
2. Backend returns `access_token`
3. Token saved to **both** memory and `localStorage`
4. All API requests include the token in `Authorization: Bearer {token}` header

### Page Refresh Flow
1. App loads
2. Checks `localStorage` for token
3. If found, validates it with a test API call
4. If valid → user stays logged in
5. If invalid → token cleared, user redirected to login

### Logout Flow
1. User clicks logout
2. Token removed from memory
3. Token removed from `localStorage`
4. User redirected to login page

## Testing

### Test Token Persistence
1. Login to the app
2. Refresh the page (F5)
3. ✅ You should **stay logged in**
4. Navigate to different pages
5. ✅ You should **stay logged in**

### Test Token Expiration
1. Login to the app
2. Wait for token to expire (or manually delete it from backend)
3. Try to access a protected page
4. ✅ You should be **redirected to login**

### Test Logout
1. Login to the app
2. Click logout
3. ✅ Token should be cleared
4. Try to access a protected page
5. ✅ You should be **redirected to login**

## Verify in Browser DevTools

### Check localStorage
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → your domain
4. You should see `access_token` with your JWT

### Check Network Requests
1. Open DevTools (F12)
2. Go to **Network** tab
3. Make any API request
4. Click on the request
5. Check **Request Headers**
6. You should see: `Authorization: Bearer eyJ...`

## Security Note

Storing tokens in `localStorage` is common but has some security considerations:

### Pros
✅ Persists across page refreshes
✅ Easy to implement
✅ Works across tabs

### Cons
⚠️ Vulnerable to XSS attacks (if your site has XSS vulnerabilities)
⚠️ Accessible to any JavaScript on the page

### Alternative: httpOnly Cookies
For better security, consider using httpOnly cookies (requires backend changes):

```typescript
// Backend sets cookie
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,  // Not accessible to JavaScript
    secure=True,    // Only sent over HTTPS
    samesite="lax"
)
```

But for now, `localStorage` is fine for development and most use cases.

## Troubleshooting

### Still Getting 403 After Login?

1. **Check localStorage**
   - Open DevTools → Application → Local Storage
   - Verify `access_token` exists

2. **Check token format**
   - Token should start with `eyJ`
   - Should be a long string (JWT format)

3. **Check Authorization header**
   - Open DevTools → Network
   - Click on a failed request
   - Check if `Authorization: Bearer {token}` is present

4. **Check token expiration**
   - Tokens expire after a certain time
   - Try logging in again

5. **Clear localStorage and try again**
   ```javascript
   // In browser console
   localStorage.clear()
   // Then login again
   ```

### Token Not Persisting?

Check if your browser allows localStorage:
```javascript
// In browser console
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
  console.log('localStorage works!')
} catch (e) {
  console.error('localStorage blocked:', e)
}
```

## Summary

The 403 errors after login were caused by the token not being persisted. Now the token is saved to `localStorage` and will survive page refreshes, keeping you logged in until the token expires or you explicitly logout.
