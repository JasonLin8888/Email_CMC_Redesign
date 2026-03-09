"use client";

import { FullMessage } from "@/lib/email/types";
import { formatDateFull } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

interface Props {
  messages: FullMessage[];
}

function MessageCard({ message }: { message: FullMessage }) {
  const senderName =
    message.from[0]?.name ?? message.from[0]?.email ?? "Unknown";
  const toStr = message.to.map((a) => a.name ?? a.email).join(", ");

  const safeHtml = DOMPurify.sanitize(message.body ?? "", {
    USE_PROFILES: { html: true },
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                {senderName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-sm">{senderName}</div>
                <div className="text-xs text-gray-500">
                  {message.from[0]?.email}
                </div>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">To: {toStr}</div>
          </div>
          <div className="text-xs text-gray-400">{formatDateFull(message.date)}</div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {message.body ? (
          <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <p className="text-gray-500 text-sm">(No body)</p>
        )}
      </div>
    </div>
  );
}

export function ThreadView({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No messages in this thread.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.map((msg) => (
        <MessageCard key={msg.id} message={msg} />
      ))}
    </div>
  );
}
