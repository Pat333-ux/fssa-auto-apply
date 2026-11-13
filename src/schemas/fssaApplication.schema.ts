import { z } from 'zod';

export const FssaApplicationSchema = z.object({
  applicantUuid: z.string().uuid({ message: "Invalid applicant UUID format" }),
  county: z.string().default("Vigo"),
  programType: z.enum(["SNAP", "TANF", "MEDICAID", "IMPACT"]),
  householdSize: z.number().int().positive("Household size must be at least 1"),
  grossMonthlyIncome: z.number().nonnegative("Income cannot be negative"),
  submissionPayload: z.record(z.any()),
});

export type FssaApplicationInput = z.infer<typeof FssaApplicationSchema>;
