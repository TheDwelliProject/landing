import { isValidPhoneNumber } from "libphonenumber-js/max";
import { z } from "zod";

export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(isValidPhoneNumber, "Please enter a valid mobile number"),
});
export type PhoneInput = z.infer<typeof phoneSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/u, "Enter the 6-digit code"),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const requestOtpBodySchema = phoneSchema;
export type RequestOtpBody = z.infer<typeof requestOtpBodySchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "That name looks a little long"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const updateMeBodySchema = profileSchema;
export type UpdateMeBody = z.infer<typeof updateMeBodySchema>;

export const verifyBodySchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(isValidPhoneNumber, "Please enter a valid mobile number"),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/u, "Enter the 6-digit code"),
  device_label: z.string().min(1).max(80),
});
export type VerifyBody = z.infer<typeof verifyBodySchema>;
