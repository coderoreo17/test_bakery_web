"use client";

export default function TermsPage() {
  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

        <p className="text-gray-600 mb-4">
          By using our website, you agree to the following terms and conditions.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Orders & Payments</h2>
        <p className="text-gray-600">
          All orders must be paid in full or confirmed based on selected payment
          method.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">
          Product Availability
        </h2>
        <p className="text-gray-600">
          We reserve the right to cancel orders due to product unavailability.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">
          Pickup Responsibility
        </h2>
        <p className="text-gray-600">
          Customers must collect orders at the selected pickup time.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Pricing & Changes</h2>
        <p className="text-gray-600">Prices may change without prior notice.</p>

        <h2 className="font-semibold text-lg mt-6 mb-2">
          Limitation of Liability
        </h2>
        <p className="text-gray-600">
          We are not liable for delays caused by unforeseen circumstances.
        </p>
      </div>
    </div>
  );
}
