import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database records...");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.moodboardItem.deleteMany();
  await prisma.moodboard.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.vendorInquiry.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.venueFavorite.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.eventPlan.deleteMany();
  await prisma.eventTemplate.deleteMany();
  await prisma.eventCollaborator.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding demo users...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@promptwars.ai",
      passwordHash,
      name: "Alex Morgan",
      role: "planner",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      preferences: {
        create: {
          theme: "midnight",
          interests: JSON.stringify(["Weddings", "Galas", "Tech Festivals", "Experiential Dinners"]),
          eventTypes: JSON.stringify(["Corporate", "Wedding", "Birthday", "Cultural"]),
          budgetRange: "high",
          planningExperience: "expert",
          notificationsEnabled: true,
          emailUpdates: true,
        },
      },
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      email: "sarah.cooper@promptwars.ai",
      passwordHash,
      name: "Sarah Cooper",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    },
  });

  console.log("Seeding venues...");
  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: "Grand Crystal Ballroom",
        location: "Downtown Metropole, New York",
        address: "742 5th Avenue, New York, NY 10019",
        capacity: 450,
        pricePerHour: 850,
        pricePerDay: 8500,
        rating: 4.9,
        amenities: JSON.stringify(["Valet Parking", "Full AV Rig", "Commercial Kitchen", "Stage Lighting", "Bridal Suite", "Panoramic Skyline"]),
        contactEmail: "events@grandcrystal.com",
        contactPhone: "+1 (212) 555-0199",
        imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.venue.create({
      data: {
        name: "The Glasshouse Pavilion & Botanical Gardens",
        location: "Kolkata Green Belt",
        address: "12 Rajarhat Main Road, Kolkata, WB 700135",
        capacity: 800,
        pricePerHour: 450,
        pricePerDay: 4800,
        rating: 4.8,
        amenities: JSON.stringify(["Lush Lawn", "Water Features", "Covered Glasshouse", "Helipad Access", "High-Speed WiFi", "Acoustic Insulation"]),
        contactEmail: "inquiries@glasshousegardens.in",
        contactPhone: "+91 98300 12345",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.venue.create({
      data: {
        name: "Starlight Sky Lounge & Terrace",
        location: "SoMa Arts District, San Francisco",
        address: "880 Folsom Street, San Francisco, CA 94107",
        capacity: 180,
        pricePerHour: 600,
        pricePerDay: 5500,
        rating: 4.95,
        amenities: JSON.stringify(["Heated Patio", "Bespoke Cocktail Bar", "DJ Booth", "Retractable Glass Roof", "Projection Mapping"]),
        contactEmail: "book@starlightlounge.sf",
        contactPhone: "+1 (415) 555-8721",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.venue.create({
      data: {
        name: "Heritage Courtyard Palace",
        location: "Old City, Udaipur",
        address: "Lake Pichola Promenade, Udaipur, RJ 313001",
        capacity: 600,
        pricePerHour: 1200,
        pricePerDay: 14000,
        rating: 5.0,
        amenities: JSON.stringify(["Lakefront Views", "Royal Architecture", "Boat Jetty", "Elephant Arrival Gate", "Folk Stage"]),
        contactEmail: "weddings@heritagepalaceudaipur.com",
        contactPhone: "+91 294 242 9999",
        imageUrl: "https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=800&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.venue.create({
      data: {
        name: "The Industrial Loft & Creator Lab",
        location: "West Loop, Chicago",
        address: "1020 W Fulton Market, Chicago, IL 60607",
        capacity: 220,
        pricePerHour: 400,
        pricePerDay: 3600,
        rating: 4.75,
        amenities: JSON.stringify(["Exposed Brick", "Polished Concrete", "Freight Elevator", "Podcast Studio", "Catering Prep Station"]),
        contactEmail: "hire@industrialfulton.com",
        contactPhone: "+1 (312) 555-4309",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
  ]);

  console.log("Seeding vendors...");
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: "Velvet & Vine Floral Couture",
        category: "florist",
        location: "New York & Boston",
        startingPrice: 2200,
        rating: 4.95,
        reviewCount: 48,
        description: "Artisanal floral installations, botanical backdrops, and sculptural centerpieces tailored for high-profile weddings and luxury brand launches.",
        contactEmail: "design@velvetandvine.com",
        contactPhone: "+1 (212) 555-7744",
        imageUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Saffron & Truffle Artisanal Catering",
        category: "caterer",
        location: "Kolkata & Mumbai",
        startingPrice: 3500,
        rating: 4.9,
        reviewCount: 72,
        description: "Award-winning fusion banquets blending royal Indian gastronomy with progressive French fine-dining, molecular desserts, and interactive grazing tables.",
        contactEmail: "chef@saffronandtruffle.com",
        contactPhone: "+91 98311 88990",
        imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Lumina Cine-Frames & Documentary Studio",
        category: "photographer",
        location: "San Francisco & Global",
        startingPrice: 2800,
        rating: 5.0,
        reviewCount: 95,
        description: "Editorial photojournalism, cinematic 4K aerial drone coverage, and candid heirloom films capturing raw human emotion and unscripted magic.",
        contactEmail: "studio@luminacine.io",
        contactPhone: "+1 (415) 555-1200",
        imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Prism Dynamic Lights & Stagecraft",
        category: "decorator",
        location: "Kolkata & Delhi",
        startingPrice: 4000,
        rating: 4.85,
        reviewCount: 63,
        description: "Transformative spatial design featuring LED tunnels, kinetic ceiling chandeliers, organic balloon architectures, and immersive laser mapping.",
        contactEmail: "hello@prismstagecraft.in",
        contactPhone: "+91 98200 44556",
        imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Aura Sound Collective & Live Strings",
        category: "entertainer",
        location: "New York & International",
        startingPrice: 3000,
        rating: 4.9,
        reviewCount: 41,
        description: "Contemporary 10-piece showband, electric violin quartets, and international festival DJs fusing house, funk, and global anthems.",
        contactEmail: "bookings@aurasoundcollective.com",
        contactPhone: "+1 (917) 555-8832",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Apex Mastermind Events & Concierge",
        category: "event_manager",
        location: "Kolkata, Mumbai, London",
        startingPrice: 5000,
        rating: 4.98,
        reviewCount: 88,
        description: "End-to-end luxury event production, VIP security coordination, vendor protocol management, and seamless day-of execution.",
        contactEmail: "concierge@apexmasterminds.com",
        contactPhone: "+91 99033 11223",
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
        isVerified: true,
        isDemo: true,
      },
    }),
  ]);

  console.log("Seeding templates...");
  const templates = await Promise.all([
    prisma.eventTemplate.create({
      data: {
        title: "Kolkata Cultural Fest & Youth Carnival",
        category: "Cultural",
        description: "A two-day extravaganza featuring live music stages, artisanal food alleys, hackathon pavilions, campus battle-of-the-bands, and cultural showcases.",
        estimatedBudget: 50000,
        guestCount: 800,
        duration: "2 Days",
        coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
        tags: JSON.stringify(["Youth", "Music", "Food", "Stage", "Campus", "Festival"]),
        isFavorite: true,
        planData: JSON.stringify({
          timelineDays: 60,
          milestones: ["Venue lock-in", "Headliner contracts", "Sponsor booths", "Stage acoustic setup"],
        }),
      },
    }),
    prisma.eventTemplate.create({
      data: {
        title: "Royal Celestial Heritage Wedding",
        category: "Wedding",
        description: "Timeless palace ceremony with royal baraat entrance, floral mandap, acoustic sitar lounge, banquet dining, and fireworks finale.",
        estimatedBudget: 65000,
        guestCount: 300,
        duration: "3 Days",
        coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        tags: JSON.stringify(["Luxury", "Palace", "Floral", "Royal", "Bespoke"]),
        isFavorite: true,
        planData: JSON.stringify({
          timelineDays: 120,
          milestones: ["Invitation suite dispatch", "Tasting session", "Sangeet choreography", "Mandap staging"],
        }),
      },
    }),
    prisma.eventTemplate.create({
      data: {
        title: "Silicon Valley Tech Summit & Founder Gala",
        category: "Corporate",
        description: "Keynote presentation theater, investor breakout pods, startup showcase boulevard, networking cocktail lounge, and live product demos.",
        estimatedBudget: 45000,
        guestCount: 400,
        duration: "1 Full Day",
        coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        tags: JSON.stringify(["Keynote", "Innovation", "Networking", "Tech", "Sponsorship"]),
        isFavorite: false,
        planData: JSON.stringify({
          timelineDays: 90,
          milestones: ["Speaker confirmation", "AV rehearsal", "Badge printing", "VIP reception"],
        }),
      },
    }),
    prisma.eventTemplate.create({
      data: {
        title: "Milestone Neon Rooftop Birthday Party",
        category: "Birthday",
        description: "Cyber-chic neon lighting, signature craft cocktail bar, celebrity DJ set, gourmet sliders & tapas station, and immersive photo-booth.",
        estimatedBudget: 12000,
        guestCount: 80,
        duration: "6 Hours",
        coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        tags: JSON.stringify(["Neon", "Nightlife", "Cocktails", "Music", "Birthday"]),
        isFavorite: true,
        planData: JSON.stringify({
          timelineDays: 30,
          milestones: ["Rooftop reservation", "Custom neon sign order", "DJ playlist review", "Cake design"],
        }),
      },
    }),
  ]);

  console.log("Seeding primary demo event...");
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 24);

  const mainEvent = await prisma.event.create({
    data: {
      userId: demoUser.id,
      title: "Kolkata Spring Cultural Festival 2026",
      description: "A grand 2-day campus and community cultural celebration bringing together 800+ attendees with headline bands, artisanal Bengali food streets, stage lights, volunteer brigades, and interactive student art exhibits.",
      category: "Cultural",
      eventDate,
      endDate: new Date(eventDate.getTime() + 48 * 3600 * 1000),
      location: "The Glasshouse Pavilion & Botanical Gardens, Kolkata",
      venueId: venues[1].id,
      estimatedGuests: 800,
      budget: 50000,
      currency: "INR",
      status: "active",
      coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      tags: JSON.stringify(["Cultural", "Music", "Food Fest", "Youth", "Stage"]),
      isDemo: true,
    },
  });

  const weddingDate = new Date();
  weddingDate.setDate(weddingDate.getDate() + 65);

  const weddingEvent = await prisma.event.create({
    data: {
      userId: demoUser.id,
      title: "Maya & Dev's Royal Palace Wedding",
      description: "An intimate royal celebration overlooking Lake Pichola with sunset pheras, customized live sitar ensemble, and heirloom candlelit reception.",
      category: "Wedding",
      eventDate: weddingDate,
      endDate: new Date(weddingDate.getTime() + 36 * 3600 * 1000),
      location: "Heritage Courtyard Palace, Udaipur",
      venueId: venues[3].id,
      estimatedGuests: 250,
      budget: 65000,
      currency: "USD",
      status: "planned",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      tags: JSON.stringify(["Luxury", "Royal", "Floral", "Palace"]),
      isDemo: true,
    },
  });

  const corporateDate = new Date();
  corporateDate.setDate(corporateDate.getDate() + 12);

  const corporateEvent = await prisma.event.create({
    data: {
      userId: demoUser.id,
      title: "Aurora Global Tech Keynote & Mixer",
      description: "Annual executive leadership summit and next-gen AI platform reveal, featuring keynotes, product showcases, and private investor dinner.",
      category: "Corporate",
      eventDate: corporateDate,
      location: "Grand Crystal Ballroom, New York",
      venueId: venues[0].id,
      estimatedGuests: 350,
      budget: 42000,
      currency: "USD",
      status: "planned",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      tags: JSON.stringify(["Conference", "Executive", "AI", "Keynote"]),
      isDemo: true,
    },
  });

  console.log("Seeding collaborators...");
  await prisma.eventCollaborator.createMany({
    data: [
      {
        eventId: mainEvent.id,
        userId: demoUser.id,
        name: "Alex Morgan",
        email: "demo@promptwars.ai",
        role: "owner",
        status: "active",
      },
      {
        eventId: mainEvent.id,
        userId: sarahUser.id,
        name: "Sarah Cooper",
        email: "sarah.cooper@promptwars.ai",
        role: "admin",
        status: "active",
      },
      {
        eventId: mainEvent.id,
        name: "Rohan Sen",
        email: "rohan.sen@college.edu",
        role: "editor",
        status: "active",
      },
      {
        eventId: mainEvent.id,
        name: "Priya Mukherjee",
        email: "priya.m@volunteers.org",
        role: "viewer",
        status: "active",
      },
    ],
  });

  console.log("Seeding budget & categories...");
  const mainBudget = await prisma.budget.create({
    data: {
      eventId: mainEvent.id,
      totalBudget: 50000,
      allocatedBudget: 46500,
      currency: "INR",
      notes: "Contingency reserve of 3,500 kept aside for sudden weather adjustments.",
      categories: {
        create: [
          { name: "Venue & Permits", allocatedAmount: 14000, color: "#6366F1" },
          { name: "Stage, Sound & Lighting", allocatedAmount: 12000, color: "#8B5CF6" },
          { name: "Food & Beverage Stalls", allocatedAmount: 10000, color: "#F5C76B" },
          { name: "Artists & Headliners", allocatedAmount: 6000, color: "#EC4899" },
          { name: "Security & Medical Team", allocatedAmount: 2500, color: "#10B981" },
          { name: "Branding, PR & Merch", allocatedAmount: 2000, color: "#3B82F6" },
        ],
      },
    },
  });

  console.log("Seeding expenses...");
  await prisma.expense.createMany({
    data: [
      {
        eventId: mainEvent.id,
        title: "Glasshouse Advance Booking Deposit",
        amount: 8000,
        category: "Venue & Permits",
        paidBy: "Alex Morgan",
        status: "paid",
        date: new Date(Date.now() - 14 * 86400000),
        notes: "50% advance invoice #GH-902",
      },
      {
        eventId: mainEvent.id,
        title: "Sound Rig & Line Array Rental (Day 1 & 2)",
        amount: 6500,
        category: "Stage, Sound & Lighting",
        paidBy: "Sarah Cooper",
        status: "paid",
        date: new Date(Date.now() - 7 * 86400000),
        notes: "Includes 4 wireless mics and sound engineer on site",
      },
      {
        eventId: mainEvent.id,
        title: "Live Band Advance Fee (The Kolkata Grooves)",
        amount: 3500,
        category: "Artists & Headliners",
        paidBy: "Alex Morgan",
        status: "paid",
        date: new Date(Date.now() - 3 * 86400000),
        notes: "Contract signed, rider reviewed",
      },
      {
        eventId: mainEvent.id,
        title: "Custom Festival Wristbands & Badges",
        amount: 850,
        category: "Branding, PR & Merch",
        paidBy: "Rohan Sen",
        status: "paid",
        date: new Date(Date.now() - 2 * 86400000),
        notes: "1,000 RFID-compatible wristbands printed",
      },
      {
        eventId: mainEvent.id,
        title: "City Fire & Crowd Safety Permit Fee",
        amount: 1200,
        category: "Security & Medical Team",
        paidBy: "Alex Morgan",
        status: "paid",
        date: new Date(Date.now() - 1 * 86400000),
        notes: "Official municipal clearance obtained",
      },
      {
        eventId: mainEvent.id,
        title: "Artisanal Bengali Food Street Vendor Subsidy",
        amount: 4500,
        category: "Food & Beverage Stalls",
        paidBy: "Sarah Cooper",
        status: "pending",
        date: new Date(),
        notes: "Payable on installation of grease trap and safety extinguishers",
      },
    ],
  });

  console.log("Seeding guests...");
  const sampleGuests = [
    { name: "Dr. Ananya Roy", email: "ananya.roy@university.edu", phone: "+91 98301 11222", group: "VIP", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 1, notes: "Festival Chief Patron, requires front-row reserve" },
    { name: "Prof. Sudipto Banerjee", email: "sbanerjee@culture.org", phone: "+91 98302 33445", group: "VIP", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 1, notes: "Keynote speaker for inauguration" },
    { name: "Kavita Rao", email: "kavita.rao@mediaworks.in", phone: "+91 98303 55667", group: "VIP", rsvpStatus: "tentative", invitationStatus: "opened", plusOne: 0, notes: "Journalist coverage" },
    { name: "Vikram Singhania", email: "vikram@sponsorship.com", phone: "+91 98304 77889", group: "VIP", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 2, notes: "Lead sponsor delegation" },
    { name: "Aarav Gupta", email: "aarav.g@gmail.com", phone: "+91 98201 99001", group: "Friends", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 1, dietaryRestrictions: "Vegetarian" },
    { name: "Sneha Chatterjee", email: "sneha.c@outlook.com", phone: "+91 98202 22334", group: "Friends", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 0, dietaryRestrictions: "Vegan" },
    { name: "Tanmay Sen", email: "tanmay.sen@techie.dev", phone: "+91 98203 44556", group: "Colleagues", rsvpStatus: "declined", invitationStatus: "opened", plusOne: 0, notes: "Traveling for hackathon" },
    { name: "Pooja Das", email: "pooja.das@creative.io", phone: "+91 98204 66778", group: "Friends", rsvpStatus: "pending", invitationStatus: "sent", plusOne: 1, dietaryRestrictions: "Gluten-Free" },
    { name: "Debabrata Ghosh", email: "deb.ghosh@alumni.org", phone: "+91 98205 88990", group: "Colleagues", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 1, notes: "Alumni association rep" },
    { name: "Ishani Paul", email: "ishani.p@campuslife.in", phone: "+91 98206 11223", group: "Friends", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 0 },
    { name: "Ritwik Majumdar", email: "ritwik.m@soundcraft.in", phone: "+91 98207 33445", group: "Vendors", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 3, notes: "Lead stage technician crew" },
    { name: "Sunita Reddy", email: "sunita.reddy@gmail.com", phone: "+91 98208 55667", group: "Family", rsvpStatus: "attending", invitationStatus: "opened", plusOne: 2 },
  ];

  for (const g of sampleGuests) {
    await prisma.guest.create({
      data: {
        eventId: mainEvent.id,
        ...g,
      },
    });
  }

  console.log("Seeding tasks...");
  const sampleTasks = [
    { title: "Finalize sound & light technical rider with headliners", priority: "urgent", status: "completed", assignedTo: "Alex Morgan", category: "Sound & Stage", dueDate: new Date(Date.now() - 4 * 86400000) },
    { title: "Submit municipal noise permit & police clearance form", priority: "urgent", status: "completed", assignedTo: "Sarah Cooper", category: "Permits", dueDate: new Date(Date.now() - 2 * 86400000) },
    { title: "Confirm electrical load capacity with Glasshouse facility manager", priority: "high", status: "in_progress", assignedTo: "Rohan Sen", category: "Venue", dueDate: new Date(Date.now() + 2 * 86400000) },
    { title: "Coordinate 40-member volunteer briefing on emergency protocols", priority: "high", status: "in_progress", assignedTo: "Priya Mukherjee", category: "Logistics", dueDate: new Date(Date.now() + 4 * 86400000) },
    { title: "Review food stall hygiene certifications and power taps", priority: "medium", status: "in_progress", assignedTo: "Sarah Cooper", category: "Catering", dueDate: new Date(Date.now() + 6 * 86400000) },
    { title: "Deploy digital invitation link & QR badge check-in terminal", priority: "high", status: "todo", assignedTo: "Alex Morgan", category: "Guest Experience", dueDate: new Date(Date.now() + 8 * 86400000) },
    { title: "Setup VIP green room refreshments & media backdrop banner", priority: "medium", status: "todo", assignedTo: "Rohan Sen", category: "Decor", dueDate: new Date(Date.now() + 10 * 86400000) },
    { title: "Post-event garbage segregation & eco-recycling inspection", priority: "low", status: "todo", assignedTo: "Priya Mukherjee", category: "Clean-up", dueDate: new Date(Date.now() + 26 * 86400000) },
  ];

  for (const t of sampleTasks) {
    await prisma.task.create({
      data: {
        eventId: mainEvent.id,
        ...t,
      },
    });
  }

  console.log("Seeding invitation...");
  await prisma.invitation.create({
    data: {
      eventId: mainEvent.id,
      templateName: "Festival Luminary Gold",
      headline: "Kolkata Spring Cultural Festival 2026",
      message: "Join us for 48 hours of electrifying live music, culinary journeys, digital art, and unforgettable celebration under the stars.",
      venueAddress: "The Glasshouse Pavilion, Rajarhat, Kolkata",
      dressCode: "Boho Chic / Festival Vibrant",
      primaryColor: "#8B5CF6",
      accentColor: "#F5C76B",
      fontStyle: "sans",
      isPublished: true,
    },
  });

  console.log("Seeding moodboard...");
  const moodboard = await prisma.moodboard.create({
    data: {
      eventId: mainEvent.id,
      title: "Spring Symphony & Lantern Glow",
      theme: "Contemporary Bengali Eclectic",
      colorPalette: JSON.stringify(["#8B5CF6", "#6366F1", "#F5C76B", "#10B981", "#FB7185"]),
      notes: "Blending rustic handloom textiles with luminous fairy-light canopies and neon accents.",
    },
  });

  await prisma.moodboardItem.createMany({
    data: [
      { moodboardId: moodboard.id, title: "Canopy of Terracotta Lanterns", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80", category: "Lighting", notes: "Suspended over central food aisle" },
      { moodboardId: moodboard.id, title: "Acoustic Bamboo Amphitheater Stage", imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=400&q=80", category: "Decor", notes: "Zero-plastic stage backdrop" },
      { moodboardId: moodboard.id, title: "Artisanal Clay Kulhad Chai Bar", imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80", category: "Cake", notes: "Interactive refreshment stop" },
      { moodboardId: moodboard.id, title: "Marigold & Botanical Photo-Wall", imageUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80", category: "Floral", notes: "Instagram station near registration" },
    ],
  });

  console.log("Seeding notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, title: "Municipal Permit Approved", message: "City safety board cleared the festival venue permit.", type: "system", link: `/events/${mainEvent.id}`, isRead: false },
      { userId: demoUser.id, title: "New VIP RSVP Received", message: "Dr. Ananya Roy and 1 guest confirmed attendance.", type: "rsvp", link: `/events/${mainEvent.id}/guests`, isRead: false },
      { userId: demoUser.id, title: "Task Due Tomorrow", message: "Confirm electrical load capacity with Glasshouse manager.", type: "task", link: `/events/${mainEvent.id}/tasks`, isRead: true },
      { userId: demoUser.id, title: "Budget Milestone Reached", message: "93% of allocated budget ($46,500) has been assigned.", type: "budget", link: `/events/${mainEvent.id}/budget`, isRead: true },
    ],
  });

  console.log("Seeding activity log...");
  await prisma.activityLog.createMany({
    data: [
      { eventId: mainEvent.id, userId: demoUser.id, action: "Event Created", details: "Created Kolkata Spring Cultural Festival 2026 with budget ₹50,000" },
      { eventId: mainEvent.id, userId: demoUser.id, action: "Venue Selected", details: "Associated venue: The Glasshouse Pavilion & Botanical Gardens" },
      { eventId: mainEvent.id, userId: demoUser.id, action: "Budget Configured", details: "Allocated ₹46,500 across 6 distinct categories" },
      { eventId: mainEvent.id, userId: demoUser.id, action: "Invitation Published", details: "Generated Festival Luminary Gold invitation suite" },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
