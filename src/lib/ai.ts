import { z } from "zod";

export const EventPlanItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const BudgetAllocationItemSchema = z.object({
  category: z.string(),
  allocatedAmount: z.number(),
  percentage: z.number(),
  notes: z.string(),
});

export const ScheduleItemSchema = z.object({
  time: z.string(),
  activity: z.string(),
  location: z.string(),
  notes: z.string().optional(),
});

export const TimelineItemSchema = z.object({
  phase: z.string(),
  daysBefore: z.string(),
  deliverables: z.array(z.string()),
});

export const TeamRoleSchema = z.object({
  role: z.string(),
  responsibilities: z.string(),
  suggestedHeadcount: z.number(),
});

export const FullEventPlanSchema = z.object({
  eventName: z.string(),
  tagline: z.string(),
  description: z.string(),
  category: z.string(),
  targetAudience: z.string(),
  proposedLocation: z.string(),
  proposedDate: z.string(),
  duration: z.string(),
  estimatedGuests: z.number(),
  totalEstimatedBudget: z.number(),
  currency: z.string(),
  budgetBreakdown: z.array(BudgetAllocationItemSchema),
  preparationTimeline: z.array(TimelineItemSchema),
  eventDaySchedule: z.array(ScheduleItemSchema),
  taskChecklist: z.array(EventPlanItemSchema),
  requiredTeamRoles: z.array(TeamRoleSchema),
  suggestedVenueRequirements: z.array(z.string()),
  vendorCategories: z.array(z.string()),
  riskContingencyChecklist: z.array(
    z.object({
      risk: z.string(),
      severity: z.enum(["Low", "Medium", "High"]),
      mitigationPlan: z.string(),
    })
  ),
  guestCommunicationPlan: z.object({
    invitationDate: z.string(),
    rsvpDeadline: z.string(),
    channels: z.array(z.string()),
    keyMessages: z.array(z.string()),
  }),
});

export type GeneratedEventPlan = z.infer<typeof FullEventPlanSchema>;

export interface AIGenerationResult {
  plan: GeneratedEventPlan;
  isDemoMode: boolean;
  provider: "demo" | "gemini" | "openai";
  warning?: string;
}

// Deterministic intelligent generator for prompt parsing in demo mode
export function generateDeterministicPlan(prompt: string): GeneratedEventPlan {
  const p = prompt.toLowerCase();

  // Extract guest count if specified
  const guestMatch = p.match(/(\d+[\d,]*)\s*(guests?|attendees?|people)/i);
  let guestCount = 200;
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1].replace(/,/g, ""), 10);
  } else if (p.includes("800")) {
    guestCount = 800;
  } else if (p.includes("500")) {
    guestCount = 500;
  } else if (p.includes("100")) {
    guestCount = 100;
  }

  // Extract budget
  let budget = 35000;
  let currency = "USD";
  if (p.includes("₹") || p.includes("rs") || p.includes("inr") || p.includes("lakh") || p.includes("5,00,000") || p.includes("500000")) {
    currency = "INR";
    if (p.includes("5,00,000") || p.includes("500000") || p.includes("5 lakh")) {
      budget = 500000;
    } else {
      budget = 400000;
    }
  } else if (p.includes("$")) {
    const bMatch = p.match(/\$\s*(\d+[\d,]*)/);
    if (bMatch) budget = parseInt(bMatch[1].replace(/,/g, ""), 10);
  }

  // Extract location
  let location = "Metropolitan Center, NY";
  if (p.includes("kolkata")) location = "The Glasshouse Pavilion & Botanical Gardens, Kolkata";
  else if (p.includes("udaipur")) location = "Heritage Courtyard Palace, Udaipur";
  else if (p.includes("san francisco") || p.includes("sf")) location = "Starlight Sky Lounge, San Francisco";
  else if (p.includes("chicago")) location = "The Industrial Loft & Creator Lab, Chicago";

  // Category determination
  let category = "General Celebration";
  let eventName = "Grand Celebration & Gathering 2026";
  let tagline = "Where memories are crafted with heart and passion.";
  let description = "An expertly curated celebration designed with precision, vibrant energy, and seamless hospitality.";

  if (p.includes("cultural") || p.includes("festival") || p.includes("fest") || p.includes("college")) {
    category = "Cultural Festival";
    eventName = "Kolkata Spring Cultural Fest & Youth Carnival 2026";
    tagline = "Two days of pulsating music, art, artisanal food, and boundless creativity.";
    description = `A grand 2-day cultural celebration for ${guestCount} attendees featuring live acoustic stages, battle of the bands, artisanal street food alleys, and volunteer-led interactive installations.`;
  } else if (p.includes("wedding") || p.includes("marriage") || p.includes("reception")) {
    category = "Wedding";
    eventName = "The Royal Starlight Heritage Wedding";
    tagline = "An ethereal celebration of eternal love and timeless tradition.";
    description = `A majestic celebration for ${guestCount} guests with royal decor, candlelit pheras, curated banquets, and unforgettable music.`;
  } else if (p.includes("birthday") || p.includes("anniversary")) {
    category = "Birthday Celebration";
    eventName = "Celestial Neon Rooftop Birthday Bash";
    tagline = "Another year bolder, brighter, and louder!";
    description = `An intimate yet high-energy party for ${guestCount} guests with signature cocktails, live DJ sets, and chic ambient lighting.`;
  } else if (p.includes("corporate") || p.includes("summit") || p.includes("conference") || p.includes("hackathon")) {
    category = "Corporate Summit";
    eventName = "NextGen AI & Innovation Summit 2026";
    tagline = "Empowering tomorrow's pioneers through collaborative brilliance.";
    description = `A premier corporate event for ${guestCount} leaders featuring keynote theaters, breakout masterclasses, and networking cocktail galas.`;
  }

  return {
    eventName,
    tagline,
    description,
    category,
    targetAudience: `Students, alumni, creative enthusiasts, and invited dignitaries (${guestCount} estimated).`,
    proposedLocation: location,
    proposedDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    duration: p.includes("two-day") || p.includes("2-day") || p.includes("2 day") ? "2 Days" : "1 Day",
    estimatedGuests: guestCount,
    totalEstimatedBudget: budget,
    currency,
    budgetBreakdown: [
      {
        category: "Venue & Permits",
        allocatedAmount: Math.round(budget * 0.28),
        percentage: 28,
        notes: "Full ground booking, municipal fire clearance, and crowd control permits.",
      },
      {
        category: "Stage, Sound & Production",
        allocatedAmount: Math.round(budget * 0.24),
        percentage: 24,
        notes: "Line-array sound systems, truss lighting, LED backdrop, and generator backups.",
      },
      {
        category: "Food & Beverage Stalls",
        allocatedAmount: Math.round(budget * 0.20),
        percentage: 20,
        notes: "Artisanal food alley subsidies, hygiene stations, and mineral water supply.",
      },
      {
        category: "Artists & Headline Acts",
        allocatedAmount: Math.round(budget * 0.14),
        percentage: 14,
        notes: "Mainstage performers, sound engineers, green room hospitality.",
      },
      {
        category: "Security, Medical & Sanitation",
        allocatedAmount: Math.round(budget * 0.08),
        percentage: 8,
        notes: "Professional security bouncers, on-site ambulance team, and eco-recycling bins.",
      },
      {
        category: "Marketing, Badges & Contingency",
        allocatedAmount: Math.round(budget * 0.06),
        percentage: 6,
        notes: "Digital campaign, RFID wristbands, photo backdrops, emergency reserve.",
      },
    ],
    preparationTimeline: [
      {
        phase: "Phase 1: Foundation & Approvals",
        daysBefore: "60 to 45 Days Out",
        deliverables: [
          "Lock in venue contract & pay reservation advance",
          "Submit municipal sound clearance and police permissions",
          "Finalize headline performer contracts & artist riders",
        ],
      },
      {
        phase: "Phase 2: Logistics & Vendor Alignment",
        daysBefore: "44 to 20 Days Out",
        deliverables: [
          "Select stage and acoustic sound vendor",
          "Vet and contract artisanal food vendors & check food safety certificates",
          "Launch digital registration portal and RSVP tracking",
        ],
      },
      {
        phase: "Phase 3: Operations & Drill",
        daysBefore: "19 to 3 Days Out",
        deliverables: [
          "Recruit & brief 40 volunteer leads on crowd management",
          "Distribute VIP invitations and media passes",
          "Conduct site walkthrough with electrical & sound contractors",
        ],
      },
      {
        phase: "Phase 4: Event Day & Wrap-up",
        daysBefore: "Event Weekend & T+1",
        deliverables: [
          "07:00 AM Stage soundcheck and emergency drill",
          "Continuous crowd check-in with digital badges",
          "Eco-waste collection and complete venue post-inspection",
        ],
      },
    ],
    eventDaySchedule: [
      { time: "08:30 AM", activity: "Volunteer & Crew Check-in & Briefing", location: "Main Gate / Secretariat", notes: "Radio test and badge handout" },
      { time: "10:00 AM", activity: "Official Gates Open & Registrations", location: "Registration Desks 1-4", notes: "QR code wristband scanning" },
      { time: "11:30 AM", activity: "Inaugural Ceremony & Welcome Address", location: "Mainstage Pavilion", notes: "Keynote patrons and lighting of the lamp" },
      { time: "01:00 PM", activity: "Artisanal Food Alley & Acoustic Sets", location: "Lawn & Food Court", notes: "Background jazz and local student performers" },
      { time: "04:30 PM", activity: "Youth Showcase & Battle of the Bands", location: "Amphitheater Stage", notes: "Judges panel and live audience poll" },
      { time: "07:30 PM", activity: "Headline Concert & Light Spectacle", location: "Mainstage Arena", notes: "Full sound rig and laser synchrony" },
      { time: "10:30 PM", activity: "Curfew & Orderly Guest Dispersal", location: "Main Exits", notes: "Shuttle cabs and emergency lane clearing" },
    ],
    taskChecklist: [
      { title: "Obtain city sound & safety permit", category: "Legal & Permits", priority: "urgent" },
      { title: "Sign agreement with sound & stage engineering provider", category: "Production", priority: "urgent" },
      { title: "Review food hygiene protocol with all 12 stall vendors", category: "Catering", priority: "high" },
      { title: "Configure digital check-in scanner app for gates", category: "Technology", priority: "high" },
      { title: "Conduct emergency medical & fire drill with on-site staff", category: "Safety", priority: "urgent" },
      { title: "Setup VIP green room hospitality & artist transport", category: "Hospitality", priority: "medium" },
      { title: "Deploy eco-friendly waste recycling stations", category: "Sanitation", priority: "medium" },
      { title: "Prepare post-festival thank-you letters and sponsor reports", category: "PR", priority: "low" },
    ],
    requiredTeamRoles: [
      { role: "Event Lead / Director", responsibilities: "Overall execution, escalation handling, and sponsor relationships", suggestedHeadcount: 2 },
      { role: "Stage & Sound Coordinator", responsibilities: "Artist liaison, audio checks, schedule adherence, and backstage management", suggestedHeadcount: 3 },
      { role: "Guest & Security Lead", responsibilities: "Entrance queues, wristband distribution, crowd flow, and emergency protocol", suggestedHeadcount: 6 },
      { role: "Food & Vendor Manager", responsibilities: "Hygiene adherence, power lines, waste clearing, and stall support", suggestedHeadcount: 4 },
      { role: "Volunteer Brigade", responsibilities: "Directional guidance, registration support, and water point hydration", suggestedHeadcount: 25 },
    ],
    suggestedVenueRequirements: [
      "Open-air or pavilion capacity for at least 800+ concurrent attendees",
      "Dedicated 3-phase power supply (minimum 65kVA) for stage and food trucks",
      "Dual entry/exit gates with wide emergency evacuation lanes",
      "Green rooms with private restrooms for headliners and dignitaries",
      "Ample parking or designated shuttle pickup perimeter",
    ],
    vendorCategories: [
      "Stage & Audio-Visual Rigging",
      "Artisanal Catering & Street Stalls",
      "Candid Event Photography & Drone Videography",
      "Lighting & Thematic Spatial Decorators",
      "Licensed Private Security & First Aid Medical Support",
    ],
    riskContingencyChecklist: [
      {
        risk: "Unseasonal rain or adverse weather during outdoor segments",
        severity: "High",
        mitigationPlan: "Pre-book waterproof canopy overhangs and ensure electrical junctions are raised on wooden pallets.",
      },
      {
        risk: "Sudden power grid interruption during headline concert",
        severity: "High",
        mitigationPlan: "Dual silent diesel generators on active auto-switch standby with 100% stage load capacity.",
      },
      {
        risk: "Overcrowding at main entrance registration",
        severity: "Medium",
        mitigationPlan: "Four staggered entry gates with pre-assigned QR wristbands and mobile queue-busting volunteers.",
      },
      {
        risk: "Food safety or vendor cancellation",
        severity: "Medium",
        mitigationPlan: "Pre-screen vendor municipal licenses and maintain 2 standby central catering backup teams.",
      },
    ],
    guestCommunicationPlan: {
      invitationDate: "30 days prior to event",
      rsvpDeadline: "7 days prior to event",
      channels: ["Email Newsletter", "WhatsApp Broadcast", "Social Channels", "Campus App Alerts"],
      keyMessages: [
        "Save the Date: Kolkata Spring Cultural Fest announcement",
        "Headliner band unveil & ticket/badge access passes release",
        "Final schedule guide, parking tips, and campus entry rules",
      ],
    },
  };
}

export async function generateEventPlan(prompt: string): Promise<AIGenerationResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // If Gemini API key is configured, use Gemini API
  if (geminiKey && geminiKey.trim() !== "") {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an elite event planning AI. Given the user's requirements: "${prompt}", output a strictly valid JSON object matching the FullEventPlanSchema with:
eventName, tagline, description, category, targetAudience, proposedLocation, proposedDate, duration, estimatedGuests (number), totalEstimatedBudget (number), currency, budgetBreakdown (array of {category, allocatedAmount, percentage, notes}), preparationTimeline (array of {phase, daysBefore, deliverables: string[]}), eventDaySchedule (array of {time, activity, location, notes}), taskChecklist (array of {title, description, category, priority: 'low'|'medium'|'high'|'urgent'}), requiredTeamRoles (array of {role, responsibilities, suggestedHeadcount}), suggestedVenueRequirements (string[]), vendorCategories (string[]), riskContingencyChecklist (array of {risk, severity: 'Low'|'Medium'|'High', mitigationPlan}), guestCommunicationPlan ({invitationDate, rsvpDeadline, channels: string[], keyMessages: string[]}).
Return ONLY pure JSON. No markdown backticks.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          const validated = FullEventPlanSchema.parse(parsed);
          return {
            plan: validated,
            isDemoMode: false,
            provider: "gemini",
          };
        }
      }
    } catch (err) {
      console.warn("Live Gemini request failed, falling back to deterministic demo generator:", err);
    }
  }

  // If OpenAI API key is configured, use OpenAI
  if (openaiKey && openaiKey.trim() !== "") {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert event architect. Output ONLY valid JSON representing the event plan with all required fields (eventName, tagline, description, category, proposedLocation, proposedDate, duration, estimatedGuests, totalEstimatedBudget, currency, budgetBreakdown, preparationTimeline, eventDaySchedule, taskChecklist, requiredTeamRoles, suggestedVenueRequirements, vendorCategories, riskContingencyChecklist, guestCommunicationPlan).",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validated = FullEventPlanSchema.parse(parsed);
          return {
            plan: validated,
            isDemoMode: false,
            provider: "openai",
          };
        }
      }
    } catch (err) {
      console.warn("Live OpenAI request failed, falling back to deterministic demo generator:", err);
    }
  }

  // Deterministic local demo generator
  const demoPlan = generateDeterministicPlan(prompt);
  return {
    plan: demoPlan,
    isDemoMode: true,
    provider: "demo",
    warning: "Running in deterministic local demo mode (no external AI API key configured). Real planning logic and structured data applied.",
  };
}
