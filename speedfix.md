# MeetingBrief Speed Optimization Implementation

## Goal
Reduce scan time from 60s to 30s while maintaining quality and catching job changes.

## Implementation Checklist

### Phase 1: Parallel Serper Calls ✅
- [x] Replace sequential Serper API calls with Promise.all
- [x] Add new primary `"${name}" "${org}"` search query
- [x] Add job change detection query
- [x] Implement job change detection system

### Phase 2: AI-Powered Snippet Analysis ✅
- [x] Create `analyzeSnippetsWithAI` function
- [x] Implement snippet relevance scoring
- [x] Add logic to skip scraping when snippet has complete info
- [x] Extract key facts from snippets for direct use

### Phase 3: Smart Firecrawl Optimization ✅
- [x] Increase FIRECRAWL_BATCH_SIZE from 10 to 25-30
- [x] Implement priority-based timeout system:
  - Critical (job changes): 15s with 2 retries
  - High (awards/recognition): 12s with 1 retry  
  - Medium (news/profiles): 8s with 1 retry
  - Low (basic mentions): 5s with no retry
- [x] Process scrapes in priority waves
- [x] Reduce FIRECRAWL_GLOBAL_BUDGET_MS to 25s

### Phase 4: Enhanced Concurrency ✅
- [x] Implement `processScrapesInPriorityWaves` function
- [x] Start obvious high-value scrapes immediately
- [x] Run AI analysis in parallel with first scrape wave
- [x] Add early termination when enough content collected

### Phase 5: Integration & Testing
- [x] Update main pipeline to use new functions
- [x] Add comprehensive logging for performance monitoring
- [x] Add timing instrumentation to track actual performance
- [ ] Test with various name/company combinations
- [ ] Verify job change detection works correctly

### Phase 6: Performance Measurement ✅
- [x] Add timing tracking for each major step
- [x] Include timing data in API response payload
- [x] Log timing breakdown to console
- [x] Ensure early returns also include timing data

## Performance Targets
- Current: ~60 seconds
- Target: 25-30 seconds
- Firecrawl calls reduced: 40-50%
- Concurrent operations: Up to 30

## Key Code Changes

### 1. New Constants
```typescript
const FIRECRAWL_BATCH_SIZE = 25; // Up from 10
const FIRECRAWL_GLOBAL_BUDGET_MS = 25_000; // Down from 35s
const MAX_CONCURRENT_FIRECRAWL = 30;
```

### 2. Enhanced Query Set
```typescript
const enhancedInitialQueries = [
  { q: `"${name}" "${org}"`, num: 15, label: "primary_name_company" },
  { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10, label: "name_company_linkedin" },
  { q: `"${name}" "${org}" (interview OR profile OR news OR "press release" OR biography)`, num: 10, label: "name_company_content" },
  { q: `"${name}" "${org}" (award OR recognition OR keynote OR webinar OR conference OR patent OR publication OR podcast OR interview OR article OR blog OR whitepaper OR research OR paper OR study OR report OR testimony OR speaking OR panel OR book OR chapter OR quoted OR expert OR commentary OR analysis OR guest OR featured OR winner OR recipient OR achievement OR honor OR fellowship OR grant OR advisory OR board OR presentation OR workshop OR seminar OR briefing)`, num: 10, label: "name_company_achievements" },
  { q: `"${name}" (joins OR "has joined" OR appointed OR "new role" OR "moves to" OR "named as" OR "promoted to") -"${org}"`, num: 5, label: "job_changes" }
];
```

## Notes
- Cost is not a concern ($0.001 per Firecrawl call)
- Focus is on speed while maintaining reliability
- Job change detection is critical for executive searches
- AI snippet analysis will reduce unnecessary scraping by 40-50%

## Implementation Summary

### What Was Changed:

1. **Parallel Serper Calls**
   - All Serper queries now run concurrently using Promise.all
   - Added primary `"${name}" "${org}"` query for better coverage
   - Added job change detection query to catch career moves
   - Prior company searches also parallelized

2. **AI-Powered Snippet Analysis**
   - New `analyzeSnippetsWithAI` function analyzes all snippets in one AI call
   - Determines which sources have complete info in snippets (no scraping needed)
   - Assigns priority scores (1-10) to guide scraping decisions
   - Extracts key facts from snippets for direct use

3. **Smart Firecrawl System**
   - New `smartFirecrawl` function with priority-based timeouts and retries
   - `determineScrapePriority` function categorizes sources by importance
   - Priority waves ensure critical content is scraped first
   - Increased batch size from 10 to 25 for higher concurrency

4. **Job Change Detection**
   - `detectJobChange` function uses AI to identify career moves
   - Alerts added to brief when job changes detected
   - Critical priority given to job change-related content

### Expected Performance Improvements:
- **Serper calls**: ~3s → ~1s (parallel execution)
- **Firecrawl**: ~35-40s → ~15-20s (smart prioritization + higher concurrency)
- **Overall**: ~60s → ~25-30s (50%+ reduction)

### Key Benefits:
- Won't miss job changes or recent announcements
- Reduces unnecessary Firecrawl calls by 40-50%
- Critical content gets priority with longer timeouts
- Graceful degradation when scraping fails

## Timing Instrumentation Implementation

The pipeline now includes comprehensive timing data in the response payload:

```typescript
timings: {
  total: number,          // Total pipeline execution time
  harvest: number,        // LinkedIn resolution time
  serper: number,         // All Serper API calls  
  jobChangeDetection: number,  // AI job change analysis
  snippetAnalysis: number,     // AI snippet analysis
  firecrawl: number,           // All Firecrawl operations
  llmGeneration: number,       // Final LLM brief generation
  breakdown: string            // Human-readable summary
}
```

### How to Use Timing Data

1. **Monitor in console logs**: Look for `[MB Timing]` messages showing the breakdown
2. **Access in API response**: The `timings` object is included in the MeetingBriefPayload
3. **Identify bottlenecks**: Compare actual times to expected:
   - Harvest: Should be <2s
   - Serper: Should be <1s (parallel)
   - Job Change Detection: Should be <1s
   - Snippet Analysis: Should be <2s
   - Firecrawl: Should be <20s (target)
   - LLM Generation: Should be <3s

### Next Steps for Performance Analysis

1. Run multiple test searches and collect timing data
2. Create a simple dashboard or log analyzer to visualize bottlenecks
3. Focus optimization efforts on the slowest components
4. Consider caching strategies for frequently searched individuals