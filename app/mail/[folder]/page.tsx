import { Suspense } from "react";
import { MailLayout } from "@/components/MailLayout";
import { MailListContainer } from "@/components/MailListContainer";

interface Props {
  params: Promise<{ folder: string }>;
  searchParams: Promise<{ page?: string; query?: string; compose?: string }>;
}

const VALID_FOLDERS = ["inbox", "sent", "all", "trash"];

export default async function MailFolderPage({ params, searchParams }: Props) {
  const { folder: rawFolder } = await params;
  const { page: rawPage, query: rawQuery, compose } = await searchParams;

  const folder = VALID_FOLDERS.includes(rawFolder) ? rawFolder : "all";
  const page = parseInt(rawPage ?? "1");
  const query = rawQuery ?? "";
  const showCompose = compose === "1";

  return (
    <MailLayout folder={folder} showCompose={showCompose}>
      <Suspense fallback={<div className="p-8 text-gray-500">Loading...</div>}>
        <MailListContainer
          folder={folder}
          page={page}
          query={query}
        />
      </Suspense>
    </MailLayout>
  );
}
