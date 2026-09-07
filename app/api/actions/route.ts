import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { currentSessionIsDemo, requireRole, requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { demoStore, nextCode } from "@/lib/server/demo-store";
import type { Announcement, CalendarEvent, Idea, IdeaComment, Task, Template, User } from "@/lib/types";
import { assertSameOrigin } from "@/lib/server/request";

const Envelope = z.object({ action: z.string(), payload: z.record(z.string(), z.unknown()).default({}) });
const Role = z.enum(["president", "vice_president", "secretary", "head", "member", "probation"]);
const Department = z.enum(["社长办", "秘书处", "外联部", "学术部", "宣传部"]);
const AdminRoles = ["president", "vice_president", "secretary"] as const;

function badRequest(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "输入无效" }, { status: 400 });
  if (error instanceof Response) {
    const message = error.status === 401 ? "请先登录" : error.status === 403 ? "没有操作权限" : error.status === 404 ? "内容不存在" : "请求失败";
    return NextResponse.json({ error: message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "操作失败" }, { status: 500 });
}

async function addFeed(actorId: string, action: string, entityType: string, entityId: string) {
  if (await currentSessionIsDemo()) {
    const actor = demoStore.users.find((user) => user.id === actorId);
    demoStore.feed.unshift({ id: String(Date.now()), at: new Date().toISOString().slice(0, 10), who: actor?.name ?? "系统", what: action });
    return;
  }
  const sql = db();
  await sql`INSERT INTO activity_feed (actor_id, action, entity_type, entity_id) VALUES (${actorId}, ${action}, ${entityType}, ${entityId})`;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { action, payload } = Envelope.parse(await request.json());
    const actor = await requireUser();
    const demo = await currentSessionIsDemo();
    const sql = demo ? null : db();

    if (action === "changePassword") {
      const input = z.object({
        currentPassword: z.string().min(1).max(128),
        newPassword: z.string().min(8, "新密码至少 8 位").max(128),
      }).refine((value) => value.currentPassword !== value.newPassword, {
        message: "新密码不能与当前密码相同",
        path: ["newPassword"],
      }).parse(payload);
      if (demo) {
        return NextResponse.json({ ok: true, demo: true, message: "演示模式不会修改账号密码" });
      }
      const rows = await sql!`SELECT password_hash FROM users WHERE id=${actor.id} AND status='active' LIMIT 1`;
      if (!rows[0] || !(await compare(input.currentPassword, String(rows[0].password_hash)))) {
        return NextResponse.json({ error: "当前密码不正确" }, { status: 400 });
      }
      const passwordHash = await hash(input.newPassword, 12);
      await sql!`UPDATE users SET password_hash=${passwordHash}, updated_at=now() WHERE id=${actor.id}`;
      await addFeed(actor.id, "修改账户密码", "user", actor.id);
      return NextResponse.json({ ok: true, message: "密码已更新" });
    }

    if (action === "createUser") {
      await requireRole([...AdminRoles]);
      const input = z.object({
        id: z.string().regex(/^\d{11,12}$/, "学号应为 11 或 12 位数字"), name: z.string().trim().min(1), nameEn: z.string().trim().optional(),
        department: Department, role: Role, title: z.string().trim().optional(), password: z.string().min(8, "初始密码至少 8 位").max(128),
      }).parse(payload);
      if (demo) {
        if (demoStore.users.some((user) => user.id === input.id)) return NextResponse.json({ error: "该学号已存在账号" }, { status: 409 });
        const year = new Date().getFullYear();
        const sequence = demoStore.users.reduce((max, item) => Math.max(max, Number(item.workNo.match(/(\d{3})$/)?.[1]) || 0), 0) + 1;
        const user: User = { id: input.id, workNo: `CA-${year}-${String(sequence).padStart(3, "0")}`, name: input.name, nameEn: input.nameEn, department: input.department, role: input.role, title: input.title, joinDate: new Date().toISOString().slice(0, 10), probationLeftDays: input.role === "probation" ? 60 : undefined };
        demoStore.users.push(user);
        await addFeed(actor.id, `添加成员 ${user.name}`, "user", user.id);
        return NextResponse.json({ user });
      }
      const passwordHash = await hash(input.password, 12);
      const probationEnd = input.role === "probation" ? new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10) : null;
      const rows = await sql!.begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(424242)`;
        const sequence = await tx`SELECT COALESCE(MAX(substring(work_no from '(\\d{3})$')::int), 0) + 1 AS next FROM users WHERE work_no LIKE ${`CA-${new Date().getFullYear()}-%`}`;
        const workNo = `CA-${new Date().getFullYear()}-${String(sequence[0].next).padStart(3, "0")}`;
        return tx`INSERT INTO users (id, work_no, name, name_en, password_hash, department, role, title, probation_ends_at)
          VALUES (${input.id}, ${workNo}, ${input.name}, ${input.nameEn || null}, ${passwordHash}, ${input.department}, ${input.role}, ${input.title || null}, ${probationEnd})
          RETURNING id, work_no, name, name_en, department, role, title, join_date`;
      });
      await addFeed(actor.id, `添加成员 ${input.name}`, "user", input.id);
      return NextResponse.json({ user: rows[0] }, { status: 201 });
    }

    if (action === "removeUser") {
      await requireRole(["president"]);
      const { id } = z.object({ id: z.string() }).parse(payload);
      if (id === actor.id) return NextResponse.json({ error: "不能除名当前登录账号" }, { status: 400 });
      if (demo) demoStore.users = demoStore.users.filter((user) => user.id !== id);
      else await sql!`UPDATE users SET status = 'removed', updated_at = now() WHERE id = ${id}`;
      await addFeed(actor.id, `移除成员 ${id}`, "user", id);
      return NextResponse.json({ ok: true });
    }

    if (action === "updateUser") {
      await requireRole([...AdminRoles]);
      const input = z.object({ id: z.string(), role: Role.optional(), department: Department.optional(), title: z.string().optional(), name: z.string().trim().min(1).optional(), nameEn: z.string().optional() }).parse(payload);
      if (demo) {
        const target = demoStore.users.find((user) => user.id === input.id);
        if (!target) return NextResponse.json({ error: "成员不存在" }, { status: 404 });
        Object.assign(target, input.role ? { role: input.role, probationLeftDays: input.role === "probation" ? 60 : undefined } : {}, input.department ? { department: input.department } : {}, input.title !== undefined ? { title: input.title } : {}, input.name ? { name: input.name } : {}, input.nameEn !== undefined ? { nameEn: input.nameEn } : {});
      } else {
        await sql!`UPDATE users SET role=COALESCE(${input.role || null},role),department=COALESCE(${input.department || null},department),title=COALESCE(${input.title ?? null},title),name=COALESCE(${input.name || null},name),name_en=COALESCE(${input.nameEn ?? null},name_en),probation_ends_at=CASE WHEN ${input.role || null}::text='probation' THEN CURRENT_DATE+60 WHEN ${input.role || null}::text IS NOT NULL THEN NULL ELSE probation_ends_at END,updated_at=now() WHERE id=${input.id}`;
      }
      await addFeed(actor.id, `更新成员 ${input.id}`, "user", input.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "createEvent" || action === "updateEvent") {
      await requireRole([...AdminRoles, "head"]);
      const input = z.object({ id: z.string().optional(), title: z.string().trim().min(1), tag: z.enum(["school", "internal", "self", "ddl"]), date: z.iso.date(), start: z.string().optional(), end: z.string().optional(), location: z.string().optional(), department: Department.optional(), owner: z.string().optional(), description: z.string().optional() }).parse(payload);
      if (demo) {
        const event: CalendarEvent = { ...input, id: input.id || String(Date.now()) };
        if (action === "updateEvent") demoStore.events = demoStore.events.map((item) => item.id === event.id ? event : item);
        else demoStore.events.push(event);
        await addFeed(actor.id, `${action === "updateEvent" ? "更新" : "创建"}活动 ${event.title}`, "event", event.id);
        return NextResponse.json({ event });
      }
      const rows = action === "updateEvent"
        ? await sql!`UPDATE events SET title=${input.title}, tag=${input.tag}, event_date=${input.date}, start_time=${input.start || null}, end_time=${input.end || null}, location=${input.location || null}, department=${input.department || null}, owner_id=${input.owner || null}, description=${input.description || null}, updated_at=now() WHERE id=${input.id!} RETURNING id`
        : await sql!`INSERT INTO events (title, tag, event_date, start_time, end_time, location, department, owner_id, description, created_by) VALUES (${input.title}, ${input.tag}, ${input.date}, ${input.start || null}, ${input.end || null}, ${input.location || null}, ${input.department || null}, ${input.owner || null}, ${input.description || null}, ${actor.id}) RETURNING id`;
      const id = String(rows[0]?.id);
      await addFeed(actor.id, `${action === "updateEvent" ? "更新" : "创建"}活动 ${input.title}`, "event", id);
      return NextResponse.json({ id });
    }

    if (action === "deleteEvent") {
      await requireRole([...AdminRoles]);
      const { id } = z.object({ id: z.string() }).parse(payload);
      if (demo) demoStore.events = demoStore.events.filter((event) => event.id !== id);
      else await sql!`DELETE FROM events WHERE id = ${id}`;
      await addFeed(actor.id, `删除活动 ${id}`, "event", id);
      return NextResponse.json({ ok: true });
    }

    if (action === "createTask" || action === "updateTask") {
      await requireRole([...AdminRoles, "head"]);
      const input = z.object({ id: z.string().optional(), title: z.string().trim().min(1), department: Department, status: z.enum(["todo", "doing", "review", "done"]).default("todo"), ddl: z.iso.date(), assignee: z.string().default(""), progress: z.number().min(0).max(100).default(0), description: z.string().optional(), cadence: z.enum(["once", "weekly", "biweekly", "monthly"]).default("once") }).parse(payload);
      if (demo) {
        const task: Task = { ...input, id: input.id || nextCode("T", demoStore.tasks.map((item) => item.id)) };
        if (action === "updateTask") demoStore.tasks = demoStore.tasks.map((item) => item.id === task.id ? task : item);
        else demoStore.tasks.push(task);
        await addFeed(actor.id, `${action === "updateTask" ? "更新" : "创建"}任务 ${task.title}`, "task", task.id);
        return NextResponse.json({ task });
      }
      if (action === "updateTask") {
        await sql!`UPDATE tasks SET title=${input.title}, department=${input.department}, status=${input.status}, due_date=${input.ddl}, assignee_id=${input.assignee || null}, progress=${input.progress}, description=${input.description || null}, cadence=${input.cadence}, updated_at=now() WHERE code=${input.id!}`;
        return NextResponse.json({ id: input.id });
      }
      const rows = await sql!.begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(434343)`;
        const sequence = await tx`SELECT COALESCE(MAX(substring(code from '(\\d{3})$')::int), 0) + 1 AS next FROM tasks`;
        const code = `T-${String(sequence[0].next).padStart(3, "0")}`;
        return tx`INSERT INTO tasks (code,title,department,status,due_date,assignee_id,progress,description,cadence,created_by) VALUES (${code},${input.title},${input.department},${input.status},${input.ddl},${input.assignee || null},${input.progress},${input.description || null},${input.cadence},${actor.id}) RETURNING code`;
      });
      await addFeed(actor.id, `创建任务 ${input.title}`, "task", String(rows[0].code));
      return NextResponse.json({ id: rows[0].code }, { status: 201 });
    }

    if (action === "updateTaskProgress") {
      const input = z.object({ id: z.string(), progress: z.number().min(0).max(100) }).parse(payload);
      if (demo) {
        const task = demoStore.tasks.find((item) => item.id === input.id);
        if (!task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });
        if (task.assignee !== actor.id && ![...AdminRoles, "head"].includes(actor.role as typeof AdminRoles[number] | "head")) throw new Response("Forbidden", { status: 403 });
        task.progress = input.progress;
        task.status = input.progress >= 100 ? "review" : "doing";
      } else {
        const allowed = [...AdminRoles, "head"].includes(actor.role as typeof AdminRoles[number] | "head");
        const rows = allowed
          ? await sql!`UPDATE tasks SET progress=${input.progress},status=${input.progress >= 100 ? "review" : "doing"},updated_at=now() WHERE code=${input.id} RETURNING code`
          : await sql!`UPDATE tasks SET progress=${input.progress},status=${input.progress >= 100 ? "review" : "doing"},updated_at=now() WHERE code=${input.id} AND assignee_id=${actor.id} RETURNING code`;
        if (!rows.length) throw new Response("Forbidden", { status: 403 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "createAnnouncement") {
      await requireRole([...AdminRoles]);
      const input = z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1), pinned: z.boolean().default(true) }).parse(payload);
      if (demo) {
        const announcement: Announcement = { id: String(Date.now()), title: input.title, body: input.body, pinned: input.pinned, author: actor.name, publishedAt: new Date().toISOString() };
        demoStore.announcements.unshift(announcement);
        await addFeed(actor.id, `发布公告 ${input.title}`, "announcement", announcement.id);
        return NextResponse.json({ announcement });
      }
      const rows = await sql!`INSERT INTO announcements (title,body,pinned,author_id) VALUES (${input.title},${input.body},${input.pinned},${actor.id}) RETURNING id`;
      await addFeed(actor.id, `发布公告 ${input.title}`, "announcement", String(rows[0].id));
      return NextResponse.json({ id: rows[0].id }, { status: 201 });
    }

    if (action === "deleteAnnouncement") {
      await requireRole([...AdminRoles]);
      const { id } = z.object({ id: z.string() }).parse(payload);
      if (demo) demoStore.announcements = demoStore.announcements.filter((item) => item.id !== id);
      else await sql!`DELETE FROM announcements WHERE id=${id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "toggleAnnouncement") {
      await requireRole([...AdminRoles]);
      const { id } = z.object({ id: z.string() }).parse(payload);
      if (demo) demoStore.announcements = demoStore.announcements.map((item) => item.id === id ? { ...item, pinned: !item.pinned } : item);
      else await sql!`UPDATE announcements SET pinned=NOT pinned, updated_at=now() WHERE id=${id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "createCredit") {
      await requireRole([...AdminRoles]);
      const input = z.object({ userId: z.string(), hours: z.number().min(0).max(999), semester: z.string().regex(/^\d{4}-(spring|autumn)$/), reason: z.string().trim().min(1), eventId: z.string().optional() }).parse(payload);
      if (demo) {
        const item = demoStore.credits.find((credit) => credit.user.id === input.userId);
        if (item) { item.total += input.hours; item.semester += input.hours; }
      } else {
        await sql!`INSERT INTO credit_records (user_id,event_id,hours,semester,reason,recorded_by) VALUES (${input.userId},${input.eventId || null},${input.hours},${input.semester},${input.reason},${actor.id})`;
      }
      await addFeed(actor.id, `为 ${input.userId} 录入 ${input.hours} 学时`, "credit", input.userId);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (action === "saveTemplate") {
      await requireRole([...AdminRoles]);
      const input = z.object({ id: z.string().optional(), name: z.string().trim().min(1), nameEn: z.string().trim(), ext: z.enum(["docx", "pdf", "md", "xlsx"]), version: z.string().trim().min(1), size: z.string().optional(), category: z.enum(["general", "letter"]) }).parse(payload);
      if (demo) {
        const template: Template = { ...input, id: input.id || nextCode("TP", demoStore.templates.map((item) => item.id), 2), updatedAt: new Date().toISOString().slice(0, 10) };
        demoStore.templates = input.id ? demoStore.templates.map((item) => item.id === input.id ? template : item) : [...demoStore.templates, template];
        return NextResponse.json({ template });
      }
      if (input.id) {
        await sql!`UPDATE templates SET name=${input.name},name_en=${input.nameEn},ext=${input.ext},version=${input.version},category=${input.category},updated_at=now() WHERE code=${input.id}`;
        return NextResponse.json({ id: input.id });
      }
      const rows = await sql!.begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(444444)`;
        const sequence = await tx`SELECT COALESCE(MAX(substring(code from '(\\d{2})$')::int), 0) + 1 AS next FROM templates`;
        const code = `TP-${String(sequence[0].next).padStart(2, "0")}`;
        return tx`INSERT INTO templates (code,name,name_en,ext,version,category,uploaded_by) VALUES (${code},${input.name},${input.nameEn},${input.ext},${input.version},${input.category},${actor.id}) RETURNING code`;
      });
      return NextResponse.json({ id: rows[0].code }, { status: 201 });
    }

    if (action === "deleteTemplate") {
      await requireRole([...AdminRoles]);
      const { id } = z.object({ id: z.string() }).parse(payload);
      if (demo) demoStore.templates = demoStore.templates.filter((item) => item.id !== id);
      else await sql!`DELETE FROM templates WHERE code=${id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "createIdea") {
      const input = z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1), category: z.enum(["activity", "outreach", "content", "internal", "other"]), anonymous: z.boolean().default(false) }).parse(payload);
      if (demo) {
        const idea: Idea = { id: nextCode("I", demoStore.ideas.map((item) => item.id)), ...input, authorId: actor.id, authorName: input.anonymous ? undefined : actor.name, createdAt: new Date().toISOString().slice(0, 10), upvotes: 0 };
        demoStore.ideas.unshift(idea);
        return NextResponse.json({ idea }, { status: 201 });
      }
      const rows = await sql!.begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(454545)`;
        const sequence = await tx`SELECT COALESCE(MAX(substring(code from '(\\d{3})$')::int), 0) + 1 AS next FROM ideas`;
        const code = `I-${String(sequence[0].next).padStart(3, "0")}`;
        return tx`INSERT INTO ideas (code,title,body,author_id,anonymous,category) VALUES (${code},${input.title},${input.body},${actor.id},${input.anonymous},${input.category}) RETURNING code`;
      });
      return NextResponse.json({ id: rows[0].code }, { status: 201 });
    }

    if (action === "addComment") {
      const input = z.object({ ideaId: z.string(), body: z.string().trim().min(1), anonymous: z.boolean().default(false) }).parse(payload);
      if (demo) {
        const comment: IdeaComment = { id: String(Date.now()), ideaId: input.ideaId, body: input.body, anonymous: input.anonymous, authorName: input.anonymous ? undefined : actor.name, createdAt: new Date().toISOString().slice(0, 10) };
        demoStore.comments.push(comment);
        return NextResponse.json({ comment }, { status: 201 });
      }
      const idea = await sql!`SELECT id FROM ideas WHERE code=${input.ideaId}`;
      if (!idea[0]) return NextResponse.json({ error: "点子不存在" }, { status: 404 });
      await sql!`INSERT INTO idea_comments (idea_id,body,author_id,anonymous) VALUES (${idea[0].id},${input.body},${actor.id},${input.anonymous})`;
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (action === "toggleUpvote") {
      const { ideaId } = z.object({ ideaId: z.string() }).parse(payload);
      if (demo) {
        const key = `${ideaId}:${actor.id}`;
        const delta = demoStore.upvotes.has(key) ? -1 : 1;
        if (delta > 0) demoStore.upvotes.add(key); else demoStore.upvotes.delete(key);
        demoStore.ideas = demoStore.ideas.map((idea) => idea.id === ideaId ? { ...idea, upvotes: Math.max(0, idea.upvotes + delta) } : idea);
      } else {
        await sql!.begin(async (tx) => {
          const idea = await tx`SELECT id FROM ideas WHERE code=${ideaId} FOR UPDATE`;
          if (!idea[0]) throw new Response("Not Found", { status: 404 });
          const removed = await tx`DELETE FROM idea_upvotes WHERE idea_id=${idea[0].id} AND user_id=${actor.id} RETURNING idea_id`;
          if (removed.length) await tx`UPDATE ideas SET upvotes=GREATEST(0,upvotes-1) WHERE id=${idea[0].id}`;
          else { await tx`INSERT INTO idea_upvotes (idea_id,user_id) VALUES (${idea[0].id},${actor.id})`; await tx`UPDATE ideas SET upvotes=upvotes+1 WHERE id=${idea[0].id}`; }
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (error) {
    return badRequest(error);
  }
}
