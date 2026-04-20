"use client";

export default function PrivacyPolicy() {
  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="text-gray-600 mb-4">
          We value your privacy and are committed to protecting your personal
          information. This policy explains how we collect, use, and safeguard
          your data.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">
          Information We Collect
        </h2>
        <p className="text-gray-600">
          We collect your name, email, phone number, and address when you place
          an order or create an account.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">
          How We Use Information
        </h2>
        <p className="text-gray-600">
          Your information is used only to process orders, improve services, and
          communicate order updates.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Data Protection</h2>
        <p className="text-gray-600">
          We implement security measures to protect your personal information.
          We do not sell or share your data with third parties.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Contact Information</h2>
        <p className="text-gray-600">
          For any privacy-related concerns, please contact us.
        </p>
      </div>
    </div>
  );
}
