"use client";

import { useState, useEffect } from "react";
import { Tag, Plus } from "lucide-react";
import { Label } from "@/lib/email/types";

export function LabelsSection() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    fetch("/api/labels")
      .then((r) => r.json())
      .then(setLabels)
      .catch(console.error);
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
        <div
          key={label.id}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
        >
          <Tag size={14} className="text-blue-400" />
          {label.displayName}
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
