"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FullMessage, Thread } from "@/lib/email/types";
import { ThreadView } from "./ThreadView";
import { Toaster } from "react-hot-toast";

interface Props {
  threadId: string;
  folder: string;
}

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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [threadId]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Toaster position="top-right" />
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={() => router.push(`/mail/${folder}`)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-base font-medium text-gray-800 truncate">
          {thread?.subject ?? "Loading..."}
        </h2>
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
