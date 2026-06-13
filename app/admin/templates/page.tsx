"use client";

import { useState } from "react";
import clsx from "clsx";
import { TEMPLATES } from "@/lib/mock/data";
import { TEMPLATE_CATEGORY_LABEL, type Template, type TemplateCategory } from "@/lib/types";

const EXT_BADGE: Record<string, string> = {
  docx: "DOC",
  pdf: "PDF",
  md: "MD ",
  xlsx: "XLS",
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [editing, setEditing] = useState<Template | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);

  const handleSave = (form: Template) => {
    if (editing) {
      setTemplates((prev) => prev.map((t) => (t.id === form.id ? form : t)));
      setEditing(null);
    } else {
      setTemplates((prev) => [...prev, form]);
      setShowNew(false);
    }
  };

  const handleDelete = (tp: Template) => {
    setTemplates((prev) => prev.filter((t) => t.id !== tp.id));
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="display text-2xl">模板管理</h2>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors rounded-full"
        >
          + 新增模板
        </button>
      </div>
      <p className="meta mb-6">管理资料库中所有模板文件。修改后所有用户立即可见。</p>

      <div className="border-t rule">
        <div className="grid grid-cols-[1.2fr_100px_80px_80px_80px_100px_140px] gap-3 py-3 border-b rule">
          {["模板名称", "英文名", "类型", "版本", "分类", "更新日期", "操作"].map((h) => (
            <span key={h} className="meta">{h}</span>
          ))}
        </div>

        {templates.map((tp) => (
          <div
            key={tp.id}
            className="grid grid-cols-[1.2fr_100px_80px_80px_80px_100px_140px] gap-3 py-3 border-b rule items-center text-sm hover:bg-card/60"
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
            </span>
          </div>
        ))}
      </div>

      {/* Edit / New modal */}
      {(editing || showNew) && (
        <TemplateForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50 px-6"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border rule rounded-sm max-w-md w-full shadow-2xl"
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
                onClick={() => handleDelete(confirmDelete)}
                className="text-sm px-4 py-2 bg-danger text-card hover:opacity-90 transition-colors rounded-full"
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
  onSave,
  onCancel,
}: {
  initial: Template | null;
  onSave: (t: Template) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Template>(
    initial || {
      id: `TP-${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
      name: "",
      nameEn: "",
      ext: "docx",
      version: "v1",
      updatedAt: new Date().toISOString().slice(0, 10),
      size: "",
      category: "general",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50 px-6"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border rule rounded-sm max-w-lg w-full shadow-2xl"
      >
        <div className="px-7 py-6 border-b rule">
          <div className="meta mb-2">{initial ? "编辑模板" : "新增模板"}</div>
          <h3 className="display text-2xl">{initial ? initial.name : "新建模板"}</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-3 gap-4">
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
            <div className="flex gap-2 mt-1">
              {(["general", "letter"] as TemplateCategory[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  className={clsx(
                    "px-3 py-1.5 text-sm border rule rounded-full transition-colors",
                    form.category === c ? "bg-ink text-card border-ink" : "hover:border-ink"
                  )}
                >
                  {TEMPLATE_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t rule mt-4">
            <button type="button" onClick={onCancel} className="text-sm px-4 py-2 hover:text-ink">
              取消
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 bg-accent text-card hover:bg-accent-soft transition-colors rounded-full"
            >
              {initial ? "保存修改" : "创建模板"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
