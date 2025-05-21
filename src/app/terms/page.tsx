export const metadata = {
  title: "Terms of Service - MeetingBrief",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p>
          By accessing or using MeetingBrief, you agree to these terms. IntelEngine
          provides this service &quot;as is&quot; without warranties of any kind.
        </p>
        <p>
          You are responsible for any content you submit. We do not guarantee the accuracy of information provided and are not liable for any damages arising from use of the service.
        </p>
        <p>
          We may update these terms at any time. Continued use constitutes acceptance of the revised terms.
        </p>
        <p>
          For support, email <a href="mailto:ryan@meetingbrief.com" className="text-blue-600 underline">ryan@meetingbrief.com</a> or call
          <a href="tel:+12064573039" className="text-blue-600 underline">(206) 457-3039</a>.
        </p>
        <p>Effective date: June 1, 2024.</p>
      </main>
    </div>
  );
}
