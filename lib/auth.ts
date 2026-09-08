"use client";

import { useEffect, useState } from "react";
import { api, getMe } from "./api-client";
import type { User } from "./types";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    getMe()
      .then((value) => { if (active) setUser(value); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  return { user, ready, setUser };
}

export async function logout() {
  await api<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function canSeeAdmin(user: User | null) {
  return !!user && ["president", "vice_president", "secretary"].includes(user.role);
}

/** 除名成员：仅社长（president）可执行。副社长与办公室不可。 */
export function canRemoveMember(user: User | null) {
  return user?.role === "president";
}

/** 删除活动：社长 / 副社长 / 办公室均可 */
export function canDeleteEvent(user: User | null) {
  return canSeeAdmin(user);
}
