# Google Login Integration

This project now supports Google One Tap / Sign-In.

## Setup Steps

1. Go to https://console.cloud.google.com/ and create (or select) a project.
2. Enable the Google Identity Services API.
3. Configure an OAuth 2.0 Client ID of type Web.
4. Add authorized JavaScript origins (e.g., http://localhost:5173) and any deployed domains.
5. Copy the Client ID.
6. Create or update a `.env` (or `.env.local`) in `website/` with:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_API_URL=http://localhost:5000/api
```

7. In the server environment, set:

```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Restart both server and frontend after changing env vars.

## Flow

- Frontend loads Google script and renders button in `LoginModal.jsx` via `GoogleLoginButton`.
- On user sign-in, Google returns a credential (ID token) which is POSTed to `/api/auth/google`.
- Backend verifies ID token using `google-auth-library`, finds or creates a user, and returns a simple base64 token plus user profile.

## Notes / Next Steps

- Replace the simple base64 token with a proper signed JWT for production security.
- Add token storage (e.g., HttpOnly cookie or localStorage) and attach to subsequent API requests.
- Implement standard password login and registration endpoints if needed for non-Google users.
