export const metadata = {
  title: "Privacy Policy - MeetingBrief",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        
        <div className="space-y-4">
          <div>
            <p><strong>Effective Date:</strong> June 1, 2024</p>
            <p><strong>Entity:</strong> Simple Apps, LLC DBA BriefStack</p>
          </div>

          <p>
            BriefStack (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the MeetingBrief
            service. This Privacy Policy explains how we collect, use, and protect the information you 
            provide when using MeetingBrief.
          </p>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect the information you choose to submit, such as:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Names</li>
              <li>Job titles</li>
              <li>Organizations</li>
              <li>Meeting topics</li>
              <li>Email addresses</li>
            </ul>
            <p className="mt-2">This data is used solely to generate meeting briefs and improve the service.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Data Usage</h2>
            <p>We do not sell or share your personal data with third parties for marketing purposes. Your data is used to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Generate meeting briefs</li>
              <li>Operate and improve MeetingBrief</li>
              <li>Support your user experience</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Retention</h2>
            <p>
              By default, submitted data is retained indefinitely. You may configure your account to 
              automatically delete data after 7 or 30 days. You can also request deletion at any time 
              by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Service Providers</h2>
            <p>
              We use third-party infrastructure and service providers to operate MeetingBrief. These 
              providers may process and store your data on our behalf. They are contractually required 
              to protect it and are only permitted to use it to provide services to us.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Analytics and Tracking</h2>
            <p>
              We may use analytics services (such as Google Analytics or similar) to understand usage 
              patterns and improve the platform. These services may use cookies or other tracking technologies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Security</h2>
            <p>We implement industry-standard security measures to protect your data, including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>HTTPS encryption in transit</li>
              <li>Authentication controls</li>
              <li>Access restrictions for administrative systems</li>
              <li>Regular software patching</li>
            </ul>
            <p className="mt-2">
              However, no system is completely secure. By using MeetingBrief, you acknowledge this risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
            <p>You may request to access, correct, or delete your data at any time by contacting us.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact</h2>
            <p>For privacy questions or data requests:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Email: <a href="mailto:ryan@meetingbrief.com" className="text-blue-600 underline">ryan@meetingbrief.com</a></li>
              <li>Phone: <a href="tel:+12064573039" className="text-blue-600 underline">(206) 457-3039</a></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
