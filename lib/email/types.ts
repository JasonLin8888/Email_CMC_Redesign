export interface EmailAddress {
  name?: string;
  email: string;
}

export interface MessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  cc?: EmailAddress[];
  snippet: string;
  date: number; // Unix timestamp
  unread: boolean;
  starred: boolean;
  labels: string[];
  folders: string[];
  hasAttachment: boolean;
}

export interface Thread {
  id: string;
  subject: string;
  participants: EmailAddress[];
  messageIds: string[];
  latestDraftOrSentAt: number;
  snippet: string;
  unread: boolean;
  starred: boolean;
  labels: string[];
  folders: string[];
  hasAttachment: boolean;
}

export interface FullMessage {
  id: string;
  threadId: string;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  date: number;
  unread: boolean;
  starred: boolean;
  labels: string[];
  folders: string[];
  snippet: string;
  body: string;
  hasAttachment: boolean;
}

export interface Label {
  id: string;
  name: string;
  displayName: string;
  color?: string;
}

export interface Folder {
  id: string;
  name: string;
  displayName: string;
  totalCount?: number;
  unreadCount?: number;
}

export interface ListMessagesParams {
  folder?: string;
  limit?: number;
  offset?: number;
  query?: string;
}

export interface SendMessageParams {
  to: EmailAddress[];
  from: EmailAddress;
  subject: string;
  body: string;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
}

export interface ListMessagesResult {
  messages: MessageSummary[];
  total?: number;
}
