"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Reply,
  Archive,
  Trash2,
  CheckSquare,
  CalendarPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { FullMessage, Thread } from "@/lib/email/types";
import { ThreadView } from "./ThreadView";

interface Props {
  threadId: string;
  folder: string;
}

const CATEGORY_STORAGE_KEY = "mail-category-overrides-v1";

export function ThreadViewContainer({ threadId, folder }: Props) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<FullMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/threads/${threadId}`)
      .then((r) => r.json())
      .then((data) => {
        setThread(data.thread);
        setMessages(data.messages ?? []);
        
        // Mark all unread messages as read
        const unreadMessages = (data.messages ?? []).filter((msg: FullMessage) => msg.unread);
        unreadMessages.forEach((msg: FullMessage) => {
          fetch(`/api/messages/${msg.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "markRead", isRead: true }),
          }).catch(console.error);
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [threadId]);

  const handleReply = () => {
    toast("Reply flow coming soon");
  };

  const handleArchive = () => {
    toast("Archive action coming soon");
  };

  const handleDelete = () => {
    toast("Delete action coming soon");
  };

  const handleAddToTodo = () => {
    if (messages.length === 0) {
      toast("No messages available to categorize");
      return;
    }

    try {
      const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      const next = { ...existing };

      messages.forEach((msg) => {
        next[msg.id] = "todo";
      });

      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next));
      toast.success("Added to To-do category");
    } catch {
      toast.error("Failed to update To-do category");
    }
  };

  const handleAddToCalendar = () => {
    toast("Google Calendar integration coming soon");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-xl shadow-sm">
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
        <button
          onClick={() => router.push(`/mail/${folder}`)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={handleReply}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title="Reply"
            aria-label="Reply"
          >
            <Reply size={18} />
          </button>
          <button
            onClick={handleArchive}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title="Archive"
            aria-label="Archive"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600"
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <h2 className="text-base font-medium text-gray-800 truncate">
          {thread?.subject ?? "Loading..."}
        </h2>

        <div className="flex-1" />

        <button
          onClick={handleAddToTodo}
          className="flex items-center gap-2 bg-[#1a73e8] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#1765cc] transition-colors"
        >
          <CheckSquare size={16} />
          Add to To-Do
        </button>

        <button
          onClick={handleAddToCalendar}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          <CalendarPlus size={16} />
          Add to Calendar
        </button>
      </div>
      {loading ? (
        <div className="flex-1 p-8 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2 border rounded-lg p-4">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-100 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <ThreadView messages={messages} />
      )}
    </div>
  );
}
