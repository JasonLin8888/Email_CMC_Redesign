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

function getRequiredEnv(name: "NYLAS_API_KEY" | "NYLAS_GRANT_ID" | "NYLAS_DEFAULT_FROM_EMAIL"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const NYLAS_API_KEY = getRequiredEnv("NYLAS_API_KEY");
const NYLAS_GRANT_ID = getRequiredEnv("NYLAS_GRANT_ID");
const NYLAS_DEFAULT_FROM_EMAIL = getRequiredEnv("NYLAS_DEFAULT_FROM_EMAIL");
const NYLAS_API_BASE_URL = process.env.NYLAS_API_BASE_URL ?? "https://api.us.nylas.com";
const NYLAS_DEFAULT_FROM_NAME = process.env.NYLAS_DEFAULT_FROM_NAME;

const nylas = new Nylas({
  apiKey: NYLAS_API_KEY,
  apiUri: NYLAS_API_BASE_URL,
});

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

  // Map UI folder names to Nylas folder names
  if (folder && folder !== "all") {
    const folderMap: Record<string, string> = {
      inbox: "INBOX",
      sent: "SENT",
      trash: "TRASH",
    };
    queryParams["in"] = folderMap[folder.toLowerCase()] || folder;
  }
  
  // Use broader search across subject, body, and participants
  if (query) {
    queryParams["search_query_native"] = query;
  }

  try {
    const response = await nylas.messages.list({
      identifier: NYLAS_GRANT_ID,
      queryParams: queryParams as Parameters<typeof nylas.messages.list>[0]["queryParams"],
    });

    // Sort by date descending (most recent first) on the client side
    const messages = (response.data ?? [])
      .map(mapMessage)
      .sort((a, b) => b.date - a.date);
    
    // Don't set a total count since Nylas API doesn't reliably provide it
    // The UI will handle pagination without knowing the exact total
    return { messages, total: undefined };
  } catch (err) {
    console.error("listMessages error:", err);
    return { messages: [] };
  }
}

export async function getMessage(messageId: string): Promise<FullMessage | null> {
  try {
    const response = await nylas.messages.find({
      identifier: NYLAS_GRANT_ID,
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
      identifier: NYLAS_GRANT_ID,
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
      identifier: NYLAS_GRANT_ID,
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
    identifier: NYLAS_GRANT_ID,
    requestBody: {
      to: params.to,
      from: [params.from],
      subject: params.subject,
      body: params.body,
      cc: params.cc,
      bcc: params.bcc,
    },
  });
}

export function getDefaultFromAddress(): EmailAddress {
  return {
    email: NYLAS_DEFAULT_FROM_EMAIL,
    name: NYLAS_DEFAULT_FROM_NAME,
  };
}

export async function deleteMessage(messageId: string): Promise<void> {
  await nylas.messages.destroy({
    identifier: NYLAS_GRANT_ID,
    messageId,
  });
}

export async function archiveMessage(messageId: string): Promise<void> {
  try {
    await nylas.messages.update({
      identifier: NYLAS_GRANT_ID,
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
    identifier: NYLAS_GRANT_ID,
    messageId,
    requestBody: { unread: !isRead },
  });
}

export async function listLabels(): Promise<Label[]> {
  try {
    const response = await nylas.folders.list({
      identifier: NYLAS_GRANT_ID,
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
      identifier: NYLAS_GRANT_ID,
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

export async function updateLabel(labelId: string, name: string): Promise<Label | null> {
  try {
    const response = await nylas.folders.update({
      identifier: NYLAS_GRANT_ID,
      folderId: labelId,
      requestBody: { name },
    });
    const f = response.data;
    return {
      id: f.id,
      name: f.name,
      displayName: f.name,
    };
  } catch (err) {
    console.error("updateLabel error:", err);
    return null;
  }
}

export async function deleteLabel(labelId: string): Promise<void> {
  try {
    await nylas.folders.destroy({
      identifier: NYLAS_GRANT_ID,
      folderId: labelId,
    });
  } catch (err) {
    console.error("deleteLabel error:", err);
    throw err;
  }
}
