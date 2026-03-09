import { Suspense } from "react";
import { MailLayout } from "@/components/MailLayout";
import { ThreadViewContainer } from "@/components/ThreadViewContainer";

interface Props {
  params: { id: string };
  searchParams: { folder?: string; compose?: string };
}

export default function ThreadPage({ params, searchParams }: Props) {
  const folder = searchParams.folder ?? "all";
  const showCompose = searchParams.compose === "1";

  return (
    <MailLayout folder={folder} showCompose={showCompose}>
      <Suspense fallback={<div className="p-8 text-gray-500">Loading thread...</div>}>
        <ThreadViewContainer threadId={params.id} folder={folder} />
      </Suspense>
    </MailLayout>
  );
}
