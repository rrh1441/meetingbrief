#!/usr/bin/env tsx

// Script to analyze MeetingBrief performance timing data
// Usage: npm run analyze-performance

interface TimingData {
  total: number;
  harvest: number;
  serper: number;
  jobChangeDetection: number;
  snippetAnalysis: number;
  firecrawl: number;
  llmGeneration: number;
  breakdown: string;
}

interface TestCase {
  name: string;
  org: string;
  timestamp: Date;
  timings?: TimingData;
  error?: string;
}

async function testBriefGeneration(name: string, org: string): Promise<TestCase> {
  console.log(`\n🔍 Testing: ${name} at ${org}`);
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/meetingbrief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, org }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    return {
      name,
      org,
      timestamp: new Date(),
      timings: data.timings || {
        total: totalTime,
        harvest: 0,
        serper: 0,
        jobChangeDetection: 0,
        snippetAnalysis: 0,
        firecrawl: 0,
        llmGeneration: 0,
        breakdown: `No timing data available - Total: ${totalTime}ms`
      }
    };
  } catch (error) {
    return {
      name,
      org,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

function analyzeResults(results: TestCase[]) {
  console.log('\n\n📊 PERFORMANCE ANALYSIS RESULTS\n');
  console.log('=' .repeat(80));
  
  const successfulTests = results.filter(r => r.timings && !r.error);
  
  if (successfulTests.length === 0) {
    console.log('❌ No successful tests to analyze');
    return;
  }
  
  // Individual test results
  console.log('\n🎯 Individual Test Results:\n');
  results.forEach((test, idx) => {
    console.log(`${idx + 1}. ${test.name} at ${test.org}`);
    if (test.error) {
      console.log(`   ❌ Error: ${test.error}`);
    } else if (test.timings) {
      console.log(`   ✅ Total: ${formatTime(test.timings.total)}`);
      console.log(`   📝 Breakdown: ${test.timings.breakdown}`);
    }
    console.log();
  });
  
  // Average timings
  console.log('\n📈 Average Timings (successful tests only):\n');
  const avgTimings: TimingData = {
    total: 0,
    harvest: 0,
    serper: 0,
    jobChangeDetection: 0,
    snippetAnalysis: 0,
    firecrawl: 0,
    llmGeneration: 0,
    breakdown: ''
  };
  
  successfulTests.forEach(test => {
    if (test.timings) {
      avgTimings.total += test.timings.total;
      avgTimings.harvest += test.timings.harvest;
      avgTimings.serper += test.timings.serper;
      avgTimings.jobChangeDetection += test.timings.jobChangeDetection;
      avgTimings.snippetAnalysis += test.timings.snippetAnalysis;
      avgTimings.firecrawl += test.timings.firecrawl;
      avgTimings.llmGeneration += test.timings.llmGeneration;
    }
  });
  
  const count = successfulTests.length;
  Object.keys(avgTimings).forEach(key => {
    if (key !== 'breakdown' && typeof avgTimings[key as keyof TimingData] === 'number') {
      (avgTimings as any)[key] = Math.round((avgTimings as any)[key] / count);
    }
  });
  
  console.log(`Total Average: ${formatTime(avgTimings.total)}`);
  console.log(`├─ Harvest (LinkedIn): ${formatTime(avgTimings.harvest)} (${((avgTimings.harvest / avgTimings.total) * 100).toFixed(1)}%)`);
  console.log(`├─ Serper (Search): ${formatTime(avgTimings.serper)} (${((avgTimings.serper / avgTimings.total) * 100).toFixed(1)}%)`);
  console.log(`├─ Job Change Detection: ${formatTime(avgTimings.jobChangeDetection)} (${((avgTimings.jobChangeDetection / avgTimings.total) * 100).toFixed(1)}%)`);
  console.log(`├─ Snippet Analysis: ${formatTime(avgTimings.snippetAnalysis)} (${((avgTimings.snippetAnalysis / avgTimings.total) * 100).toFixed(1)}%)`);
  console.log(`├─ Firecrawl (Scraping): ${formatTime(avgTimings.firecrawl)} (${((avgTimings.firecrawl / avgTimings.total) * 100).toFixed(1)}%)`);
  console.log(`└─ LLM Generation: ${formatTime(avgTimings.llmGeneration)} (${((avgTimings.llmGeneration / avgTimings.total) * 100).toFixed(1)}%)`);
  
  // Performance vs targets
  console.log('\n🎯 Performance vs Targets:\n');
  const targets = {
    total: 30000, // 30s target
    harvest: 2000,
    serper: 1000,
    jobChangeDetection: 1000,
    snippetAnalysis: 2000,
    firecrawl: 20000,
    llmGeneration: 3000
  };
  
  Object.entries(targets).forEach(([key, target]) => {
    const actual = avgTimings[key as keyof TimingData] as number;
    const diff = actual - target;
    const status = diff <= 0 ? '✅' : '⚠️';
    const sign = diff > 0 ? '+' : '';
    console.log(`${status} ${key}: ${formatTime(actual)} (target: ${formatTime(target)}, ${sign}${formatTime(Math.abs(diff))})`);
  });
  
  // Bottleneck analysis
  console.log('\n🔍 Bottleneck Analysis:\n');
  const components = [
    { name: 'Firecrawl', time: avgTimings.firecrawl },
    { name: 'Harvest', time: avgTimings.harvest },
    { name: 'LLM Generation', time: avgTimings.llmGeneration },
    { name: 'Snippet Analysis', time: avgTimings.snippetAnalysis },
    { name: 'Serper', time: avgTimings.serper },
    { name: 'Job Change Detection', time: avgTimings.jobChangeDetection },
  ].sort((a, b) => b.time - a.time);
  
  console.log('Components by time consumed:');
  components.forEach((comp, idx) => {
    const percentage = ((comp.time / avgTimings.total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(parseFloat(percentage) / 2));
    console.log(`${idx + 1}. ${comp.name.padEnd(20)} ${formatTime(comp.time).padEnd(8)} ${percentage.padStart(5)}% ${bar}`);
  });
}

// Test cases
async function runTests() {
  console.log('🚀 Starting MeetingBrief Performance Analysis...');
  console.log('Note: Make sure your MeetingBrief API is running on localhost:3000\n');
  
  const testCases = [
    { name: 'Satya Nadella', org: 'Microsoft' },
    { name: 'Tim Cook', org: 'Apple' },
    { name: 'Sundar Pichai', org: 'Google' },
    { name: 'Ryan Heger', org: 'Flashpoint' },
    { name: 'Ashish Kumbhat', org: 'Bank of America' },
  ];
  
  const results: TestCase[] = [];
  
  for (const testCase of testCases) {
    const result = await testBriefGeneration(testCase.name, testCase.org);
    results.push(result);
    
    // Add a small delay between tests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  analyzeResults(results);
}

// Run the tests
runTests().catch(console.error);