export const metadata = {
  title: "Terms of Service - MeetingBrief",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        
        <div className="space-y-4">
          <div>
            <p><strong>Effective Date:</strong> June 1, 2024</p>
            <p><strong>Entity:</strong> Simple Apps, LLC DBA BriefStack</p>
          </div>

          <p>
            By accessing or using MeetingBrief (&quot;Service&quot;), you agree to the following 
            Terms of Service. If you do not agree, do not use the Service.
          </p>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Use of Service</h2>
            <p>You may use MeetingBrief for lawful purposes only. You are responsible for any content you submit. You agree not to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Scrape, reverse engineer, or interfere with the Service</li>
              <li>Submit false, misleading, or unlawful content</li>
              <li>Attempt to breach or circumvent security measures</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. No Warranty</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind, express or implied, 
              including fitness for a particular purpose and non-infringement. We do not guarantee the 
              accuracy or completeness of generated content.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
              special, or consequential damages, or loss of profits, data, or use.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Simple Apps, LLC and its affiliates from any claims 
              or damages resulting from your use of the Service or violation of these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
            <p>
              All intellectual property rights in the Service are owned by or licensed to BriefStack. 
              You retain ownership of any data you submit but grant us a license to use it solely to 
              operate the Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time for violation of these 
              terms or abuse of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Modifications</h2>
            <p>
              We may update these terms at any time. Continued use of the Service after changes take 
              effect constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of Wyoming, without regard to conflict 
              of law principles. Any disputes must be resolved in the state or federal courts located 
              in Wyoming.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact</h2>
            <p>For support:</p>
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
