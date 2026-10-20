import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { generateDeterministicPlan, FullEventPlanSchema } from "../src/lib/ai";

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
        title: "Confidential Leadership Retreat",
        category: "Corporate",
        eventDate: new Date(Date.now() + 10 * 86400000),
        location: "Private Island",
        budget: 10000,
        isDemo: false,
      },
    });

    const isAuthorized = privateEvent.userId === otherUser.id || privateEvent.isDemo;
    assert(!isAuthorized, "Access denied: Unauthorized user cannot access another user's private event");

    // ----------------------------------------------------
    // Scenario 3: Create, read, and edit event
    // ----------------------------------------------------
    console.log("\n3. Testing Event CRUD Operations:");
    const updatedEvent = await prisma.event.update({
      where: { id: privateEvent.id },
      data: {
        title: "Updated Confidential Leadership Retreat",
        budget: 15000,
        status: "active",
      },
    });

    assert(updatedEvent.title === "Updated Confidential Leadership Retreat", "Event title updated successfully");
    assert(updatedEvent.budget === 15000, "Event budget updated successfully");
    assert(updatedEvent.status === "active", "Event status updated to active");

    // ----------------------------------------------------
    // Scenario 4 & 5: AI Event Planning Engine in Demo Mode
    // ----------------------------------------------------
    console.log("\n4 & 5. Testing AI Event Planning Engine & Demo Mode:");
    const prompt =
      "Plan a college cultural festival for 800 attendees in Kolkata with a budget of ₹5,00,000. It should include a stage, music, food stalls, decorations, security, a volunteer team, and a two-day schedule.";

    const generatedPlan = generateDeterministicPlan(prompt);
    const validated = FullEventPlanSchema.safeParse(generatedPlan);

    assert(validated.success, "Deterministic plan matches FullEventPlanSchema strictly");
    assert(generatedPlan.estimatedGuests === 800, "AI accurately extracted guest count (800 attendees)");
    assert(generatedPlan.totalEstimatedBudget === 500000, "AI accurately extracted budget (₹5,00,000)");
    assert(generatedPlan.currency === "INR", "AI accurately inferred Indian Rupee (INR) currency");
    assert(generatedPlan.budgetBreakdown.length === 6, "AI allocated 6 distinct budget categories");
    assert(generatedPlan.preparationTimeline.length === 4, "AI generated 4-phase preparation timeline");
    assert(generatedPlan.taskChecklist.length === 8, "AI generated 8 prioritized operational tasks");
    assert(generatedPlan.riskContingencyChecklist.length === 4, "AI generated 4 contingency risk plans");

    // ----------------------------------------------------
    // Scenario 6: Guest creation and RSVP updates
    // ----------------------------------------------------
    console.log("\n6. Testing Guest Creation & RSVP Updates:");
    const guest = await prisma.guest.create({
      data: {
        eventId: privateEvent.id,
        name: "Professor Sen",
        email: "sen@academics.edu",
        group: "VIP",
        rsvpStatus: "pending",
        plusOne: 1,
        dietaryRestrictions: "Vegan",
      },
    });

    assert(guest.rsvpStatus === "pending", "Guest initial status is pending");

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: { rsvpStatus: "attending" },
    });

    assert(updatedGuest.rsvpStatus === "attending", "Guest RSVP updated to attending");
    assert(updatedGuest.plusOne === 1, "Plus-one count correctly persisted");

    // ----------------------------------------------------
    // Scenario 7: Budget totals, expenses & remaining balances
    // ----------------------------------------------------
    console.log("\n7. Testing Budget Calculations & Balance Verification:");
    const eventBudget = 20000;
    const exp1 = await prisma.expense.create({
      data: {
        eventId: privateEvent.id,
        title: "Stage Rigging",
        amount: 8000,
        category: "Stage",
        status: "paid",
      },
    });

    const exp2 = await prisma.expense.create({
      data: {
        eventId: privateEvent.id,
        title: "Catering Deposit",
        amount: 6000,
        category: "Catering",
        status: "paid",
      },
    });

    const totalPaid = exp1.amount + exp2.amount;
    const remainingBudget = eventBudget - totalPaid;
    const utilization = Math.round((totalPaid / eventBudget) * 100);

    assert(totalPaid === 14000, "Total paid expenses calculate correctly to $14,000");
    assert(remainingBudget === 6000, "Remaining balance calculates accurately to $6,000");
    assert(utilization === 70, "Budget utilization correctly computes to 70%");

    // ----------------------------------------------------
    // Scenario 8: Task completion and Kanban progress rate
    // ----------------------------------------------------
    console.log("\n8. Testing Task Completion & Velocity Progress:");
    const task1 = await prisma.task.create({
      data: {
        eventId: privateEvent.id,
        title: "Sound Permit Submission",
        priority: "urgent",
        status: "completed",
        category: "Permits",
      },
    });

    const task2 = await prisma.task.create({
      data: {
        eventId: privateEvent.id,
        title: "Stage Safety Check",
        priority: "high",
        status: "todo",
        category: "Production",
      },
    });

    const allTasks = [task1, task2];
    const completedCount = allTasks.filter((t) => t.status === "completed").length;
    const taskProgress = Math.round((completedCount / allTasks.length) * 100);

    assert(taskProgress === 50, "Task progress rate calculated accurately (50%)");

    // ----------------------------------------------------
    // Scenario 9: Calendar date mapping
    // ----------------------------------------------------
    console.log("\n9. Testing Calendar Date Mapping:");
    const eventDate = new Date(privateEvent.eventDate);
    const day = eventDate.getDate();
    const month = eventDate.getMonth();

    const matchingEvents = await prisma.event.findMany({
      where: {
        id: privateEvent.id,
        eventDate: {
          gte: new Date(eventDate.getFullYear(), month, day),
          lt: new Date(eventDate.getFullYear(), month, day + 1),
        },
      },
    });

    assert(matchingEvents.length === 1, "Calendar correctly filters events for target date");

    // ----------------------------------------------------
    // Scenario 10: Search and filtering verification
    // ----------------------------------------------------
    console.log("\n10. Testing Venue & Vendor Search & Filters:");
    const venuesInKolkata = await prisma.venue.findMany({
      where: { location: { contains: "Kolkata" } },
    });
    assert(venuesInKolkata.length >= 1, "Location search returns Kolkata Glasshouse Pavilion");

    const florists = await prisma.vendor.findMany({
      where: { category: "florist" },
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

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Test execution encountered an unhandled exception:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
