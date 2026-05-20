export type Role = "president" | "secretary" | "head" | "member" | "probation";

export const ROLE_LABEL: Record<Role, string> = {
  president: "社长",
  secretary: "秘书处",
  head: "部长",
  member: "正式成员",
  probation: "预备成员",
};

export type Department =
  | "社长办"
  | "秘书处"
  | "外联部"
  | "学术部"
  | "宣传部"
  | "日语部"
  | "德语部";

export interface User {
  id: string;         // 学号 e.g. 23110301021
  workNo: string;     // 工号 e.g. CA-2024-007
  name: string;       // 中文姓名
  nameEn?: string;    // 英文/拼音
  department: Department;
  role: Role;
  title?: string;     // 副社长 / 部长 / 干事
  joinDate: string;   // YYYY-MM-DD
  probationLeftDays?: number;
}

export type EventTag = "school" | "internal" | "self" | "ddl";

export const EVENT_TAG_META: Record<EventTag, { label: string; color: string }> = {
  school: { label: "学校任务", color: "#b8731f" },
  self: { label: "自办活动", color: "#7a1f2e" },
  internal: { label: "内部工作", color: "#5c5651" },
  ddl: { label: "DDL", color: "#8c2a1f" },
};

export interface CalendarEvent {
  id: string;
  title: string;
  tag: EventTag;
  date: string;       // YYYY-MM-DD
  start?: string;     // HH:MM
  end?: string;
  location?: string;
  department?: Department;
  owner?: string;     // user id
  attachments?: { name: string; ext: string }[];
  description?: string;
}

export type TaskStatus = "todo" | "doing" | "review" | "done";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "待安排",
  doing: "进行中",
  review: "待审核",
  done: "已完成",
};

export interface Task {
  id: string;            // T-031
  title: string;
  department: Department;
  status: TaskStatus;
  ddl: string;           // YYYY-MM-DD
  assignee: string;      // user id
  progress?: number;     // 0–100
  description?: string;
}

export interface Announcement {
  id: string;            // #001
  title: string;
  body: string;
  publishedAt: string;   // ISO
  author: string;        // user id
  pinned: boolean;
}

export interface Template {
  id: string;
  name: string;
  nameEn: string;
  ext: "docx" | "pdf" | "md" | "xlsx";
  version: string;
  updatedAt: string;
  size?: string;
}

export interface ArchiveItem {
  id: string;
  date: string;
  title: string;
  department: Department;
  tag: EventTag;
  files: { kind: string; count?: number }[];
}

export interface FeedItem {
  id: string;
  at: string;            // YYYY-MM-DD
  who: string;           // display name
  what: string;
}
