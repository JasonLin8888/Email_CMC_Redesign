"use client";

import { useRouter } from "next/navigation";
import {
  Menu,
  Inbox,
  Send,
  Archive,
  Trash2,
  PenSquare,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { LabelsSection } from "./LabelsSection";

interface Props {
  open: boolean;
  onToggle: () => void;
  currentFolder: string;
}

const NAV_ITEMS = [
  { folder: "inbox", label: "Inbox", icon: Inbox },
  { folder: "all", label: "All Mail", icon: Archive },
  { folder: "sent", label: "Sent", icon: Send },
  { folder: "trash", label: "Trash", icon: Trash2 },
];

export function Sidebar({ open, onToggle, currentFolder }: Props) {
  const router = useRouter();

  const handleCompose = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("compose", "1");
    router.push(url.pathname + "?" + url.searchParams.toString());
  };

  return (
    <aside
      className={`flex flex-col bg-gray-50 h-full transition-all duration-200 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Hamburger */}
      <div className="p-3 flex items-center">
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Compose Button */}
      <div className={`px-2 mb-4 ${open ? "" : "flex justify-center"}`}>
        <button
          onClick={handleCompose}
          className={`flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-gray-800 rounded-2xl transition-colors ${
            open ? "w-[90%] mx-auto px-4 py-3" : "p-3"
          }`}
        >
          <PenSquare size={20} className="shrink-0" />
          {open && <span className="font-medium">Compose</span>}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ folder, label, icon }) => (
          <NavItem
            key={folder}
            icon={icon}
            label={label}
            selected={currentFolder === folder}
            open={open}
            onClick={() => router.push(`/mail/${folder}`)}
          />
        ))}
      </nav>

      {/* Labels */}
      {open && (
        <div className="mt-4 px-2">
          <LabelsSection />
        </div>
      )}
    </aside>
  );
}
