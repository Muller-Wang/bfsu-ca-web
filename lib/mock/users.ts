/**
 * ⚠️ DEMO DATA —— 虚拟测试账户，仅用于原型展示。
 * 本文件属可整体删除的隔离区，切除步骤见 lib/mock/README.md。
 * 外部代码请通过 lib/auth.ts 的 resolveUserById 访问，勿直接依赖本表。
 */
import "server-only";
import type { User } from "../types";

export const USERS: User[] = [
  {
    id: "202420107031",
    workNo: "CA-2026-001",
    name: "王颢然",
    nameEn: "Wang Haoran",
    department: "社长办",
    role: "president",
    title: "社长",
    joinDate: "2026-09-05",
  },
  {
    id: "23110301001",
    workNo: "CA-2024-001",
    name: "张明",
    nameEn: "Zhang Ming",
    department: "社长办",
    role: "president",
    title: "社长",
    joinDate: "2024-09-15",
  },
  {
    id: "23110301007",
    workNo: "CA-2024-007",
    name: "墨乐",
    nameEn: "Mo Le",
    department: "社长办",
    role: "vice_president",
    title: "副社长",
    joinDate: "2024-09-15",
  },
  {
    id: "23110301099",
    workNo: "CA-2024-099",
    name: "林思齐",
    nameEn: "Lin Siqi",
    department: "秘书处",
    role: "secretary",
    title: "秘书长",
    joinDate: "2024-09-15",
  },
  {
    id: "24110301012",
    workNo: "CA-2025-012",
    name: "林雨",
    nameEn: "Lin Yu",
    department: "外联部",
    role: "head",
    title: "部长",
    joinDate: "2025-03-10",
  },
  {
    id: "25110301003",
    workNo: "CA-2026-003",
    name: "陈一然",
    nameEn: "Chen Yiran",
    department: "学术部",
    role: "head",
    title: "部长",
    joinDate: "2026-02-20",
  },
  {
    id: "25110301014",
    workNo: "CA-2026-014",
    name: "周晴",
    nameEn: "Zhou Qing",
    department: "宣传部",
    role: "head",
    title: "部长",
    joinDate: "2026-02-20",
  },
  {
    id: "25110301018",
    workNo: "CA-2026-018",
    name: "王悦",
    nameEn: "Wang Yue",
    department: "秘书处",
    role: "probation",
    title: "干事",
    joinDate: "2026-04-06",
    probationLeftDays: 45,
  },
  {
    id: "24110301045",
    workNo: "CA-2025-045",
    name: "李知秋",
    nameEn: "Li Zhiqiu",
    department: "日语部",
    role: "head",
    title: "部长",
    joinDate: "2025-03-10",
  },
  {
    id: "24110301056",
    workNo: "CA-2025-056",
    name: "唐穆",
    nameEn: "Tang Mu",
    department: "德语部",
    role: "head",
    title: "部长",
    joinDate: "2025-03-10",
  },
  {
    id: "23110301018",
    workNo: "CA-2024-018",
    name: "张驰",
    nameEn: "Zhang Chi",
    department: "宣传部",
    role: "member",
    title: "部员",
    joinDate: "2024-09-15",
  },
  {
    id: "26110301002",
    workNo: "CA-2026-022",
    name: "苏婉",
    nameEn: "Su Wan",
    department: "外联部",
    role: "probation",
    title: "干事",
    joinDate: "2026-04-06",
    probationLeftDays: 45,
  },
];

/** 仅供本地演示环境的普通登录使用；代码中不保存明文密码。 */
export const LOCAL_LOGIN_PASSWORD_HASHES: Record<string, string> = {
  "202420107031": "$2b$12$pkszrd2BfYVsfDv.aXfVh.TdUd30Ye77LqgsVzd1E2HdWxDVc3EFW",
};

export function findUser(id: string) {
  return USERS.find((u) => u.id === id);
}

export function findUserByName(name: string) {
  return USERS.find((u) => u.name === name);
}
