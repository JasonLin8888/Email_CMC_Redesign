import { Suspense } from "react";
import { MailLayout } from "@/components/MailLayout";
import { MailListContainer } from "@/components/MailListContainer";

interface Props {
  params: { folder: string };
  searchParams: { page?: string; query?: string; compose?: string };
}

const VALID_FOLDERS = ["inbox", "sent", "all", "trash"];

export default function MailFolderPage({ params, searchParams }: Props) {
  const folder = VALID_FOLDERS.includes(params.folder) ? params.folder : "all";
  const page = parseInt(searchParams.page ?? "1");
  const query = searchParams.query ?? "";
  const showCompose = searchParams.compose === "1";

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
