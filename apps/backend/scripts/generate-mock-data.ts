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

const rng = seedrandom("ai-talent-sense-v3");
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
  "Vikram","Deepak","Suresh","Rajesh","Manish","Swati","Divya","Kritika","Tanvi","Harini",
  "Raghav","Pranav","Akash","Chirag","Yash","Sneha","Sakshi","Ankita","Pallavi","Ritika",
];
const LAST_NAMES = [
  "Sharma","Verma","Gupta","Mehta","Iyer","Nair","Reddy","Rao","Patel","Shah",
  "Kulkarni","Deshpande","Joshi","Malhotra","Kapoor","Chopra","Bhatt","Menon","Pillai","Banerjee",
  "Chatterjee","Mukherjee","Das","Bose","Sen","Singh","Yadav","Mishra","Tripathi","Pandey",
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Martinez","Anderson",
  "Taylor","Thomas","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Clark",
  "Lewis","Walker","Hall","Young","King","Wright","Scott","Green","Baker","Nelson",
  "Agarwal","Saxena","Tiwari","Chauhan","Srivastava","Rastogi","Dubey","Goyal","Arora","Bhatia",
];

// 25 Role families (15 original + 10 new domain families)
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
  | "hr"
  // ── 10 new families ──
  | "embedded"
  | "hardware"
  | "mechanical"
  | "civil-construction"
  | "biotech-pharma"
  | "finance-accounting"
  | "supply-chain"
  | "content-media"
  | "customer-success"
  | "cloud-architecture";

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
  // ── 10 new ──
  "embedded",
  "hardware",
  "mechanical",
  "civil-construction",
  "biotech-pharma",
  "finance-accounting",
  "supply-chain",
  "content-media",
  "customer-success",
  "cloud-architecture",
];

// Profile counts per family: original 15 × 100 + new 10 × 50 = 2000
const FAMILY_COUNTS: Record<RoleFamily, number> = {
  frontend: 100, backend: 100, fullstack: 100, "data-science": 100,
  "ml-engineering": 100, "devops-sre": 100, mobile: 100,
  "product-management": 100, design: 100, qa: 100,
  sales: 100, marketing: 100, legal: 100, cybersecurity: 100, hr: 100,
  embedded: 50, hardware: 50, mechanical: 50, "civil-construction": 50,
  "biotech-pharma": 50, "finance-accounting": 50, "supply-chain": 50,
  "content-media": 50, "customer-success": 50, "cloud-architecture": 50,
};

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
  // ── 10 new families ──
  embedded: ["C", "C++", "STM32", "RTOS", "BLE", "Embedded C", "Microcontrollers", "ARM Cortex", "I2C/SPI/UART", "CubeMX", "FreeRTOS", "IoT", "Firmware Development", "Debugging", "Oscilloscope", "PCB Bring-up"],
  hardware: ["FPGA", "Verilog", "SystemVerilog", "VLSI Design", "PCB Design", "ASIC Design", "Cadence", "Synopsys", "Timing Analysis", "RTL Design", "EDA Tools", "Signal Integrity", "Altium Designer", "KiCad"],
  mechanical: ["SolidWorks", "AutoCAD", "ANSYS", "CATIA", "GD&T", "FEA", "CFD", "3D Printing", "Manufacturing Processes", "Thermal Analysis", "CNC Machining", "Six Sigma", "Creo", "Tolerance Analysis"],
  "civil-construction": ["AutoCAD", "Revit", "BIM", "Structural Analysis", "STAAD Pro", "Project Management", "Construction Management", "Surveying", "ETABS", "Primavera", "Concrete Design", "Steel Structures"],
  "biotech-pharma": ["Molecular Biology", "Cell Culture", "PCR", "HPLC", "GMP", "Clinical Trials", "Drug Discovery", "Bioinformatics", "Genomics", "Regulatory Affairs", "FDA Compliance", "Protein Engineering", "CRISPR", "Pharmacology"],
  "finance-accounting": ["Financial Modeling", "Excel", "SAP", "Accounting", "Tax Compliance", "FP&A", "Auditing", "GAAP/IFRS", "Tally", "QuickBooks", "Risk Analysis", "Budgeting", "Power BI", "Corporate Finance"],
  "supply-chain": ["Procurement", "SAP SCM", "Inventory Management", "Demand Planning", "Logistics", "ERP", "Warehouse Management", "Lean Manufacturing", "Vendor Management", "Oracle SCM", "Supply Chain Analytics", "Quality Control"],
  "content-media": ["Adobe Premiere", "Final Cut Pro", "Video Production", "Content Strategy", "Scriptwriting", "Photography", "After Effects", "Podcasting", "Social Media Management", "Journalism", "Copyediting", "DaVinci Resolve"],
  "customer-success": ["Customer Relationship Management", "Zendesk", "Intercom", "Onboarding", "Retention Strategies", "Account Management", "SLA Management", "Customer Analytics", "Churn Prevention", "Upselling", "Salesforce", "CSAT/NPS"],
  "cloud-architecture": ["AWS", "Azure", "GCP", "Solutions Architecture", "Cloud Migration", "Terraform", "Kubernetes", "Microservices Architecture", "Enterprise Architecture", "TOGAF", "Serverless", "Cloud Security", "Cost Optimization", "Multi-Cloud Strategy"],
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
  // ── 15 new companies for new domains ──
  { name: "Str8bat", industry: "Sports Technology" },
  { name: "NanoCore", industry: "Semiconductors" },
  { name: "FirmaTech", industry: "IoT" },
  { name: "BridgeBuild", industry: "Construction" },
  { name: "PharmaVerse", industry: "Pharmaceuticals" },
  { name: "CapitalEdge", industry: "Financial Services" },
  { name: "SupplyChainX", industry: "Supply Chain" },
  { name: "MediaPulse", industry: "Media & Entertainment" },
  { name: "SuccessHub", industry: "SaaS" },
  { name: "CloudPeak", industry: "Cloud Solutions" },
  { name: "RoboSense", industry: "Robotics" },
  { name: "AeroNova", industry: "Aerospace" },
  { name: "BioGenix", industry: "Biotechnology" },
  { name: "GreenGrid", industry: "Renewable Energy" },
  { name: "PrecisionMfg", industry: "Manufacturing" },
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
const DEGREES_ENGINEERING = ["B.E. ECE", "B.E. EEE", "B.Tech ECE", "M.Tech VLSI", "M.Tech Embedded Systems", "B.E. Electronics"];
const DEGREES_MECHANICAL = ["B.E. Mechanical", "B.Tech Mechanical", "M.Tech Thermal", "M.E. Manufacturing", "B.Tech Production"];
const DEGREES_CIVIL = ["B.E. Civil", "B.Tech Civil", "M.Tech Structural", "M.E. Construction Management"];
const DEGREES_SCIENCE = ["B.Sc Biology", "M.Sc Biotechnology", "B.Pharm", "M.Pharm", "PhD Biochemistry", "M.Sc Molecular Biology"];
const DEGREES_FINANCE = ["B.Com", "CA", "CFA Level III", "MBA Finance", "M.Com", "CPA"];
const DEGREES_MEDIA = ["BA Journalism", "BA Film Studies", "BFA Visual Arts", "MA Mass Communication", "BA Media Studies"];

// Role titles: 25 families × 5 seniority bands
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
  // ── 10 new families ──
  embedded:             { junior: "Embedded Developer",     mid: "Embedded Engineer",       senior: "Senior Embedded Engineer",     lead: "Lead Firmware Engineer",        director: "Director of Embedded Systems" },
  hardware:             { junior: "Hardware Design Intern", mid: "Hardware Engineer",       senior: "Senior Hardware Engineer",     lead: "Lead VLSI Engineer",            director: "Director of Hardware Engineering" },
  mechanical:           { junior: "Junior Mechanical Engr", mid: "Mechanical Engineer",     senior: "Senior Mechanical Engineer",   lead: "Lead Mechanical Engineer",      director: "Director of Mechanical Engineering" },
  "civil-construction": { junior: "Junior Civil Engineer",  mid: "Civil Engineer",          senior: "Senior Structural Engineer",   lead: "Lead Construction Manager",     director: "Director of Construction" },
  "biotech-pharma":     { junior: "Research Associate",     mid: "Biotech Researcher",      senior: "Senior Research Scientist",    lead: "Principal Scientist",           director: "Director of R&D" },
  "finance-accounting": { junior: "Junior Accountant",      mid: "Financial Analyst",       senior: "Senior Financial Analyst",     lead: "Finance Manager",               director: "VP of Finance" },
  "supply-chain":       { junior: "Supply Chain Analyst",   mid: "Procurement Specialist",  senior: "Senior Supply Chain Mgr",      lead: "Head of Procurement",           director: "VP of Supply Chain" },
  "content-media":      { junior: "Content Intern",         mid: "Content Producer",        senior: "Senior Video Editor",          lead: "Head of Content",               director: "VP of Content & Media" },
  "customer-success":   { junior: "Customer Support Rep",   mid: "Customer Success Mgr",    senior: "Senior CSM",                   lead: "Head of Customer Success",      director: "VP of Customer Experience" },
  "cloud-architecture": { junior: "Cloud Engineer",         mid: "Cloud Solutions Architect",senior: "Senior Solutions Architect",   lead: "Principal Architect",            director: "VP of Cloud Architecture" },
};

// Seniority label for CrustData format
const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: "Entry", mid: "Mid", senior: "Senior", lead: "Lead", director: "Director",
};

// Summary templates
const VALUES = ["performance","accessibility","design systems","developer experience","clean architecture","mentoring","shipping fast","data-driven decisions","compliance","security-first","scalability","growth enablement","brand awareness","deal closing","reliability","precision","safety","innovation","quality"];
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
  // ── 10 new families ──
  embedded: [
    "Embedded firmware engineer with {n} years developing {skill1}-based systems. Deep experience with {skill2} and real-time protocols. Industry: {industry}.",
    "{title} with {n} years writing firmware for {skill1} microcontrollers. Expert in {skill2} and low-level debugging.",
    "IoT/embedded specialist with {n}+ years. Core: {skill1}, {skill2}. Passionate about {value}. Previously at {pastCompany}.",
  ],
  hardware: [
    "Hardware engineer with {n} years in {skill1} and chip design. Core tools: {skill2}, {skill1}. Industry: {industry}.",
    "{title} with {n} years designing digital circuits. Expert in {skill1} and {skill2}. Values {value}.",
    "VLSI/FPGA specialist with {n}+ years across {industry}. Deep in {skill1}. Previously at {pastCompany}.",
  ],
  mechanical: [
    "Mechanical engineer with {n} years designing products using {skill1} and {skill2}. Industry: {industry}.",
    "{title} with {n} years in product design and manufacturing. Expert in {skill1}. Cares about {value}.",
    "Design and simulation specialist with {n}+ years. Core: {skill1}, {skill2}. Previously at {pastCompany}.",
  ],
  "civil-construction": [
    "Civil/structural engineer with {n} years in {industry}. Core tools: {skill1}, {skill2}.",
    "{title} with {n} years managing construction projects. Expert in {skill1} and {skill2}. Values {value}.",
    "Infrastructure specialist with {n}+ years across commercial and residential projects. Deep in {skill1}.",
  ],
  "biotech-pharma": [
    "Biotech researcher with {n} years in {skill1} and {skill2}. Industry: {industry}. Focused on {value}.",
    "{title} with {n} years in drug discovery and development. Expert in {skill1}. Previously at {pastCompany}.",
    "Life sciences professional with {n}+ years. Core: {skill1}, {skill2}. Passionate about {value}.",
  ],
  "finance-accounting": [
    "Finance professional with {n} years in {skill1} and {skill2}. Industry: {industry}.",
    "{title} with {n} years managing budgets and forecasts. Expert in {skill1}. Values {value}.",
    "Accounting specialist with {n}+ years. Core: {skill1}, {skill2}. Previously at {pastCompany}.",
  ],
  "supply-chain": [
    "Supply chain leader with {n} years optimizing {skill1} and {skill2}. Industry: {industry}.",
    "{title} with {n} years streamlining procurement and logistics. Expert in {skill1}. Values {value}.",
    "Operations specialist with {n}+ years across {industry}. Deep in {skill1} and {skill2}.",
  ],
  "content-media": [
    "Content creator with {n} years in {skill1} and {skill2}. Industry: {industry}. Focused on {value}.",
    "{title} with {n} years producing engaging media. Expert in {skill1}. Previously at {pastCompany}.",
    "Media professional with {n}+ years. Core: {skill1}, {skill2}. Passionate about {value}.",
  ],
  "customer-success": [
    "Customer success professional with {n} years driving retention and growth. Core: {skill1}, {skill2}. Industry: {industry}.",
    "{title} with {n} years managing enterprise accounts. Expert in {skill1}. Values {value}.",
    "Client relations specialist with {n}+ years. Deep in {skill1} and {skill2}. Previously at {pastCompany}.",
  ],
  "cloud-architecture": [
    "Cloud architect with {n} years designing enterprise-grade {skill1} and {skill2} solutions. Industry: {industry}.",
    "{title} with {n} years leading cloud migration and optimization. Expert in {skill1}. Values {value}.",
    "Solutions architect with {n}+ years. Core: {skill1}, {skill2}. Passionate about {value}. Previously at {pastCompany}.",
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

// Degree selection based on family
function pickDegree(family: RoleFamily): string {
  switch (family) {
    case "embedded":
    case "hardware":
      return pick(DEGREES_ENGINEERING);
    case "mechanical":
      return pick(DEGREES_MECHANICAL);
    case "civil-construction":
      return pick(DEGREES_CIVIL);
    case "biotech-pharma":
      return pick(DEGREES_SCIENCE);
    case "finance-accounting":
      return pick(DEGREES_FINANCE);
    case "content-media":
      return pick(DEGREES_MEDIA);
    case "legal":
      return pick(["LLB", "LLM", "Juris Doctor"]);
    case "frontend":
    case "backend":
    case "fullstack":
    case "data-science":
    case "ml-engineering":
    case "devops-sre":
    case "mobile":
    case "qa":
    case "cybersecurity":
    case "cloud-architecture":
      return pick(DEGREES_TECH);
    default:
      return pick(DEGREES_NON_TECH);
  }
}

// Main generation
async function main() {
  const totalExpected = Object.values(FAMILY_COUNTS).reduce((a, b) => a + b, 0);
  console.log(`🌱 Seeding ${totalExpected.toLocaleString()} mock_profiles (25 role families)...\n`);

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

  for (const family of ROLE_FAMILIES) {
    const count = FAMILY_COUNTS[family];
    for (let i = 0; i < count; i++) {
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

      const school = pick(INSTITUTIONS);
      const degree = pickDegree(family);

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
  if (total !== totalExpected) { console.error(`  ❌ Expected ${totalExpected} rows`); process.exit(1); }

  // Count per role family
  for (const family of ROLE_FAMILIES) {
    const expected = FAMILY_COUNTS[family];
    const { count } = await supabase
      .from("mock_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role_family", family);
    console.log(`  ${family}: ${count}`);
    if (count !== expected) { console.error(`  ❌ Expected ${expected} for ${family}`); process.exit(1); }
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
  console.log(`  Null LinkedIn: ${nullLinkedin} (~${Math.round(nullLinkedin / 20)}%)`);

  // Smoke query: "React" + senior
  const { data: smoke } = await supabase
    .from("mock_profiles")
    .select("id")
    .overlaps("skills", ["React"])
    .eq("seniority", "senior");
  const smokeCount = smoke?.length || 0;
  console.log(`  Smoke query (React + senior): ${smokeCount}`);
  if (smokeCount < 10) { console.error("  ❌ Expected ≥10 results"); process.exit(1); }

  // Smoke query: embedded/firmware
  const { data: smokeEmb } = await supabase
    .from("mock_profiles")
    .select("id")
    .eq("role_family", "embedded");
  const smokeEmbCount = smokeEmb?.length || 0;
  console.log(`  Smoke query (embedded family): ${smokeEmbCount}`);
  if (smokeEmbCount < 40) { console.error("  ❌ Expected ≥40 embedded results"); process.exit(1); }

  console.log("\n✅ Seed complete!\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
