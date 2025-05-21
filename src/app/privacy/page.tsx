export const metadata = {
  title: "Privacy Policy - MeetingBrief",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p>IntelEngine ("we", "us", or "our") operates the MeetingBrief service.</p>
        <p>
          This policy explains how we handle information you provide when using
          our site. We may collect names, organizations and other details you
          enter solely to generate meeting briefs.
        </p>
        <p>
          We do not share or sell your personal data with third parties. We use
          the information only to deliver the requested service and improve our
          product. Information may be stored with our service providers who are
          contractually obligated to protect it.
        </p>
        <p>
          You may contact us at <a href="mailto:ryan@meetingbrief.com" className="text-blue-600 underline">ryan@meetingbrief.com</a> or call
          <a href="tel:+12064573039" className="text-blue-600 underline">(206) 457-3039</a> with any privacy questions.
        </p>
        <p>Effective date: June 1, 2024.</p>
      </main>
    </div>
  );
}
