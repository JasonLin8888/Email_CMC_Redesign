import { Suspense } from "react";
import { MailLayout } from "@/components/MailLayout";
import { ThreadViewContainer } from "@/components/ThreadViewContainer";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ folder?: string; compose?: string }>;
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { folder: rawFolder, compose } = await searchParams;

  const folder = rawFolder ?? "all";
  const showCompose = compose === "1";

  return (
    <MailLayout folder={folder} showCompose={showCompose}>
      <Suspense fallback={<div className="p-8 text-gray-500">Loading thread...</div>}>
        <ThreadViewContainer threadId={id} folder={folder} />
      </Suspense>
    </MailLayout>
  );
}
