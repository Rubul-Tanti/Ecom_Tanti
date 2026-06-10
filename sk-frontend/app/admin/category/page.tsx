"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  FolderOpen,
  FolderTree,
  ChevronRight,
  Package,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react"
import useCategory from "@/hooks/use-category"
import { Category } from "@/server/category/types"

/* ─── Types (mirrors getSafeCategory output) ─────────────── */
interface CategoryChild {
  id: string
  name: string
  slug: string
}

interface SafeCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  parent: { id: string; name: string; slug: string } | null
  children: CategoryChild[]
  productCount: number
  createdAt: string
  updatedAt: string
}

/* ─── Styles ─────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black:    #080808;
    --white:    #ffffff;
    --off:      #f7f7f7;
    --border:   #ebebeb;
    --border2:  #d8d8d8;
    --muted:    #999999;
    --subtle:   #f2f2f2;
    --red:      #cc2200;
    --mono:     'JetBrains Mono', monospace;
    --sans:     'Instrument Sans', sans-serif;
    --serif:    'Instrument Serif', serif;
  }

  .cl-root {
    min-height: 100vh;
    background: var(--white);
    font-family: var(--sans);
    color: var(--black);
  }

  /* ── Top bar ── */
  .cl-topbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 32px;
    gap: 16px;
  }
  .cl-topbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 8px;
  }
  .cl-topbar-icon {
    width: 24px;
    height: 24px;
    border: 1px solid var(--black);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cl-topbar-name {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 400;
  }
  .cl-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }
  .cl-breadcrumb-sep { color: var(--border2); }
  .cl-breadcrumb-current { color: var(--black); }
  .cl-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

  /* ── Page header ── */
  .cl-pagehead {
    padding: 48px 32px 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    border-bottom: 1px solid var(--border);
  }
  .cl-pagehead-left { padding-bottom: 32px; }
  .cl-eyebrow {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cl-eyebrow::before {
    content: '';
    display: block;
    width: 16px;
    height: 1px;
    background: var(--border2);
  }
  .cl-page-title {
    font-family: var(--serif);
    font-size: 44px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.01em;
    color: var(--black);
  }
  .cl-page-title em { font-style: italic; }
  .cl-page-meta {
    margin-top: 12px;
    font-size: 13px;
    font-weight: 300;
    color: var(--muted);
  }
  .cl-pagehead-tabs {
    display: flex;
    align-items: flex-end;
    gap: 0;
    align-self: flex-end;
  }
  .cl-tab {
    padding: 12px 20px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    border: none;
    background: transparent;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
  }
  .cl-tab:hover { color: var(--black); }
  .cl-tab--active { color: var(--black); border-bottom-color: var(--black); }

  /* ── Stats row ── */
  .cl-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid var(--border);
  }
  .cl-stat {
    padding: 20px 32px;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cl-stat:last-child { border-right: none; }
  .cl-stat-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .cl-stat-value {
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 400;
    color: var(--black);
    line-height: 1;
  }
  .cl-stat-sub {
    font-size: 11px;
    color: var(--muted);
    font-weight: 300;
  }

  /* ── Toolbar ── */
  .cl-toolbar {
    padding: 20px 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .cl-search-wrap {
    position: relative;
    flex: 1;
    max-width: 320px;
  }
  .cl-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
  }
  .cl-search {
    width: 100%;
    height: 36px;
    border: 1px solid var(--border);
    background: var(--off);
    padding: 0 12px 0 36px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--black);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .cl-search::placeholder { color: var(--muted); }
  .cl-search:focus { border-color: var(--black); background: var(--white); }
  .cl-toolbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .cl-count-badge {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: var(--off);
    letter-spacing: 0.04em;
  }
  .cl-btn-icon {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.2s;
  }
  .cl-btn-icon:hover { border-color: var(--black); color: var(--black); }
  .cl-btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
  .cl-btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 16px;
    background: var(--black);
    color: var(--white);
    border: none;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s;
  }
  .cl-btn-primary:hover { background: #222; }

  /* ── Table ── */
  .cl-table-wrap { overflow-x: auto; }
  .cl-table {
    width: 100%;
    border-collapse: collapse;
  }
  .cl-thead { border-bottom: 1px solid var(--border); }
  .cl-th {
    padding: 12px 16px;
    text-align: left;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 400;
    white-space: nowrap;
    background: var(--off);
  }
  .cl-th:first-child { padding-left: 32px; }
  .cl-th:last-child { padding-right: 32px; text-align: right; }

  .cl-row {
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    cursor: pointer;
  }
  .cl-row:hover { background: var(--off); }
  .cl-row:last-child { border-bottom: none; }
  .cl-td {
    padding: 16px;
    vertical-align: middle;
    font-size: 13px;
  }
  .cl-td:first-child { padding-left: 32px; }
  .cl-td:last-child { padding-right: 32px; text-align: right; }

  /* ── Category cell ── */
  .cl-cat-cell {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .cl-cat-thumb {
    width: 40px;
    height: 40px;
    background: var(--subtle);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    border: 1px solid var(--border);
  }
  .cl-cat-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .cl-cat-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--black);
    margin-bottom: 2px;
  }
  .cl-cat-slug {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }

  /* ── Children pills ── */
  .cl-children-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
  .cl-child-pill {
    font-family: var(--mono);
    font-size: 10px;
    padding: 3px 8px;
    border: 1px solid var(--border);
    color: var(--muted);
    background: var(--off);
    white-space: nowrap;
    letter-spacing: 0.04em;
  }
  .cl-children-more {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    padding: 3px 0;
  }
  .cl-empty-dash { color: var(--border2); }

  /* ── Product count ── */
  .cl-prod-count {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--black);
  }
  .cl-prod-count svg { color: var(--muted); }

  /* ── Date ── */
  .cl-date {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }

  /* ── Actions ── */
  .cl-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }
  .cl-action-btn {
    width: 30px;
    height: 30px;
    border: 1px solid transparent;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.15s;
  }
  .cl-action-btn:hover { border-color: var(--border); color: var(--black); background: var(--white); }
  .cl-action-btn--danger:hover { border-color: #f5cdc6; color: var(--red); background: #fff5f3; }

  /* ── Expand row ── */
  .cl-expand-row { background: var(--off); }
  .cl-expand-inner {
    padding: 16px 32px 20px 86px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .cl-expand-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .cl-expand-desc {
    font-size: 13px;
    font-weight: 300;
    color: var(--black);
    line-height: 1.6;
    max-width: 560px;
  }
  .cl-expand-children-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .cl-expand-child {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 11px;
    padding: 5px 10px;
    border: 1px solid var(--border);
    color: var(--black);
    background: var(--white);
    text-decoration: none;
    transition: border-color 0.15s;
  }
  .cl-expand-child:hover { border-color: var(--black); }
  .cl-expand-child svg { color: var(--muted); }

  /* ── Empty state ── */
  .cl-empty {
    padding: 80px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
  }
  .cl-empty-icon {
    width: 64px;
    height: 64px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }
  .cl-empty-title {
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 400;
  }
  .cl-empty-sub {
    font-size: 13px;
    color: var(--muted);
    font-weight: 300;
    max-width: 280px;
    line-height: 1.6;
  }

  /* ── Error banner ── */
  .cl-error {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #f5cdc6;
    background: #fff5f3;
    margin: 24px 32px;
    padding: 14px 16px;
    color: var(--red);
    font-size: 13px;
  }

  /* ── Skeleton shimmer ── */
  @keyframes cl-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .cl-skeleton {
    background: linear-gradient(90deg, var(--subtle) 25%, var(--border) 50%, var(--subtle) 75%);
    background-size: 400px 100%;
    animation: cl-shimmer 1.4s infinite;
    border-radius: 0;
  }
  .cl-skeleton-row {
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid var(--border);
  }
  .cl-skeleton-thumb { width: 40px; height: 40px; flex-shrink: 0; }
  .cl-skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .cl-skeleton-line { height: 12px; }

  /* ── Delete dialog ── */
  .cl-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }
  .cl-dialog {
    background: var(--white);
    border: 1px solid var(--border);
    padding: 32px;
    width: 380px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cl-dialog-icon {
    width: 40px;
    height: 40px;
    border: 1px solid #f5cdc6;
    background: #fff5f3;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--red);
  }
  .cl-dialog-title { font-family: var(--serif); font-size: 22px; font-weight: 400; }
  .cl-dialog-body { font-size: 13px; color: var(--muted); line-height: 1.6; font-weight: 300; }
  .cl-dialog-body strong { color: var(--black); font-weight: 500; }
  .cl-dialog-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 4px; }
  .cl-btn-ghost {
    height: 36px;
    padding: 0 16px;
    border: 1px solid var(--border);
    background: var(--white);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--black);
    transition: border-color 0.2s;
  }
  .cl-btn-ghost:hover { border-color: var(--black); }
  .cl-btn-danger {
    height: 36px;
    padding: 0 16px;
    border: none;
    background: var(--red);
    color: var(--white);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s;
  }
  .cl-btn-danger:hover:not(:disabled) { background: #aa1c00; }
  .cl-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Spin ── */
  @keyframes cl-spin { to { transform: rotate(360deg); } }
  .cl-spin { animation: cl-spin 0.8s linear infinite; }
`

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

/* ─── Sub-components ─────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="cl-skeleton-row">
      <div className="cl-skeleton cl-skeleton-thumb" />
      <div className="cl-skeleton-lines">
        <div className="cl-skeleton cl-skeleton-line" style={{ width: "38%" }} />
        <div className="cl-skeleton cl-skeleton-line" style={{ width: "22%" }} />
      </div>
      <div
        className="cl-skeleton cl-skeleton-line"
        style={{ width: "72px", height: "12px", marginLeft: "auto" }}
      />
    </div>
  )
}

function DeleteDialog({
  category,
  onConfirm,
  onCancel,
  loading,
}: {
  category: SafeCategory
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const blocked = category.productCount > 0 || category.children.length > 0
  return (
    <motion.div
      className="cl-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="cl-dialog"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cl-dialog-icon"><Trash2 size={16} /></div>
        <p className="cl-dialog-title">Delete category</p>
        <p className="cl-dialog-body">
          Delete <strong>{category.name}</strong>?{" "}
          {category.productCount > 0 && (
            <>Has <strong>{category.productCount} product{category.productCount !== 1 && "s"}</strong> — reassign them first. </>
          )}
          {category.children.length > 0 && (
            <>Has <strong>{category.children.length} sub-categor{category.children.length !== 1 ? "ies" : "y"}</strong> — remove them first.</>
          )}
          {!blocked && "This action cannot be undone."}
        </p>
        <div className="cl-dialog-actions">
          <button className="cl-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="cl-btn-danger"
            onClick={onConfirm}
            disabled={loading || blocked}
          >
            {loading && <RefreshCw size={11} className="cl-spin" />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CategoryRow({
  category,
  index,
  onDelete,
}: {
  category: Category
  index: number
  onDelete: (c:Category) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = !!category.description || category.children.length > 0

  return (
    <>
      <motion.tr
        className="cl-row"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => hasDetail && setExpanded((o) => !o)}
      >
        {/* Category info */}
        <td className="cl-td">
          <div className="cl-cat-cell">
            <div className="cl-cat-thumb">
              {category.imageUrl
                ? <img src={category.imageUrl} alt={category.name} />
                : <FolderOpen size={16} />
              }
            </div>
            <div>
              <p className="cl-cat-name">{category.name}</p>
              <p className="cl-cat-slug">/{category.slug}</p>
            </div>
          </div>
        </td>

        {/* Children */}
        <td className="cl-td">
          {category.children.length > 0 ? (
            <div className="cl-children-wrap">
              {category.children.slice(0, 3).map((c) => (
                <span key={c.id} className="cl-child-pill">{c.name}</span>
              ))}
              {category.children.length > 3 && (
                <span className="cl-children-more">+{category.children.length - 3}</span>
              )}
            </div>
          ) : (
            <span className="cl-empty-dash">—</span>
          )}
        </td>

        {/* Products */}
        <td className="cl-td">
          <span className="cl-prod-count">
            <Package size={12} />
            {category.productCount}
          </span>
        </td>

        {/* Created */}
        <td className="cl-td">
          <span className="cl-date">{fmt(category.createdAt)}</span>
        </td>

        {/* Actions */}
        <td className="cl-td">
          <div className="cl-actions" onClick={(e) => e.stopPropagation()}>
            {hasDetail && (
              <motion.button
                className="cl-action-btn"
                onClick={(e) => { e.stopPropagation(); setExpanded((o) => !o) }}
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                title="Expand details"
              >
                <ChevronDown size={13} />
              </motion.button>
            )}
            <Link href={`/admin/category/${category.id}`}>
              <button className="cl-action-btn" title="Edit">
                <Pencil size={13} />
              </button>
            </Link>
            <button
              className="cl-action-btn cl-action-btn--danger"
              onClick={() => onDelete(category)}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </motion.tr>

      {/* Expandable detail */}
      <AnimatePresence initial={false}>
        {expanded && hasDetail && (
          <motion.tr
            className="cl-expand-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <td colSpan={5}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="cl-expand-inner">
                  {category.description && (
                    <div>
                      <p className="cl-expand-label">Description</p>
                      <p className="cl-expand-desc">{category.description}</p>
                    </div>
                  )}
                  {category.children.length > 0 && (
                    <div>
                      <p className="cl-expand-label">Sub-categories</p>
                      <div className="cl-expand-children-list">
                        {category.children.map((c) => (
                          <Link key={c.id} href={`/admin/category/${c.id}`} className="cl-expand-child">
                            <FolderOpen size={11} />
                            {c.name}
                            <ChevronRight size={10} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export default function CategoriesPage() {
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<SafeCategory | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const category=useCategory()
    const {data:allCategory,error,isLoading, refetch}=category.getAllCategory()
    const categories=allCategory?.data || []
    const fetchCategories = refetch

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }
      setDeleteTarget(null)
      refetch()
    } catch (e: unknown) {
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.includes(search.toLowerCase())
  )

  const totalChildren = categories.reduce((a, c) => a + c.children.length, 0)
  const totalProducts = categories.reduce((a, c) => a + c.productCount, 0)
  const withImage    = categories.filter((c) => c.imageUrl).length

  return (
    <>
      <style>{css}</style>

      <div className="cl-root">

        {/* Top bar */}
        <header className="cl-topbar">
          <div className="cl-topbar-brand">
            <div className="cl-topbar-icon"><FolderTree size={12} /></div>
            <span className="cl-topbar-name">Catalog</span>
          </div>
          <div className="cl-breadcrumb">
            <span>Admin</span>
            <span className="cl-breadcrumb-sep">/</span>
            <span className="cl-breadcrumb-current">Categories</span>
          </div>
          <div className="cl-topbar-right">
            <Link href="/admin/category/create">
              <div className="cl-btn-primary">
                <Plus size={13} />
                New category
              </div>
            </Link>
          </div>
        </header>

        {/* Page header */}
        <div className="cl-pagehead">
          <motion.div
            className="cl-pagehead-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="cl-eyebrow">Product catalog</p>
            <h1 className="cl-page-title">All <em>Categories</em></h1>
            <p className="cl-page-meta">
              Root categories only — sub-categories are nested inside each entry.
            </p>
          </motion.div>
          <div className="cl-pagehead-tabs">
            <button className="cl-tab cl-tab--active">All</button>
            <button className="cl-tab">With products</button>
            <button className="cl-tab">Empty</button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          className="cl-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {[
            { label: "Root categories", value: categories.length, sub: "top level" },
            { label: "Sub-categories",  value: totalChildren,    sub: "nested"    },
            { label: "Total products",  value: totalProducts,    sub: "across all"},
            { label: "With image",      value: withImage,        sub: `of ${categories.length}` },
          ].map((s) => (
            <div key={s.label} className="cl-stat">
              <p className="cl-stat-label">{s.label}</p>
              <p className="cl-stat-value">{s.value}</p>
              <p className="cl-stat-sub">{s.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Toolbar */}
        <div className="cl-toolbar">
          <div className="cl-search-wrap">
            <Search size={13} className="cl-search-icon" />
            <input
              className="cl-search"
              placeholder="Search by name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="cl-toolbar-right">
            <span className="cl-count-badge">{filtered.length} / {categories.length}</span>
            <button
              className="cl-btn-icon"
              onClick={()=>{}}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw size={13} className={isLoading ? "cl-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="cl-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle size={16} />
              {error?.message||'someting went wrong'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {isLoading ? (
          <div>{Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="cl-empty">
            <div className="cl-empty-icon"><FolderOpen size={28} /></div>
            <p className="cl-empty-title">
              {search ? "No results found" : "No categories yet"}
            </p>
            <p className="cl-empty-sub">
              {search
                ? `Nothing matches "${search}".`
                : "Create your first category to start organising products."}
            </p>
            {!search && (
              <Link href="/admin/category/create">
                <div className="cl-btn-primary" style={{ marginTop: "8px" }}>
                  <Plus size={13} />New category
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="cl-table-wrap">
            <table className="cl-table">
              <thead className="cl-thead">
                <tr>
                  <th className="cl-th" style={{ width: "35%" }}>Category</th>
                  <th className="cl-th" style={{ width: "28%" }}>Sub-categories</th>
                  <th className="cl-th" style={{ width: "12%" }}>Products</th>
                  <th className="cl-th" style={{ width: "15%" }}>Created</th>
                  <th className="cl-th" style={{ width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat, i) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    index={i}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            category={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </>
  )
}