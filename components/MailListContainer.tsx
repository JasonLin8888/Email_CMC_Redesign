"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
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

export function MailListContainer({ folder, page, query }: Props) {
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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

  const displayedMessages = showUnreadOnly
    ? messages.filter((m) => m.unread)
    : messages;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Toaster position="top-right" />

      {/* Search bar */}
      <div className="flex justify-center px-4 py-3 border-b border-gray-100">
        <SearchBar folder={folder} initialQuery={query} />
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
