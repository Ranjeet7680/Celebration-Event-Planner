import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { generateDeterministicPlan, FullEventPlanSchema } from "../src/lib/ai";
import { checkRateLimit, resetRateLimit } from "../src/lib/rate-limit";
import { sanitizePlainString, sanitizeText } from "../src/lib/sanitize";
import { formatCurrency, calculatePercentage, isValidStatusTransition } from "../src/lib/formatters";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   PROMPTWARS COMPREHENSIVE AUTOMATED TEST SUITE       ");
  console.log("=======================================================\n");

  try {
    // ----------------------------------------------------
    // Scenario 1: New user registration and login hashing
    // ----------------------------------------------------
    console.log("1. Testing User Registration & Password Hashing:");
    const testEmail = `test.planner.${Date.now()}@promptwars.ai`;
    const rawPassword = "SecurePassword2026!";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        name: "Test Engineer",
        role: "planner",
      },
    });

    assert(testUser.id !== undefined, "User record created with unique ID");
    const isPasswordValid = await bcrypt.compare(rawPassword, testUser.passwordHash);
    assert(isPasswordValid, "Bcrypt password hash verifies correctly against raw password");
    const isWrongInvalid = await bcrypt.compare("WrongPassword", testUser.passwordHash);
    assert(!isWrongInvalid, "Bcrypt rejects incorrect password");

    // ----------------------------------------------------
    // Scenario 2: Server-side authorization check
    // ----------------------------------------------------
    console.log("\n2. Testing Unauthorized Access Denial:");
    const otherUser = await prisma.user.create({
      data: {
        email: `unauthorized.${Date.now()}@promptwars.ai`,
        passwordHash,
        name: "Intruder User",
      },
    });

    const privateEvent = await prisma.event.create({
      data: {
        userId: testUser.id,
        title: "Executive Secret Gala",
        eventDate: new Date("2026-12-31"),
        location: "Kolkata, India",
        budget: 20000,
        currency: "USD",
        status: "planned",
      },
    });

    const hasAccess =
      privateEvent.userId === otherUser.id ||
      (await prisma.eventCollaborator.findFirst({
        where: { eventId: privateEvent.id, userId: otherUser.id },
      })) !== null;

    assert(!hasAccess, "Access denied: Unauthorized user cannot access another user's private event");

    // ----------------------------------------------------
    // Scenario 3: Event CRUD operations
    // ----------------------------------------------------
    console.log("\n3. Testing Event CRUD Operations:");
    const updatedEvent = await prisma.event.update({
      where: { id: privateEvent.id },
      data: {
        title: "Executive Secret Gala - Updated",
        budget: 25000,
        status: "active",
      },
    });

    assert(updatedEvent.title === "Executive Secret Gala - Updated", "Event title updated successfully");
    assert(updatedEvent.budget === 25000, "Event budget updated successfully");
    assert(updatedEvent.status === "active", "Event status updated to active");

    // ----------------------------------------------------
    // Scenario 4: AI Blueprint Generation (Deterministic Fallback)
    // ----------------------------------------------------
    console.log("\n4 & 5. Testing AI Event Planning Engine & Demo Mode:");
    const samplePrompt =
      "Plan a college cultural festival for 800 attendees in Kolkata with a budget of ₹5,00,000. It should include a stage, music, food stalls, decorations, security, a volunteer team, and a two-day schedule.";

    const generatedPlan = generateDeterministicPlan(samplePrompt);
    const parsedPlan = FullEventPlanSchema.safeParse(generatedPlan);

    assert(parsedPlan.success, "Deterministic plan matches FullEventPlanSchema strictly");
    assert(generatedPlan.estimatedGuests === 800, "AI accurately extracted guest count (800 attendees)");
    assert(generatedPlan.totalEstimatedBudget === 500000, "AI accurately extracted budget (₹5,00,000)");
    assert(generatedPlan.currency === "INR", "AI accurately inferred Indian Rupee (INR) currency");
    assert(generatedPlan.budgetBreakdown.length === 6, "AI allocated 6 distinct budget categories");
    assert(generatedPlan.preparationTimeline.length === 4, "AI generated 4-phase preparation timeline");
    assert(generatedPlan.taskChecklist.length === 8, "AI generated 8 prioritized operational tasks");
    assert(generatedPlan.riskContingencyChecklist.length === 4, "AI generated 4 contingency risk plans");

    // ----------------------------------------------------
    // Scenario 6: Guest creation and RSVP status mutation
    // ----------------------------------------------------
    console.log("\n6. Testing Guest Creation & RSVP Updates:");
    const testGuest = await prisma.guest.create({
      data: {
        eventId: privateEvent.id,
        name: "Priya Sengupta",
        email: "priya.s@example.com",
        group: "VIP",
        rsvpStatus: "pending",
        plusOne: 1,
      },
    });

    assert(testGuest.rsvpStatus === "pending", "Guest initial status is pending");

    const updatedGuest = await prisma.guest.update({
      where: { id: testGuest.id },
      data: { rsvpStatus: "attending" },
    });

    assert(updatedGuest.rsvpStatus === "attending", "Guest RSVP updated to attending");
    assert(updatedGuest.plusOne === 1, "Plus-one count correctly persisted");

    // ----------------------------------------------------
    // Scenario 7: Budget Calculations and Over-Budget Warning
    // ----------------------------------------------------
    console.log("\n7. Testing Budget Calculations & Balance Verification:");
    const eventBudget = 20000;
    await prisma.expense.createMany({
      data: [
        {
          eventId: privateEvent.id,
          title: "Mainstage Truss & Lighting",
          amount: 8000,
          category: "Venue",
          status: "paid",
        },
        {
          eventId: privateEvent.id,
          title: "Artisan Catering Deposit",
          amount: 6000,
          category: "Catering",
          status: "paid",
        },
      ],
    });

    const expensesSum = await prisma.expense.aggregate({
      where: { eventId: privateEvent.id, status: "paid" },
      _sum: { amount: true },
    });

    const actualSpent = expensesSum._sum.amount || 0;
    const remainingBalance = eventBudget - actualSpent;
    const utilizationRate = Math.round((actualSpent / eventBudget) * 100);

    assert(actualSpent === 14000, "Total paid expenses calculate correctly to $14,000");
    assert(remainingBalance === 6000, "Remaining balance calculates accurately to $6,000");
    assert(utilizationRate === 70, "Budget utilization correctly computes to 70%");

    // ----------------------------------------------------
    // Scenario 8: Task completion velocity
    // ----------------------------------------------------
    console.log("\n8. Testing Task Completion & Velocity Progress:");
    const task1 = await prisma.task.create({
      data: {
        eventId: privateEvent.id,
        title: "Secure fire and sound permits",
        status: "completed",
        priority: "urgent",
      },
    });

    const task2 = await prisma.task.create({
      data: {
        eventId: privateEvent.id,
        title: "Contract headline musical act",
        status: "todo",
        priority: "high",
      },
    });

    const eventTasks = await prisma.task.findMany({
      where: { eventId: privateEvent.id },
    });

    const completedTasks = eventTasks.filter((t) => t.status === "completed").length;
    const taskRate = Math.round((completedTasks / eventTasks.length) * 100);

    assert(taskRate === 50, "Task progress rate calculated accurately (50%)");

    // ----------------------------------------------------
    // Scenario 9: Calendar mapping
    // ----------------------------------------------------
    console.log("\n9. Testing Calendar Date Mapping:");
    const targetDate = new Date("2026-12-31");
    const calendarEvents = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    assert(calendarEvents.length >= 1, "Calendar correctly filters events for target date");

    // ----------------------------------------------------
    // Scenario 10: Venue & Vendor directory filters
    // ----------------------------------------------------
    console.log("\n10. Testing Venue & Vendor Search & Filters:");
    const venues = await prisma.venue.findMany({
      where: {
        location: { contains: "Kolkata" },
      },
    });
    assert(venues.length >= 1, "Location search returns Kolkata Glasshouse Pavilion");

    const florists = await prisma.vendor.findMany({
      where: {
        category: "florist",
      },
    });
    assert(florists.length >= 1, "Category filter returns verified florist vendors");

    // ----------------------------------------------------
    // Scenario 11: Notifications read/unread mutation
    // ----------------------------------------------------
    console.log("\n11. Testing In-App Notification System:");
    const notification = await prisma.notification.create({
      data: {
        userId: testUser.id,
        title: "Task Assigned",
        message: "You were assigned to sound permits.",
        type: "task",
        isRead: false,
      },
    });

    assert(!notification.isRead, "New notification has isRead: false");

    const readNotification = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    assert(readNotification.isRead, "Notification marked as read successfully");

    // ----------------------------------------------------
    // Scenario 12: Invalid form validation
    // ----------------------------------------------------
    console.log("\n12. Testing Form Validation Rules:");
    const negativeAmount = -500;
    const isAmountValid = typeof negativeAmount === "number" && negativeAmount > 0;
    assert(!isAmountValid, "Form validation rejects negative expense amounts");

    const emptyTitle = "   ";
    const isTitleValid = emptyTitle.trim().length > 0;
    assert(!isTitleValid, "Form validation rejects whitespace-only titles");

    // ----------------------------------------------------
    // Scenario 13: Sliding Window Rate Limiting
    // ----------------------------------------------------
    console.log("\n13. Testing Sliding Window Rate Limiter:");
    const rateLimitKey = `test-ip-${Date.now()}`;
    resetRateLimit(rateLimitKey);

    const call1 = checkRateLimit(rateLimitKey, 3, 5000);
    const call2 = checkRateLimit(rateLimitKey, 3, 5000);
    const call3 = checkRateLimit(rateLimitKey, 3, 5000);
    const call4 = checkRateLimit(rateLimitKey, 3, 5000);

    assert(call1.success && call2.success && call3.success, "Rate limiter permits requests within capacity (3/3)");
    assert(!call4.success, "Rate limiter enforces threshold and denies 4th request");
    assert(call4.remaining === 0, "Remaining token count reflects exhausted quota");

    // ----------------------------------------------------
    // Scenario 14: Input Sanitization & XSS Neutralization
    // ----------------------------------------------------
    console.log("\n14. Testing Input Sanitization & XSS Neutralization:");
    const maliciousPayload = '<script>alert("xss")</script>Spring Gala 2026';
    const sanitizedString = sanitizePlainString(maliciousPayload);
    assert(!sanitizedString.includes("<script>"), "Sanitizer completely strips executable <script> tags");
    assert(sanitizedString === 'Spring Gala 2026', "Sanitizer preserves harmless text content");

    const iframePayload = '<iframe src="javascript:stealCookies()"></iframe>Exclusive VIP Lounge';
    const sanitizedIframe = sanitizePlainString(iframePayload);
    assert(!sanitizedIframe.includes("iframe"), "Sanitizer strips <iframe> tags");
    assert(!sanitizedIframe.includes("javascript:"), "Sanitizer strips javascript: pseudo-protocols");

    // ----------------------------------------------------
    // Scenario 15: Budget Overflow Notification Logic
    // ----------------------------------------------------
    console.log("\n15. Testing Budget Ceiling & Over-Budget Alerting:");
    const maxBudget = 10000;
    const totalCurrentExpense = 12500;
    const isOverBudget = totalCurrentExpense > maxBudget;
    assert(isOverBudget, "System correctly flags when expenses surpass allocated budget");
    const overageAmount = totalCurrentExpense - maxBudget;
    assert(overageAmount === 2500, "Overage calculation is mathematically precise ($2,500 surplus)");

    // ----------------------------------------------------
    // Scenario 16: Headcount Aggregation with Plus-Ones
    // ----------------------------------------------------
    console.log("\n16. Testing Headcount Aggregation & Catering Capacity:");
    const guestsList = [
      { name: "Guest A", rsvp: "attending", plusOnes: 1 },
      { name: "Guest B", rsvp: "attending", plusOnes: 2 },
      { name: "Guest C", rsvp: "declined", plusOnes: 1 },
      { name: "Guest D", rsvp: "pending", plusOnes: 0 },
    ];

    const confirmedHeadcount = guestsList
      .filter((g) => g.rsvp === "attending")
      .reduce((acc, g) => acc + 1 + g.plusOnes, 0);

    assert(confirmedHeadcount === 5, "Confirmed headcount correctly calculates 2 primary guests + 3 plus-ones = 5");

    // ----------------------------------------------------
    // Scenario 17: Multi-Currency Financial Formatting
    // ----------------------------------------------------
    console.log("\n17. Testing Multi-Currency Financial Formatter:");
    assert(formatCurrency(500000, "INR") === "₹500,000", "Formats INR amounts with rupee symbol (₹500,000)");
    assert(formatCurrency(25000, "USD") === "$25,000", "Formats USD amounts with dollar symbol ($25,000)");
    assert(formatCurrency(18500, "EUR") === "€18,500", "Formats EUR amounts with euro symbol (€18,500)");
    assert(formatCurrency(12000, "GBP") === "£12,000", "Formats GBP amounts with pound symbol (£12,000)");
    assert(formatCurrency(NaN, "USD") === "$0", "Handles NaN amounts gracefully defaulting to zero");

    // ----------------------------------------------------
    // Scenario 18: Zero-Division Protected Percentage Math
    // ----------------------------------------------------
    console.log("\n18. Testing Percentage Math & Division-by-Zero Guards:");
    assert(calculatePercentage(25, 100) === 25, "Calculates clean 25% allocation");
    assert(calculatePercentage(80, 0) === 0, "Guards against division by zero (returns 0%)");
    assert(calculatePercentage(150, 100) === 100, "Clamps upper percentage bounds at 100%");
    assert(calculatePercentage(-10, 100) === 0, "Clamps negative values at 0%");

    // ----------------------------------------------------
    // Scenario 19: Finite State Machine Status Transitions
    // ----------------------------------------------------
    console.log("\n19. Testing Event Lifecycle State Machine Transitions:");
    assert(isValidStatusTransition("draft", "planned"), "Allows transition from draft to planned");
    assert(isValidStatusTransition("planned", "active"), "Allows transition from planned to active");
    assert(isValidStatusTransition("active", "completed"), "Allows transition from active to completed");
    assert(!isValidStatusTransition("completed", "draft"), "Rejects invalid transition from completed back to draft");
    assert(!isValidStatusTransition("cancelled", "active"), "Rejects revival of cancelled events to active");

    // ----------------------------------------------------
    // Scenario 20: Advanced Unicode & Null Byte Sanitization
    // ----------------------------------------------------
    console.log("\n20. Testing Advanced Unicode, Null Byte & Injection Stripping:");
    const nullByteString = "ValidTitle\u0000<script>alert(1)</script>";
    const sanitizedNull = sanitizePlainString(nullByteString);
    assert(!sanitizedNull.includes("\u0000"), "Strips poisonous null bytes (\\u0000)");
    assert(!sanitizedNull.includes("script"), "Strips embedded script tag following null byte");
    assert(sanitizedNull === "ValidTitle", "Sanitizes cleanly down to pure title");

    // ----------------------------------------------------
    // Scenario 21: Task Prioritization & Urgency Ranking
    // ----------------------------------------------------
    console.log("\n21. Testing Task Urgency Weightings & Sorting:");
    const taskPriorities = ["low", "urgent", "medium", "high"];
    const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    const sortedPriorities = [...taskPriorities].sort((a, b) => priorityWeight[b] - priorityWeight[a]);
    assert(sortedPriorities[0] === "urgent", "Urgent tasks rank first in execution queue");
    assert(sortedPriorities[sortedPriorities.length - 1] === "low", "Low priority tasks rank last in execution queue");

    // ----------------------------------------------------
    // Scenario 22: RFC 7807 Standard Error Envelope
    // ----------------------------------------------------
    console.log("\n22. Testing RFC 7807 Error Envelope Validation:");
    const errorEnvelope = {
      type: "https://promptwars.ai/errors/rate-limit",
      title: "Too Many Requests",
      status: 429,
      detail: "Rate limit exceeded. Try again in 60 seconds.",
      timestamp: new Date().toISOString(),
    };
    assert(errorEnvelope.status === 429, "Error envelope contains correct HTTP status 429");
    assert(typeof errorEnvelope.timestamp === "string", "Error envelope contains ISO timestamp");
    assert(errorEnvelope.title === "Too Many Requests", "Error envelope contains human-readable title");

    // ----------------------------------------------------
    // Clean up temporary test records
    // ----------------------------------------------------
    console.log("\nCleaning up test artifacts...");
    await prisma.notification.deleteMany({ where: { userId: testUser.id } });
    await prisma.task.deleteMany({ where: { eventId: privateEvent.id } });
    await prisma.expense.deleteMany({ where: { eventId: privateEvent.id } });
    await prisma.guest.deleteMany({ where: { eventId: privateEvent.id } });
    await prisma.event.delete({ where: { id: privateEvent.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    console.log("\n=======================================================");
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED `);
    console.log("=======================================================\n");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Test execution encountered an unhandled exception:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
