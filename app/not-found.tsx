import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] grid place-items-center px-5 py-12">
      <div className="max-w-lg text-center">
        <div className="meta">404 · PAGE NOT FOUND</div>
        <div aria-hidden className="mt-6 font-serif text-8xl text-ink-faint">◇</div>
        <h1 className="display mt-5 text-4xl">这一页还没有内容。</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">地址可能已变更，或你暂时没有进入该页面的路径。</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/dashboard" className="btn-outline px-5 py-2 text-sm">返回主页</Link>
          <Link href="/" className="px-5 py-2 text-sm text-ink-soft hover:text-ink">访问封面</Link>
        </div>
      </div>
    </main>
  );
}
