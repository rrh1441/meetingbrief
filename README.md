# MeetingBrief LinkedIn Extension

Chrome extension that automatically extracts LinkedIn profile data and creates AI-powered MeetingBriefs using the MeetingBrief platform.

## Features

- 🔍 **Automatic Profile Extraction**: Extracts profile data from LinkedIn pages using multiple methods (JSON-LD, DOM parsing)
- 🤖 **AI Brief Generation**: Creates MeetingBriefs using MeetingBrief's AI backend
- 🔐 **Google OAuth Integration**: Secure authentication via Google using Better Auth
- 📊 **Usage Tracking**: Monitors brief creation limits and subscription status
- 🚀 **Proxycurl Fallback**: Uses Proxycurl API when LinkedIn extraction fails
- 💾 **Local Storage**: Caches authentication and profile data
- 📱 **Modern UI**: Clean, responsive popup interface

## Architecture

```
├── src/
│   ├── background.ts          # Service worker
│   ├── content.ts            # LinkedIn page content script
│   ├── popup/
│   │   └── popup.ts          # Popup interface logic
│   ├── utils/
│   │   ├── auth.ts           # Better Auth integration
│   │   ├── api-client.ts     # MeetingBrief API client
│   │   ├── linkedin-extractor.ts # Profile extraction
│   └── types/
│       └── profile.ts        # TypeScript interfaces
├── public/
│   ├── popup/
│   │   └── popup.html        # Popup UI
│   └── icons/               # Extension icons
├── test/
│   ├── fixtures/            # LinkedIn HTML test data
│   └── *.test.ts           # Jest tests
└── dist/                   # Built extension
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd meetingbrief-linkedin-extension
npm install
```

### 2. Configure Environment

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://<extension-id>.chromiumapp.org/`
5. Copy the Client ID to `manifest.json`:

```json
{
  "oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID_HERE",
    "scopes": ["openid", "email", "profile"]
  }
}
```


### 3. Build the Extension

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### 4. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the project root directory (contains `manifest.json`)
5. The extension should now appear in your extensions list

### 5. Configure MeetingBrief Backend

Add Google OAuth provider to your Better Auth configuration:

```typescript
// In your Better Auth config
export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`
    }
  }
});
```

Create the required API endpoints:

```typescript
// api/briefs/route.ts
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Handle brief creation...
}

// api/usage/route.ts  
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  
  // Return usage data...
}
```

## Development

### Scripts

```bash
npm run build     # Build extension
npm run dev       # Build with watch mode
npm run test      # Run tests
npm run lint      # Lint code
npm run format    # Format code
```

### Testing

The extension includes comprehensive tests using Jest:

```bash
npm test
```

Test fixtures include sample LinkedIn profile HTML files to test extraction logic.

### Project Structure

- **Background Script**: Handles extension lifecycle, API communication, notifications
- **Content Script**: Runs on LinkedIn pages, extracts profile data, adds UI elements
- **Popup**: User interface for authentication and brief creation
- **Utils**: Shared utilities for auth, API communication, data extraction

## Usage

1. **Install & Authenticate**: Install extension and sign in with Google
2. **Navigate to LinkedIn**: Go to any LinkedIn profile page (linkedin.com/in/*)
3. **Extract Profile**: Extension automatically extracts profile data
4. **Create Brief**: Click extension icon or floating button to create MeetingBrief
5. **View Results**: Brief opens in new tab, linked to your MeetingBrief dashboard

## API Integration

The extension integrates with these endpoints:

- `POST /api/auth/google` - Initiate Google OAuth
- `POST /api/auth/callback/google` - Handle OAuth callback
- `GET /api/auth/session` - Verify session
- `POST /api/auth/sign-out` - Sign out user
- `GET /api/usage` - Get usage statistics
- `POST /api/briefs` - Create new brief
- `GET /api/briefs/history` - Get brief history

## Configuration

### Environment Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Extension Permissions

Required permissions in `manifest.json`:
- `storage` - Store auth tokens and profile data
- `identity` - Google OAuth authentication
- `activeTab` - Access current tab for LinkedIn data
- `notifications` - Show brief creation notifications
- `webNavigation` - Detect LinkedIn page navigation

## Security Considerations

- OAuth tokens stored in Chrome's encrypted storage
- No sensitive data in content scripts
- HTTPS-only API communication
- Minimal permissions requested
- Session validation on all API calls

## Troubleshooting

### Common Issues

1. **Authentication fails**: Check Google OAuth configuration and redirect URIs
2. **Profile extraction fails**: LinkedIn may have changed their DOM structure
3. **API calls fail**: Verify Better Auth endpoints and CORS settings
4. **Extension not loading**: Check for TypeScript compilation errors

### Debug Mode

Enable debug logging:

```typescript
// In any utility file
const DEBUG = true;
if (DEBUG) console.log('Debug info:', data);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Ensure linting passes
5. Submit pull request

## License

MIT License - see LICENSE file for details.
