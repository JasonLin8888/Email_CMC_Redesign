"use client";

import { useState, useEffect, useRef } from "react";
import { Tag, Plus, MoreVertical } from "lucide-react";
import { Label } from "@/lib/email/types";

export function LabelsSection() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/labels")
      .then((r) => r.json())
      .then(setLabels)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const res = await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLabel }),
    });
    const label = await res.json();
    setLabels((l) => [...l, label]);
    setNewLabel("");
    setAdding(false);
  };

  const handleDelete = async (labelId: string) => {
    if (!confirm("Are you sure you want to delete this label?")) return;
    
    try {
      await fetch(`/api/labels/${labelId}`, { method: "DELETE" });
      setLabels((l) => l.filter((label) => label.id !== labelId));
      setMenuOpen(null);
    } catch (err) {
      console.error("Failed to delete label:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-3 mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Labels
        </span>
        <button
          onClick={() => setAdding(true)}
          className="p-1 hover:bg-gray-200 rounded-full"
          title="New Label"
        >
          <Plus size={14} />
        </button>
      </div>
      {labels.map((label) => (
        <div key={label.id} className="relative flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 rounded-lg hover:bg-gray-200 group">
          <Tag size={14} className="text-blue-400 shrink-0" />
          <span className="flex-1 truncate">{label.displayName}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(menuOpen === label.id ? null : label.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded-full transition-opacity shrink-0"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen === label.id && (
            <div
              ref={menuRef}
              className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-32"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(label.id);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {adding && (
        <div className="px-3 py-1.5 flex gap-1">
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="Label name"
          />
          <button
            onClick={handleAdd}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
