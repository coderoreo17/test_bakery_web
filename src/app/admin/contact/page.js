"use client";

import { useEffect, useState } from "react";

export default function AdminContactPage() {
  const [messages, setMessages] = useState([]);
  const [showStarred, setShowStarred] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    const res = await fetch("/api/contact");
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectedMessage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  });

  const updateMessage = async (id, type) => {
    await fetch("/api/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    fetchMessages();
  };

  const deleteMessage = async (id) => {
    await fetch("/api/contact", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchMessages();
  };

  const filteredMessages = showStarred
    ? messages.filter((msg) => msg.isStarred)
    : messages;

  return (
    <div className="p-8 relative">
      <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>

      {/* ⭐ Toggle Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowStarred(!showStarred)}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer ${
            showStarred
              ? "bg-yellow-400 text-black"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {showStarred ? "Show All Messages" : "Show Starred"}
        </button>
      </div>

      {filteredMessages.length === 0 ? (
        <p className="text-gray-500">No messages found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMessages.map((msg) => {
            const isLong = msg.message.length > 70;
            const subject =
              msg.subject.length > 30
                ? msg.subject.slice(0, 30) + "..."
                : msg.subject;
            const shortMessage = isLong
              ? msg.message.slice(0, 70) + "..."
              : msg.message;

            return (
              <div
                key={msg._id}
                className="p-6 rounded-xl shadow bg-white border transition hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">{msg.name}</h2>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>

                  {/* ⭐ Star */}
                  <button
                    onClick={() => updateMessage(msg._id, "star")}
                    className={`text-2xl cursor-pointer ${
                      msg.isStarred ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                </div>
                <h2 className="font-medium mb-1">Subject: {subject}</h2>

                {/* Clickable Message */}
                <p
                  onClick={() => setSelectedMessage(msg)}
                  className="text-black text-sm mb-4 cursor-pointer hover:underline"
                >
                  {shortMessage}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${
                        msg.subject || ""
                      }`}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition"
                    >
                      Reply
                    </a>

                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔵 MODAL */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={() => setSelectedMessage(null)} // click outside closes
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            className="bg-primary text-white p-8 rounded-2xl max-w-lg w-full shadow-2xl relative transform transition-all duration-300 scale-100 opacity-100 animate-modal"
          >
            {/* X Button */}
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-5 text-white text-2xl hover:scale-110 transition cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {selectedMessage.subject || "Message"}
            </h2>

            <p className="mb-6 whitespace-pre-wrap leading-relaxed">
              {selectedMessage.message}
            </p>

            <div className="text-sm opacity-80 border-t border-white/30 pt-4">
              From: {selectedMessage.name} ({selectedMessage.email})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
