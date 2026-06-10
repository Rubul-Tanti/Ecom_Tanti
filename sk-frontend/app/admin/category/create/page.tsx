"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  Variants,
} from "framer-motion"
import {
  Upload,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FolderOpen,
  Hash,
  Type,
  AlignLeft,
  Link2,
} from "lucide-react"
import useCategory from "@/hooks/use-category"
import { CgSpinner } from "react-icons/cg"
import { toast } from "react-toastify"

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface FormState {
  name: string
  description: string
  parentId: string
}

interface ImageFile {
  file: File
  preview: string
}

type Status = "idle" | "loading" | "success" | "error"

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black:   #0a0a0a;
    --white:   #ffffff;
    --off:     #fafafa;
    --border:  #e8e8e8;
    --muted:   #a0a0a0;
    --subtle:  #f2f2f2;
    --red:     #d4290d;
    --green:   #1a7a4a;
    --accent:  #0a0a0a;
    --mono:    'Geist Mono', monospace;
    --sans:    'Geist', sans-serif;
    --serif:   'Cormorant Garamond', serif;
  }

  .cc-root {
    min-height: 100vh;
    background: var(--white);
    font-family: var(--sans);
    color: var(--black);
    display: grid;
    grid-template-columns: 1fr 520px 1fr;
    grid-template-rows: auto 1fr;
  }

  /* ── Sidebar rail ── */
  .cc-rail {
    grid-column: 1;
    grid-row: 1 / 3;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 48px 32px;
    gap: 48px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
  .cc-rail-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cc-rail-mark {
    width: 28px;
    height: 28px;
    border: 1.5px solid var(--black);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cc-rail-mark svg {
    width: 12px;
    height: 12px;
  }
  .cc-rail-brand {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--black);
  }
  .cc-rail-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1;
  }
  .cc-step {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 0;
    position: relative;
  }
  .cc-step::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 40px;
    bottom: -16px;
    width: 1px;
    background: var(--border);
  }
  .cc-step:last-child::before { display: none; }
  .cc-step-num {
    width: 30px;
    height: 30px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 400;
    color: var(--muted);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  .cc-step--active .cc-step-num {
    border-color: var(--black);
    background: var(--black);
    color: var(--white);
  }
  .cc-step--done .cc-step-num {
    border-color: var(--green);
    background: var(--green);
    color: var(--white);
  }
  .cc-step-info { padding-top: 4px; }
  .cc-step-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 2px;
    transition: color 0.3s ease;
  }
  .cc-step--active .cc-step-label { color: var(--black); }
  .cc-step-desc {
    font-size: 12px;
    color: var(--muted);
    font-weight: 300;
    line-height: 1.5;
  }
  .cc-rail-foot {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.08em;
  }

  /* ── Main column ── */
  .cc-main {
    grid-column: 2;
    grid-row: 1 / 3;
    border-right: 1px solid var(--border);
    padding: 64px 48px 96px;
    min-height: 100vh;
  }

  /* ── Right column ── */
  .cc-aside {
    grid-column: 3;
    grid-row: 1 / 3;
    padding: 48px 32px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
  .cc-preview-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
  }
  .cc-preview-card {
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .cc-preview-img {
    width: 100%;
    height: 140px;
    background: var(--subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .cc-preview-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cc-preview-img-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--muted);
  }
  .cc-preview-img-placeholder span {
    font-size: 11px;
    font-family: var(--mono);
    letter-spacing: 0.06em;
  }
  .cc-preview-body { padding: 16px; }
  .cc-preview-name {
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 400;
    color: var(--black);
    margin-bottom: 4px;
    min-height: 28px;
  }
  .cc-preview-slug {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 10px;
    min-height: 16px;
  }
  .cc-preview-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.6;
    font-weight: 300;
    min-height: 18px;
  }
  .cc-hint-box {
    border: 1px solid var(--border);
    padding: 16px;
  }
  .cc-hint-title {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--black);
    margin-bottom: 12px;
  }
  .cc-hint-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
  }
  .cc-hint-item svg { flex-shrink: 0; margin-top: 1px; }
  .cc-hint-item:last-child { margin-bottom: 0; }

  /* ── Page header ── */
  .cc-header {
    margin-bottom: 52px;
  }
  .cc-eyebrow {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cc-eyebrow::before {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: var(--muted);
  }
  .cc-title {
    font-family: var(--serif);
    font-size: 52px;
    font-weight: 300;
    line-height: 1;
    color: var(--black);
    letter-spacing: -0.01em;
  }
  .cc-title em {
    font-style: italic;
    font-weight: 300;
  }
  .cc-subtitle {
    margin-top: 14px;
    font-size: 13px;
    color: var(--muted);
    font-weight: 300;
    line-height: 1.6;
    max-width: 340px;
  }

  /* ── Form ── */
  .cc-form { display: flex; flex-direction: column; gap: 28px; }

  /* ── Field ── */
  .cc-field { display: flex; flex-direction: column; gap: 8px; }
  .cc-field-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cc-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--black);
  }
  .cc-label svg { color: var(--muted); }
  .cc-label-optional {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.06em;
  }
  .cc-input-wrap { position: relative; }
  .cc-input,
  .cc-textarea {
    width: 100%;
    border: 1px solid var(--border);
    background: var(--white);
    color: var(--black);
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 400;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }
  .cc-input::placeholder,
  .cc-textarea::placeholder { color: var(--muted); }
  .cc-input:focus,
  .cc-textarea:focus {
    border-color: var(--black);
    background: var(--off);
  }
  .cc-input--error { border-color: var(--red) !important; }
  .cc-textarea { resize: none; line-height: 1.6; }
  .cc-char-count {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    text-align: right;
    margin-top: 4px;
    letter-spacing: 0.04em;
  }
  .cc-field-error {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--red);
    font-weight: 400;
  }

  /* ── Slug preview ── */
  .cc-slug-preview {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid var(--border);
    background: var(--subtle);
    overflow: hidden;
    height: 40px;
  }
  .cc-slug-base {
    padding: 0 12px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    border-right: 1px solid var(--border);
    height: 100%;
    display: flex;
    align-items: center;
    white-space: nowrap;
    flex-shrink: 0;
    background: var(--white);
  }
  .cc-slug-value {
    padding: 0 12px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--black);
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cc-slug-empty { color: var(--muted); }

  /* ── Dropzone ── */
  .cc-drop {
    border: 1.5px dashed var(--border);
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
    overflow: hidden;
  }
  .cc-drop:hover,
  .cc-drop--drag { border-color: var(--black); background: var(--off); }
  .cc-drop-icon { color: var(--muted); transition: color 0.2s; }
  .cc-drop:hover .cc-drop-icon,
  .cc-drop--drag .cc-drop-icon { color: var(--black); }
  .cc-drop-text {
    font-size: 13px;
    color: var(--muted);
    text-align: center;
  }
  .cc-drop-text strong { color: var(--black); font-weight: 500; }
  .cc-drop-hint {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.08em;
  }
  .cc-img-preview {
    position: relative;
    margin-top: 4px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .cc-img-preview img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }
  .cc-img-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    background: var(--white);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.2s;
  }
  .cc-img-remove:hover { background: var(--black); color: var(--white); border-color: var(--black); }

  /* ── Parent selector ── */
  .cc-select-wrap { position: relative; }
  .cc-select {
    width: 100%;
    border: 1px solid var(--border);
    background: var(--white);
    color: var(--black);
    font-family: var(--mono);
    font-size: 13px;
    padding: 12px 40px 12px 14px;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .cc-select:focus { border-color: var(--black); background: var(--off); }
  .cc-select-chevron {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--muted);
  }

  /* ── Divider ── */
  .cc-divider {
    height: 1px;
    background: var(--border);
    margin: 4px 0;
  }

  /* ── Submit ── */
  .cc-submit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
  }
  .cc-submit-meta {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }
  .cc-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--black);
    color: var(--white);
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 14px 28px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }
  .cc-btn:hover:not(:disabled) { background: #1f1f1f; }
  .cc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .cc-btn-arrow {
    font-family: var(--mono);
    color: #666;
    transition: transform 0.2s;
  }
  .cc-btn:hover .cc-btn-arrow { transform: translateX(3px); }

  /* ── Alert ── */
  .cc-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 4px;
  }
  .cc-alert--error { color: var(--red); background: #fff5f3; border-color: #f5cdc6; }
  .cc-alert--success { color: var(--green); background: #f0faf5; border-color: #b8e6cf; }
  .cc-alert svg { flex-shrink: 0; margin-top: 1px; }

  /* ── Spin ── */
  @keyframes cc-spin { to { transform: rotate(360deg); } }
  .cc-spin { animation: cc-spin 0.8s linear infinite; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .cc-root {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }
    .cc-rail { display: none; }
    .cc-aside { display: none; }
    .cc-main {
      grid-column: 1;
      border-right: none;
      padding: 48px 24px 80px;
    }
  }
`

/* ─── Helpers ────────────────────────────────────────────── */
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

/* ─── Animation presets ──────────────────────────────────── */
const fadeUp:Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ─── Sidebar steps ──────────────────────────────────────── */
const STEPS = [
  { label: "Identity", desc: "Name and slug of the category" },
  { label: "Description", desc: "Optional context for shoppers" },
  { label: "Image", desc: "Thumbnail for the listing" },
  { label: "Hierarchy", desc: "Optional parent category" },
]

/* ─── Preview panel ──────────────────────────────────────── */
function PreviewPanel({ name, description, image }: {
  name: string
  description: string
  image: ImageFile | null
}) {
  const slug = toSlug(name)
  return (
    <div>
      <p className="cc-preview-label">Live preview</p>
      <div className="cc-preview-card">
        <div className="cc-preview-img">
          {image ? (
            <img src={image.preview} alt="" />
          ) : (
            <div className="cc-preview-img-placeholder">
              <FolderOpen size={24} />
              <span>no image</span>
            </div>
          )}
        </div>
        <div className="cc-preview-body">
          <p className="cc-preview-name">{name || "Category name"}</p>
          <p className="cc-preview-slug">{slug ? `/${slug}` : "/category-slug"}</p>
          <p className="cc-preview-desc">{description || "Category description will appear here."}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export default function CreateCategoryPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({ name: "", description: "", parentId: "none" })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [image, setImage] = useState<ImageFile | null>(null)
  const [drag, setDrag] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const category=useCategory()
  const {data:allCategory,error,isLoading}=category.getAllCategory()
  const createCategory=category.createCategory()
  const AllCategory=allCategory?.data
  // Determine active step for sidebar
  const activeStep =
    form.name ? (form.description ? (image ? 3 : 2) : 1) : 0

  const set = (field: keyof FormState) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    if (image) URL.revokeObjectURL(image.preview)
    setImage({ file, preview: URL.createObjectURL(file) })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const validate = (): boolean => {
    const errs: Partial<FormState> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    else if (form.name.length < 2) errs.name = "Name must be at least 2 characters"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
      const fd = new FormData()
      fd.append("name", form.name.trim())
      if (form.description.trim()) fd.append("description", form.description.trim())
        console.log(form.parentId)
      if (form.parentId.trim()!=='none') fd.append("parentId", form.parentId.trim())
      if (image?.file) fd.append("image", image.file)
        createCategory.mutate(fd,{onSuccess:()=>{

      toast("Category created successfully")
        router.push("/admin/category")
    },onError:(e)=>{
          toast('something went wrong please try again later')
        }})
  }

  const slug = toSlug(form.name)

  return (
    <>
      <style>{css}</style>

      <div className="cc-root">

        {/* ── Sidebar ── */}
        <aside className="cc-rail">
          <div className="cc-rail-logo">
            <div className="cc-rail-mark">
              <FolderOpen size={12} />
            </div>
            <span className="cc-rail-brand">Categories</span>
          </div>

          <div className="cc-rail-steps">
            {STEPS.map((s, i) => (
              <div
                key={s.label}
                className={`cc-step ${i === activeStep ? "cc-step--active" : ""} ${i < activeStep ? "cc-step--done" : ""}`}
              >
                <div className="cc-step-num">
                  {i < activeStep ? <CheckCircle2 size={12} /> : String(i + 1).padStart(2, "0")}
                </div>
                <div className="cc-step-info">
                  <p className="cc-step-label">{s.label}</p>
                  <p className="cc-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="cc-rail-foot">admin / catalog / create</p>
        </aside>

        {/* ── Main form ── */}
        <main className="cc-main">

          {/* Header */}
          <motion.div
            className="cc-header"
            variants={fadeUp} custom={0} initial="hidden" animate="show"
          >
            <p className="cc-eyebrow">Catalog management</p>
            <h1 className="cc-title">
              New<br /><em>Category</em>
            </h1>
            <p className="cc-subtitle">
              Define a category to organise products in your storefront. All fields except name are optional.
            </p>
          </motion.div>

          <form className="cc-form" onSubmit={handleSubmit} noValidate>

            {/* ── Name ── */}
            <motion.div
              className="cc-field"
              variants={fadeUp} custom={1} initial="hidden" animate="show"
            >
              <div className="cc-field-head">
                <label className="cc-label" htmlFor="cat-name">
                  <Type size={12} /> Name
                </label>
              </div>
              <input
                id="cat-name"
                className={`cc-input${errors.name ? " cc-input--error" : ""}`}
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="e.g. Men's Footwear"
                autoComplete="off"
                autoFocus
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    className="cc-field-error"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  >
                    <AlertCircle size={11} /> {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Slug preview ── */}
            <AnimatePresence>
              {form.name && (
                <motion.div
                  className="cc-field"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                >
                  <label className="cc-label">
                    <Hash size={12} /> Generated slug
                  </label>
                  <div className="cc-slug-preview">
                    <span className="cc-slug-base">{process.env.NEXT_PUBLIC_FRONTEND_URL}/categories/</span>
                    <span className={`cc-slug-value${!slug ? " cc-slug-empty" : ""}`}>
                      {slug || "…"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="cc-divider" />

            {/* ── Description ── */}
            <motion.div
              className="cc-field"
              variants={fadeUp} custom={2} initial="hidden" animate="show"
            >
              <div className="cc-field-head">
                <label className="cc-label" htmlFor="cat-desc">
                  <AlignLeft size={12} /> Description
                </label>
                <span className="cc-label-optional">optional</span>
              </div>
              <textarea
                id="cat-desc"
                className="cc-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="A short description visible to shoppers browsing this category…"
                maxLength={500}
              />
              <p className="cc-char-count">{form.description.length} / 500</p>
            </motion.div>

            <div className="cc-divider" />

            {/* ── Image upload ── */}
            <motion.div
              className="cc-field"
              variants={fadeUp} custom={3} initial="hidden" animate="show"
            >
              <div className="cc-field-head">
                <label className="cc-label">
                  <Upload size={12} /> Category image
                </label>
                <span className="cc-label-optional">optional</span>
              </div>

              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.div
                    key="drop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`cc-drop${drag ? " cc-drop--drag" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={20} className="cc-drop-icon" />
                    <p className="cc-drop-text">
                      <strong>Click to upload</strong> or drag &amp; drop
                    </p>
                    <p className="cc-drop-hint">PNG · JPG · WEBP · max 4 MB</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleFile(f)
                        e.target.value = ""
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="cc-img-preview"
                  >
                    <img src={image.preview} alt="Category preview" />
                    <button
                      type="button"
                      className="cc-img-remove"
                      onClick={() => { URL.revokeObjectURL(image.preview); setImage(null) }}
                      aria-label="Remove image"
                    >
                      <X size={13} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="cc-divider" />

            {/* ── Parent category ── */}
            <motion.div
              className="cc-field"
              variants={fadeUp} custom={4} initial="hidden" animate="show"
            >
              <div className="cc-field-head">
                <label className="cc-label" htmlFor="cat-parent">
                  <Link2 size={12} /> Parent category ID
                </label>
                <span className="cc-label-optional">optional</span>
              </div>
                <Select onValueChange={(e)=>{setForm(pre=>({...pre,parentId:e}))}}>
  <SelectTrigger style={{paddingLeft:20}} className="w-[180px]">
    <SelectValue   placeholder="Parent category id" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem   className="hover:bg-white" value='none'>none</SelectItem>
      {isLoading?<div  className="bg-gray-50 animate-pulse"><CgSpinner className="animate-spin"/></div>:AllCategory?.length!==0&&AllCategory?.map((c,i)=><SelectItem style={{padding:5}} key={i} value={c.id} >{c.name}</SelectItem>)}
    </SelectGroup>
  </SelectContent>
</Select>
              <p className="cc-char-count" style={{ textAlign: "left", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>
                Leave blank to create a root-level category
              </p>
            </motion.div>

            {/* ── Alerts + submit ── */}
            <motion.div
              variants={fadeUp} custom={5} initial="hidden" animate="show"
            >
              <AnimatePresence mode="wait">
                {status === "error" && (
                  <motion.div
                    key="err"
                    className="cc-alert cc-alert--error"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  >
                    <AlertCircle size={14} />
                    {errorMsg || "Something went wrong. Please try again."}
                  </motion.div>
                )}
                {status === "success" && (
                  <motion.div
                    key="ok"
                    className="cc-alert cc-alert--success"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  >
                    <CheckCircle2 size={14} />
                    Category created — redirecting…
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="cc-submit-row">
                <span className="cc-submit-meta">
                  {slug ? `/${slug}` : "—"}
                </span>
                <motion.button
                  type="submit"
                  className="cc-btn"
                  disabled={createCategory.isPending}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.12 }}
                >
                  {createCategory.isPending ? (
                    <>
                      <Loader2 size={13} className="cc-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      Create category
                      <span className="cc-btn-arrow">→</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

          </form>
        </main>

        {/* ── Right aside: live preview + hints ── */}
        <aside className="cc-aside">
          <PreviewPanel name={form.name} description={form.description} image={image} />

          <div className="cc-hint-box">
            <p className="cc-hint-title">Field guide</p>
            <div className="cc-hint-item">
              <Type size={12} />
              <span><strong>Name</strong> is used to generate the URL slug automatically.</span>
            </div>
            <div className="cc-hint-item">
              <Hash size={12} />
              <span><strong>Slug</strong> is auto-derived and must be unique across all categories.</span>
            </div>
            <div className="cc-hint-item">
              <Link2 size={12} />
              <span><strong>Parent ID</strong> nests this under an existing category. Leave blank for root.</span>
            </div>
            <div className="cc-hint-item">
              <Upload size={12} />
              <span><strong>Image</strong> is uploaded to Cloudinary. Recommended: 1:1 ratio, min 600 × 600px.</span>
            </div>
          </div>
        </aside>

      </div>
    </>
  )
}