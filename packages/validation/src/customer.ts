import { z } from "zod";

/** Empty form fields arrive as "", so treat "" as "not provided". */
const optionalEmail = z
  .email("Enter a valid email address")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const customerSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  email: optionalEmail,
});

export type CustomerInput = z.infer<typeof customerSchema>;
