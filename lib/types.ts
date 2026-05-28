export type Role = "president" | "vice_president" | "secretary" | "head" | "member" | "probation";

export const ROLE_LABEL: Record<Role, string> = {
  president: "社长",
  vice_president: "副社长",
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

export type TemplateCategory = "general" | "letter";

export const TEMPLATE_CATEGORY_LABEL: Record<TemplateCategory, string> = {
  general: "通用模版",
  letter: "书信模版",
};

export interface Template {
  id: string;
  name: string;
  nameEn: string;
  ext: "docx" | "pdf" | "md" | "xlsx";
  version: string;
  updatedAt: string;
  size?: string;
  category: TemplateCategory;
}

export type LiaisonCategory = "club" | "enterprise" | "foundation" | "government";

export const LIAISON_CATEGORY_LABEL: Record<LiaisonCategory, string> = {
  club: "社团外联",
  enterprise: "企业合作",
  foundation: "基金会/组织",
  government: "政府单位",
};

export type LiaisonStatus = "contacting" | "negotiating" | "cooperating" | "completed" | "stalled";

export const LIAISON_STATUS_LABEL: Record<LiaisonStatus, string> = {
  contacting: "接洽中",
  negotiating: "洽谈中",
  cooperating: "合作中",
  completed: "已完成",
  stalled: "搁置",
};

export const LIAISON_STATUS_COLOR: Record<LiaisonStatus, string> = {
  contacting: "#b8731f",
  negotiating: "#7a1f2e",
  cooperating: "#4a6b3a",
  completed: "#5c5651",
  stalled: "#8c2a1f",
};

export interface LiaisonEntry {
  id: string;
  name: string;
  category: LiaisonCategory;
  status: LiaisonStatus;
  contact: string;
  contactRole?: string;
  notes: string;
  updatedAt: string;
  nextStep?: string;
  since?: string;
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

export type IdeaCategory = "activity" | "outreach" | "content" | "internal" | "other";

export const IDEA_CATEGORY_LABEL: Record<IdeaCategory, string> = {
  activity: "活动创意",
  outreach: "外联拓展",
  content: "内容创意",
  internal: "内部优化",
  other: "其他",
};

export interface Idea {
  id: string;
  title: string;
  body: string;
  authorId?: string;
  authorName?: string;
  anonymous: boolean;
  category: IdeaCategory;
  createdAt: string;
  upvotes: number;
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  body: string;
  authorName?: string;
  anonymous: boolean;
  createdAt: string;
}
