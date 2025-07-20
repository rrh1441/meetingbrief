# Calendar Integration Guide for MeetingBrief

## Overview

This guide outlines how to integrate calendar functionality into MeetingBrief to automatically generate reports for external meeting attendees. The integration will allow users to connect their Google Calendar or Microsoft Outlook calendars and automatically process upcoming meetings.

## Architecture Overview

The calendar integration will extend MeetingBrief's existing pipeline architecture by adding:
1. **Calendar Sync Service** - Fetches and monitors calendar events
2. **Meeting Queue** - Processes upcoming meetings and their attendees
3. **Automated Brief Generation** - Triggers the existing pipeline for each external attendee

## Implementation Process

### Phase 1: Database Schema Updates

Add new tables to track calendar connections and meetings:

```sql
-- Calendar connections
CREATE TABLE calendar_connections (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL, -- 'google' or 'microsoft'
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled meetings
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  calendar_connection_id INTEGER REFERENCES calendar_connections(id),
  external_meeting_id TEXT UNIQUE NOT NULL,
  title TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location TEXT,
  description TEXT,
  attendees JSONB, -- Array of attendee objects
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meeting briefs relationship
CREATE TABLE meeting_briefs (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id),
  brief_id INTEGER REFERENCES briefs(id),
  attendee_email TEXT,
  attendee_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 2: OAuth Integration

#### Google Calendar Setup

1. **Create OAuth Credentials**
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://yourdomain.com/api/auth/google/calendar/callback`
   - Required scopes:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events.readonly`

2. **Implement OAuth Flow**
   ```typescript
   // app/api/auth/google/calendar/route.ts
   export async function GET(request: Request) {
     const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
       client_id=${process.env.GOOGLE_CLIENT_ID}&
       redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&
       response_type=code&
       scope=https://www.googleapis.com/auth/calendar.readonly&
       access_type=offline&
       prompt=consent`;
     
     return redirect(authUrl);
   }
   ```

3. **Handle Callback**
   ```typescript
   // app/api/auth/google/calendar/callback/route.ts
   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url);
     const code = searchParams.get('code');
     
     // Exchange code for tokens
     const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         code,
         client_id: process.env.GOOGLE_CLIENT_ID,
         client_secret: process.env.GOOGLE_CLIENT_SECRET,
         redirect_uri: process.env.GOOGLE_REDIRECT_URI,
         grant_type: 'authorization_code'
       })
     });
     
     const tokens = await tokenResponse.json();
     
     // Store tokens in calendar_connections table
     // Redirect to success page
   }
   ```

#### Microsoft Calendar Setup

Similar process using Microsoft Graph API:
- Register app in Azure AD
- Use Microsoft Identity Platform
- Required permissions: `Calendars.Read`, `Calendars.ReadBasic`

### Phase 3: Calendar Sync Service

Create a service to fetch and sync calendar events:

```typescript
// lib/services/calendarSync.ts
export class CalendarSyncService {
  async syncGoogleCalendar(connection: CalendarConnection) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Fetch events for next 7 days
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    // Process each event
    for (const event of events.data.items || []) {
      await this.processEvent(event, connection.user_id);
    }
  }
  
  private async processEvent(event: any, userId: string) {
    // Extract attendees
    const externalAttendees = event.attendees?.filter(
      (attendee: any) => !attendee.self && !attendee.organizer
    ) || [];
    
    // Store meeting in database
    const meeting = await this.storeMeeting({
      user_id: userId,
      external_meeting_id: event.id,
      title: event.summary,
      start_time: event.start.dateTime || event.start.date,
      attendees: externalAttendees,
      // ... other fields
    });
    
    // Queue briefs for external attendees
    for (const attendee of externalAttendees) {
      await this.queueBriefGeneration(meeting.id, attendee);
    }
  }
}
```

### Phase 4: Automated Brief Generation

Extend the existing pipeline to handle calendar-triggered briefs:

```typescript
// lib/services/meetingBriefProcessor.ts
export class MeetingBriefProcessor {
  async processMeetingAttendees(meetingId: number) {
    const meeting = await getMeeting(meetingId);
    const attendees = meeting.attendees as any[];
    
    for (const attendee of attendees) {
      if (attendee.email && attendee.displayName) {
        try {
          // Extract organization from email domain or meeting context
          const organization = this.extractOrganization(attendee.email, meeting);
          
          // Use existing pipeline
          const pipeline = new MeetingBriefGeminiPipeline();
          const brief = await pipeline.generateBrief({
            name: attendee.displayName,
            organization: organization,
            userId: meeting.user_id,
            // Add meeting context
            context: {
              meetingTitle: meeting.title,
              meetingDate: meeting.start_time,
              source: 'calendar_sync'
            }
          });
          
          // Link brief to meeting
          await linkBriefToMeeting(meetingId, brief.id, attendee);
          
        } catch (error) {
          console.error(`Failed to generate brief for ${attendee.email}:`, error);
        }
      }
    }
  }
  
  private extractOrganization(email: string, meeting: any): string {
    // Try to extract from email domain
    const domain = email.split('@')[1];
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    
    if (!commonDomains.includes(domain)) {
      // Use domain as organization (e.g., @company.com -> Company)
      return domain.split('.')[0].charAt(0).toUpperCase() + 
             domain.split('.')[0].slice(1);
    }
    
    // Fallback: try to extract from meeting title or description
    // e.g., "Meeting with John from Acme Corp"
    const orgPattern = /(?:from|at|with|@)\s+([A-Z][A-Za-z\s&]+)/;
    const match = meeting.title?.match(orgPattern) || 
                  meeting.description?.match(orgPattern);
    
    return match?.[1]?.trim() || 'Unknown Organization';
  }
}
```

### Phase 5: User Interface

Add calendar connection UI:

```typescript
// app/dashboard/calendar/page.tsx
export default function CalendarSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Calendar Integration</h1>
      
      <div className="space-y-4">
        <CalendarConnectionCard 
          provider="google"
          title="Google Calendar"
          description="Connect your Google Calendar to automatically generate briefs for meeting attendees"
          onConnect={() => window.location.href = '/api/auth/google/calendar'}
        />
        
        <CalendarConnectionCard 
          provider="microsoft"
          title="Microsoft Outlook"
          description="Connect your Outlook calendar to automatically generate briefs for meeting attendees"
          onConnect={() => window.location.href = '/api/auth/microsoft/calendar'}
        />
      </div>
      
      <ConnectedCalendarsList />
      <SyncSettingsPanel />
    </div>
  );
}
```

### Phase 6: Background Jobs

Set up scheduled jobs to sync calendars:

```typescript
// lib/jobs/calendarSync.ts
export async function syncAllCalendars() {
  const activeConnections = await getActiveCalendarConnections();
  
  for (const connection of activeConnections) {
    try {
      const syncService = new CalendarSyncService();
      
      if (connection.provider === 'google') {
        await syncService.syncGoogleCalendar(connection);
      } else if (connection.provider === 'microsoft') {
        await syncService.syncMicrosoftCalendar(connection);
      }
      
    } catch (error) {
      console.error(`Sync failed for connection ${connection.id}:`, error);
      
      // Handle token refresh if needed
      if (error.code === 401) {
        await refreshTokens(connection);
      }
    }
  }
}

// Run every 30 minutes via cron job or Vercel Cron
```

## Security Considerations

1. **Token Storage**: Encrypt OAuth tokens before storing in database
2. **Scope Limitations**: Only request read-only calendar access
3. **Data Privacy**: 
   - Allow users to exclude specific calendars
   - Provide options to exclude internal meetings
   - Clear data retention policies
4. **Rate Limiting**: Implement per-user limits on calendar sync frequency
5. **Audit Logging**: Track all calendar access and brief generation

## User Settings

Allow users to configure:
- Which calendars to sync
- How far in advance to generate briefs (1-7 days)
- Exclude patterns (e.g., recurring meetings, internal domains)
- Credit usage preferences for automated briefs
- Email notifications for new briefs

## Credit Usage Model

Options for calendar-triggered briefs:
1. **Subscription Tier**: Include X automated briefs per month
2. **Credit Deduction**: Use existing credit system
3. **Calendar Pack**: Separate add-on for unlimited calendar briefs
4. **Smart Mode**: Only generate briefs for important meetings (based on title, attendee count, etc.)

## Implementation Timeline

- **Week 1-2**: Database schema and OAuth implementation
- **Week 3**: Calendar sync service and API integration
- **Week 4**: UI components and user settings
- **Week 5**: Background jobs and testing
- **Week 6**: Security audit and optimization

## Next Steps

1. Choose initial calendar provider (recommend starting with Google)
2. Set up OAuth application credentials
3. Implement basic sync functionality
4. Add to existing dashboard
5. Test with beta users
6. Expand to additional providers

This integration will transform MeetingBrief from a manual lookup tool to an automated meeting preparation assistant, significantly increasing user value and engagement.