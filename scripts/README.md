# Migration Scripts

This directory contains scripts to fix the plan limits inconsistency issue.

## Problem
The plan limits were inconsistent across different files:
- `auth-server.ts`: starter = 50 ✓
- `brief-usage/route.ts`: starter = 100 ❌  
- `meetingbrief/route.ts`: starter = 100 ❌

This caused users to see incorrect usage counts.

## Scripts

### 1. `fix-plan-limits.js`
**Purpose**: Audit and identify users affected by the plan limits inconsistency

**Usage**:
```bash
node scripts/fix-plan-limits.js
```

**What it does**:
- Shows subscription distribution
- Lists all users with their current usage
- Identifies users who exceed the new 50-brief limit
- Provides summary for manual review

**Safe**: Read-only analysis, no data changes

### 2. `reset-user-counts.js`
**Purpose**: Reset brief counts for users who exceeded the new limit

**Usage**:
```bash
node scripts/reset-user-counts.js
```

**What it does**:
- Finds users with >50 briefs this month
- Generates SQL commands to reset their counts
- Optionally executes the reset (disabled by default)

**Safety**: 
- Disabled by default (`CONFIRM_RESET = false`)
- Provides SQL commands for manual execution
- Only affects users who exceeded the new limit

## Recommended Process

1. **Run audit script**:
   ```bash
   node scripts/fix-plan-limits.js
   ```

2. **Review the output** to understand impact

3. **Decide on resolution**:
   - Option A: Reset counts to 0 (generous)
   - Option B: Cap counts at 50 (strict)
   - Option C: Grandfather existing users

4. **Execute reset if needed**:
   ```bash
   # Edit reset-user-counts.js and set CONFIRM_RESET = true
   node scripts/reset-user-counts.js
   ```

5. **Deploy the fixed API endpoints** (already done)

## Files Fixed
- ✅ `src/app/api/brief-usage/route.ts` - Updated starter limit to 50
- ✅ `src/app/api/meetingbrief/route.ts` - Updated starter limit to 50
- ✅ `src/lib/auth-server.ts` - Already correct at 50

## Environment Variables
Make sure you have `DATABASE_URL` set in your environment:
```bash
export DATABASE_URL="postgresql://..."
```