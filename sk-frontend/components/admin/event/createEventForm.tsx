"use client";

import { SetStateAction, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { Button } from "@/components/ui/button";

import { CalendarIcon } from "lucide-react";

import { format } from "date-fns";
import useEvents from "@/hooks/useEvent";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
type EventStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ENDED"
  | "ARCHIVED";

interface EventFormData {
  name: string;
  slug: string;
  tagLine: string;
  description: string;
  thumbnail: File|any;
  banner: File|any;
  status: EventStatus;
  startDate: string;
  endDate: string;
}

const INITIAL_FORM: EventFormData = {
  name: "",
  slug: "",
  tagLine: "",
  description: "",
  thumbnail:null,
  banner:null,
  status: "DRAFT",
  startDate: "",
  endDate: "",
};

export default function EventForm({onClose}:{onClose:()=>void}) {
  const [form, setForm] =
    useState<EventFormData>(INITIAL_FORM);
    const {createEvent}=useEvents()
const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement
  >
) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const { name, files } = e.target;

  if (!files || !files[0]) return;

  setForm((prev) => ({
    ...prev,
    [name]: files[0],
  }));
};

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();
    console.log(form)
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("slug", form.slug);
    formData.append("tagLine", form.tagLine);
    formData.append("description", form.description);
    formData.append("status", form.status);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);

    if (form.thumbnail) {
      formData.append("thumbnail", form.thumbnail);
    }

    if (form.banner) {
      formData.append("banner", form.banner);
    }
    createEvent.mutate(formData,{onSuccess:()=>{
      toast(
        "Event created Successfully"
      )
      onClose();
      setForm(INITIAL_FORM);
    },onError:()=>{
    toast.error("Error while creating event")}})


};
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #0a0a0a;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "white",
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "2rem",
          }}
        >

          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem,8vw,5rem)",
              lineHeight: 0.9,
              letterSpacing: "0.03em",
              margin: 0,
            }}
          >
            Create
            <br />
            <span style={{ color: "#737373" }}>
              Event
            </span>
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Name + Slug */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "1rem",
            }}
          >
            <Field label="Event Name">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Summer Collection"
              />
            </Field>
              {/* Tagline */}
          <Field label="Tag Line">
            <Input
              name="tagLine"
              value={form.tagLine}
              onChange={handleChange}
              placeholder="Fresh styles for the season"
            />
          </Field>

          </div>



          {/* Description */}
          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write event description..."
              style={textareaStyle}
            />
          </Field>

          {/* Thumbnail + Banner */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "1rem",
  }}
>
  {/* Thumbnail */}
  <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
    <label
      htmlFor="thumbnail"
      style={{
        fontSize: ".9rem",
        fontWeight: 600,
        color: "gray",
        letterSpacing: "-0.01em",
      }}
    >
      Thumbnail Image
    </label>

   {form.thumbnail?<div>
    <img className="h-[300px]" src={URL.createObjectURL(form.thumbnail)}/>
   </div>:<label
      htmlFor="thumbnail"
      style={{
        border: "1px dashed #d1d5db",
        borderRadius: "14px",
        padding: "1.2rem",
        cursor: "pointer",
        transition: "all .2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "120px",
        textAlign: "center",
      }}
    >
      <input
        id="thumbnail"
        type="file"
        name="thumbnail"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: "gray",
          }}
        >
          {form.thumbnail
            ? form.thumbnail.name
            : "Upload thumbnail"}
        </p>

        <span
          style={{
            fontSize: ".82rem",
            color: "#6b7280",
          }}
        >
          PNG, JPG, WEBP
        </span>
      </div>
    </label>
    }
  </div>

  {/* Banner */}
  <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
 <label
      htmlFor="banner"
      style={{
        fontSize: ".9rem",
        fontWeight: 600,
        color: "gray",
        letterSpacing: "-0.01em",
      }}
    >
      Banner Image
    </label>

   {form.banner?<div>
        <img className="h-[300px]" src={URL.createObjectURL(form.banner)}/>
    </div>:    <label
      htmlFor="banner"
      style={{
        border: "1px dashed #d1d5db",
        borderRadius: "14px",
        padding: "1.2rem",
        cursor: "pointer",
        transition: "all .2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "120px",
        textAlign: "center",
      }}
    >
      <input
        id="banner"
        type="file"
        name="banner"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: "gray",
          }}
        >
          {form.banner ? form.banner.name : "Upload banner"}
        </p>

        <span
          style={{
            fontSize: ".82rem",
            color: "#6b7280",
          }}
        >
          PNG, JPG, WEBP
        </span>
      </div>
    </label>
}
  </div>
</div>

          {/* Status */}
          <Field label="Status">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">
                ACTIVE
              </option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">
                CANCELLED
              </option>
            </select>
          </Field>

          {/* Dates */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "1rem",
            }}
          >
           {/* Dates */}
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: "1rem",
  }}
>
  {/* Start Date */}
  <Field label="Start Date">
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full hover:text-white justify-start text-left font-normal bg-[#111111] border-[#262626] text-white hover:bg-[#1a1a1a]"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />

          {form.startDate ? (
            format(new Date(form.startDate), "PPP")
          ) : (
            <span> start date</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto  p-0 bg-zinc-900 border-[#262626]"
        align="start"
      >
        <Calendar
          mode="single"
          className="text-white"
          selected={
            form.startDate
              ? new Date(form.startDate)
              : undefined
          }
          onSelect={(date) => {
            if (!date) return;

            setForm((prev) => ({
              ...prev,
              startDate: date.toISOString(),
            }));
          }}

        />
      </PopoverContent>
    </Popover>
  </Field>

  {/* End Date */}
  <Field label="End Date">
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full hover:text-white justify-start text-left font-normal bg-[#111111] border-[#262626] text-white hover:bg-[#1a1a1a]"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />

          {form.endDate ? (
            format(new Date(form.endDate), "PPP")
          ) : (
            <span> end date</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 bg-[#111111] border-[#262626]"
        align="start"
      >
        <Calendar
        className="text-white"
          mode="single"
          selected={
            form.endDate
              ? new Date(form.endDate)
              : undefined
          }
          onSelect={(date) => {
            if (!date) return;

            setForm((prev) => ({
              ...prev,
              endDate: date.toISOString(),
            }));
          }}
        />
      </PopoverContent>
    </Popover>
  </Field>
</div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="submit"
              style={{
                background: "white",
                color: "black",
                border: "none",
                padding: "0.9rem 1.5rem",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >{createEvent.isPending?<div><CgSpinner className="animate-spin"/></div>:"Create Event"}

            </button>

            <button
            onClick={()=>onClose()}
              type="button"
              style={{
                background: "transparent",
                color: "#737373",
                border: "1px solid #262626",
                padding: "0.9rem 1.5rem",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
      }}
    >
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#737373",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function Input({
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      {...props}
      style={inputStyle}
    />
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111111",
  border: "1px solid #262626",
  color: "white",
  padding: "0.9rem 1rem",
  fontSize: "14px",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "140px",
  resize: "vertical",
  background: "#111111",
  border: "1px solid #262626",
  color: "white",
  padding: "1rem",
  fontSize: "14px",
  outline: "none",
};
