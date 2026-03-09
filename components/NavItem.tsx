"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  open: boolean;
  onClick: () => void;
}

export function NavItem({ icon: Icon, label, selected, open, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 py-2 transition-colors text-sm font-medium
        ${open ? "w-[90%] mx-auto px-3" : "w-10 mx-auto px-2 justify-center"}
        ${
          selected
            ? "bg-blue-100 text-blue-800"
            : "text-gray-700 hover:bg-gray-200"
        }
        ${selected ? "rounded-l-2xl rounded-r-full" : "rounded-xl"}
      `}
    >
      <Icon size={20} className="shrink-0" />
      {open && <span>{label}</span>}
    </button>
  );
}
