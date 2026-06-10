import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(120),
  tagLine: z
    .string()
    .min(3, "Tagline is required")
    .max(200),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),

  status: z.enum([
    "DRAFT",
    "ACTIVE",
    "EXPIRED",
    "CANCELLED",
  ]),

  startDate: z.coerce.date(),

  endDate: z.coerce.date(),
})
.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);


  export const updateEventSchema = z
  .object({
    name: z
      .string()
      .min(3, "Event name must be at least 3 characters")
      .max(120)
      .optional(),

    tagLine: z
      .string()
      .min(3, "Tagline is required")
      .max(200)
      .optional(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000)
      .optional(),

    status: z
      .enum([
        "DRAFT",
        "ACTIVE",
        "EXPIRED",
        "CANCELLED",
      ])
      .optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined
      ),
    {
      message: "At least one field is required to update",
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }

      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );