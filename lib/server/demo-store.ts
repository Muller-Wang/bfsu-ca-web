import "server-only";
import { USERS } from "@/lib/mock/users";
import {
  ANNOUNCEMENTS, ARCHIVE, EVENTS, FEED, IDEA_COMMENTS, IDEAS, LIAISONS, TASKS, TEMPLATES,
} from "@/lib/mock/data";
import type {
  Announcement, ArchiveItem, CalendarEvent, FeedItem, Idea, IdeaComment, LiaisonEntry, Task, Template, User,
} from "@/lib/types";

export interface CreditSummary {
  user: User;
  total: number;
  semester: number;
}

const clone = <T>(value: T): T => structuredClone(value);
const demoBase = Date.UTC(2026, 4, 21);
const today = new Date();
const demoNow = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
const offsetMs = demoNow - demoBase;

function shiftDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return new Date(date.getTime() + offsetMs).toISOString().slice(0, 10);
}

function shiftTimestamp(value: string) {
  return new Date(new Date(value).getTime() + offsetMs).toISOString();
}

export const demoStore = {
  users: clone(USERS),
  events: clone(EVENTS).map((event) => ({ ...event, date: shiftDate(event.date) })),
  tasks: clone(TASKS).map((task) => ({ ...task, ddl: shiftDate(task.ddl) })),
  announcements: clone(ANNOUNCEMENTS).map((item) => ({ ...item, publishedAt: shiftTimestamp(item.publishedAt) })),
  templates: clone(TEMPLATES),
  archives: clone(ARCHIVE).map((item) => ({ ...item, date: shiftDate(item.date) })),
  liaisons: clone(LIAISONS).map((item) => ({ ...item, updatedAt: shiftDate(item.updatedAt), since: item.since ? shiftDate(item.since) : undefined })),
  feed: clone(FEED).map((item) => ({ ...item, at: shiftDate(item.at) })),
  ideas: clone(IDEAS).map((item) => ({ ...item, createdAt: shiftDate(item.createdAt) })),
  comments: clone(IDEA_COMMENTS).map((item) => ({ ...item, createdAt: shiftDate(item.createdAt) })),
  credits: USERS.map((user, index) => ({ user: clone(user), total: 28 - index * 2, semester: 8 + (index % 4) })),
  upvotes: new Set<string>(),
  fileKeys: new Map<string, string>(),
} satisfies {
  users: User[];
  events: CalendarEvent[];
  tasks: Task[];
  announcements: Announcement[];
  templates: Template[];
  archives: ArchiveItem[];
  liaisons: LiaisonEntry[];
  feed: FeedItem[];
  ideas: Idea[];
  comments: IdeaComment[];
  credits: CreditSummary[];
  upvotes: Set<string>;
  fileKeys: Map<string, string>;
};

export function nextCode(prefix: string, ids: string[], width = 3) {
  const max = ids.reduce((value, id) => Math.max(value, Number(id.replace(`${prefix}-`, "")) || 0), 0);
  return `${prefix}-${String(max + 1).padStart(width, "0")}`;
}
