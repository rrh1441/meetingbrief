import { proxyCurlBackupPipeline, checkProxyCurlCredits } from './src/lib/ProxyCurlBackup';

async function testProxyCurlBackup() {
  console.log('Testing ProxyCurl backup system...');
  
  // Check credits first
  const credits = await checkProxyCurlCredits();
  console.log(`ProxyCurl credits available: ${credits ?? 'Unknown'}`);
  
  // Test the backup pipeline
  try {
    const result = await proxyCurlBackupPipeline('Bill Gates', 'Microsoft');
    console.log('ProxyCurl backup result:', {
      success: result.success,
      creditsUsed: result.creditsUsed,
      jobTimelineLength: result.jobTimeline.length,
      educationTimelineLength: result.educationTimeline.length,
      reason: result.reason,
      linkedinUrl: result.linkedinUrl
    });
    
    if (result.success) {
      console.log('Job timeline sample:', result.jobTimeline.slice(0, 3));
      console.log('Education timeline sample:', result.educationTimeline.slice(0, 2));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testProxyCurlBackup(); 