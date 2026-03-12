"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { MessageSummary } from "@/lib/email/types";
import { SearchBar } from "./SearchBar";
import { MailToolbar } from "./MailToolbar";
import { MailList } from "./MailList";
import { MailListSkeleton } from "./MailListSkeleton";

interface Props {
  folder: string;
  page: number;
  query: string;
}

const LIMIT = 50;

type Tab = "all" | "urgent" | "needs-response" | "todo";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All Mail" },
  { id: "urgent", label: "Urgent" },
  { id: "needs-response", label: "Needs Response" },
  { id: "todo", label: "To-do List" },
];

const URGENT_KEYWORDS = ["urgent", "asap", "immediate", "action required", "deadline", "critical", "important", "time sensitive"];
const NEEDS_RESPONSE_KEYWORDS = ["please respond", "reply", "let me know", "can you", "could you", "please confirm", "awaiting your", "waiting for your", "please advise", "get back to me", "please reply"];
const TODO_KEYWORDS = ["todo", "to do", "to-do", "task", "action item", "follow up", "follow-up", "reminder", "due", "by eod", "by cob", "please complete", "please review", "please send"];

function matchesKeywords(msg: MessageSummary, keywords: string[]): boolean {
  const text = `${msg.subject} ${msg.snippet}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

function filterByTab(messages: MessageSummary[], tab: Tab): MessageSummary[] {
  switch (tab) {
    case "urgent":        return messages.filter((m) => matchesKeywords(m, URGENT_KEYWORDS));
    case "needs-response": return messages.filter((m) => matchesKeywords(m, NEEDS_RESPONSE_KEYWORDS));
    case "todo":          return messages.filter((m) => matchesKeywords(m, TODO_KEYWORDS));
    default:              return messages;
  }
}

export function MailListContainer({ folder, page, query }: Props) {
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const params = new URLSearchParams({
        folder,
        limit: String(LIMIT),
        offset: String((page - 1) * LIMIT),
      });
      if (query) params.set("query", query);
      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [folder, page, query]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSelect = (id: string, sel: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (sel) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () =>
    setSelectedIds(new Set(messages.map((m) => m.id)));
  const handleDeselectAll = () => setSelectedIds(new Set());

  const handleDelete = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete");
      fetchMessages();
    }
  };

  const handleArchive = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      toast.success("Archived");
    } catch {
      toast.error("Failed to archive");
      fetchMessages();
    }
  };

  const handleMarkRead = async (id: string, isRead: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: !isRead } : m))
    );
    try {
      await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", isRead }),
      });
    } catch {
      toast.error("Failed to update");
      fetchMessages();
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    setSelectedIds(new Set());
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/messages/${id}`, { method: "DELETE" }))
      );
      toast.success(`Deleted ${ids.length} messages`);
    } catch {
      toast.error("Some deletes failed");
      fetchMessages();
    }
  };

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    setSelectedIds(new Set());
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "archive" }),
          })
        )
      );
      toast.success(`Archived ${ids.length} messages`);
    } catch {
      toast.error("Some archives failed");
      fetchMessages();
    }
  };

  const handleBulkMarkRead = async () => {
    const ids = Array.from(selectedIds);
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, unread: false } : m))
    );
    setSelectedIds(new Set());
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "markRead", isRead: true }),
          })
        )
      );
    } catch {
      toast.error("Some updates failed");
      fetchMessages();
    }
  };

  const displayedMessages = filterByTab(
    showUnreadOnly ? messages.filter((m) => m.unread) : messages,
    activeTab
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Search bar */}
      <div className="flex justify-center px-4 py-3 border-b border-gray-100">
        <SearchBar folder={folder} initialQuery={query} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <MailToolbar
        folder={folder}
        page={page}
        total={total}
        limit={LIMIT}
        onRefresh={fetchMessages}
        selectedCount={selectedIds.size}
        totalCount={displayedMessages.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        onBulkMarkRead={handleBulkMarkRead}
        showUnreadOnly={showUnreadOnly}
        onToggleUnread={() => setShowUnreadOnly(!showUnreadOnly)}
      />

      {/* Message list */}
      {loading ? (
        <MailListSkeleton />
      ) : (
        <MailList
          messages={displayedMessages}
          folder={folder}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
