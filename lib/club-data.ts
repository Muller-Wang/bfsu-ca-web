"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api-client";
import type {
  Announcement, ArchiveItem, CalendarEvent, FeedItem, Idea, IdeaComment, LiaisonEntry, Task, Template, User,
} from "./types";

export interface CreditSummary {
  user: User;
  total: number;
  semester: number;
}

export interface ClubData {
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
}

export function useClubData() {
  const [data, setData] = useState<ClubData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api<ClubData>("/api/data"));
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api<ClubData>("/api/data")
      .then((value) => { if (active) { setData(value); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "数据加载失败"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { data, error, loading, refresh };
}

export async function runAction<T = unknown>(action: string, payload: object = {}) {
  return api<T>("/api/actions", { method: "POST", body: JSON.stringify({ action, payload }) });
}
