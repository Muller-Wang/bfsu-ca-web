"use client";

import { useEffect, useState } from "react";
import { USERS } from "./mock/users";
import type { User } from "./types";

const KEY = "bfsu-ca:current-user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (stored) {
      const found = USERS.find((u) => u.id === stored);
      if (found) setUser(found);
    }
    setReady(true);
  }, []);

  return { user, ready, setUser: setLocal };
}

export function setLocal(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(KEY, user.id);
  else window.localStorage.removeItem(KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(KEY);
  if (!id) return null;
  return USERS.find((u) => u.id === id) || null;
}

export function canSeeAdmin(user: User | null) {
  if (!user) return false;
  return user.role === "president" || user.role === "secretary";
}

/** 除名成员：仅社长（president）可执行 */
export function canRemoveMember(user: User | null) {
  if (!user) return false;
  return user.role === "president";
}

/** 删除活动：秘书处与社长均可 */
export function canDeleteEvent(user: User | null) {
  return canSeeAdmin(user);
}
