/**
 * Core Domain & API Type Definitions
 * Strict TypeScript models for Events, Guests, Budgets, Tasks, Vendors, and AI Blueprints.
 */

export type EventCategory =
  | "Wedding"
  | "Corporate"
  | "Birthday"
  | "Cultural"
  | "Conference"
  | "Gala"
  | "Anniversary"
  | "General";

export type EventStatus =
  | "draft"
  | "planned"
  | "active"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "completed";

export type RsvpStatus = "attending" | "declined" | "tentative" | "pending";
export type InvitationStatus = "not_sent" | "sent" | "delivered" | "opened";

export type ExpenseCategory =
  | "Venue"
  | "Catering"
  | "Decor"
  | "Photography"
  | "Entertainment"
  | "Logistics"
  | "Marketing"
  | "Other";

export interface EventEntity {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  eventDate: Date | string;
  endDate?: Date | string | null;
  location: string;
  venueId?: string | null;
  estimatedGuests: number;
  budget: number;
  currency: string;
  status: EventStatus;
  coverImage?: string | null;
  tags: string;
  isDemo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GuestEntity {
  id: string;
  eventId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  group: string;
  rsvpStatus: RsvpStatus;
  invitationStatus: InvitationStatus;
  dietaryRestrictions?: string | null;
  plusOne: number;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ExpenseEntity {
  id: string;
  eventId: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  status: "pending" | "paid" | "cancelled";
  receiptUrl?: string | null;
  date: Date | string;
  notes?: string | null;
  createdAt: Date | string;
}

export interface TaskEntity {
  id: string;
  eventId: string;
  title: string;
  description?: string | null;
  assignedTo?: string | null;
  dueDate?: Date | string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BudgetSummaryStats {
  totalBudget: number;
  totalExpenses: number;
  remainingBalance: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
}

export interface RsvpSummaryStats {
  totalGuests: number;
  attending: number;
  declined: number;
  tentative: number;
  pending: number;
  responseRate: number;
  totalHeadcountWithPlusOnes: number;
}
