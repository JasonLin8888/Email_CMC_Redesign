"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Archive, Mail, MailOpen, CalendarPlus } from "lucide-react";
import { MessageSummary } from "@/lib/email/types";
import { formatDate } from "@/lib/utils";

interface Props {
  message: MessageSummary;
  folder: string;
  selected: boolean;
  onDragStart: (id: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkRead: (id: string, isRead: boolean) => void;
  onAddToCalendar: (id: string) => void;
}

export function MailRow({
  message,
  folder,
  selected,
  onDragStart,
  onSelect,
  onDelete,
  onArchive,
  onMarkRead,
  onAddToCalendar,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const senderName =
    message.from[0]?.name ?? message.from[0]?.email ?? "Unknown";

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-nav]")) return;
    router.push(`/mail/thread/${message.threadId}?folder=${folder}`);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", message.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(message.id);
      }}
      onClick={handleRowClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg mx-2 my-0.5 transition-all duration-100 border
        ${selected ? "bg-blue-50 border-blue-200" : message.unread ? "bg-white border-transparent font-semibold" : "bg-gray-50 border-transparent"}
        ${hovered ? "shadow-md -translate-y-px" : ""}
      `}
    >
      {/* Checkbox */}
      <div data-no-nav>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(message.id, e.target.checked)}
          className="cursor-pointer"
        />
      </div>

      {/* Sender */}
      <div className="w-40 shrink-0 truncate text-sm">{senderName}</div>

      {/* Subject */}
      <div className="w-48 shrink-0 truncate text-sm">{message.subject}</div>

      {/* Labels */}
      <div className="flex gap-1 shrink-0">
        {message.labels.slice(0, 2).map((l) => (
          <span
            key={l}
            className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full"
          >
            {l}
          </span>
        ))}
      </div>

      {/* Snippet */}
      <div className="flex-1 truncate text-sm text-gray-500 min-w-0">
        {message.snippet}
      </div>

      {/* Right side: time or actions */}
      <div className="ml-2 shrink-0 w-52 flex justify-end">
        {hovered ? (
          <div className="flex items-center gap-1" data-no-nav>
            <button
              onClick={() => onAddToCalendar(message.id)}
              className="h-7 px-2 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors flex items-center gap-1"
              title="Add to Calendar"
            >
              <CalendarPlus size={13} />
              Add to Calendar
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => onMarkRead(message.id, message.unread)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title={message.unread ? "Mark read" : "Mark unread"}
            >
              {message.unread ? <Mail size={15} /> : <MailOpen size={15} />}
            </button>
            <button
              onClick={() => onArchive(message.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="Archive"
            >
              <Archive size={15} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">{formatDate(message.date)}</span>
        )}
      </div>
    </div>
  );
}
