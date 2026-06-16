"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, Variants } from "framer-motion"
import { Plus, Trash2, Upload, X, ChevronDown, AlertCircle, CheckCircle2, Loader2, Cross, Minus } from "lucide-react"
import useCategory from "@/hooks/use-category"
import {useRouter} from "next/navigation"
/* ─── Types ─────────────────────────────────────────────── */
interface ImageMeta {
  file: File | null
  preview: string
  altText: string
  isPrimary: boolean
}
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CgSpinner } from "react-icons/cg"
import useProduct from "@/hooks/use-product"
import { toast } from "react-toastify"
import Image from "next/image"

interface Variant {
  id: string
  size: string
  color: string
  colorName: string
  finalPrice:number,
  deliveryCharge:number,
  price: number
  discountPrice: number
  discountPercentage: number
  stock: number
  stockToDisplay: number
  lowStockThreshold: number
  images: ImageMeta[]
}

/* ─── localStorage key ───────────────────────────────────── */
const FORM_STORAGE_KEY = "create_product_draft"

/* ─── Draft helpers ──────────────────────────────────────── */
function loadDraft() {
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY)
  } catch {}
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"]

const emptyVariant = (): Variant => ({
  id: crypto.randomUUID(),
  size: "",
  color: "",
  deliveryCharge:0,
  colorName: "",
  price: 0,
  discountPrice: 0,
  discountPercentage: 0,
  stock: 0,
  stockToDisplay: 0,
  lowStockThreshold: 5,
  images: [],
  finalPrice:0
})

/* ─── Animation Variants ─────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const variantCard: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.25 } },
}

/* ─── Global Styles ──────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; }

  .pm-page {
    min-height: 100vh;
    background: #ffffff;
    color: #000000;
  }

  /* ── Progress bar ── */
  .pm-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: #000000;
    z-index: 50;
    transform-origin: left center;
  }

  /* ── Header ── */
  .pm-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: #ffffff;
    border-bottom: 1px solid #f5f5f5;
  }
  .pm-header-inner {
    max-width: 896px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pm-header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pm-header-dot {
    width: 8px;
    height: 8px;
    background: #000000;
    flex-shrink: 0;
  }
  .pm-header-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .pm-header-sub {
    font-size: 11px;
    color: #a3a3a3;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  /* ── Main layout ── */
  .pm-main {
    max-width: 896px;
    margin: 0 auto;
    padding: 56px 24px;
  }

  /* ── Page title ── */
  .pm-page-eyebrow {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #a3a3a3;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .pm-page-h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.05;
    color: #000000;
  }
  .pm-page-h1 em {
    font-style: italic;
  }
  .pm-page-divider {
    margin-top: 20px;
    height: 1px;
    background: #f5f5f5;
    width: 100%;
  }
  .pm-page-title-block {
    margin-bottom: 48px;
  }

  /* ── Form ── */
  .pm-form {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  /* ── Section label ── */
  .pm-section-label {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pm-section-num {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
    font-weight: 700;
    color: #f5f5f5;
    line-height: 1;
    user-select: none;
  }
  .pm-section-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pm-section-tag {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #a3a3a3;
    font-weight: 600;
    line-height: 1;
  }
  .pm-section-name {
    font-size: 16px;
    font-weight: 600;
    color: #000000;
    line-height: 1;
  }

  /* ── Section bodies ── */
  .pm-section-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 24px;
  }
  .pm-section-header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  /* ── Field ── */
  .pm-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pm-field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #737373;
  }
  .pm-field-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #ef4444;
    font-weight: 500;
  }

  /* ── Input / Textarea ── */
  .pm-input,
  .pm-textarea {
    width: 100%;
    border: 1px solid #e5e5e5;
    background: #ffffff;
    color: #000000;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s ease;
    appearance: none;
    -webkit-appearance: none;
  }
  .pm-input::placeholder,
  .pm-textarea::placeholder {
    color: #d4d4d4;
  }
  .pm-input:focus,
  .pm-textarea:focus {
    border-color: #000000;
  }
  .pm-textarea {
    resize: none;
    rows: 3;
  }

  /* ── Hex color input with live swatch ── */
  .pm-color-input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid #e5e5e5;
    transition: border-color 0.2s ease;
    overflow: hidden;
  }
  .pm-color-input-wrap:focus-within {
    border-color: #000000;
  }
  .pm-color-swatch {
    width: 38px;
    height: 40px;
    flex-shrink: 0;
    border-right: 1px solid #e5e5e5;
    position: relative;
    cursor: pointer;
  }
  .pm-color-swatch input[type="color"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    border: none;
    padding: 0;
  }
  .pm-color-hex-input {
    flex: 1;
    border: none;
    background: #ffffff;
    color: #000000;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
  }
  .pm-color-hex-input::placeholder {
    color: #d4d4d4;
  }

  /* ── Grid helpers ── */
  .pm-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .pm-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }

  /* ── Toggle ── */
  .pm-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #e5e5e5;
    padding: 12px 16px;
    background: transparent;
    cursor: pointer;
    transition: border-color 0.2s ease;
    width: 100%;
  }
  .pm-toggle-btn:hover {
    border-color: #000000;
  }
  .pm-toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: #000000;
  }
  .pm-toggle-track {
    position: relative;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
    transition: background-color 0.3s ease;
  }
  .pm-toggle-track--on  { background: #000000; }
  .pm-toggle-track--off { background: #e5e5e5; }
  .pm-toggle-thumb {
    position: absolute;
    top: 2px;
    width: 16px;
    height: 16px;
    background: #ffffff;
  }

  /* ── Policies grid ── */
  .pm-policies-body {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ── Subsection heading inside variant card ── */
  .pm-sub-heading {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #a3a3a3;
    margin-bottom: 12px;
  }

  /* ── Variant card ── */
  .pm-variant-card {
    border: 1px solid #e5e5e5;
    overflow: hidden;
  }
  .pm-variant-toggle-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  .pm-variant-toggle-btn:hover {
    background: #fafafa;
  }
  .pm-variant-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pm-variant-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #a3a3a3;
    border: 1px solid #e5e5e5;
    padding: 2px 8px;
  }
  .pm-variant-name {
    font-size: 14px;
    font-weight: 500;
    color: #000000;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pm-variant-color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #e5e5e5;
    flex-shrink: 0;
  }
  .pm-variant-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pm-variant-delete-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #d4d4d4;
    padding: 4px;
    transition: color 0.2s ease;
    line-height: 0;
  }
  .pm-variant-delete-btn:hover { color: #ef4444; }

  .pm-variant-body {
    padding: 4px 20px 20px;
    border-top: 1px solid #f5f5f5;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }

  /* ── Image dropzone ── */
  .pm-dropzone {
    border: 2px dashed #e5e5e5;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }
  .pm-dropzone:hover { border-color: #000000; }
  .pm-dropzone-icon { color: #a3a3a3; }
  .pm-dropzone-text {
    font-size: 14px;
    color: #737373;
  }
  .pm-dropzone-text strong {
    font-weight: 600;
    color: #000000;
  }
  .pm-dropzone-hint {
    font-size: 11px;
    color: #a3a3a3;
    letter-spacing: 0.05em;
  }

  .pm-image-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 0;
  }
  .pm-image-item {
    border: 1px solid #e5e5e5;
    overflow: hidden;
  }
  .pm-image-item-inner {
    display: flex;
    gap: 12px;
    padding: 12px;
  }
  .pm-image-thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid #f5f5f5;
  }
  .pm-image-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pm-image-alt-input {
    width: 100%;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    border: none;
    border-bottom: 1px solid #e5e5e5;
    outline: none;
    padding-bottom: 4px;
    background: transparent;
    transition: border-color 0.2s ease;
    color: #000000;
  }
  .pm-image-alt-input::placeholder { color: #d4d4d4; }
  .pm-image-alt-input:focus { border-bottom-color: #000000; }
  .pm-image-primary-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .pm-image-primary-box {
    width: 14px;
    height: 14px;
    border: 1px solid #d4d4d4;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  .pm-image-primary-box--active {
    background: #000000;
    border-color: #000000;
  }
  .pm-image-primary-dot {
    width: 6px;
    height: 6px;
    background: #ffffff;
  }
  .pm-image-primary-text {
    font-size: 11px;
    color: #737373;
  }
  .pm-image-remove-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #d4d4d4;
    align-self: flex-start;
    margin-top: 2px;
    padding: 0;
    line-height: 0;
    transition: color 0.2s ease;
  }
  .pm-image-remove-btn:hover { color: #ef4444; }

  /* ── Add variant button ── */
  .pm-add-variant-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #000000;
    margin-bottom: 4px;
    transition: opacity 0.2s ease;
  }
  .pm-add-variant-btn:hover { opacity: 0.6; }

  /* ── Submit area ── */
  .pm-submit-section {
    padding-top: 16px;
    border-top: 1px solid #f5f5f5;
  }
  .pm-submit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pm-submit-meta {
    font-size: 12px;
    color: #a3a3a3;
  }
  .pm-submit-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #000000;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 14px 32px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .pm-submit-btn:hover:not(:disabled) { background: #262626; }
  .pm-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pm-submit-arrow { color: #737373; }

  /* ── Alert banners ── */
  .pm-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    padding: 12px 16px;
    margin-bottom: 16px;
    border: 1px solid;
  }
  .pm-alert--error {
    color: #dc2626;
    background: #fef2f2;
    border-color: #fecaca;
  }
  .pm-alert--success {
    color: #065f46;
    background: #ecfdf5;
    border-color: #a7f3d0;
  }

  /* ── Spin animation ── */
  @keyframes pm-spin {
    to { transform: rotate(360deg); }
  }
  .pm-spin {
    animation: pm-spin 1s linear infinite;
  }
`

/* ─── Sub-components ─────────────────────────────────────── */
function Field({
  label,
  error,
  children,
  style,
}: {
  label: string
  error?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className="pm-field" style={style}>
      <label className="pm-field-label">{label}</label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pm-field-error"
        >
          <AlertCircle size={11} /> {error}
        </motion.p>
      )}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  textarea?: boolean
}) {
  return textarea ? (
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pm-textarea"
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pm-input"
    />
  )
}

/* ─── Hex Color Input with live swatch ──────────────────── */
function HexColorInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const pickerValue =
    value.startsWith("#") && value.length === 7 ? value : "#000000"

  const handleTextChange = (raw: string) => {
    let val = raw
    if (val && !val.startsWith("#")) val = "#" + val
    onChange(val)
  }

  return (
    <div className="pm-color-input-wrap">
      <div
        className="pm-color-swatch"
        style={{ backgroundColor: pickerValue }}
        title="Click to open colour picker"
      >
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="#000000"
        maxLength={7}
        className="pm-color-hex-input"
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="pm-toggle-btn"
    >
      <span className="pm-toggle-label">{label}</span>
      <div className={`pm-toggle-track ${checked ? "pm-toggle-track--on" : "pm-toggle-track--off"}`}>
        <motion.div
          animate={{ x: checked ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="pm-toggle-thumb"
        />
      </div>
    </button>
  )
}

function SizeMultiSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const selectedSizes = value ? value.split(",").map((s) => s.trim()) : []

  const toggleSize = (size: string) => {
    let updated: string[]
    if (selectedSizes.includes(size)) {
      updated = selectedSizes.filter((s) => s !== size)
    } else {
      updated = [...selectedSizes, size]
    }
    onChange(updated.join(","))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {AVAILABLE_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            style={{
              padding: "8px 12px",
              border: selectedSizes.includes(size) ? "1px solid #000000" : "1px solid #e5e5e5",
              background: selectedSizes.includes(size) ? "#000000" : "#ffffff",
              color: selectedSizes.includes(size) ? "#ffffff" : "#000000",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
              transition: "all 0.2s ease",
              borderRadius: "0",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {size}
          </button>
        ))}
      </div>
      {selectedSizes.length > 0 && (
        <div style={{ fontSize: "11px", color: "#a3a3a3", fontFamily: "'DM Mono', monospace" }}>
          Selected: {value}
        </div>
      )}
    </div>
  )
}

function ImageDropzone({
  images,
  onAdd,
  variantName,
  onRemove,
  onUpdate,
}: {
  variantName: string
  images: ImageMeta[]
  onAdd: (files: File[]) => void
  onRemove: (i: number) => void
  onUpdate: (i: number, field: keyof ImageMeta, value: string | boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length) onAdd(files)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <motion.div
        animate={{ borderColor: drag ? "#000" : "#e5e5e5" }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="pm-dropzone"
      >
        <Upload size={20} className="pm-dropzone-icon" />
        <p className="pm-dropzone-text">
          <strong>Click to upload</strong> or drag &amp; drop
        </p>
        <p className="pm-dropzone-hint">PNG, JPG, WEBP</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length) onAdd(files)
            e.target.value = ""
          }}
        />
      </motion.div>

      <AnimatePresence>
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pm-image-item"
          >
            <div className="pm-image-item-inner">
              <img src={img.preview} alt="" className="pm-image-thumb" />
              <div className="pm-image-meta">
                <input
                  type="number"
                  required={true}
                  defaultValue={i}
                  value={img.altText.split("_")[1]}
                  onChange={(e) => onUpdate(i, "altText", `${variantName}_${e.target.value||i}`)}
                  placeholder="sort order"
                  className="pm-image-alt-input"
                />
                <label className="pm-image-primary-label">
                  <div
                    onClick={() => onUpdate(i, "isPrimary", true)}
                    className={`pm-image-primary-box ${img.isPrimary ? "pm-image-primary-box--active" : ""}`}
                  >
                    {img.isPrimary && <div className="pm-image-primary-dot" />}
                  </div>
                  <span className="pm-image-primary-text">Primary image</span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="pm-image-remove-btn"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function VariantPanel({
  variant,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  variant: Variant
  index: number
  onUpdate: (id: string, field: keyof Variant, value: string | ImageMeta[]) => void
  onRemove: (id: string) => void
  canRemove: boolean
}) {
  const [open, setOpen] = useState(true)

  const set = (field: keyof Variant) => (value: string) =>
    onUpdate(variant.id, field, value)

  const addImages = (files: File[]) => {
    const newImgs: ImageMeta[] = files.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      altText: "",
      isPrimary: variant.images.length === 0,
    }))
    console.log(newImgs)
    onUpdate(variant.id, "images", [...variant.images, ...newImgs])
  }

  const removeImage = (i: number) => {
    const next = variant.images.filter((_, idx) => idx !== i)
    onUpdate(variant.id, "images", next)
  }

  const updateImage = (i: number, field: keyof ImageMeta, value: string | boolean) => {
    const next = variant.images.map((img, idx) => {
      if (field === "isPrimary") {
        return { ...img, isPrimary: idx === i }
      }
      return idx === i ? { ...img, [field]: value } : img
    })
    onUpdate(variant.id, "images", next)
  }

  const swatchColor =
    variant.color.startsWith("#") && variant.color.length === 7 ? variant.color : null

  return (
    <motion.div
      variants={variantCard}
      initial="hidden"
      animate="show"
      exit="exit"
      className="pm-variant-card"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pm-variant-toggle-btn"
      >
        <div className="pm-variant-header-left">
          <span className="pm-variant-badge">Variant {index + 1}</span>
          {(variant.colorName || variant.color) && (
            <span className="pm-variant-name">
              {swatchColor && (
                <span
                  className="pm-variant-color-dot"
                  style={{ backgroundColor: swatchColor }}
                />
              )}
              {variant.colorName || variant.color}
              {variant.size && ` / ${variant.size}`}
            </span>
          )}
        </div>
        <div className="pm-variant-header-right">
          {canRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(variant.id) }}
              className="pm-variant-delete-btn"
            >
              <Trash2 size={14} />
            </button>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} style={{ color: "#a3a3a3" }} />
          </motion.div>
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pm-variant-body">
              {/* Color identity */}
              <div className="pm-grid-2">
                <Field label="Hex Color">
                  <HexColorInput value={variant.color} onChange={set("color")} />
                </Field>
                <Field label="Color Name">
                  <Input
                    value={variant.colorName}
                    onChange={set("colorName")}
                    placeholder="e.g. Midnight Black"
                  />
                </Field>
              </div>

              {/* Size */}
              <Field label="Size (Multi-select)">
                <SizeMultiSelect value={variant.size} onChange={set("size")} />
              </Field>

              {/* Pricing */}
              <div>
                <p className="pm-sub-heading">Pricing</p>
                <div className="pm-grid-3">
                  <Field label="Price (₹)">
                    <Input type="number" value={String(variant.price)}
                     onChange={(v) => {
      const price = Number(v) || 0;
      const discount = Number(variant.discountPercentage) || 0;

      set("price")(v);
      set("discountPrice")(((price * discount) / 100).toString());
      set("finalPrice")((price - (price * discount) / 100).toString());
    }}
                    />
                  </Field>
                  <Field label="Discount %">
                    <Input type="number" value={String(variant.discountPercentage)}
                      onChange={(v) => {
      const discount = Number(v) || 0;
      const price = Number(variant.price) || 0;

      set("discountPercentage")(v);
      set("discountPrice")(((price * discount) / 100).toString());
      set("finalPrice")((price - (price * discount) / 100).toString());
    }}


                    placeholder="0" />
                  </Field>
                  <Field label="Discount Price">
                    <input className="outline-none border border-gray-200 bg-zinc-300" readOnly style={{padding:"8px"}} type="number" value={String(variant.discountPrice)}  placeholder="0.00" />
                  </Field>

                  <Field label="Final Price (₹)">
                    <input type="number" value={String(variant.finalPrice)} readOnly className="outline-none border border-gray-200 bg-zinc-300" style={{padding:"8px"}} placeholder="0.00" />
                  </Field>
                </div>
              </div>

              {/* Stock */}
              <div>
                <p className="pm-sub-heading">Inventory</p>
                <div className="pm-grid-3">
                  <Field label="Stock">
                    <Input type="number" value={String(variant.stock)} onChange={(v) => set("stock")(v)} placeholder="0" />
                  </Field>
                  <Field label="Display Stock">
                    <Input type="number" value={String(variant.stockToDisplay)} onChange={(v) => set("stockToDisplay")(v)} placeholder="0" />
                  </Field>
                  <Field label="Low Stock Alert">
                    <Input type="number" value={String(variant.lowStockThreshold)} onChange={(v) => set("lowStockThreshold")(v)} placeholder="5" />
                  </Field>
                  <Field label="Delivery Charge">
                    <Input type="number" value={String(variant.deliveryCharge)} onChange={(v) => set("deliveryCharge")(v)} placeholder="5" />
                  </Field>
                </div>
              </div>

              {/* Images */}
              <div>
                <p className="pm-sub-heading">Images</p>
                <ImageDropzone
                  variantName={variant.colorName}
                  images={variant.images}
                  onAdd={addImages}
                  onRemove={removeImage}
                  onUpdate={updateImage}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Section Label ──────────────────────────────────────── */
function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="pm-section-label">
      <span className="pm-section-num">{number}</span>
      <div className="pm-section-meta">
        <p className="pm-section-tag">Section</p>
        <p className="pm-section-name">{title}</p>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function CreateProductPage() {
  const router = useRouter()

  /* ── Seed state from localStorage draft ── */
  const _d = loadDraft()

  const [name, setName] = useState(_d?.name ?? "")
  const [description, setDescription] = useState(_d?.description ?? "")
  const [moreAbout, setMoreAbout] = useState(_d?.moreAbout ?? "")
  const [categoryName, setcategoryName] = useState(_d?.categoryName ?? "")
  const [refundable, setRefundable] = useState(_d?.refundable ?? true)
  const [returnable, setReturnable] = useState(_d?.returnable ?? true)
  const [returnWindowDays, setReturnWindowDays] = useState(_d?.returnWindowDays ?? 7)
  const [isActive, setIsActive] = useState(_d?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(_d?.isFeatured ?? false)
  const [variants, setVariants] = useState<Variant[]>(
    _d?.variants ?? [emptyVariant()]
  )

  const category = useCategory()
  const createProduct = useProduct().createProduct
  const { data: allCategory, error, isLoading } = category.getAllCategory()
  const AllCategory = allCategory?.data

  /* ── Persist draft on every change ── */
  useEffect(() => {
    try {
      const draft = {
        name,
        description,
        moreAbout,
        categoryName,
        refundable,
        returnable,
        returnWindowDays,
        isActive,
        isFeatured,
        variants: variants.map((v) => ({
          ...v,
          images: [], // Do not store images in localStorage
        })),
      }
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft))
    } catch {
      // Quota exceeded or SSR — silent fail
    }
  }, [
    name, description, moreAbout, categoryName,
    refundable, returnable, returnWindowDays,
    isActive, isFeatured, variants,
  ])

  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  /* Variant helpers */
  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()])
  const removeVariant = (id: string) => setVariants((prev) => prev.filter((v) => v.id !== id))
  const updateVariant = (id: string, field: keyof Variant, value: string | ImageMeta[]) =>
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)))

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error("Product name is required")
      return
    }
    if (!description.trim()) {
      toast.error("Product description is required")
      return
    }
    if (!categoryName) {
      toast.error("Please select a category")
      return
    }
    if (variants.length === 0) {
      toast.error("At least one variant is required")
      return
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      if (!v.color.trim()) {
        toast.error(`Variant ${i + 1}: Color is required`)
        return
      }
      if (!v.size.trim()) {
        toast.error(`Variant ${i + 1}: Size is required`)
        return
      }
      if (v.price <= 0) {
        toast.error(`Variant ${i + 1}: Price must be greater than 0`)
        return
      }
      if (v.stock < 0) {
        toast.error(`Variant ${i + 1}: Stock cannot be negative`)
        return
      }
      if (v.images.length === 0) {
        toast.error(`Variant ${i + 1}: At least one image is required`)
        return
      }
      // Check if all images have files
      const hasInvalidImages = v.images.some(img => !img.file)
      if (hasInvalidImages) {
        toast.error(`Variant ${i + 1}: All images must be properly uploaded`)
        return
      }
    }

    const data = {
      name,
      description,
      moreAboutProduct: moreAbout,
      categoryName,
      refundable,
      returnable,
      returnWindowDays,
      isActive,
      isFeatured,
      variants: variants.map((v) => ({
        color: v.color,
        colorName: v.colorName,
        deliveryCharge:v.deliveryCharge,
        size: v.size,
        price: v.price,
        finalPrice:v.finalPrice,
        discountPrice: v.discountPrice,
        discountPercentage: v.discountPercentage,
        stock: v.stock,
        stockToDisplay: v.stockToDisplay,
        lowStockThreshold: v.lowStockThreshold,
        images: v.images.map((img) => ({
          altText: img.altText || `${v.colorName || v.color}`,
          isPrimary: img.isPrimary,

        })),
      })),
    }
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("moreAboutProduct", data.moreAboutProduct)
    formData.append("categoryName", data.categoryName)
    formData.append("refundable", JSON.stringify(data.refundable))
    formData.append("returnable", JSON.stringify(data.returnable))
    formData.append("returnWindowDays", JSON.stringify(data.returnWindowDays))
    formData.append("isActive", JSON.stringify(data.isActive))
    formData.append("isFeatured", JSON.stringify(data.isFeatured))
    formData.append("variants", JSON.stringify(data.variants))

    variants.forEach((v,vi) => {
      v.images.forEach((img,i) => {
        if (img.file) formData.append(data.variants[vi].images[i].altText, img.file)
        })
    })

    createProduct.mutate(formData, {
      onSuccess: (response: any) => {
        const status = response?.status ?? response?.data?.status
          clearDraft()
          router.push("/admin/products")
          toast('product created successfully')

      },
    onError: (error: any) => {
  const err = error?.response?.data;
toast.error(err.response.message)

  if (err?.error?.fieldErrors) {
    const fieldErrors = err.error.fieldErrors;

    // Example: set form errors
    toast.error(fieldErrors.variants[0])

  }
},
    })
  }

  const totalImages = variants.reduce((acc, v) => acc + v.images.length, 0)

  return (
    <>
      <style>{globalStyles}</style>

      {/* Scroll progress bar */}
      <motion.div
        style={{ width: progressWidth }}
        className="pm-progress"
      />

      <div className="pm-page">

        {/* Hero Header */}
        <motion.header style={{ opacity: headerOpacity }} className="pm-header">
          <div className="pm-header-inner">
            <div className="pm-header-brand">
              <div className="pm-header-dot" />
              <span className="pm-header-title">Product Manager</span>
            </div>
            <span className="pm-header-sub">Admin Console</span>
          </div>
        </motion.header>

        <main className="pm-main">

          {/* Page Title */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="show"
            className="pm-page-title-block"
          >
            <p className="pm-page-eyebrow">New listing</p>
            <h1 className="pm-page-h1">
              Create<br /><em>Product</em>
            </h1>
            <div className="pm-page-divider" />
          </motion.div>

          <form onSubmit={handleSubmit} className="pm-form">

            {/* ── Section 01: Core Details ── */}
            <motion.section variants={fadeUp} custom={1} initial="hidden" animate="show">
              <SectionLabel number="01" title="Core Details" />
              <div className="pm-section-body">
                <Field label="Product Name">
                  <Input value={name} onChange={setName} placeholder="Enter product name" />
                </Field>
                <Field label="Description">
                  <Input value={description} onChange={setDescription} placeholder="Short description for listings…" textarea />
                </Field>
                <Field label="More About Product">
                  <Input value={moreAbout} onChange={setMoreAbout} placeholder="Extended details, care instructions, materials…" textarea />
                </Field>
                <Field label="Category">
                  <Select onValueChange={(e) => { setcategoryName(e) }} defaultValue={categoryName}>
                    <SelectTrigger style={{ paddingLeft: 20 }} className="w-[180px]">
                      <SelectValue placeholder="Parent category id" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem style={{paddingLeft:'5px'}} className="hover:bg-white" value='none'><Minus/>none</SelectItem>
                        {isLoading
                          ? <div className="bg-gray-50 animate-pulse"><CgSpinner className="animate-spin" /></div>
                          : AllCategory?.length !== 0 && AllCategory?.map((c, i) =>
                              <SelectItem style={{ padding: 5 }} key={i} value={c.name}>{c.imageUrl&&<Image alt='category' src={c.imageUrl} width={15} height={15}/>}{c.name}</SelectItem>
                            )
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </motion.section>

            {/* ── Section 02: Policies ── */}
            <motion.section variants={fadeUp} custom={2} initial="hidden" animate="show">
              <SectionLabel number="02" title="Policies & Visibility" />
              <div className="pm-policies-body">
                <div className="pm-grid-2">
                  <Toggle label="Refundable" checked={refundable} onChange={setRefundable} />
                  <Toggle label="Returnable" checked={returnable} onChange={setReturnable} />
                  <Toggle label="Active" checked={isActive} onChange={setIsActive} />
                  <Toggle label="Featured" checked={isFeatured} onChange={setIsFeatured} />
                </div>
                <AnimatePresence>
                  {returnable && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Field label="Return Window (days)">
                        <Input
                          type="number"
                          value={String(returnWindowDays)}
                          onChange={(v) => setReturnWindowDays(Number(v) || 7)}
                          placeholder="7"
                        />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* ── Section 03: Variants ── */}
            <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show">
              <div className="pm-section-header-row">
                <SectionLabel number="03" title="Variants" />
                <button
                  type="button"
                  onClick={addVariant}
                  className="pm-add-variant-btn"
                >
                  <Plus size={13} /> Add Variant
                </button>
              </div>

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <AnimatePresence mode="popLayout">
                  {variants.map((v, i) => (
                    <VariantPanel
                      key={v.id}
                      variant={v}
                      index={i}
                      onUpdate={updateVariant}
                      onRemove={removeVariant}
                      canRemove={variants.length > 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* ── Submit ── */}
            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="show"
              className="pm-submit-section"
            >
              <AnimatePresence mode="wait">
                {createProduct.isError && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pm-alert pm-alert--error"
                  >
                    <AlertCircle size={14} /> {createProduct.error?.message || "Something went wrong."}
                  </motion.div>
                )}
                {createProduct.isSuccess && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pm-alert pm-alert--success"
                  >
                    <CheckCircle2 size={14} /> Product created successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pm-submit-row">
                <p className="pm-submit-meta">
                  {variants.length} variant{variants.length !== 1 && "s"} ·{" "}
                  {totalImages} image{totalImages !== 1 && "s"}
                </p>

                <motion.button
                  type="submit"
                  disabled={createProduct.isPending}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.15 }}
                  className="pm-submit-btn"
                >
                  {createProduct.isPending ? (
                    <>
                      <Loader2 size={14} className="pm-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      Publish Product
                      <span className="pm-submit-arrow">→</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

          </form>
        </main>
      </div>
    </>
  )
}