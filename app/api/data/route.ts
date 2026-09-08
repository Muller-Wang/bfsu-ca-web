import { NextResponse } from "next/server";
import { currentSessionIsDemo, isAdminRole, requireUser } from "@/lib/server/auth";
import { demoStore } from "@/lib/server/demo-store";
import { db } from "@/lib/server/db";
import type { ClubData } from "@/lib/club-data";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

const cleanUser = (row: Record<string, unknown>): User => ({
  id: String(row.id),
  workNo: String(row.work_no),
  name: String(row.name),
  nameEn: row.name_en ? String(row.name_en) : undefined,
  department: row.department as User["department"],
  role: row.role as User["role"],
  title: row.title ? String(row.title) : undefined,
  joinDate: String(row.join_date).slice(0, 10),
  probationLeftDays: row.probation_ends_at
    ? Math.max(0, Math.ceil((new Date(String(row.probation_ends_at)).getTime() - Date.now()) / 86_400_000))
    : undefined,
  avatarUrl: row.avatar_key ? `/api/avatar/${row.id}` : undefined,
});

export async function GET() {
  try {
    const user = await requireUser();
    if (await currentSessionIsDemo()) {
      return NextResponse.json({
        users: demoStore.users,
        events: demoStore.events,
        tasks: demoStore.tasks,
        announcements: demoStore.announcements,
        templates: demoStore.templates,
        archives: demoStore.archives,
        liaisons: demoStore.liaisons,
        feed: demoStore.feed,
        ideas: demoStore.ideas,
        comments: demoStore.comments,
        credits: isAdminRole(user.role) ? demoStore.credits : demoStore.credits.filter((item) => item.user.id === user.id),
      } satisfies ClubData, { headers: { "Cache-Control": "private, no-store" } });
    }

    const sql = db();
    const [users, events, tasks, announcements, templates, archives, archiveFiles, liaisons, feed, ideas, comments, credits] = await Promise.all([
      sql`SELECT id, work_no, name, name_en, department, role, title, join_date, probation_ends_at, avatar_key FROM users WHERE status = 'active' ORDER BY work_no`,
      sql`SELECT e.*, u.name AS owner_name FROM events e LEFT JOIN users u ON u.id = e.owner_id ORDER BY e.event_date, e.start_time NULLS LAST`,
      sql`SELECT * FROM tasks ORDER BY due_date, code`,
      sql`SELECT a.*, COALESCE(u.name, '系统') AS author_name FROM announcements a LEFT JOIN users u ON u.id = a.author_id ORDER BY a.pinned DESC, a.published_at DESC`,
      sql`SELECT * FROM templates ORDER BY updated_at DESC, code`,
      sql`SELECT * FROM archives ORDER BY archive_date DESC`,
      sql`SELECT archive_id, kind, COUNT(*)::int AS count FROM archive_files GROUP BY archive_id, kind`,
      sql`SELECT * FROM liaisons ORDER BY updated_at DESC`,
      sql`SELECT f.*, COALESCE(u.name, '系统') AS actor_name FROM activity_feed f LEFT JOIN users u ON u.id = f.actor_id ORDER BY f.created_at DESC LIMIT 50`,
      sql`SELECT i.*, u.name AS author_name FROM ideas i LEFT JOIN users u ON u.id = i.author_id ORDER BY i.created_at DESC`,
      sql`SELECT c.*, u.name AS author_name FROM idea_comments c LEFT JOIN users u ON u.id = c.author_id ORDER BY c.created_at`,
      isAdminRole(user.role)
        ? sql`SELECT v.*, u.work_no, u.name_en, u.role, u.title, u.join_date, u.avatar_key FROM v_credit_totals v JOIN users u ON u.id = v.user_id ORDER BY u.work_no`
        : sql`SELECT v.*, u.work_no, u.name_en, u.role, u.title, u.join_date, u.avatar_key FROM v_credit_totals v JOIN users u ON u.id = v.user_id WHERE v.user_id = ${user.id}`,
    ]);

    const data: ClubData = {
      users: users.map(cleanUser),
      events: events.map((row) => ({
        id: String(row.id), title: String(row.title), tag: row.tag, date: String(row.event_date).slice(0, 10),
        start: row.start_time ? String(row.start_time).slice(0, 5) : undefined,
        end: row.end_time ? String(row.end_time).slice(0, 5) : undefined,
        location: row.location ?? undefined, department: row.department ?? undefined,
        owner: row.owner_id ?? undefined, description: row.description ?? undefined,
      })),
      tasks: tasks.map((row) => ({
        id: String(row.code), title: String(row.title), department: row.department, status: row.status,
        ddl: String(row.due_date).slice(0, 10), assignee: row.assignee_id ?? "", progress: Number(row.progress),
        description: row.description ?? undefined, cadence: row.cadence,
      })),
      announcements: announcements.map((row) => ({
        id: String(row.id), title: String(row.title), body: String(row.body),
        publishedAt: new Date(row.published_at).toISOString(), author: String(row.author_name), pinned: Boolean(row.pinned),
      })),
      templates: templates.map((row) => ({
        id: String(row.code), name: String(row.name), nameEn: String(row.name_en), ext: row.ext,
        version: String(row.version), updatedAt: String(row.updated_at).slice(0, 10),
        size: row.size_bytes == null ? undefined : `${Math.max(1, Math.round(Number(row.size_bytes) / 1024))} KB`, category: row.category,
        downloadUrl: row.file_key ? `/api/templates/${row.code}/file` : undefined,
      })),
      archives: archives.map((row) => ({
        id: String(row.id), date: String(row.archive_date).slice(0, 10), title: String(row.title), department: row.department,
        tag: row.tag, files: archiveFiles.filter((file) => String(file.archive_id) === String(row.id)).map((file) => ({ kind: String(file.kind), count: Number(file.count) })),
      })),
      liaisons: liaisons.map((row) => ({
        id: String(row.id), name: String(row.name), category: row.category, status: row.status,
        contact: String(row.contact_name), contactRole: row.contact_role ?? undefined, notes: String(row.notes),
        updatedAt: String(row.updated_at).slice(0, 10), nextStep: row.next_step ?? undefined,
        since: row.since ? String(row.since).slice(0, 10) : undefined,
      })),
      feed: feed.map((row) => ({ id: String(row.id), at: String(row.created_at).slice(0, 10), who: String(row.actor_name), what: String(row.action) })),
      ideas: ideas.map((row) => ({
        id: String(row.code), title: String(row.title), body: String(row.body), authorId: row.author_id ?? undefined,
        authorName: row.anonymous ? undefined : row.author_name ?? undefined, anonymous: Boolean(row.anonymous),
        category: row.category, createdAt: String(row.created_at).slice(0, 10), upvotes: Number(row.upvotes),
      })),
      comments: comments.map((row) => ({
        id: String(row.id), ideaId: String(row.idea_id), body: String(row.body),
        authorName: row.anonymous ? undefined : row.author_name ?? undefined,
        anonymous: Boolean(row.anonymous), createdAt: String(row.created_at).slice(0, 10),
      })),
      credits: credits.map((row) => ({ user: cleanUser({ ...row, id: row.user_id, department: row.department }), total: Number(row.total_hours), semester: Number(row.semester_hours) })),
    };
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Response) {
      const message = error.status === 401 ? "请先登录" : error.status === 403 ? "没有访问权限" : "请求失败";
      return NextResponse.json({ error: message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "数据服务暂不可用" }, { status: 503 });
  }
}
