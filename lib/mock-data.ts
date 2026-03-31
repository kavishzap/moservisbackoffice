// Types
export type WorkerProfileStatus = "pending" | "active" | "inactive" | "rejected"

export interface User {
  id: string
  firstName: string
  lastName: string
  whatsapp: string
  email: string
  /** Primary job label for table display */
  jobType: string
  /** Slugs from DB (e.g. electrician, plumber) */
  jobTypes: string[]
  yearsOfExperience: number
  areaServed: string
  /** District slug when sourced from DB */
  districtSlug?: string
  serviceOffered: string
  servicesOffered?: string[]
  subscriptionPlan?: string
  workerKind?: "individual" | "contractor"
  /** When job_types includes "other" */
  otherJobType?: string | null
  /** Linked Supabase auth user id, if any */
  userId?: string | null
  termsAcceptedAt?: string
  updatedAt?: string
  bio: string
  createdAt: string
  status: WorkerProfileStatus
}

export interface Payment {
  id: string
  userId: string
  userName: string
  jobType: string
  phone: string
  /** Optional area for alerts / cards */
  areaServed?: string
  year: number
  months: {
    january: "paid" | "unpaid" | "pending"
    february: "paid" | "unpaid" | "pending"
    march: "paid" | "unpaid" | "pending"
    april: "paid" | "unpaid" | "pending"
    may: "paid" | "unpaid" | "pending"
    june: "paid" | "unpaid" | "pending"
    july: "paid" | "unpaid" | "pending"
    august: "paid" | "unpaid" | "pending"
    september: "paid" | "unpaid" | "pending"
    october: "paid" | "unpaid" | "pending"
    november: "paid" | "unpaid" | "pending"
    december: "paid" | "unpaid" | "pending"
  }
}

// Mauritius-style names
const firstNames = [
  "Raj", "Priya", "Jean-Pierre", "Marie", "Avinash", "Sanjay", "Nadia", "Kevin",
  "Asha", "Ravi", "Divya", "Pascal", "Anisha", "Vikram", "Sunita", "Olivier",
  "Meera", "Yusuf", "Fatima", "Deepak", "Kavita", "Michel", "Lakshmi", "Armand"
]

const lastNames = [
  "Doorgakant", "Jeetah", "Ramsamy", "Beeharry", "Doobah", "Sookun", "Dorasami",
  "Balgobin", "Lutchmun", "Doorgoo", "Seeruttun", "Doobur", "Doobree", "Doosaj",
  "Doorgoo", "Doolhur", "Doongoor", "Doorsamy", "Doorgakant", "Doorgoo",
  "Duval", "Laroche", "Pierre-Louis", "Ramdenee"
]

// Areas in Mauritius
const areas = [
  "Port Louis", "Curepipe", "Quatre Bornes", "Vacoas", "Rose Hill",
  "Mahebourg", "Flacq", "Goodlands", "Triolet", "Beau Bassin"
]

// Job types
const jobTypes = [
  "Electrician", "Plumber", "Cleaner", "Gardener", "Painter", "Mason", "Handyman"
]

// Services by job type
const servicesByJob: Record<string, string[]> = {
  Electrician: ["Wiring installation", "Electrical repairs", "Panel upgrades", "Lighting setup"],
  Plumber: ["Pipe repairs", "Drain cleaning", "Water heater installation", "Fixture installation"],
  Cleaner: ["House cleaning", "Office cleaning", "Deep cleaning", "Post-construction cleanup"],
  Gardener: ["Lawn maintenance", "Tree trimming", "Garden design", "Irrigation setup"],
  Painter: ["Interior painting", "Exterior painting", "Wall texturing", "Wallpaper installation"],
  Mason: ["Brick laying", "Concrete work", "Stone masonry", "Foundation repair"],
  Handyman: ["General repairs", "Furniture assembly", "Minor plumbing", "Small electrical jobs"]
}

// Seeded random number generator for consistent SSR/client hydration
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Create a global seeded random instance
let seededRandom = createSeededRandom(12345)

// Generate random data using seeded random
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)]
}

function generatePhone(): string {
  return `+230 5${Math.floor(seededRandom() * 9)}${Math.floor(100 + seededRandom() * 900)} ${Math.floor(1000 + seededRandom() * 9000)}`
}

function generateBio(jobType: string, years: number, area: string): string {
  const bios = [
    `Experienced ${jobType.toLowerCase()} with ${years} years of professional experience serving the ${area} area. Known for quality work and reliable service.`,
    `Professional ${jobType.toLowerCase()} dedicated to delivering excellent results. Have been working in ${area} and surrounding areas for ${years} years.`,
    `Skilled ${jobType.toLowerCase()} offering top-notch services in ${area}. With ${years} years in the trade, I bring expertise and attention to detail.`,
    `Trusted ${jobType.toLowerCase()} serving ${area} for ${years} years. Committed to customer satisfaction and quality workmanship.`
  ]
  return randomItem(bios)
}

function generateDate(startYear: number, endYear: number): string {
  const year = startYear + Math.floor(seededRandom() * (endYear - startYear + 1))
  const month = Math.floor(seededRandom() * 12)
  const day = Math.floor(1 + seededRandom() * 28)
  return new Date(year, month, day).toISOString()
}

// Generate users
export function generateUsers(count: number): User[] {
  const users: User[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const jobType = randomItem(jobTypes)
    const area = randomItem(areas)
    const years = Math.floor(1 + seededRandom() * 20)
    const services = servicesByJob[jobType]
    
    const slug = jobType.toLowerCase().replace(/\s+/g, "-")
    const createdAt = generateDate(2022, 2025)
    users.push({
      id: `user-${i + 1}`,
      firstName,
      lastName,
      whatsapp: generatePhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.mu`,
      jobType,
      jobTypes: [slug],
      workerKind: seededRandom() > 0.5 ? "individual" : "contractor",
      otherJobType: null,
      userId: null,
      yearsOfExperience: years,
      areaServed: area,
      districtSlug: area.toLowerCase().replace(/\s+/g, "-"),
      serviceOffered: services ? randomItem(services) : "General services",
      servicesOffered: services ? [randomItem(services)] : [],
      subscriptionPlan: seededRandom() > 0.5 ? "monthly_100" : "yearly_1000",
      bio: generateBio(jobType, years, area),
      termsAcceptedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      status: seededRandom() > 0.2 ? "active" : "inactive",
    })
  }
  
  return users
}

// Generate payments
export function generatePayments(users: User[], year: number): Payment[] {
  const currentMonth = new Date().getMonth()
  
  return users.map(user => {
    const months: Payment["months"] = {
      january: "unpaid",
      february: "unpaid",
      march: "unpaid",
      april: "unpaid",
      may: "unpaid",
      june: "unpaid",
      july: "unpaid",
      august: "unpaid",
      september: "unpaid",
      october: "unpaid",
      november: "unpaid",
      december: "unpaid"
    }
    
    const monthKeys = Object.keys(months) as Array<keyof typeof months>
    
    monthKeys.forEach((month, index) => {
      if (index <= currentMonth) {
        const rand = seededRandom()
        if (rand > 0.3) {
          months[month] = "paid"
        } else if (rand > 0.1) {
          months[month] = "pending"
        } else {
          months[month] = "unpaid"
        }
      }
    })
    
    return {
      id: `payment-${user.id}-${year}`,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      jobType: user.jobType,
      phone: user.whatsapp,
      year,
      months
    }
  })
}

// Pre-generated data
export const users = generateUsers(50)
export const payments = generatePayments(users, 2026)

// Stats calculations
export function getStats(users: User[], payments: Payment[]) {
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === "active").length
  const inactiveUsers = users.filter(u => u.status === "inactive").length
  
  let totalPaid = 0
  let totalUnpaid = 0
  let totalPending = 0
  
  payments.forEach(payment => {
    const monthKeys = Object.keys(payment.months) as Array<keyof typeof payment.months>
    monthKeys.forEach(month => {
      if (payment.months[month] === "paid") totalPaid++
      else if (payment.months[month] === "unpaid") totalUnpaid++
      else totalPending++
    })
  })
  
  const currentMonthIndex = new Date().getMonth()
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"] as const
  const currentMonthKey = monthNames[currentMonthIndex]
  
  const paymentsThisMonth = payments.filter(p => p.months[currentMonthKey] === "paid").length
  const overdueUsers = payments.filter(p => {
    const months = Object.values(p.months).slice(0, currentMonthIndex + 1)
    return months.some(m => m === "unpaid")
  }).length
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalPaid,
    totalUnpaid,
    totalPending,
    paymentsThisMonth,
    overdueUsers
  }
}

// User growth data for chart
export const userGrowthData = [
  { month: "Jan", users: 12 },
  { month: "Feb", users: 18 },
  { month: "Mar", users: 24 },
  { month: "Apr", users: 28 },
  { month: "May", users: 32 },
  { month: "Jun", users: 35 },
  { month: "Jul", users: 38 },
  { month: "Aug", users: 42 },
  { month: "Sep", users: 45 },
  { month: "Oct", users: 48 },
  { month: "Nov", users: 50 },
  { month: "Dec", users: 50 }
]

// Payment collection data for chart
export const paymentCollectionData = [
  { month: "Jan", collected: 45, pending: 5 },
  { month: "Feb", collected: 42, pending: 8 },
  { month: "Mar", collected: 48, pending: 2 },
  { month: "Apr", collected: 40, pending: 10 },
  { month: "May", collected: 44, pending: 6 },
  { month: "Jun", collected: 46, pending: 4 },
  { month: "Jul", collected: 43, pending: 7 },
  { month: "Aug", collected: 47, pending: 3 },
  { month: "Sep", collected: 41, pending: 9 },
  { month: "Oct", collected: 44, pending: 6 },
  { month: "Nov", collected: 46, pending: 4 },
  { month: "Dec", collected: 35, pending: 15 }
]
