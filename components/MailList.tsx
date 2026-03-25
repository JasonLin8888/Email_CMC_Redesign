"use client";

import { MessageSummary } from "@/lib/email/types";
import { MailRow } from "./MailRow";

interface Props {
  messages: MessageSummary[];
  folder: string;
  selectedIds: Set<string>;
  onDragStart: (id: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkRead: (id: string, isRead: boolean) => void;
  onAddToCalendar: (id: string) => void;
}

export function MailList({
  messages,
  folder,
  selectedIds,
  onDragStart,
  onSelect,
  onDelete,
  onArchive,
  onMarkRead,
  onAddToCalendar,
}: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No messages in this folder.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {messages.map((msg) => (
        <MailRow
          key={msg.id}
          message={msg}
          folder={folder}
          selected={selectedIds.has(msg.id)}
          onDragStart={onDragStart}
          onSelect={onSelect}
          onDelete={onDelete}
          onArchive={onArchive}
          onMarkRead={onMarkRead}
          onAddToCalendar={onAddToCalendar}
        />
      ))}
    </div>
  );
}
