"use client";

import { useState } from "react";
import { TEMPLATE_CATEGORY_LABEL, type Template } from "@/lib/types";
import { PillGroup } from "@/components/ui/PillGroup";
import { runAction, useClubData } from "@/lib/club-data";
import { EmptyState, SectionError, SectionLoading } from "@/components/ui/PageState";

const EXT_BADGE: Record<string, string> = {
  docx: "DOC",
  pdf: "PDF",
  md: "MD ",
  xlsx: "XLS",
};

export default function AdminTemplatesPage() {
  const [editing, setEditing] = useState<Template | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, loading, error, refresh } = useClubData();
  if (loading && !data) return <SectionLoading label="正在加载模板" />;
  if (error && !data) return <SectionError message={error} onRetry={() => void refresh()} />;
  if (!data) return null;
  const templates = data.templates;

  const handleSave = async (form: Template) => {
    setActionError("");
    try {
      await runAction("saveTemplate", form);
      setEditing(null);
      setShowNew(false);
      await refresh();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "保存失败"); }
  };

  const handleDelete = async (tp: Template) => {
    setActionError("");
    try {
      await runAction("deleteTemplate", { id: tp.id });
      setConfirmDelete(null);
      await refresh();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "删除失败"); }
  };

  const uploadFile = async (template: Template, file: File) => {
    const body = new FormData(); body.append("file", file);
    const response = await fetch(`/api/templates/${template.id}/file`, { method: "POST", body });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setUploadError(result.error || "上传失败"); return; }
    setUploadError(""); await refresh();
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline mb-5">
        <h2 className="display text-2xl">模板管理</h2>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 text-sm btn-outline"
        >
          + 新增模板
        </button>
      </div>
      <p className="meta mb-6">管理资料库中所有模板文件。修改后所有用户立即可见。</p>
      {uploadError && <p className="text-danger text-sm mb-4">{uploadError}</p>}
      {actionError && <div className="mb-4"><SectionError message={actionError} /></div>}

      <div className="table-scroll border-t rule">
        <div className="min-w-[880px]">
        <div className="grid grid-cols-[1.2fr_100px_80px_80px_80px_100px_200px] gap-3 py-3 border-b rule">
          {["模板名称", "英文名", "类型", "版本", "分类", "更新日期", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>

        {templates.map((tp) => (
          <div
            key={tp.id}
            className="grid grid-cols-[1.2fr_100px_80px_80px_80px_100px_200px] gap-3 py-3 border-b rule items-center text-sm hover:bg-card/60"
          >
            <span>
              <span className="font-mono text-[10px] border rule px-1.5 py-0.5 mr-2">{EXT_BADGE[tp.ext]}</span>
              {tp.name}
            </span>
            <span className="text-xs text-ink-soft italic font-serif normal-case tracking-normal">{tp.nameEn}</span>
            <span className="text-xs font-mono">{tp.ext}</span>
            <span className="text-xs font-mono">{tp.version}</span>
            <span className="text-xs">{TEMPLATE_CATEGORY_LABEL[tp.category]}</span>
            <span className="font-mono text-xs text-ink-soft">{tp.updatedAt}</span>
            <span className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setEditing({ ...tp })}
                className="border-b rule hover:border-ink"
              >
                编辑
              </button>
              <button
                onClick={() => setConfirmDelete(tp)}
                className="border-b rule text-danger hover:border-danger"
              >
                删除
              </button>
              <label className="border-b rule hover:border-ink cursor-pointer">
                上传文件
                <input type="file" accept=".docx,.pdf,.md,.xlsx" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(tp, file); }} />
              </label>
              {tp.downloadUrl && <a href={tp.downloadUrl} className="border-b rule hover:border-ink">下载</a>}
            </span>
          </div>
        ))}
        </div>
      </div>
      {templates.length === 0 && <EmptyState title="暂无模板" detail="创建模板元数据后，可以继续上传对应文件。" />}

      {/* Edit / New modal */}
      {(editing || showNew) && (
        <TemplateForm
          initial={editing}
          existingIds={templates.map((t) => t.id)}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-panel bg-card border rule rounded-sm max-w-md w-full shadow-2xl"
          >
            <div className="px-7 py-6 border-b rule">
              <div className="meta text-danger mb-2">⚠ 删除模板</div>
              <h3 className="display text-2xl">确认删除「{confirmDelete.name}」？</h3>
            </div>
            <div className="px-7 py-5 text-sm text-ink-soft leading-relaxed">
              删除后所有用户将无法下载此模板。此操作不可恢复。
            </div>
            <div className="px-7 py-4 border-t rule flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="text-sm px-4 py-2 hover:text-ink">
                取消
              </button>
              <button
                onClick={() => void handleDelete(confirmDelete)}
                className="text-sm px-4 py-2 btn-outline-danger"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateForm({
  initial,
  existingIds,
  onSave,
  onCancel,
}: {
  initial: Template | null;
  existingIds: string[];
  onSave: (t: Template) => Promise<void>;
  onCancel: () => void;
}) {
  const nextId = () => {
    const nums = existingIds
      .map((id) => parseInt(id.replace(/^TP-/, ""), 10))
      .filter(Number.isFinite);
    const max = nums.length ? Math.max(...nums) : 0;
    return `TP-${String(max + 1).padStart(2, "0")}`;
  };

  const [form, setForm] = useState<Template>(
    initial || {
      id: nextId(),
      name: "",
      nameEn: "",
      ext: "docx",
      version: "v1",
      updatedAt: new Date().toISOString().slice(0, 10),
      size: "",
      category: "general",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel bg-card border rule rounded-sm max-w-lg w-full shadow-2xl"
      >
        <div className="px-5 sm:px-7 py-5 sm:py-6 border-b rule">
          <div className="meta mb-2">{initial ? "编辑模板" : "新增模板"}</div>
          <h3 className="display text-2xl">{initial ? initial.name : "新建模板"}</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="meta text-xs block mb-1">中文名称</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
                required
              />
            </div>
            <div>
              <label className="meta text-xs block mb-1">英文名称</label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="meta text-xs block mb-1">文件类型</label>
              <select
                value={form.ext}
                onChange={(e) => setForm({ ...form, ext: e.target.value as Template["ext"] })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm"
              >
                <option value="docx">docx</option>
                <option value="pdf">pdf</option>
                <option value="md">md</option>
                <option value="xlsx">xlsx</option>
              </select>
            </div>
            <div>
              <label className="meta text-xs block mb-1">版本</label>
              <input
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm font-mono"
              />
            </div>
            <div>
              <label className="meta text-xs block mb-1">文件大小</label>
              <input
                value={form.size || ""}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full bg-transparent border-b rule pb-1.5 outline-none focus:border-ink text-sm font-mono"
                placeholder="82 KB"
              />
            </div>
          </div>
          <div>
            <label className="meta text-xs block mb-1">分类</label>
            <div className="mt-1">
              <PillGroup
                options={[
                  { key: "general", label: TEMPLATE_CATEGORY_LABEL.general },
                  { key: "letter", label: TEMPLATE_CATEGORY_LABEL.letter },
                ]}
                value={form.category}
                onChange={(c) => setForm({ ...form, category: c })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t rule mt-4">
            <button type="button" onClick={onCancel} className="text-sm px-4 py-2 hover:text-ink">
              取消
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 btn-outline"
            >
              {initial ? "保存修改" : "创建模板"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
