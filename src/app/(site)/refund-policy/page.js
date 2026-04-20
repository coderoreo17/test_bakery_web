"use client";

export default function RefundPolicy() {
  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>

        <p className="text-gray-600 mb-4">
          We aim to provide the best quality products. Due to the perishable
          nature of bakery items, refunds are limited.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Order Cancellation</h2>
        <p className="text-gray-600">
          Orders can be cancelled before preparation begins. Once preparation
          has started, cancellation may not be possible.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Refund Eligibility</h2>
        <p className="text-gray-600">
          Refunds will be provided if the order is not fulfilled due to our
          inability to process it.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">
          Non-refundable Cases
        </h2>
        <p className="text-gray-600">
          No refunds will be issued for taste preferences or minor design
          variations.
        </p>

        <h2 className="font-semibold text-lg mt-6 mb-2">Refund Processing</h2>
        <p className="text-gray-600">
          Approved refunds will be processed within 5-7 business days.
        </p>
      </div>
    </div>
  );
}
