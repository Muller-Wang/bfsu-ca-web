import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentSessionIsDemo, requireAdmin, requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { demoStore } from "@/lib/server/demo-store";
import { safeStoredPath } from "@/lib/server/files";
import { assertSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set(["docx", "pdf", "md", "xlsx"]);

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    await requireUser();
    const { code } = await context.params;
    let key: string | undefined;
    let name = code;
    let ext = "bin";
    if (await currentSessionIsDemo()) {
      const template = demoStore.templates.find((item) => item.id === code);
      key = demoStore.fileKeys.get(code);
      name = template?.name || name;
      ext = template?.ext || ext;
    } else {
      const rows = await db()`SELECT file_key,name,ext FROM templates WHERE code=${code}`;
      key = rows[0]?.file_key ? String(rows[0].file_key) : undefined;
      name = rows[0]?.name ? String(rows[0].name) : name;
      ext = rows[0]?.ext ? String(rows[0].ext) : ext;
    }
    if (!key) return NextResponse.json({ error: "文件尚未上传" }, { status: 404 });
    const bytes = await readFile(safeStoredPath(key));
    return new Response(bytes, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${name}.${ext}`)}`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Response) return NextResponse.json({ error: error.status === 401 ? "请先登录" : "没有访问权限" }, { status: error.status });
    return NextResponse.json({ error: "文件不可用" }, { status: 404 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { code } = await context.params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "文件不能超过 10 MB" }, { status: 413 });
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED.has(ext)) return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
    const key = `templates/${code}-${Date.now()}.${ext}`;
    await mkdir(path.dirname(safeStoredPath(key)), { recursive: true });
    await writeFile(safeStoredPath(key), Buffer.from(await file.arrayBuffer()));
    if (await currentSessionIsDemo()) {
      const template = demoStore.templates.find((item) => item.id === code);
      if (!template) return NextResponse.json({ error: "模板不存在" }, { status: 404 });
      template.ext = ext as typeof template.ext;
      template.size = `${Math.max(1, Math.round(file.size / 1024))} KB`;
      template.downloadUrl = `/api/templates/${code}/file`;
      demoStore.fileKeys.set(code, key);
    } else {
      await db()`UPDATE templates SET file_key=${key},ext=${ext},size_bytes=${file.size},updated_at=now() WHERE code=${code}`;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return NextResponse.json({ error: error.status === 401 ? "请先登录" : "没有操作权限" }, { status: error.status });
    console.error(error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
