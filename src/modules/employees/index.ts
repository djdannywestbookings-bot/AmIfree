import { z } from "zod";
import { APP_ROLES } from "@/server/policies/roles";
import { MEMBER_STATUSES } from "@/modules/auth";

/**
 * Employees domain types — Phase 38.
 *
 * An "employee" in the AmIFree UI is just a workspace_members row.
 * The DB-level concept is "member" (workspace_members) but the user-
 * facing concept is "employee" because that's what scheduling apps
 * call them.
 *
 * Roles: owner / manager_lite / employee. Owner has full authority,
 * manager_lite covers the reserved-scaffolding mid-tier role, and
 * employee is a non-admin team member who can view/be assigned shifts.
 */

export const employeeCreateInputSchema = z.object({
  email: z.string().email("Email is required").max(254).toLowerCase(),
  name: z.string().trim().min(1, "Name is required").max(200),
  phone: z.string().trim().max(60).nullable().optional(),
  role: z.enum(APP_ROLES).default("employee"),
  // Phase 41 — pay rate per scheduled hour, USD cents.
  default_pay_rate_cents: z.number().int().min(0).max(99_999_900).optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateInputSchema>;

export const employeeUpdateInputSchema = z.object({
  email: z.string().email().max(254).toLowerCase().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().max(60).nullable().optional(),
  role: z.enum(APP_ROLES).optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
  default_pay_rate_cents: z.number().int().min(0).max(99_999_900).optional(),
});

export type EmployeeUpdateInput = z.infer<typeof employeeUpdateInputSchema>;
