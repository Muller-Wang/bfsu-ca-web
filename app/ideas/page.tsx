"use client";

import { useState } from "react";
import { IDEAS, IDEA_COMMENTS } from "@/lib/mock/data";
import {
  IDEA_CATEGORY_LABEL,
  type Idea,
  type IdeaCategory,
  type IdeaComment,
} from "@/lib/types";
import { PillGroup } from "@/components/ui/PillGroup";

type SortKey = "latest" | "hot";

const CATEGORY_FILTERS = [
  { key: "all" as const,        label: "全部" },
  { key: "activity" as const,   label: "活动" },
  { key: "outreach" as const,   label: "外联" },
  { key: "content" as const,    label: "内容" },
  { key: "internal" as const,   label: "内部" },
  { key: "other" as const,      label: "其他" },
];

export default function IdeasPage() {
  const [cat, setCat] = useState<IdeaCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [showNew, setShowNew] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(IDEAS);
  const [comments, setComments] = useState<IdeaComment[]>(IDEA_COMMENTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = ideas
    .filter((i) => cat === "all" || i.category === cat)
    .sort((a, b) =>
      sort === "latest"
        ? b.createdAt.localeCompare(a.createdAt)
        : b.upvotes - a.upvotes
    );

  const handleUpvote = (id: string) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i))
    );
  };

  const handleAddIdea = (idea: Idea) => {
    setIdeas((prev) => [idea, ...prev]);
    setShowNew(false);
  };

  const handleAddComment = (ideaId: string, comment: IdeaComment) => {
    setComments((prev) => [...prev, comment]);
  };

  return (
    <div className="px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="rise rise-1 flex items-end justify-between mb-3">
        <div>
          <div className="meta">IDEAS · 创意点子库</div>
          <h1 className="display text-4xl mt-2">创意点子库</h1>
          <p className="meta mt-2">所有成员可公开或匿名提交创意，其他人可匿名评论讨论</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-outline px-4 h-8 text-sm shrink-0">
          + 提交点子
        </button>
      </div>

      <hr className="border-t rule my-8" />

      {/* Filters */}
      <div className="rise rise-2 flex items-center justify-between mb-8 gap-4 flex-wrap">
        <PillGroup
          options={CATEGORY_FILTERS as { key: IdeaCategory | "all"; label: string }[]}
          value={cat}
          onChange={setCat}
        />
        <PillGroup
          options={[{ key: "latest" as SortKey, label: "最新" }, { key: "hot" as SortKey, label: "最热" }]}
          value={sort}
          onChange={setSort}
        />
      </div>

      {/* Idea cards */}
      <div className="rise rise-3 space-y-4">
        {filtered.map((idea) => {
          const ideaComments = comments.filter((c) => c.ideaId === idea.id);
          const isExpanded = expanded === idea.id;
          return (
            <article
              key={idea.id}
              className="border rule bg-card transition-all duration-200 rounded-[10px]"
              style={{ borderColor: isExpanded ? "var(--line-strong)" : undefined }}
            >
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs border rule px-2 py-0.5 text-ink-soft rounded-[4px]">
                        {IDEA_CATEGORY_LABEL[idea.category]}
                      </span>
                      {idea.anonymous ? (
                        <span className="text-xs text-ink-soft/60 italic">匿名</span>
                      ) : (
                        <span className="text-xs text-ink-soft">{idea.authorName}</span>
                      )}
                      <span className="meta">{idea.createdAt}</span>
                    </div>
                    <h3 className="text-base mb-1.5">{idea.title}</h3>
                    <p className={`text-sm text-ink-soft leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                      {idea.body}
                    </p>
                    {!isExpanded && idea.body.length > 150 && (
                      <button
                        onClick={() => setExpanded(idea.id)}
                        style={{ fontSize: 12, color: "var(--ink-soft)", background: "none", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer", padding: "2px 0", marginTop: 4, transition: "color 120ms, border-color 120ms" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
                      >
                        展开全文
                      </button>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-5 mt-4 pt-3 border-t rule">
                  <button
                    onClick={() => handleUpvote(idea.id)}
                    className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-soft)")}
                  >
                    <span className="meta">▲</span>
                    <span className="font-mono text-xs">{idea.upvotes}</span>
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : idea.id)}
                    className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-soft)")}
                  >
                    <span className="meta">◇</span>
                    <span className="font-mono text-xs">{ideaComments.length}</span>
                  </button>
                </div>
              </div>

              {/* Expanded: comments */}
              {isExpanded && (
                <div className="px-6 pb-5 border-t rule">
                  {ideaComments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {ideaComments.map((c) => (
                        <div key={c.id} className="flex gap-3 text-sm">
                          <span className="meta shrink-0 mt-0.5 text-[10px]">
                            {c.anonymous ? "匿名" : c.authorName}
                          </span>
                          <div>
                            <p className="text-sm text-ink-soft leading-relaxed">{c.body}</p>
                            <span className="meta text-[10px]">{c.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <CommentForm ideaId={idea.id} onSubmit={handleAddComment} />
                </div>
              )}
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">暂无符合条件的点子，来提交第一个吧</div>
        )}
      </div>

      {showNew && (
        <NewIdeaForm onSubmit={handleAddIdea} onCancel={() => setShowNew(false)} />
      )}
    </div>
  );
}

function CommentForm({ ideaId, onSubmit }: { ideaId: string; onSubmit: (id: string, c: IdeaComment) => void }) {
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(ideaId, {
      id: `C-${Date.now()}`,
      ideaId,
      body: body.trim(),
      authorName: "我",
      anonymous,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-start">
      <div className="flex-1">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="写评论…（可匿名）"
          className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
        />
        <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-3 h-3"
          />
          <span className="text-xs text-ink-soft">匿名评论</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={!body.trim()}
        style={{ fontSize: 13, padding: "4px 14px", border: "1px solid var(--line)", borderRadius: 999, cursor: "pointer", background: "transparent", color: "var(--ink-soft)", transition: "border-color 120ms, color 120ms" }}
        onMouseEnter={(e) => { if (body.trim()) { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink)"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; } }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)"; }}
      >
        发送
      </button>
    </form>
  );
}

function NewIdeaForm({ onSubmit, onCancel }: { onSubmit: (idea: Idea) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("activity");
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSubmit({
      id: `I-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      authorName: "我",
      anonymous,
      category,
      createdAt: new Date().toISOString().slice(0, 10),
      upvotes: 0,
    });
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm grid place-items-center z-50 px-6"
      style={{ background: "rgba(29,29,31,0.4)" }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border rule max-w-lg w-full"
        style={{ borderRadius: 16, boxShadow: "var(--shadow-lg)" }}
      >
        <div className="px-7 py-6 border-b rule">
          <div className="meta mb-2">New Idea · 提交点子</div>
          <h3 className="display text-2xl">新创意</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div>
            <label className="meta text-xs block mb-1">标题</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
              placeholder="一句话说清你的想法"
              required
            />
          </div>
          <div>
            <label className="meta text-xs block mb-1">详细描述</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full bg-transparent border rule p-3 outline-none focus:border-ink text-sm resize-none rounded-[8px]"
              placeholder="展开说说：背景、具体怎么做、预期效果…"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="meta text-xs block mb-1">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IdeaCategory)}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
              >
                {Object.entries(IDEA_CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-ink-soft">匿名提交</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t rule">
            <button
              type="button"
              onClick={onCancel}
              style={{ fontSize: 13, padding: "6px 16px", border: "none", borderRadius: 999, cursor: "pointer", background: "transparent", color: "var(--ink-soft)", transition: "color 120ms" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-soft)")}
            >
              取消
            </button>
            <button type="submit" disabled={!title.trim() || !body.trim()} className="btn-outline px-5 py-1.5 text-sm">
              提交点子
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
