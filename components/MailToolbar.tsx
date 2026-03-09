"use client";

import { RefreshCw, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  folder: string;
  page: number;
  total?: number;
  limit: number;
  onRefresh: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkMarkRead: () => void;
  showUnreadOnly: boolean;
  onToggleUnread: () => void;
}

const FOLDER_LABELS: Record<string, string> = {
  inbox: "Inbox",
  sent: "Sent",
  all: "All Mail",
  trash: "Trash",
};

export function MailToolbar({
  folder,
  page,
  total,
  limit,
  onRefresh,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkArchive,
  onBulkMarkRead,
  showUnreadOnly,
  onToggleUnread,
}: Props) {
  const router = useRouter();
  const folderLabel = FOLDER_LABELS[folder] ?? folder;
  const start = (page - 1) * limit + 1;
  const end = (page - 1) * limit + totalCount;
  const totalStr = total ? `of ${total.toLocaleString()}` : "of ?";

  const isFirstPage = page <= 1;
  const isLastPage = total ? end >= total : totalCount < limit;

  const goPage = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(p));
    router.push(`/mail/${folder}?${params.toString()}`);
  };

  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className="text-gray-600" />
        </button>
        <h1 className="text-base font-medium text-gray-800">{folderLabel}</h1>

        {/* Bulk actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1 ml-2">
            <span className="text-sm text-gray-500">{selectedCount} selected</span>
            <button
              onClick={onBulkMarkRead}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Mark Read
            </button>
            <button
              onClick={onBulkArchive}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Archive
            </button>
            <button
              onClick={onBulkDelete}
              className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              Delete
            </button>
          </div>
        )}

        {/* Unread filter */}
        <button
          onClick={onToggleUnread}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            showUnreadOnly
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unread only
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Select all */}
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <input
            type="checkbox"
            checked={allSelected}
            readOnly
            className="cursor-pointer"
          />
          <span className="text-xs">Select all</span>
        </button>

        {/* Pagination */}
        <span className="text-sm text-gray-500">
          {totalCount > 0 ? `${start}–${end}` : "0"} {totalStr}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goPage(page - 1)}
            disabled={isFirstPage}
            className={`p-1.5 rounded-full transition-colors ${
              isFirstPage
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Newer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goPage(page + 1)}
            disabled={isLastPage}
            className={`p-1.5 rounded-full transition-colors ${
              isLastPage
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Older"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Settings */}
        <button
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Settings"
        >
          <Settings size={18} className="text-gray-600" />
        </button>

        {/* Profile avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </div>
  );
}
