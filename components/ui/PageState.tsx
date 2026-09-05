type PageErrorProps = { message: string; onRetry?: () => void };

export function PageLoading({ label = "正在整理内容" }: { label?: string }) {
  return (
    <div className="page-shell max-w-6xl" role="status" aria-live="polite">
      <span className="meta">{label}…</span>
      <div className="mt-7 space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-10 w-2/5 rounded bg-paper-sunken" />
        <div className="h-px bg-line" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl bg-paper-sunken" />
          <div className="h-28 rounded-xl bg-paper-sunken" />
        </div>
        <div className="h-40 rounded-xl bg-paper-sunken" />
      </div>
    </div>
  );
}

export function PageError({ message, onRetry }: PageErrorProps) {
  return (
    <section className="page-shell max-w-3xl" role="alert">
      <div className="border-l-2 border-danger bg-danger-wash px-5 py-4">
        <div className="meta text-danger">无法加载页面</div>
        <p className="mt-2 text-sm text-ink-soft">{message}</p>
        {onRetry && <button type="button" onClick={onRetry} className="btn-outline mt-4 px-4 py-2 text-sm">重新加载</button>}
      </div>
    </section>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed rule px-5 py-10 text-center">
      <div className="font-medium">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionLoading({ label = "正在加载" }: { label?: string }) {
  return (
    <div className="space-y-3 py-4" role="status" aria-live="polite">
      <span className="meta">{label}…</span>
      <div className="h-10 animate-pulse rounded bg-paper-sunken" />
      <div className="h-10 animate-pulse rounded bg-paper-sunken" />
      <div className="h-10 animate-pulse rounded bg-paper-sunken" />
    </div>
  );
}

export function SectionError({ message, onRetry }: PageErrorProps) {
  return (
    <div className="border-l-2 border-danger bg-danger-wash px-4 py-3" role="alert">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-2 text-xs border-b border-danger">重试</button>}
    </div>
  );
}
