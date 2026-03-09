"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ComposeModal } from "./ComposeModal";
import { useRouter } from "next/navigation";

interface Props {
  folder: string;
  showCompose: boolean;
  children: React.ReactNode;
}

export function MailLayout({ folder, showCompose, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const closeCompose = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("compose");
    router.push(url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : ""));
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentFolder={folder}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      {showCompose && <ComposeModal onClose={closeCompose} />}
    </div>
  );
}
