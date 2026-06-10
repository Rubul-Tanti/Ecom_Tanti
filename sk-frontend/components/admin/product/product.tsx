'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import useProduct from "@/hooks/use-product"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { DeleteIcon, Trash, Plus, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import Image from "next/image"
import {  useEffect, useMemo, useState } from "react"
import { CgSpinner } from "react-icons/cg"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { GrUpload } from "react-icons/gr"
import { toast } from "react-toastify"
import useCategory from "@/hooks/use-category"
import { ApiProduct, ProductFormData, ProductImage } from "@/server/product/types"

interface VariantForm {
  id: string
  color: string
  colorName: string
  size: string
  price: string
  discountPercentage: string
  discountPrice: string
  finalPrice:string
  deliveryCharge:string
  stock: string
  stockToDisplay: string
  lowStockThreshold: string
  images: ProductImage[]
}

interface AddVariantForm {
  color: string
  colorName: string
  size: string
  price: string
  finalPrice:string
  deliveryCharge:string
  discountPercentage: string
  discountPrice: string
  stock: string
  stockToDisplay: string
  lowStockThreshold: string
}

interface ProductForm {
  name: string
  description: string
  moreAboutProduct: string
  categoryId: string
  categoryName: string
  isActive: boolean
  isFeatured: boolean
  refundable: boolean
  returnable: boolean
  returnWindowDays: string
  variants: VariantForm[]
}

const defaultAddVariantForm = (): AddVariantForm => ({
  color: "#000000",
  colorName: "",
  size: "",
  finalPrice:"",
  deliveryCharge:"0",
  price: "",
  discountPercentage: "0",
  discountPrice: "",
  stock: "",
  stockToDisplay: "",
  lowStockThreshold: "5",
})

const toForm = (p: ApiProduct): ProductForm => ({
  name: p.name,
  description: p.description,
  moreAboutProduct: p.moreAboutProduct,
  categoryId: p.categoryId,
  categoryName: p.categoryName || "",
  isActive: p.isActive,
  isFeatured: p.isFeatured,
  refundable: p.refundable,
  returnable: p.returnable,
  returnWindowDays: String(p.returnWindowDays),
  variants: p.variants.map((v) => ({
    id: v.id,
    color: v.color,
    colorName: v.colorName ?? "",
    deliveryCharge:String(v.deliveryCharge),
    size: v.size,
    price: String(v.price),
    finalPrice:String(v.finalPrice),
    discountPercentage: String(v.discountPercentage),
    discountPrice: String(v.discountPrice),
    stock: String(v.stock),
    stockToDisplay: String(v.stockToDisplay),
    lowStockThreshold: String(v.lowStockThreshold),
    images: v.images,
  })),
})

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "14px", fontWeight: 500, color: "#71717a" }}>{label}</label>
      {children}
    </div>
  )
}

function Input({
  className,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  className?: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      className={className}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        height: "48px",
        borderRadius: "14px",
        border: "1px solid #e4e4e7",
        background: "#ffffff",
        padding: type === "color" ? "4px" : "0 16px",
        fontSize: "14px",
        outline: "none",
        cursor: type === "color" ? "pointer" : "text",
        boxSizing: "border-box",
      }}
    />
  )
}

function Textarea({ value, onChange, rows = 4 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        borderRadius: "14px",
        border: "1px solid #e4e4e7",
        background: "#ffffff",
        padding: "16px",
        fontSize: "14px",
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
      }}
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        height: "42px",
        paddingLeft: "18px",
        paddingRight: "18px",
        borderRadius: "12px",
        border: "none",
        background: checked ? "#18181b" : "#f4f4f5",
        color: checked ? "#ffffff" : "#52525b",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "14px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "28px",
        border: "1px solid #e4e4e7",
        padding: "24px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  )
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

function SizeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selectedSizes = value ? value.split(",").filter(Boolean) : []
  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => {
        const isSelected = selectedSizes.includes(size)
        return (
          <button
            type="button"
            key={size}
            onClick={() => {
              const updated = isSelected ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size]
              onChange(updated.join(","))
            }}
            style={{
              minWidth: "48px",
              height: "40px",
              padding: "0 14px",
              borderRadius: "8px",
              border: `1px solid ${isSelected ? "#18181b" : "#d4d4d8"}`,
              background: isSelected ? "#18181b" : "#ffffff",
              color: isSelected ? "#ffffff" : "#18181b",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}

// ─── ADD VARIANT FORM ────────────────────────────────────────────────────────

type VariantImage = {
  order: number,
  altText: string,
  isPrimary: boolean,
  image: File
}
function AddVariantPanel({
  productId,
  productName,
  onSuccess,
}: {
  productId: string
  productName: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AddVariantForm>(defaultAddVariantForm())
  const [imageForm, setImageForm] = useState<VariantImage[]>([])
  const { addProductVariant } = useProduct() // you must expose this mutation
  const queryClient = useQueryClient()

  const set = (key: keyof AddVariantForm) => (value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!form.colorName||form.colorName.trim()==='')return

    const file = e.target.files?.[0]
    if (file) {
      setImageForm([...imageForm, { altText:`${form.colorName.trim()}_${imageForm.length+1}`, isPrimary: false, order: imageForm.length+1, image: file }])
    }
  }

  const handleSubmit = () => {
    if (!form.colorName.trim()) return toast.error("Color name is required")
    if (!form.price) return toast.error("Price is required")
    if (!form.stock) return toast.error("Stock is required")

     const variantData = new FormData()

variantData.append("color", form.color)
variantData.append("colorName", form.colorName)
variantData.append("size", form.size)
variantData.append("price", form.price)
variantData.append("discountPercentage", form.discountPercentage)

if (form.discountPrice) {
  variantData.append("discountPrice", form.discountPrice)
}

variantData.append("stock", form.stock)
variantData.append("stockToDisplay", form.stockToDisplay)
variantData.append("lowStockThreshold", form.lowStockThreshold)

// images
imageForm.forEach((img, index) => {
  variantData.append(`images[${index}][sortOrder]`, String(img.order))
  variantData.append(`images[${index}][altText]`, img.altText)
  variantData.append(`images[${index}][isPrimary]`, String(img.isPrimary))

  if (img.image instanceof File) {
    variantData.append(`${img.altText}`, img.image)
  }
})

    addProductVariant?.mutate({productId,data:variantData},
      {
        onSuccess: () => {
          toast("Variant added successfully")
          queryClient.invalidateQueries({ queryKey: ["get-product"] })
          setForm(defaultAddVariantForm())
          setOpen(false)
          onSuccess()
        },
        onError: (e: any) => {
          toast.error(`Failed: ${e?.response?.data?.message ?? "Unknown error"}`)
        },
      }
    )

  }

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          height: "44px",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderRadius: "12px",
          background: "#18181b",
          color: "#ffffff",
          border: "none",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Plus size={16} />
        Add Variant
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Collapsible form */}
      {open && (
        <div
          style={{
            marginTop: "20px",
            background: "#ffffff",
            borderRadius: "28px",
            border: "2px dashed #d4d4d8",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#18181b", margin: 0 }}>New Variant</h3>
              <p style={{ fontSize: "13px", color: "#71717a", marginTop: "4px" }}>Fill in the details for this variant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#71717a" }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Color */}
            <Field label="Color Code">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => set("color")(e.target.value)}
                  style={{ width: "48px", height: "48px", borderRadius: "12px", border: "1px solid #e4e4e7", padding: "4px", cursor: "pointer", flexShrink: 0 }}
                />
                <Input value={form.color} onChange={set("color")} placeholder="#000000" />
              </div>
            </Field>

            <Field label="Color Name">
              <Input value={form.colorName} onChange={set("colorName")} placeholder="e.g. Midnight Black" />
            </Field>

            {/* Size */}
            <Field label="Size">
              <SizeSelector value={form.size} onChange={set("size")} />
            </Field>

            <Field label="Price (₹)">
              <Input type="number" value={form.price} onChange={set("price")} placeholder="0" />
            </Field>

            <Field label="Discount Percentage">
              <Input type="number" value={form.discountPercentage} onChange={set("discountPercentage")} placeholder="0" />
            </Field>

            <Field label="Discount Price (₹)">
              <Input type="number" value={form.discountPrice} onChange={set("discountPrice")} placeholder="0" />
            </Field>
            <Field label="Final Price (₹)">
              <Input type="number" value={form.discountPrice} onChange={set("finalPrice")} placeholder="0" />
            </Field>

            <Field label="Stock">
              <Input type="number" value={form.stock} onChange={set("stock")} placeholder="0" />
            </Field>

            <Field label="Display Stock">
              <Input type="number" value={form.stockToDisplay} onChange={set("stockToDisplay")} placeholder="0" />
            </Field>

            <Field label="Low Stock Threshold">
              <Input type="number" value={form.lowStockThreshold} onChange={set("lowStockThreshold")} placeholder="5" />
            </Field>


          </div>

          {/* Image upload */}
          <div style={{ marginTop: "20px" }}>
            <Field label="Variant Image ">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                {imageForm.length > 0 && imageForm.map((img, i) =>
                (
                  <div style={{ position: "relative" }} key={i}>
                    <img
                      src={URL.createObjectURL(img.image)}
                      alt="preview"
                      style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover", border: "1px solid #e4e4e7" }}
                    />
                    <button
                      onClick={() => { setImageForm(prev => prev.filter((_, index) => index !== i)) }}
                      style={{ position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", borderRadius: "50%", background: "#18181b", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={12} />
                    </button>
                    <input min="1" value={img.order} onChange={(e) => {
                      setImageForm((prev) => {
                        const updated = [...prev]

                        updated[i] = {
                          ...updated[i],
                          order: Number(e.target.value),
                          altText: `${form.colorName.trim()}_${Number(e.target.value)}`
                        }
                        return updated
                      })
                    }} defaultValue={i} type="number" className="border border-gray-300 rounded-md w-10" style={{ padding: "4px", margin: "2px" }} />
                    <div className="border-b flex gap-2 border-gray-200 rounded-sm">
                      <div onClick={() => {
                      setImageForm((prev) => {
                        const updated = [...prev]
                        updated.forEach(img => img.isPrimary = false)
                        updated[i] = {
                          ...updated[i],
                          isPrimary: !updated[i].isPrimary,
                        }
                        return updated
                      })
                    }} defaultValue={i} className={`border  rounded-xs  h-3 w-3 ${img.isPrimary ? 'bg-black border-red-200' : 'bg-white border-black'}`} style={{ padding: "4px", margin: "2px" }} />
                      <span style={{ fontSize: "12px" }}>Primary</span>
                    </div>
                  </div>
                ))}
                <label
                  htmlFor="addVariantImage"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "48px",
                    padding: "0 18px",
                    border: "1px dashed #d4d4d8",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#71717a",
                    fontWeight: 500,
                  }}
                >
                  <GrUpload /> {"Upload Image"}
                </label>
                <input type="file" id="addVariantImage" hidden accept="image/*" value={''} onChange={handleImageChange} />
              </div>
            </Field>
          </div>

          {/* Actions */}
          <div style={{ marginTop: "28px", display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              onClick={() => { setOpen(false); setForm(defaultAddVariantForm()); setImageForm([]) }}
              style={{ height: "44px", paddingLeft: "20px", paddingRight: "20px", borderRadius: "12px", background: "#f4f4f5", color: "#52525b", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={addProductVariant?.isPending}
              style={{ height: "44px", paddingLeft: "28px", paddingRight: "28px", borderRadius: "12px", background: "#18181b", color: "#ffffff", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              {addProductVariant?.isPending ? <><CgSpinner className="animate-spin" /> Saving...</> : <><Plus size={16} /> Add Variant</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── VARIANT EDITOR ──────────────────────────────────────────────────────────

function VariantEditor({
  variant,
  id,
  product,
  index,
  onChange,
}: {
  id: string
  product: ApiProduct | undefined
  variant: VariantForm
  index: number
  onChange: (updated: VariantForm) => void
}) {
  const set = (key: keyof VariantForm) => (value: string) => onChange({ ...variant, [key]: value })
  const [uploadImage, setImageUrl] = useState<File>()
  const [deleteVariantDialogOpen, setDeleteVariantDialogOpen] = useState(false)
  const [isPrimary, setIsPrimary] = useState(false)
  const { AddProductImage,deleteProductVariant,deleteProductImage,updateProductVariant } = useProduct()
  const queryClient = useQueryClient()
  const image = variant.images

  const handleAddProductImage = () => {
    if (!uploadImage || !product?.id) return
    AddProductImage.mutate(
      { productId: product?.id, productVariantId: variant.id, altText: `${variant.colorName + variant.images.length}`, sortOrder: variant.images.length, image: uploadImage, isPrimary: false },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["get-product", id] })
          setImageUrl(undefined)
          toast("Added Image successfully")
        },
        onError: () => toast.error("failed Adding Image"),
      }
    )
  }

  const handleDelete = (imgId: string) => {
    deleteProductImage.mutate(imgId, {
      onSuccess: () => {
        toast("Image Deleted Successfully")
        queryClient.invalidateQueries({ queryKey: ["get-product", id] })
      },
      onError: (e: any) => toast.error(` ${e.response.data.message}`),
    })
  }

  const updateVariant = () => {
    if (!variant) return
    updateProductVariant.mutate(
      {
        id: variant.id,
        data: {
          color: variant.color,
          colorName: variant.colorName,
          size: variant.size,
          deliveryCharge:variant.deliveryCharge,
          price: variant.price,
          discountPercentage: variant.discountPercentage,
          discountPrice: variant.discountPrice,
          stock: variant.stock,
          sku: `${product?.name}_${variant.color}`,
          stockToDisplay: variant.stockToDisplay,
          lowStockThreshold: variant.lowStockThreshold,
        },
      },
      { onSuccess: () => { }, onError: () => { } }
    )
  }

  const imageUrl = uploadImage && URL.createObjectURL(uploadImage)

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "12px" }}>
        {deleteVariantDialogOpen && (
          <Dialog open={deleteVariantDialogOpen} onOpenChange={setDeleteVariantDialogOpen}>
            <DialogContent style={{ padding: "24px" }}>
              <DialogHeader>
                <DialogTitle>Delete Variant</DialogTitle>
                <DialogDescription>Are you sure you want to delete this variant? This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" style={{ flexShrink: 0, height: "36px", paddingLeft: "16px", paddingRight: "16px", borderRadius: "8px", background: "#ef4444", color: "#ffffff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }} onClick={() => {
                    deleteProductVariant.mutate(variant.id, {
                      onSuccess: () => {
                        toast("Variant Deleted Successfully")
                        queryClient.invalidateQueries({ queryKey: ["get-product", id] })
                      },
                      onError: (e: any) => toast.error(` ${e.response.data.message}`),
                    })
                  }}>
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ width: "24px", height: "24px", flexShrink: 0, borderRadius: "999px", background: variant.color, border: "1px solid #e4e4e7" }} />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#18181b" }}>Variant {index + 1}</h3>
            <p style={{ fontSize: "14px", color: "#71717a", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {variant.colorName || "No Color"}
            </p>
          </div>
        </div>
        <div className="flex gap-5">
        <button onClick={()=>{setDeleteVariantDialogOpen(true)}} style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "8px", background: "#fef2f2", color: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Trash2 size={20} color="#ef4444" />
        </button>
        <button
          onClick={updateVariant}
          style={{ flexShrink: 0, height: "36px", paddingLeft: "16px", paddingRight: "16px", borderRadius: "8px", background: "#18181b", color: "#ffffff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          {updateProductVariant.isPending ? "Saving..." : "Save"}
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Color Code">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={variant.color}
              onChange={(e) => set("color")(e.target.value)}
              style={{ width: "48px", height: "48px", borderRadius: "12px", border: "1px solid #e4e4e7", padding: "4px", cursor: "pointer", flexShrink: 0 }}
            />
            <Input value={variant.color} onChange={set("color")} />
          </div>
        </Field>

        <Field label="Color Name">
          <Input value={variant.colorName ?? ""} onChange={set("colorName")} />
        </Field>

        <Field label="Size (Multi-Select)">
          <SizeSelector value={variant.size} onChange={set("size")} />
        </Field>

        <Field label="Price">
          <Input type="number" value={variant.price} onChange={set("price")} />
        </Field>
        <Field label="Final Price">
          <Input type="number" value={variant.finalPrice} onChange={set("finalPrice")} />
        </Field>

        <Field label="Discount Percentage">
          <Input type="number" value={variant.discountPercentage} onChange={set("discountPercentage")} />
        </Field>

        <Field label="Discount Price">
          <Input type="number" value={variant.discountPrice} onChange={set("discountPrice")} />
        </Field>

        <Field label="Stock">
          <Input type="number" value={variant.stock} onChange={set("stock")} />
        </Field>

        <Field label="Display Stock">
          <Input type="number" value={variant.stockToDisplay} onChange={set("stockToDisplay")} />
        </Field>

        <Field label="Low Stock Threshold">
          <Input type="number" value={variant.lowStockThreshold} onChange={set("lowStockThreshold")} />
        </Field>
        <Field label="deliveryCharge">
          <Input type="number" value={variant.deliveryCharge} onChange={set("deliveryCharge")} />
        </Field>
      </div>

      {/* Images */}
      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {image &&
          image.map((img) => (
            <div className="relative" key={img.id} style={{ width: "100px", height: "100px", flexShrink: 0 }}>
              <img
                src={img.url}
                alt=""
                style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover", border: "1px solid #e4e4e7" }}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "white", padding: "4px", cursor: "pointer", border: "none" }}
                  >
                    <Trash size={16} color="black" />
                  </button>
                </DialogTrigger>
                <DialogContent style={{ padding: "24px" }}>
                  <DialogHeader>
                    <DialogTitle>Delete Image</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this image? This action cannot be undone.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={() => handleDelete(img.id)} disabled={deleteProductImage.isPending}>
                        {deleteProductImage.isPending ? <CgSpinner className="animate-spin" /> : "Delete"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}

        {imageUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Image src={imageUrl} width={100} height={100} alt="uploadedFile" style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover", border: "1px solid #e4e4e7" }} />
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              Set as Primary
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => { setImageUrl(undefined); setIsPrimary(false) }}
                style={{ flex: 1, height: "32px", borderRadius: "8px", border: "1px solid #d4d4d8", background: "#fff", fontSize: "12px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddProductImage}
                style={{ flex: 1, height: "32px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#fff", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {AddProductImage.isPending ? <CgSpinner className="animate-spin" /> : "Add"}
              </button>
            </div>
          </div>
        )}

        <label
          htmlFor={`fileUpload-${index}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100px", height: "100px", border: "1px dashed #d4d4d8", color: "#71717a", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: 500, flexShrink: 0 }}
        >
          <GrUpload size={16} /> Upload
        </label>
        <input
          type="file"
          id={`fileUpload-${index}`}
          hidden
          onChange={(e) => { if (e.target.files?.[0]) setImageUrl(e.target.files[0]) }}
        />
      </div>
    </Card>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

const AdminProductEdit = ({ id }: { id: string }) => {
  const { getProductById, updateProduct } = useProduct()
  const { data, isLoading } = getProductById(id)

  const category = useCategory()
  const { data: allCategory, isLoading: categoryLoading } = category.getAllCategory()
  const AllCategory = allCategory?.data

  const product: ApiProduct | undefined = data?.data
  const [form, setForm] = useState<ProductForm | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product && !form) setForm(toForm(product))
  }, [product])

  const setField =
    <K extends keyof ProductForm>(key: K) =>
      (value: ProductForm[K]) =>
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev))

  const updateVariant = (index: number, updated: VariantForm) =>
    setForm((prev) => {
      if (!prev) return prev
      const variants = [...prev.variants]
      variants[index] = updated
      return { ...prev, variants }
    })

  const handleSave = async () => {
    if (!form) return
    if (Number(form.returnWindowDays) < 1) {
      toast.error("Return window days must be at least 1")
      return
    }
    updateProduct.mutate(
      {
        id,
        data: {
          name: form.name,
          description: form.description,
          moreAboutProduct: form.moreAboutProduct,
          categoryId: form.categoryId,
          refundable: form.refundable,
          returnable: form.returnable,
          returnWindowDays: form.returnWindowDays,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
        },
      },
      {
        onSuccess: () => toast("Product Updated Successfully"),
        onError: (e: any) => toast.error(`Failed to update Product ${e.response.data.message}`),
      }
    )
  }

  if (isLoading || !form) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <CgSpinner style={{ fontSize: "32px", color: "#71717a", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "14px", color: "#71717a" }}>Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }

        /* Responsive grid for sidebar layout */
        .product-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
        }
        .sidebar-card {
          position: sticky;
          top: 110px;
          height: fit-content;
        }
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .sidebar-card {
            position: static;
          }
        }
        @media (max-width: 480px) {
          .page-header { padding: 0 16px !important; }
          .page-content { padding: 20px 16px !important; }
          .header-title { font-size: 22px !important; }
          .save-btn-text { display: none; }
          .save-btn-short { display: inline !important; }
        }
        .save-btn-short { display: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.9)", borderBottom: "1px solid #e4e4e7", backdropFilter: "blur(10px)" }}>
        <div
          className="page-header"
          style={{ maxWidth: "1280px", margin: "0 auto", height: "72px", paddingLeft: "24px", paddingRight: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 className="header-title" style={{ fontSize: "24px", fontWeight: 700, color: "#18181b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Edit Product
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flexShrink: 0, height: "44px", paddingLeft: "20px", paddingRight: "20px", borderRadius: "12px", background: "#18181b", color: "#ffffff", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            <span className="save-btn-text">{updateProduct.isPending ? "Saving..." : "Save Changes"}</span>
            <span className="save-btn-short">{updateProduct.isPending ? "..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="page-content" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="product-grid">

          {/* SIDEBAR */}
          <div className="sidebar-card">
            <Card>
              <p style={{ fontSize: "13px", color: "#71717a", marginBottom: "6px" }}>Product</p>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#18181b", lineHeight: 1.4, marginBottom: "16px" }}>
                {product?.name}
              </h2>
              <div style={{ borderTop: "1px solid #f4f4f5", paddingTop: "14px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#71717a" }}>Variants</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#18181b" }}>{product?.variants.length}</span>
              </div>
              <div style={{ borderTop: "1px solid #f4f4f5", paddingTop: "14px", marginTop: "12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#71717a" }}>Status</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: form.isActive ? "#16a34a" : "#dc2626", background: form.isActive ? "#dcfce7" : "#fee2e2", padding: "2px 10px", borderRadius: "999px" }}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </Card>
          </div>

          {/* MAIN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* PRODUCT INFO */}
            <Card>
              <div style={{ marginBottom: "28px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#18181b", marginBottom: "4px" }}>Product Information</h2>
                <p style={{ fontSize: "14px", color: "#71717a" }}>Manage product details</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <Field label="Product Name">
                  <Textarea value={form.name} onChange={setField("name")} rows={2} />
                </Field>
                <Field label="Description">
                  <Textarea value={form.description} onChange={setField("description")} rows={5} />
                </Field>
                <Field label="More About Product">
                  <Textarea value={form.moreAboutProduct} onChange={setField("moreAboutProduct")} rows={6} />
                </Field>
                <Field label="Category">
                  <Select value={form.categoryId} onValueChange={(v) => setForm((prev: any) => ({ ...prev, categoryId: v }))}>
                    <SelectTrigger className="w-full md:w-[240px] pl-5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">None</SelectItem>
                        {categoryLoading ? (
                          <div className="flex justify-center p-2"><CgSpinner className="animate-spin" /></div>
                        ) : (
                          AllCategory?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Card>

            {/* VARIANTS */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#18181b", marginBottom: "4px" }}>Variants</h2>
                  <p style={{ fontSize: "14px", color: "#71717a" }}>Manage product variants</p>
                </div>
                {product && (
                  <AddVariantPanel
                    productId={product.id}
                    productName={product.name}
                    onSuccess={() => { }}
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {form.variants.map((variant, index) => (
                  <VariantEditor
                    product={product}
                    key={variant.id}
                    variant={variant}
                    index={index}
                    id={id}
                    onChange={(updated) => updateVariant(index, updated)}
                  />
                ))}
              </div>
            </div>

            {/* POLICY */}
            <Card>
              <div style={{ marginBottom: "28px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#18181b", marginBottom: "4px" }}>Policy & Status</h2>
                <p style={{ fontSize: "14px", color: "#71717a" }}>Product visibility & return settings</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <Toggle checked={form.isActive} onChange={setField("isActive")} label="Active" />
                  <Toggle checked={form.isFeatured} onChange={setField("isFeatured")} label="Featured" />
                  <Toggle checked={form.refundable} onChange={setField("refundable")} label="Refundable" />
                  <Toggle checked={form.returnable} onChange={setField("returnable")} label="Returnable" />
                </div>
                <Field label="Return Window Days">
                  <Input type="number" value={form.returnWindowDays} onChange={setField("returnWindowDays")} />
                </Field>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductEdit
