"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import usePromocode from "@/hooks/use-promoCode";
import { PromoCodeFormValue } from "@/server/promoCodes";
import { GetPromoCodeResponse, PromoCode } from "@/server/promoCodes/types";
import { UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { Trash, Trash2 } from "lucide-react";
import { SetStateAction, useEffect, useState } from "react";
import { z } from "zod";

// ─── Schema ────────────────────────────────────────────────────────────────────

export const createPromoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Promo code must be at least 3 characters")
    .max(20, "Promo code cannot exceed 20 characters")
    .transform((val) => val.toUpperCase()),
  amount: z.number().int().positive("Amount must be greater than 0"),
  minOrder: z.number().int().nonnegative().optional(),
  maxDiscount: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional().default(true),
  expiresAt: z
    .string()
    .datetime("Invalid date format")
    .refine(
      (date) => new Date(date) > new Date(),
      {
        message: "Expiration date cannot be in the past",
      }
    ),
});
type DeletePromoDialogProps = {
  promo:PromoCode;
  onDelete: () => void;
  isLoading?: boolean;
};
// ─── Update Promo Dialog ───────────────────────────────────────────────────────
export function DeletePromoDialog({
  promo,
  onDelete,
  isLoading,
}: DeletePromoDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger style={{marginRight:"10px"}} asChild>
        <Trash2 size={14}/>

      </AlertDialogTrigger>

      <AlertDialogContent style={{padding:"10px"}}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete Promo Code?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete the promo code{" "}
            <span className="font-semibold">
              {promo.code}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel style={{padding:"5px"}} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
          style={{padding:"5px"}}
            disabled={isLoading}
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UpdatePromoDialog({
  promo,
  onUpdate,
  updatePromoCodes,
}: {
  promo: PromoCode;
  onUpdate: (updated: PromoCode) => void;
  updatePromoCodes: UseMutationResult<any, Error, { id: string; data: PromoCodeFormValue }, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PromoCodeFormValues>({
    code: promo.code,
    amount: String(promo.amount),
    minOrder: promo.minOrder ? String(promo.minOrder) : "",
    maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : "",
    usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
    expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : "",
    isActive: promo.isActive,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PromoCodeFormValues, string[]>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof PromoCodeFormValues>(key: K, value: PromoCodeFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit() {
    const raw = {
      code: form.code,
      amount: form.amount ? parseInt(form.amount) : NaN,
      minOrder: form.minOrder ? parseInt(form.minOrder) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      isActive: form.isActive,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : "",
    };
    const result = createPromoCodeSchema.safeParse(raw);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    updatePromoCodes.mutate(
      { id: promo.id, data: result.data },
      {
        onSuccess: (res: GetPromoCodeResponse) => {
          onUpdate(res.data);
          setErrors({});
          setOpen(false);
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  }

  function handleReset() {
    setForm({
      code: promo.code,
      amount: String(promo.amount),
      minOrder: promo.minOrder ? String(promo.minOrder) : "",
      maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : "",
      usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : "",
      isActive: promo.isActive,
    });
    setErrors({});
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          style={{
            borderRadius: "4px",
            cursor: "pointer",
            border: "1px solid #d4d4d8",
            fontSize: "12px",
            color: "#71717a",
            marginRight: "8px",
            padding: "4px 10px",
            backgroundColor: "#ffffff",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = "#f4f4f5";
            (e.target as HTMLElement).style.borderColor = "#a1a1aa";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = "#ffffff";
            (e.target as HTMLElement).style.borderColor = "#d4d4d8";
          }}
        >
          Edit
        </button>
      </DialogTrigger>
      <DialogContent
        style={{
          maxWidth: "520px",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <DialogHeader style={{ marginBottom: "20px" }}>
          <DialogTitle
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            Update Promo Code
          </DialogTitle>
          <DialogDescription
            style={{
              fontSize: "13px",
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            Modify the details for <strong style={{ color: "#1d4ed8" }}>{promo.code}</strong>. Changes will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <Field label="Code" error={errors.code}>
            <input
              style={inputStyle}
              placeholder="e.g. SUMMER25"
              value={form.code}
              maxLength={20}
              onChange={(e) => setField("code", e.target.value.toUpperCase())}
            />
          </Field>

          <Field label="Discount amount (₹)" error={errors.amount}>
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 200"
              min={1}
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
            />
          </Field>

          <Field label="Min order (optional)">
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 500"
              min={0}
              value={form.minOrder}
              onChange={(e) => setField("minOrder", e.target.value)}
            />
          </Field>

          <Field label="Max discount (optional)">
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 500"
              min={1}
              value={form.maxDiscount}
              onChange={(e) => setField("maxDiscount", e.target.value)}
            />
          </Field>

          <Field label="Usage limit (optional)">
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 100"
              min={1}
              value={form.usageLimit}
              onChange={(e) => setField("usageLimit", e.target.value)}
            />
          </Field>

          <Field label="Expires at" error={errors.expiresAt}>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.expiresAt}
              onChange={(e) => setField("expiresAt", e.target.value)}
            />
          </Field>
        </div>

        {/* Active toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #f3f4f6",
            marginTop: "4px",
            paddingTop: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", marginBottom: "2px" }}>
              Active
            </p>
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>Code can be applied at checkout</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => setField("isActive", !form.isActive)}
            style={{
              position: "relative",
              display: "inline-flex",
              height: "24px",
              width: "40px",
              flexShrink: 0,
              cursor: "pointer",
              borderRadius: "9999px",
              border: "2px solid transparent",
              transition: "background-color 0.2s ease",
              backgroundColor: form.isActive ? "#10b981" : "#e5e7eb",
              outline: "none",
            }}
          >
            <span
              style={{
                pointerEvents: "none",
                display: "inline-block",
                height: "20px",
                width: "20px",
                transform: form.isActive ? "translateX(16px)" : "translateX(0)",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease-in-out",
              }}
            />
          </button>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            borderTop: "1px solid #f3f4f6",
            paddingTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            style={{
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              color: "#6b7280",
              padding: "8px 16px",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#ffffff";
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              borderRadius: "6px",
              backgroundColor: isSubmitting ? "#9ca3af" : "#059669",
              fontSize: "13px",
              fontWeight: 500,
              color: "#ffffff",
              padding: "8px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              border: "none",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) (e.target as HTMLElement).style.backgroundColor = "#047857";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) (e.target as HTMLElement).style.backgroundColor = "#059669";
            }}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Form (unchanged) ───────────────────────────────────────────────────

function CreatePromoCodeForm({
  createPromoCodes,
  setToast,
  setPromos,
}: {
  setPromos: React.Dispatch<SetStateAction<PromoCode[]>>;
  createPromoCodes: UseMutationResult<any, Error, PromoCodeFormValue, unknown>;
  setToast: React.Dispatch<SetStateAction<string | null>>;
}) {
  const [form, setForm] = useState<PromoCodeFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PromoCodeFormValues, string[]>>>({});

  function set<K extends keyof PromoCodeFormValues>(key: K, value: PromoCodeFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }
  function handleSubmit() {
    const raw = {
      code: form.code,
      amount: form.amount ? parseInt(form.amount) : NaN,
      minOrder: form.minOrder ? parseInt(form.minOrder) : undefined,
      maxDiscount: form.maxDiscount ? parseInt(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      isActive: form.isActive,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : "",
    };
    const result = createPromoCodeSchema.safeParse(raw);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    createPromoCodes.mutate(result.data, {
      onSuccess: (v: GetPromoCodeResponse) => {
        setPromos((prev) => [v.data, ...prev]);
        setErrors({});
        showToast(`Code "${result.data.code}" created.`);
        setForm(EMPTY_FORM);
      },
      onError: () => {},
    });
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
  }
  return (
    <>
      <p
        className="text-xs font-semibold uppercase tracking-widest text-gray-400"
        style={{ marginBottom: 12 }}
      >
        New promo code
      </p>

      <div
        className="rounded-xl border border-gray-100 bg-white shadow-sm"
        style={{ padding: 20, marginBottom: 32 }}
      >
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          <Field label="Code" error={errors.code}>
            <input
              style={inputStyle}
              placeholder="e.g. SUMMER25"
              value={form.code}
              maxLength={20}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
            />
          </Field>

          <Field label="Discount amount (₹)" error={errors.amount}>
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 200"
              min={1}
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </Field>

          <Field label="Min order (optional)">
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 500"
              min={0}
              value={form.minOrder}
              onChange={(e) => set("minOrder", e.target.value)}
            />
          </Field>

          <Field label="Usage limit (optional)">
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g. 100"
              min={1}
              value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
            />
          </Field>

          <Field label="Expires at" error={errors.expiresAt}>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
          </Field>
        </div>

        {/* Active toggle */}
        <div
          className="flex items-center justify-between border-t border-gray-100"
          style={{ marginTop: 16, paddingTop: 16 }}
        >
          <div>
            <p className="text-sm font-medium text-gray-900">Active</p>
            <p className="text-xs text-gray-400">Code can be applied at checkout</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => set("isActive", !form.isActive)}
            className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              form.isActive ? "bg-emerald-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                form.isActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-2 border-t border-gray-100"
          style={{ marginTop: 16, paddingTop: 16 }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            style={{ padding: "8px 16px" }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            style={{ padding: "8px 20px" }}
          >
            Create code
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isExpired(iso: string) {
  return new Date(iso) < new Date();
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-gray-400"
      style={{ paddingTop: 40, paddingBottom: 40 }}
    >
      <svg
        className="h-8 w-8"
        style={{ marginBottom: 8 }}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
      <p className="text-sm">No promo codes yet.</p>
    </div>
  );
}

// ─── Promo row ─────────────────────────────────────────────────────────────────
function PromoRow({
  promo,
  onUpdate,
  updatePromoCodes,
  deletePromoCode
}: {deletePromoCode:UseMutationResult<any, Error,string, unknown>,
  promo: PromoCode;
  onUpdate: (updated: PromoCode) => void;
  updatePromoCodes: UseMutationResult<any, Error, { id: string; data: PromoCodeFormValue }, unknown>;
}) {
  const expired = isExpired(promo.expiresAt);
  const active = promo.isActive && !expired;
  const queryClient=useQueryClient()
  const remaining =
    promo.usageLimit == null
      ? "∞"
      : Math.max(0, promo.usageLimit - promo.usedCount);

  const usagePercent = promo.usageLimit
    ? Math.min(100, (promo.usedCount / promo.usageLimit) * 100)
    : 0;

  const statusConfig = active
    ? { label: "Active", bg: "#d1fae5", text: "#047857" }
    : expired
    ? { label: "Expired", bg: "#fee2e2", text: "#dc2626" }
    : { label: "Inactive", bg: "#f3f4f6", text: "#6b7280" };

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              borderRadius: "6px",
              backgroundColor: "#eff6ff",
              padding: "6px 12px",
              fontFamily: "ui-monospace, monospace",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1d4ed8",
              letterSpacing: "0.025em",
            }}
          >
            {promo.code}
          </span>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            ₹{promo.amount} OFF
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <DeletePromoDialog onDelete={()=>{deletePromoCode.mutate(promo.id,{onSuccess:()=>{queryClient.invalidateQueries({queryKey:['promocodes']})}})}} promo={promo} isLoading={deletePromoCode.isPending}/>
          <UpdatePromoDialog
            promo={promo}
            onUpdate={onUpdate}
            updatePromoCodes={updatePromoCodes}
          />
          <span
            style={{
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor: statusConfig.bg,
              color: statusConfig.text,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <DetailItem label="Min Order" value={promo.minOrder ? `₹${promo.minOrder}` : "None"} />
        <DetailItem label="Expires" value={formatDate(promo.expiresAt)} />
        <DetailItem label="Usage Limit" value={String(promo.usageLimit) ?? "Unlimited"} />
      </div>

      {/* Progress Bar */}
      {promo.usageLimit && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
              Usage
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
              {promo.usedCount} / {promo.usageLimit}
            </span>
          </div>
          <div
            style={{
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: "#f3f4f6",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "9999px",
                backgroundColor:
                  usagePercent > 90 ? "#ef4444" : usagePercent > 70 ? "#f59e0b" : "#3b82f6",
                width: `${usagePercent}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: 500 }}
      >
        {label}
      </p>
      <p style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
        {value}
      </p>
    </div>
  );
}

type FieldProps = {
  label: string;
  error?: string[];
  children: React.ReactNode;
  style?: React.CSSProperties;
};

function Field({ label, error, children, style }: FieldProps) {
  return (
    <div className="flex flex-col" style={{ gap: 4, ...style }}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export type PromoCodeFormValues = {
  code: string;
  amount: string;
  minOrder: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
};

const EMPTY_FORM: PromoCodeFormValues = {
  code: "",
  amount: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: 14,
  color: "#111827",
  outline: "none",
  width: "100%",
};

const Page = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [FormOpen, setFormOpen] = useState(false);
  const { getPromoCodes, createPromoCodes, updatePromoCode,deletePromoCode } = usePromocode();
  const { data, isLoading } = getPromoCodes();

  useEffect(() => {
    if (!isLoading && data) {
      setPromos(data.data);
    }
  }, [isLoading, data]);

  function handleUpdatePromo(updated: PromoCode) {
    setPromos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setToast(`Code "${updated.code}" updated.`);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <section className="flex justify-center">
      <div
        className="mx-auto w-full max-w-2xl"
        style={{ paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16 }}
      >
        {/* Toast */}
        {toast && (
          <div
            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-sm text-emerald-800"
            style={{ marginBottom: 16, padding: "12px 16px" }}
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {toast}
          </div>
        )}
        <div>
          <Button
            onClick={() => setFormOpen(!FormOpen)}
            style={{ margin: "10px 0px", padding: "5px 10px" }}
          >
            {FormOpen ? "X " : "+ New PromoCode"}
          </Button>
        </div>
        {/* ── Create form ── */}
        {FormOpen && (
          <CreatePromoCodeForm
            createPromoCodes={createPromoCodes}
            setPromos={setPromos}
            setToast={setToast}
          />
        )}

        {/* ── Promo list ── */}
        <p
          className="text-xs font-semibold uppercase tracking-widest text-gray-400"
          style={{ marginBottom: 12 }}
        >
          Recent codes
        </p>
        <div className="flex flex-col" style={{ gap: 8 }}>
          {promos.length === 0 ? (
            <EmptyState />
          ) : (
            promos.map((p, i) => (
              <PromoRow
                key={`${p.code}-${i}`}
                promo={p}
                onUpdate={handleUpdatePromo}
                updatePromoCodes={updatePromoCode}
                deletePromoCode={deletePromoCode}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Page;