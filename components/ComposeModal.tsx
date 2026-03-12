"use client";

import { useState, useEffect } from "react";
import { X, Minus, Send } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  onClose: () => void;
}

export function ComposeModal({ onClose }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSend = async () => {
    if (!to || !subject) {
      toast.error("Please fill in recipient and subject");
      return;
    }
    setSending(true);
    try {
      const toAddresses = to.split(",").map((email) => ({
        email: email.trim(),
      }));
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toAddresses,
          subject,
          body,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Message sent!");
      onClose();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-[560px] bg-white shadow-2xl rounded-t-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-xl">
        <span className="text-white text-sm font-medium">New Message</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-gray-300 hover:text-white"
          >
            <Minus size={16} />
          </button>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* To */}
          <div className="border-b border-gray-200 px-4 py-2">
            <input
              type="email"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Subject */}
          <div className="border-b border-gray-200 px-4 py-2">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Body */}
          <textarea
            placeholder="Compose email..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-48 px-4 py-3 outline-none text-sm resize-none"
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              <Send size={14} />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
