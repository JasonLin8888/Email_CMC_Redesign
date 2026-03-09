import Nylas from "nylas";
import {
  EmailAddress,
  FullMessage,
  Label,
  ListMessagesParams,
  ListMessagesResult,
  MessageSummary,
  SendMessageParams,
  Thread,
} from "./types";

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: process.env.NYLAS_API_BASE_URL ?? "https://api.nylas.com",
});

const GRANT_ID = process.env.NYLAS_GRANT_ID!;

function toEmailAddress(p: { name?: string; email: string }): EmailAddress {
  return { name: p.name, email: p.email };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(msg: any): MessageSummary {
  return {
    id: msg.id,
    threadId: msg.threadId ?? msg.thread_id ?? "",
    subject: msg.subject ?? "(no subject)",
    from: (msg.from ?? []).map(toEmailAddress),
    to: (msg.to ?? []).map(toEmailAddress),
    cc: (msg.cc ?? []).map(toEmailAddress),
    snippet: msg.snippet ?? "",
    date: msg.date ?? 0,
    unread: msg.unread ?? false,
    starred: msg.starred ?? false,
    labels: (msg.labels ?? []).map((l: { name?: string; id?: string }) => l.name ?? l.id ?? ""),
    folders: (msg.folders ?? []),
    hasAttachment: (msg.attachments ?? []).length > 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFullMessage(msg: any): FullMessage {
  return {
    ...mapMessage(msg),
    bcc: (msg.bcc ?? []).map(toEmailAddress),
    replyTo: (msg.replyTo ?? msg.reply_to ?? []).map(toEmailAddress),
    body: msg.body ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapThread(t: any): Thread {
  return {
    id: t.id,
    subject: t.subject ?? "(no subject)",
    participants: (t.participants ?? []).map(toEmailAddress),
    messageIds: t.messageIds ?? t.message_ids ?? [],
    latestDraftOrSentAt: t.latestDraftOrSentAt ?? t.latest_draft_or_sent_at ?? 0,
    snippet: t.snippet ?? "",
    unread: t.unread ?? false,
    starred: t.starred ?? false,
    labels: (t.labels ?? []).map((l: { name?: string; id?: string }) => l.name ?? l.id ?? ""),
    folders: t.folders ?? [],
    hasAttachment: t.hasAttachment ?? false,
  };
}

export async function listMessages(
  params: ListMessagesParams = {}
): Promise<ListMessagesResult> {
  const { folder, limit = 50, offset = 0, query } = params;

  const queryParams: Record<string, string | number | boolean> = {
    limit,
    offset,
  };

  if (folder && folder !== "all") {
    queryParams["in"] = folder;
  }
  if (query) {
    queryParams["subject"] = query;
  }

  try {
    const response = await nylas.messages.list({
      identifier: GRANT_ID,
      queryParams: queryParams as Parameters<typeof nylas.messages.list>[0]["queryParams"],
    });

    const messages = (response.data ?? []).map(mapMessage);
    return { messages, total: undefined };
  } catch (err) {
    console.error("listMessages error:", err);
    return { messages: [] };
  }
}

export async function getMessage(messageId: string): Promise<FullMessage | null> {
  try {
    const response = await nylas.messages.find({
      identifier: GRANT_ID,
      messageId,
    });
    return mapFullMessage(response.data);
  } catch (err) {
    console.error("getMessage error:", err);
    return null;
  }
}

export async function getThread(threadId: string): Promise<Thread | null> {
  try {
    const response = await nylas.threads.find({
      identifier: GRANT_ID,
      threadId,
    });
    return mapThread(response.data);
  } catch (err) {
    console.error("getThread error:", err);
    return null;
  }
}

export async function getThreadMessages(threadId: string): Promise<FullMessage[]> {
  try {
    const response = await nylas.messages.list({
      identifier: GRANT_ID,
      queryParams: { threadId, limit: 100 } as Parameters<typeof nylas.messages.list>[0]["queryParams"],
    });
    return (response.data ?? []).map(mapFullMessage);
  } catch (err) {
    console.error("getThreadMessages error:", err);
    return [];
  }
}

export async function sendMessage(params: SendMessageParams): Promise<void> {
  await nylas.messages.send({
    identifier: GRANT_ID,
    requestBody: {
      to: params.to,
      subject: params.subject,
      body: params.body,
      cc: params.cc,
      bcc: params.bcc,
    },
  });
}

export async function deleteMessage(messageId: string): Promise<void> {
  await nylas.messages.destroy({
    identifier: GRANT_ID,
    messageId,
  });
}

export async function archiveMessage(messageId: string): Promise<void> {
  try {
    await nylas.messages.update({
      identifier: GRANT_ID,
      messageId,
      requestBody: {
        unread: false,
        folders: ["all"],
      },
    });
  } catch (err) {
    console.error("archiveMessage error:", err);
  }
}

export async function markRead(
  messageId: string,
  isRead: boolean
): Promise<void> {
  await nylas.messages.update({
    identifier: GRANT_ID,
    messageId,
    requestBody: { unread: !isRead },
  });
}

export async function listLabels(): Promise<Label[]> {
  try {
    const response = await nylas.folders.list({
      identifier: GRANT_ID,
    });
    return (response.data ?? []).map((f: { id: string; name: string }) => ({
      id: f.id,
      name: f.name,
      displayName: f.name,
    }));
  } catch (err) {
    console.error("listLabels error:", err);
    return [];
  }
}

export async function createLabel(name: string): Promise<Label | null> {
  try {
    const response = await nylas.folders.create({
      identifier: GRANT_ID,
      requestBody: { name },
    });
    const f = response.data;
    return {
      id: f.id,
      name: f.name,
      displayName: f.name,
    };
  } catch (err) {
    console.error("createLabel error:", err);
    return null;
  }
}
