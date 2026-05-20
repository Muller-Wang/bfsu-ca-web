import type { User } from "../types";

export const USERS: User[] = [
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
    department: "秘书处",
    role: "secretary",
    title: "副社长",
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

export function findUser(id: string) {
  return USERS.find((u) => u.id === id);
}

export function findUserByName(name: string) {
  return USERS.find((u) => u.name === name);
}
