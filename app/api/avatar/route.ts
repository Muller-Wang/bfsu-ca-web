import { mkdir, open, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { currentSessionIsDemo, requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { demoStore } from "@/lib/server/demo-store";
import { safeStoredPath } from "@/lib/server/files";
import { assertSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";

const MAX_AVATAR_BYTES = 200 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export async function POST(request: Request) {
  let temporaryPath = "";
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || "";
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return NextResponse.json({ error: "仅支持 JPG、PNG 或 WebP 图片" }, { status: 400 });
    }

    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > MAX_AVATAR_BYTES) {
      return NextResponse.json({ error: "头像不能超过 200 MB" }, { status: 413 });
    }
    if (!request.body) return NextResponse.json({ error: "请选择头像图片" }, { status: 400 });

    const avatarDirectory = safeStoredPath("avatars");
    await mkdir(avatarDirectory, { recursive: true });
    temporaryPath = path.join(avatarDirectory, `${user.id}-${randomUUID()}.upload`);
    const file = await open(temporaryPath, "wx", 0o640);
    let received = 0;
    try {
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > MAX_AVATAR_BYTES) {
          await reader.cancel();
          throw new Response("头像不能超过 200 MB", { status: 413 });
        }
        await file.write(value);
      }
    } finally {
      await file.close();
    }
    if (received === 0) throw new Response("请选择头像图片", { status: 400 });

    const source = sharp(temporaryPath, { animated: false });
    const metadata = await source.metadata();
    if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
      throw new Response("图片内容不是有效的 JPG、PNG 或 WebP", { status: 400 });
    }
    if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
      throw new Response("头像必须是正方形图片", { status: 400 });
    }

    const key = `avatars/${user.id}.webp`;
    await source
      .rotate()
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(safeStoredPath(key));

    if (await currentSessionIsDemo()) {
      const target = demoStore.users.find((item) => item.id === user.id);
      if (target) target.avatarUrl = `/api/avatar/${user.id}`;
      const credit = demoStore.credits.find((item) => item.user.id === user.id);
      if (credit) credit.user.avatarUrl = `/api/avatar/${user.id}`;
    } else {
      await db()`UPDATE users SET avatar_key=${key}, updated_at=now() WHERE id=${user.id}`;
    }

    return NextResponse.json({ avatarUrl: `/api/avatar/${user.id}?v=${Date.now()}` });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: (await error.text()) || "上传失败" }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "头像上传失败" }, { status: 500 });
  } finally {
    if (temporaryPath) await unlink(temporaryPath).catch(() => undefined);
  }
}
