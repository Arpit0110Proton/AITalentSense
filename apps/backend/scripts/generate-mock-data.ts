import { createClient } from "@supabase/supabase-js";
import seedrandom from "seedrandom";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rng = seedrandom("ai-talent-sense-v2");
function rand(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

// §6.2 — Name pools
const FIRST_NAMES = [
  "Aarav","Vivaan","Aditya","Arjun","Reyansh","Ishaan","Kabir","Rohan","Karan","Nikhil",
  "Siddharth","Varun","Aman","Rahul","Dev","Ananya","Diya","Ishita","Kavya","Meera",
  "Nisha","Priya","Riya","Sanya","Tara","Zara","Aisha","Neha","Pooja","Shreya",
  "Alex","Ben","Chris","Daniel","Ethan","Felix","Gabriel","Henry","Ivan","James",
  "Kevin","Liam","Marcus","Noah","Oliver","Amelia","Beatrice","Chloe","Elena","Fiona",
  "Grace","Hannah","Isla","Julia","Katherine","Lena","Maria","Nadia","Olivia","Sofia",
];
const LAST_NAMES = [
  "Sharma","Verma","Gupta","Mehta","Iyer","Nair","Reddy","Rao","Patel","Shah",
  "Kulkarni","Deshpande","Joshi","Malhotra","Kapoor","Chopra","Bhatt","Menon","Pillai","Banerjee",
  "Chatterjee","Mukherjee","Das","Bose","Sen","Singh","Yadav","Mishra","Tripathi","Pandey",
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Martinez","Anderson",
  "Taylor","Thomas","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Clark",
  "Lewis","Walker","Hall","Young","King","Wright","Scott","Green","Baker","Nelson",
];

// 15 Role families (10 original + 5 MNC corporate families)
type RoleFamily =
  | "frontend"
  | "backend"
  | "fullstack"
  | "data-science"
  | "ml-engineering"
  | "devops-sre"
  | "mobile"
  | "product-management"
  | "design"
  | "qa"
  | "sales"
  | "marketing"
  | "legal"
  | "cybersecurity"
  | "hr";

const ROLE_FAMILIES: RoleFamily[] = [
  "frontend",
  "backend",
  "fullstack",
  "data-science",
  "ml-engineering",
  "devops-sre",
  "mobile",
  "product-management",
  "design",
  "qa",
  "sales",
  "marketing",
  "legal",
  "cybersecurity",
  "hr",
];

type Seniority = "junior" | "mid" | "senior" | "lead" | "director";

// Skills pools per role family
const SKILLS: Record<RoleFamily, string[]> = {
  frontend: ["React","TypeScript","JavaScript","CSS","Next.js","Redux","Tailwind CSS","HTML","Webpack","Vite","GraphQL","Jest","Framer Motion","Accessibility","Storybook","Vue.js"],
  backend: ["Node.js","PostgreSQL","REST APIs","TypeScript","Express","Python","Redis","Docker","GraphQL","MongoDB","Kafka","gRPC","Microservices","Java","Spring Boot","Go"],
  fullstack: ["React","Node.js","TypeScript","PostgreSQL","Next.js","Express","REST APIs","Docker","GraphQL","Redis","AWS","Tailwind CSS","MongoDB","CI/CD"],
  "data-science": ["Python","SQL","Pandas","Machine Learning","NumPy","Scikit-learn","Statistics","Data Visualization","Tableau","A/B Testing","Spark","dbt","Airflow","R"],
  "ml-engineering": ["Python","PyTorch","Machine Learning","MLOps","TensorFlow","Hugging Face","LLMs","Docker","Kubernetes","AWS SageMaker","Vector Databases","RAG","FastAPI","CUDA"],
  "devops-sre": ["Kubernetes","Docker","AWS","Terraform","CI/CD","Linux","Prometheus","Grafana","Ansible","GCP","Helm","Bash","Incident Response","Networking"],
  mobile: ["React Native","Swift","Kotlin","iOS","Android","TypeScript","Flutter","Firebase","REST APIs","App Store Deployment","Jetpack Compose","SwiftUI"],
  "product-management": ["Product Strategy","Roadmapping","User Research","Agile","SQL","A/B Testing","Stakeholder Management","Analytics","Figma","JIRA","Go-to-Market","PRDs"],
  design: ["Figma","UI Design","UX Research","Prototyping","Design Systems","Interaction Design","Adobe Creative Suite","Usability Testing","Wireframing","Motion Design","Accessibility","Webflow"],
  qa: ["Test Automation","Selenium","Cypress","API Testing","JavaScript","Playwright","Manual Testing","JIRA","Performance Testing","Postman","CI/CD","Appium"],
  sales: ["Enterprise Sales", "B2B Sales", "Account Management", "Negotiation", "Sales Pipeline", "Salesforce", "Lead Generation", "Closing", "Cold Outreach", "CRM", "SaaS Sales"],
  marketing: ["Digital Marketing", "Content Strategy", "SEO", "SEM", "Google Analytics", "Growth Marketing", "Social Media", "Brand Strategy", "Email Marketing", "Copywriting", "Campaign Management"],
  legal: ["Contract Negotiation", "Corporate Law", "Intellectual Property", "Compliance", "Risk Management", "Legal Research", "GDPR", "Litigation", "M&A", "Employment Law"],
  cybersecurity: ["Network Security", "Penetration Testing", "Vulnerability Assessment", "SIEM", "Incident Response", "Firewalls", "Identity Access Management", "Encryption", "OWASP", "Threat Hunting", "ISO 27001"],
  hr: ["Talent Acquisition", "Technical Recruiting", "Employee Relations", "Performance Management", "Onboarding", "HR Policies", "HRIS", "Compensation & Benefits", "Employer Branding", "Conflict Resolution"],
};

// Companies
const COMPANIES: { name: string; industry: string }[] = [
  { name: "NimbusPay", industry: "Fintech" },
  { name: "Zentrix Labs", industry: "SaaS" },
  { name: "Craftloop", industry: "E-commerce" },
  { name: "Veridian Health", industry: "Healthtech" },
  { name: "Quantifi", industry: "Analytics" },
  { name: "Orbitshift", industry: "Logistics" },
  { name: "Brighthive", industry: "EdTech" },
  { name: "Lumeno", industry: "Consumer" },
  { name: "Stackform", industry: "DevTools" },
  { name: "Cloudmesa", industry: "Infra" },
  { name: "Finlock", industry: "Fintech" },
  { name: "Medlane", industry: "Healthtech" },
  { name: "Shoplattice", industry: "E-commerce" },
  { name: "Datawisp", industry: "Analytics" },
  { name: "Kitewire", industry: "SaaS" },
  { name: "Farmlink", industry: "AgriTech" },
  { name: "Playforge", industry: "Gaming" },
  { name: "Securanto", industry: "Cybersecurity" },
  { name: "Travelyn", industry: "Travel" },
  { name: "Homebase Labs", industry: "PropTech" },
  { name: "Paycrest", industry: "Fintech" },
  { name: "Learnloop", industry: "EdTech" },
  { name: "Vitalcore", industry: "Healthtech" },
  { name: "Cartology", industry: "E-commerce" },
  { name: "Signalpath", industry: "Analytics" },
  { name: "Meshgrid", industry: "Infra" },
  { name: "Taskerly", industry: "SaaS" },
  { name: "Foodrunner", industry: "FoodTech" },
  { name: "Insurely", industry: "InsurTech" },
  { name: "Gridspark", industry: "Energy" },
  { name: "Talentbase", industry: "HRTech" },
  { name: "Docuflow", industry: "SaaS" },
  { name: "Streamlyne", industry: "Media" },
  { name: "Bankly", industry: "Fintech" },
  { name: "Curelight", industry: "Healthtech" },
  { name: "Shipmate", industry: "Logistics" },
  { name: "Adverve", industry: "AdTech" },
  { name: "Codehatch", industry: "DevTools" },
  { name: "Wearably", industry: "Consumer" },
  { name: "Agrinova", industry: "AgriTech" },
  { name: "Gamewick", industry: "Gaming" },
  { name: "Safelayer", industry: "Cybersecurity" },
  { name: "Triplyn", industry: "Travel" },
  { name: "Rentware", industry: "PropTech" },
  { name: "Walletree", industry: "Fintech" },
  { name: "Skillbridge", industry: "EdTech" },
  { name: "Carepoint", industry: "Healthtech" },
  { name: "Storefrontly", industry: "E-commerce" },
];

// Education
const INSTITUTIONS = [
  "IIT Bombay","IIT Delhi","IIT Madras","NIT Trichy","BITS Pilani",
  "Delhi University","VIT Vellore","Anna University","Pune University","Manipal Institute",
  "Stanford","MIT","UC Berkeley","Georgia Tech","University of Toronto",
  "Imperial College London","TU Munich","NUS Singapore","IIIT Hyderabad","SRM University",
];
const DEGREES_TECH = ["B.Tech CSE","B.E. IT","B.Sc CS","M.Tech","MS CS"];
const DEGREES_NON_TECH = ["BBA", "MBA", "B.Com", "BA Communications", "B.Sc Finance", "BA Marketing"];

// Role titles: 15 families × 5 seniority bands
const ROLE_TITLES: Record<RoleFamily, Record<Seniority, string>> = {
  frontend:             { junior: "Frontend Developer",     mid: "Frontend Engineer",       senior: "Senior Frontend Engineer",     lead: "Staff Frontend Engineer",       director: "Director of Frontend Engineering" },
  backend:              { junior: "Backend Developer",      mid: "Backend Engineer",        senior: "Senior Backend Engineer",      lead: "Staff Backend Engineer",        director: "Director of Backend Engineering" },
  fullstack:            { junior: "Fullstack Developer",    mid: "Fullstack Engineer",      senior: "Senior Fullstack Engineer",    lead: "Staff Fullstack Engineer",      director: "Director of Engineering" },
  "data-science":       { junior: "Data Analyst",           mid: "Data Scientist",          senior: "Senior Data Scientist",        lead: "Lead Data Scientist",           director: "Director of Data Science" },
  "ml-engineering":     { junior: "ML Engineer Intern",     mid: "ML Engineer",             senior: "Senior ML Engineer",           lead: "Staff ML Engineer",             director: "Director of ML Engineering" },
  "devops-sre":         { junior: "DevOps Engineer",        mid: "SRE",                     senior: "Senior SRE",                   lead: "Staff SRE",                     director: "Director of Infrastructure" },
  mobile:               { junior: "Mobile Developer",       mid: "Mobile Engineer",         senior: "Senior Mobile Engineer",       lead: "Staff Mobile Engineer",         director: "Director of Mobile Engineering" },
  "product-management": { junior: "Associate PM",           mid: "Product Manager",         senior: "Senior Product Manager",       lead: "Group Product Manager",         director: "Director of Product" },
  design:               { junior: "Junior Designer",        mid: "Product Designer",        senior: "Senior Product Designer",      lead: "Staff Designer",                director: "Director of Design" },
  qa:                   { junior: "QA Analyst",             mid: "QA Engineer",             senior: "Senior QA Engineer",           lead: "Lead QA Engineer",              director: "Director of Quality" },
  sales:                { junior: "Sales Development Rep",  mid: "Account Executive",       senior: "Senior Account Executive",      lead: "Sales Director",                director: "VP of Global Sales" },
  marketing:            { junior: "Marketing Coordinator",  mid: "Marketing Specialist",    senior: "Senior Marketing Manager",     lead: "Head of Growth / Marketing",    director: "VP of Marketing" },
  legal:                { junior: "Legal Intern",           mid: "Legal Counsel",           senior: "Senior Legal Counsel",         lead: "Head of Legal & Compliance",    director: "General Counsel" },
  cybersecurity:        { junior: "Security Analyst",       mid: "Security Engineer",       senior: "Senior Security Engineer",     lead: "Security Architect",            director: "Chief Info Security Officer" },
  hr:                   { junior: "HR Coordinator",         mid: "HR Specialist / Recruiter", senior: "Senior HR Manager",          lead: "Head of People Operations",      director: "VP of People & Talent" },
};

// Seniority label for CrustData format
const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: "Entry", mid: "Mid", senior: "Senior", lead: "Lead", director: "Director",
};

// Summary templates
const VALUES = ["performance","accessibility","design systems","developer experience","clean architecture","mentoring","shipping fast","data-driven decisions","compliance","security-first","scalability","growth enablement","brand awareness","deal closing"];
const SUMMARY_TEMPLATES: Record<RoleFamily, string[]> = {
  frontend: [
    "{title} with {n} years building {skill1}-heavy products in {industry}. Previously at {pastCompany}. Cares about {value}.",
    "Experienced frontend developer with {n} years crafting UIs using {skill1} and {skill2}. Focused on {value}.",
    "Frontend specialist with {n}+ years across {industry} companies. Deep expertise in {skill1}. Passionate about {value}.",
  ],
  backend: [
    "Backend engineer with {n} years designing scalable APIs and services. Core stack: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years building distributed systems. Expertise in {skill1} and {skill2}. Cares about {value}.",
    "Building robust backends for {n} years. Strong in {skill1}, {skill2}. Previously at {pastCompany}.",
  ],
  fullstack: [
    "Fullstack engineer with {n} years spanning {skill1} and {skill2}. Works across the stack in {industry}.",
    "{title} with {n} years building end-to-end products. Currently at {company}. Values {value}.",
    "Building complete products for {n} years with {skill1} and {skill2}. Passionate about {value}.",
  ],
  "data-science": [
    "Data scientist with {n} years turning data into decisions. Core tools: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years in analytics and ML. Strong in {skill1}. Focused on {value}.",
  ],
  "ml-engineering": [
    "ML engineer with {n} years building production ML systems. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years in applied ML. Deep expertise in {skill1}. Cares about {value}.",
  ],
  "devops-sre": [
    "SRE with {n} years keeping systems reliable. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years in infrastructure and automation. Deep in {skill1}. Values {value}.",
  ],
  mobile: [
    "Mobile engineer with {n} years building iOS and Android apps. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years in mobile development. Deep expertise in {skill1}. Values {value}.",
  ],
  "product-management": [
    "Product manager with {n} years driving product strategy. Strong in {skill1} and {skill2}. Industry: {industry}.",
    "{title} with {n} years building products users love. Currently at {company}. Values {value}.",
  ],
  design: [
    "Product designer with {n} years crafting user experiences. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years in design. Deep expertise in {skill1}. Values {value}.",
  ],
  qa: [
    "QA engineer with {n} years ensuring product quality. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years in testing and automation. Deep in {skill1}. Values {value}.",
  ],
  sales: [
    "Sales leader with {n} years experience driving enterprise B2B revenue. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with a proven track record of {n} years beating quotas using {skill1} and {skill2}.",
    "Dedicated business builder with {n} years driving SaaS expansion. Focused on {value}.",
  ],
  marketing: [
    "Growth marketer with {n} years developing scalable customer acquisition. Expert in {skill1} and {skill2}.",
    "{title} with {n} years managing campaigns and branding. Specialized in {skill1}. Focuses on {value}.",
    "Content strategist with {n} years driving organic audience engagement. Strong in {skill1}.",
  ],
  legal: [
    "Corporate counsel with {n} years managing commercial transactions and compliance. Core: {skill1}, {skill2}.",
    "{title} with {n} years of experience in corporate governance, risk assessment, and {skill1}.",
    "Advising multinational enterprises for {n} years on complex regulations and {skill1}.",
  ],
  cybersecurity: [
    "Security specialist with {n} years protecting cloud infrastructure. Core stack: {skill1}, {skill2}.",
    "{title} with {n} years experience in threat modeling, penetration testing, and {skill1}.",
    "Information security practitioner with {n} years. Expert in auditing and {skill1}.",
  ],
  hr: [
    "People operations partner with {n} years building high-retention corporate cultures. Expert in {skill1}.",
    "{title} with {n} years of experience in global recruiting, talent strategies, and {skill1}.",
    "Managing employee relations and {skill1} for {n} years. Focused on {value}.",
  ],
};

// Locations
interface LocationEntry { city: string; country: string; weight: number }
const INDIA_LOCATIONS: LocationEntry[] = [
  { city: "Bengaluru", country: "India", weight: 3 },
  { city: "Mumbai", country: "India", weight: 2 },
  { city: "Delhi NCR", country: "India", weight: 2 },
  { city: "Hyderabad", country: "India", weight: 2 },
  { city: "Pune", country: "India", weight: 1 },
  { city: "Chennai", country: "India", weight: 1 },
  { city: "Remote", country: "Remote", weight: 2 },
];
const INTL_LOCATIONS: LocationEntry[] = [
  { city: "San Francisco", country: "USA", weight: 1 },
  { city: "New York", country: "USA", weight: 1 },
  { city: "London", country: "UK", weight: 1 },
  { city: "Berlin", country: "Germany", weight: 1 },
  { city: "Singapore", country: "Singapore", weight: 1 },
  { city: "Toronto", country: "Canada", weight: 1 },
  { city: "Remote", country: "Remote", weight: 1 },
];

function buildWeightedPool(locations: LocationEntry[]): LocationEntry[] {
  const pool: LocationEntry[] = [];
  for (const loc of locations) {
    for (let i = 0; i < loc.weight; i++) pool.push(loc);
  }
  return pool;
}
const indiaPool = buildWeightedPool(INDIA_LOCATIONS);
const intlPool = buildWeightedPool(INTL_LOCATIONS);

function pickLocation(): { city: string; country: string } {
  const isIndia = rng() < 0.7;
  return pick(isIndia ? indiaPool : intlPool);
}

// Seniority distribution
function pickSeniority(): { seniority: Seniority; yoeMin: number; yoeMax: number } {
  const r = rng();
  if (r < 0.15) return { seniority: "junior", yoeMin: 0, yoeMax: 2 };
  if (r < 0.45) return { seniority: "mid", yoeMin: 2, yoeMax: 5 };
  if (r < 0.75) return { seniority: "senior", yoeMin: 5, yoeMax: 9 };
  if (r < 0.90) return { seniority: "lead", yoeMin: 9, yoeMax: 14 };
  return { seniority: "director", yoeMin: 14, yoeMax: 20 };
}

function generateSkills(family: RoleFamily): string[] {
  const pool = SKILLS[family];
  const core = pool.slice(0, 4);
  const rest = pool.slice(4);
  const extra = pickN(rest, rand(2, 6));
  return [...core, ...extra];
}

function generateLinkedIn(first: string, last: string): string | null {
  if (rng() < 0.15) return null;
  const hash = Math.floor(rng() * 1000000).toString(36).slice(0, 6);
  return `https://www.linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}-${hash}`;
}

function generatePastRoles(
  seniority: Seniority,
  yoe: number,
  family: RoleFamily,
  currentCompany: string
): { title: string; company: string; years: number; startDate: string; endDate: string }[] {
  let numPast: number;
  switch (seniority) {
    case "director": case "lead": numPast = rand(3, 4); break;
    case "senior": numPast = rand(2, 3); break;
    case "mid": numPast = rand(1, 2); break;
    default: numPast = rand(0, 1);
  }

  const roles: { title: string; company: string; years: number; startDate: string; endDate: string }[] = [];
  let remainingYears = Math.max(0, yoe - 1);
  const currentYear = new Date().getFullYear();
  let endYear = currentYear - 1;

  const seniorityOrder: Seniority[] = ["junior", "mid", "senior", "lead", "director"];
  const currentIdx = seniorityOrder.indexOf(seniority);

  for (let i = 0; i < numPast && remainingYears > 0; i++) {
    const pastSeniorityIdx = Math.max(0, currentIdx - i - 1);
    const pastSeniority = seniorityOrder[pastSeniorityIdx];
    const pastTitle = ROLE_TITLES[family][pastSeniority];
    let comp: { name: string; industry: string };
    do {
      comp = pick(COMPANIES);
    } while (comp.name === currentCompany);
    const duration = Math.min(remainingYears, rand(1, 3));
    const startYear = endYear - duration;
    roles.push({
      title: pastTitle,
      company: comp.name,
      years: duration,
      startDate: `${startYear}-${String(rand(1, 12)).padStart(2, "0")}`,
      endDate: `${endYear}-${String(rand(1, 12)).padStart(2, "0")}`,
    });
    endYear = startYear;
    remainingYears -= duration;
  }
  return roles;
}

function generateSummary(
  family: RoleFamily,
  title: string,
  yoe: number,
  skills: string[],
  company: string,
  pastCompany: string | undefined,
  industry: string
): string {
  const templates = SUMMARY_TEMPLATES[family];
  const template = pick(templates);
  const value = pick(VALUES);
  return template
    .replace("{title}", title)
    .replace("{n}", String(yoe))
    .replace("{skill1}", skills[0] || "Consulting")
    .replace("{skill2}", skills[1] || "Management")
    .replace("{industry}", industry)
    .replace("{company}", company)
    .replace("{pastCompany}", pastCompany || company)
    .replace("{value}", value);
}

// Main generation
async function main() {
  console.log("🌱 Seeding 1,275 mock_profiles (MNC corporate roles)...\n");

  // Truncate
  const { error: truncErr } = await supabase
    .from("mock_profiles")
    .delete()
    .gte("created_at", "1970-01-01");
  if (truncErr) {
    console.error("Truncate error:", truncErr.message);
    process.exit(1);
  }

  const usedNames = new Set<string>();
  const allRows: Record<string, unknown>[] = [];
  const currentYear = new Date().getFullYear();

  // Generate 85 profiles per family × 15 families = 1,275 profiles (750 + 525 additional)
  for (const family of ROLE_FAMILIES) {
    for (let i = 0; i < 85; i++) {
      let first: string, last: string, fullName: string;
      let attempts = 0;
      do {
        first = pick(FIRST_NAMES);
        last = pick(LAST_NAMES);
        fullName = `${first} ${last}`;
        attempts++;
      } while (usedNames.has(fullName) && attempts < 200);
      usedNames.add(fullName);

      const { seniority, yoeMin, yoeMax } = pickSeniority();
      const yoe = rand(yoeMin, yoeMax);
      const skills = generateSkills(family);
      const loc = pickLocation();
      const linkedinUrl = generateLinkedIn(first, last);
      const currentCompanyObj = pick(COMPANIES);
      const title = ROLE_TITLES[family][seniority];
      const headline = `${title} at ${currentCompanyObj.name}`;
      const pastRoles = generatePastRoles(seniority, yoe, family, currentCompanyObj.name);
      const pastCompany = pastRoles.length > 0 ? pastRoles[0].company : undefined;
      const summary = generateSummary(family, title, yoe, skills, currentCompanyObj.name, pastCompany, currentCompanyObj.industry);

      // Select education based on domain type
      const isTech = [
        "frontend",
        "backend",
        "fullstack",
        "data-science",
        "ml-engineering",
        "devops-sre",
        "mobile",
        "qa",
        "cybersecurity",
      ].includes(family);

      const school = pick(INSTITUTIONS);
      let degree = "";
      if (family === "legal") {
        degree = pick(["LLB", "LLM", "Juris Doctor"]);
      } else if (isTech) {
        degree = pick(DEGREES_TECH);
      } else {
        degree = pick(DEGREES_NON_TECH);
      }

      const gradYear = currentYear - yoe - rand(0, 2);
      const connectionCount = rand(120, 3200);

      // Current role start date
      const currentStartYear = currentYear - rand(1, Math.min(3, yoe || 1));
      const currentStartMonth = String(rand(1, 12)).padStart(2, "0");

      const profile = {
        basic_profile: {
          name: fullName,
          headline,
          summary,
          location: { full_location: loc.city === "Remote" ? "Remote" : `${loc.city}, ${loc.country}` },
          linkedin_profile_url: linkedinUrl,
          connection_count: connectionCount,
          top_skills: skills.slice(0, 4),
        },
        experience: {
          employment_details: {
            current: {
              title,
              company_name: currentCompanyObj.name,
              seniority_level: SENIORITY_LABELS[seniority],
              industry: currentCompanyObj.industry,
              start_date: `${currentStartYear}-${currentStartMonth}`,
            },
            past: pastRoles.map((r) => ({
              title: r.title,
              company_name: r.company,
              start_date: r.startDate,
              end_date: r.endDate,
            })),
          },
        },
        education: {
          schools: [{ name: school, degree, end_year: gradYear }],
        },
        skills: { professional_network_skills: skills },
        years_of_experience: yoe,
      };

      allRows.push({
        profile,
        role_family: family,
        seniority,
        city: loc.city,
        country: loc.country,
        skills,
        years_of_experience: yoe,
      });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < allRows.length; i += 50) {
    const batch = allRows.slice(i, i + 50);
    const { error } = await supabase.from("mock_profiles").insert(batch);
    if (error) {
      console.error(`Insert error at batch ${i / 50}:`, error.message);
      process.exit(1);
    }
    process.stdout.write(`  inserted ${Math.min(i + 50, allRows.length)} / ${allRows.length}\r`);
  }
  console.log();

  // Sanity checks
  console.log("\n📊 Sanity checks:\n");

  // Total rows
  const { count: total } = await supabase
    .from("mock_profiles")
    .select("*", { count: "exact", head: true });
  console.log(`  Total rows: ${total}`);
  if (total !== 1275) { console.error("  ❌ Expected 1275 rows"); process.exit(1); }

  // Count per role family
  for (const family of ROLE_FAMILIES) {
    const { count } = await supabase
      .from("mock_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role_family", family);
    console.log(`  ${family}: ${count}`);
    if (count !== 85) { console.error(`  ❌ Expected 85 for ${family}`); process.exit(1); }
  }

  // Count per seniority
  const seniorityBands: Seniority[] = ["junior", "mid", "senior", "lead", "director"];
  for (const s of seniorityBands) {
    const { count } = await supabase
      .from("mock_profiles")
      .select("*", { count: "exact", head: true })
      .eq("seniority", s);
    console.log(`  ${s}: ${count}`);
  }

  // Null LinkedIn count
  const { data: allProfiles } = await supabase
    .from("mock_profiles")
    .select("profile");
  const nullLinkedin = (allProfiles || []).filter((r: any) =>
    r.profile?.basic_profile?.linkedin_profile_url === null
  ).length;
  console.log(`  Null LinkedIn: ${nullLinkedin} (~${Math.round(nullLinkedin / 12.75)}%)`);

  // Smoke query: "React" + senior
  const { data: smoke } = await supabase
    .from("mock_profiles")
    .select("id")
    .overlaps("skills", ["React"])
    .eq("seniority", "senior");
  const smokeCount = smoke?.length || 0;
  console.log(`  Smoke query (React + senior): ${smokeCount}`);
  if (smokeCount < 10) { console.error("  ❌ Expected ≥10 results"); process.exit(1); }

  console.log("\n✅ Seed complete!\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
