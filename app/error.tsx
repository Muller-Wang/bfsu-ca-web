"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-[70dvh] grid place-items-center px-5 py-12" role="alert">
      <div className="max-w-lg border-l-2 border-danger bg-danger-wash px-6 py-5">
        <div className="meta text-danger">页面遇到问题</div>
        <h1 className="display mt-3 text-3xl">内容暂时无法显示。</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">可以重新加载当前页面；如果问题持续出现，请联系系统管理员。</p>
        <button type="button" onClick={reset} className="btn-outline mt-5 px-5 py-2 text-sm">重新加载</button>
      </div>
    </main>
  );
}
