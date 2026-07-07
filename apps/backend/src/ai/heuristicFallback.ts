import type { FilterSet, Seniority } from "../providers/types.js";
import type { ScoredCandidate, CandidateProfile } from "../providers/types.js";

const SENIORITY_INDEX: Record<Seniority, number> = {
  junior: 0,
  mid: 1,
  senior: 2,
  lead: 3,
  director: 4,
};

// Skill synonym groups — skills within the same group count as semantic matches
const SKILL_GROUPS: string[][] = [
  // Cloud platforms
  ["cloud services", "cloud computing", "cloud", "aws", "amazon web services", "gcp", "google cloud", "azure", "microsoft azure", "cloud infrastructure"],
  // Frontend frameworks
  ["frontend", "front-end", "react", "reactjs", "react.js", "vue", "vuejs", "vue.js", "angular", "angularjs", "svelte", "next.js", "nextjs", "nuxt", "gatsby"],
  // Backend frameworks
  ["backend", "back-end", "node.js", "nodejs", "express", "express.js", "fastify", "django", "flask", "spring", "spring boot", "rails", "ruby on rails", "laravel", "nestjs"],
  // Programming languages
  ["javascript", "js", "typescript", "ts"],
  ["python", "python3"],
  ["java", "kotlin", "scala"],
  ["c#", "csharp", ".net", "dotnet", "asp.net"],
  ["go", "golang"],
  ["rust", "rustlang"],
  ["ruby", "rb"],
  ["php"],
  ["swift", "objective-c", "ios development"],
  // Databases
  ["databases", "database", "sql", "postgresql", "postgres", "mysql", "mariadb", "sqlite", "oracle", "sql server", "mssql"],
  ["nosql", "mongodb", "mongo", "dynamodb", "cassandra", "couchdb", "firestore"],
  ["redis", "memcached", "caching"],
  // DevOps & Infrastructure
  ["devops", "ci/cd", "cicd", "continuous integration", "continuous deployment", "jenkins", "github actions", "gitlab ci", "circleci"],
  ["docker", "containerization", "containers", "kubernetes", "k8s", "container orchestration"],
  ["terraform", "infrastructure as code", "iac", "cloudformation", "pulumi", "ansible"],
  // Data & ML
  ["machine learning", "ml", "deep learning", "artificial intelligence", "ai", "neural networks"],
  ["data science", "data analysis", "data analytics", "statistics", "statistical analysis"],
  ["data engineering", "etl", "data pipelines", "apache spark", "spark", "kafka", "airflow"],
  ["nlp", "natural language processing", "text mining", "language models"],
  ["computer vision", "image recognition", "opencv"],
  // Mobile
  ["mobile development", "react native", "flutter", "ionic", "xamarin"],
  ["android", "android development", "kotlin android"],
  ["ios", "ios development", "swift", "swiftui"],
  // Testing
  ["testing", "test automation", "unit testing", "jest", "mocha", "pytest", "selenium", "cypress", "playwright", "qa"],
  // Design
  ["ui design", "ux design", "ui/ux", "figma", "sketch", "adobe xd", "user experience", "user interface"],
  // API & Communication
  ["rest", "rest api", "restful", "graphql", "grpc", "api design", "api development"],
  ["microservices", "service oriented architecture", "soa", "distributed systems"],
  // Security
  ["cybersecurity", "security", "infosec", "information security", "penetration testing", "owasp"],
  // Project / Agile
  ["agile", "scrum", "kanban", "project management", "jira", "sprint planning"],
  // Version control
  ["git", "github", "gitlab", "bitbucket", "version control"],
  // Monitoring
  ["monitoring", "observability", "datadog", "new relic", "prometheus", "grafana", "splunk", "elk", "logging"],
  // ── New domain groups ──
  // Embedded / Firmware / IoT
  ["embedded", "embedded systems", "firmware", "firmware development", "embedded c", "microcontrollers", "mcu"],
  ["stm32", "stm32cube", "cubemx", "stm32cubemx", "st hal and ll drivers", "arm cortex", "arm"],
  ["rtos", "freertos", "real-time operating systems", "zephyr", "vxworks"],
  ["ble", "bluetooth low energy", "bluetooth", "ble protocols", "zigbee", "lora", "wireless protocols"],
  ["i2c", "spi", "uart", "i2c/spi/uart", "serial communication", "can bus", "modbus"],
  ["iot", "internet of things", "mqtt", "coap", "iot protocols"],
  // Hardware / VLSI / PCB
  ["fpga", "verilog", "systemverilog", "rtl design", "rtl", "hdl"],
  ["vlsi", "vlsi design", "asic", "asic design", "chip design", "semiconductor"],
  ["pcb design", "pcb", "altium designer", "altium", "kicad", "eagle", "pcb layout"],
  ["cadence", "synopsys", "eda tools", "eda", "timing analysis", "signal integrity"],
  // Mechanical Engineering
  ["solidworks", "cad", "autocad", "catia", "creo", "inventor", "onshape", "mechanical design"],
  ["ansys", "fea", "finite element analysis", "cfd", "computational fluid dynamics", "simulation"],
  ["cnc machining", "cnc", "manufacturing processes", "manufacturing", "3d printing", "additive manufacturing"],
  ["gd&t", "geometric dimensioning", "tolerance analysis", "tolerancing"],
  ["six sigma", "lean", "lean manufacturing", "kaizen", "quality engineering"],
  // Civil / Construction
  ["revit", "bim", "building information modeling", "archicad"],
  ["structural analysis", "staad pro", "staad", "etabs", "sap2000", "structural engineering"],
  ["construction management", "primavera", "p6", "project planning", "site management"],
  ["concrete design", "steel structures", "reinforced concrete", "structural design"],
  // Biotech / Pharma
  ["molecular biology", "cell culture", "pcr", "dna", "rna", "genomics", "proteomics"],
  ["hplc", "mass spectrometry", "chromatography", "analytical chemistry"],
  ["clinical trials", "gmp", "good manufacturing practice", "fda compliance", "fda", "regulatory affairs"],
  ["bioinformatics", "computational biology", "protein engineering", "crispr", "gene editing"],
  ["drug discovery", "pharmacology", "pharmaceutical", "drug development", "clinical research"],
  // Finance / Accounting
  ["financial modeling", "financial analysis", "corporate finance", "fp&a", "financial planning"],
  ["accounting", "gaap", "ifrs", "gaap/ifrs", "bookkeeping", "general ledger"],
  ["auditing", "tax compliance", "tax", "internal audit", "external audit"],
  ["sap", "tally", "quickbooks", "erp", "oracle financials", "netsuite"],
  // Supply Chain / Operations
  ["procurement", "vendor management", "sourcing", "purchase management"],
  ["inventory management", "warehouse management", "wms", "logistics", "demand planning"],
  ["supply chain analytics", "supply chain", "scm", "sap scm", "oracle scm"],
  // Content / Media
  ["adobe premiere", "premiere pro", "final cut pro", "davinci resolve", "video editing", "video production"],
  ["after effects", "motion graphics", "animation", "visual effects", "vfx"],
  ["journalism", "copyediting", "scriptwriting", "content writing", "editorial"],
  ["photography", "videography", "cinematography", "camera operation"],
  // Customer Success
  ["customer relationship management", "crm", "salesforce crm", "hubspot"],
  ["zendesk", "intercom", "freshdesk", "customer support", "helpdesk"],
  ["csat", "nps", "csat/nps", "customer satisfaction", "net promoter score"],
  ["retention strategies", "churn prevention", "customer retention", "upselling", "cross-selling"],
  // Cloud Architecture
  ["solutions architecture", "enterprise architecture", "togaf", "cloud architecture"],
  ["cloud migration", "cloud strategy", "multi-cloud", "multi-cloud strategy", "hybrid cloud"],
  ["serverless", "lambda", "aws lambda", "cloud functions", "azure functions"],
  ["cost optimization", "finops", "cloud cost management", "cloud governance"],
];

// Build a lookup: lowercase skill → group index
const skillToGroupIndex = new Map<string, number>();
SKILL_GROUPS.forEach((group, idx) => {
  group.forEach((skill) => {
    skillToGroupIndex.set(skill.toLowerCase(), idx);
  });
});

/**
 * Check if two skill strings are semantically related
 * (either exact match or in the same synonym group).
 */
function skillsMatch(a: string, b: string): boolean {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if (la === lb) return true;
  // Substring containment (e.g. "react" in "react.js")
  if (la.includes(lb) || lb.includes(la)) return true;
  // Same synonym group
  const groupA = skillToGroupIndex.get(la);
  const groupB = skillToGroupIndex.get(lb);
  if (groupA !== undefined && groupB !== undefined && groupA === groupB) return true;
  return false;
}

/**
 * Compute semantic skill overlap as a score 0-100.
 * For each required skill, check if any candidate skill semantically matches.
 */
function semanticSkillOverlap(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 70; // No requirements → neutral
  let matched = 0;
  for (const req of requiredSkills) {
    if (candidateSkills.some((cs) => skillsMatch(cs, req))) {
      matched++;
    }
  }
  return Math.round((matched / requiredSkills.length) * 100);
}

export function heuristicScore(
  candidate: CandidateProfile,
  filters: FilterSet
): ScoredCandidate {
  // Skills: semantic overlap
  const skillsScore = semanticSkillOverlap(candidate.skills, filters.skills);

  // Seniority: 100 - 25 × |bandIndex(candidate) - nearest bandIndex(required)|, floor 0
  let seniorityScore: number;
  if (filters.seniority.length === 0) {
    seniorityScore = 70;
  } else {
    const candidateIdx = SENIORITY_INDEX[candidate.seniority];
    const minDist = Math.min(
      ...filters.seniority.map((s) => Math.abs(candidateIdx - SENIORITY_INDEX[s]))
    );
    seniorityScore = Math.max(0, 100 - 25 * minDist);
  }

  // Industry: 80 if match, 55 otherwise, 70 if filter has none
  let industryScore: number;
  if (filters.industries.length === 0) {
    industryScore = 70;
  } else {
    const allText = `${candidate.summary} ${candidate.headline} ${candidate.currentCompany}`.toLowerCase();
    const hasMatch = filters.industries.some((ind) =>
      allText.includes(ind.toLowerCase())
    );
    industryScore = hasMatch ? 80 : 55;
  }

  // Location: exact 100, same country 70, else 40, unspecified 70
  let locationScore: number;
  if (filters.locations.length === 0) {
    locationScore = 70;
  } else {
    const candidateLoc = candidate.location.toLowerCase();
    const exactMatch = filters.locations.some(
      (l) => candidateLoc.includes(l.toLowerCase()) || l.toLowerCase().includes("remote") && candidateLoc.includes("remote")
    );
    if (exactMatch) {
      locationScore = 100;
    } else {
      // Check same country
      const candidateCountryHints = candidateLoc.split(",").map((s) => s.trim());
      const sameCountry = filters.locations.some((l) =>
        candidateCountryHints.some((ch) => l.toLowerCase().includes(ch))
      );
      locationScore = sameCountry ? 70 : 40;
    }
  }

  // Shared skills for blurb — semantic match
  const sharedSkills = candidate.skills.filter((s) =>
    filters.skills.some((fs) => skillsMatch(s, fs))
  );

  const subscores = {
    skills: Math.min(100, Math.max(0, skillsScore)),
    seniority: Math.min(100, Math.max(0, seniorityScore)),
    industry: Math.min(100, Math.max(0, industryScore)),
    location: Math.min(100, Math.max(0, locationScore)),
  };

  const score = Math.round(
    0.4 * subscores.skills +
    0.25 * subscores.seniority +
    0.25 * subscores.industry +
    0.1 * subscores.location
  );

  const blurb = `${candidate.yearsOfExperience}y ${candidate.currentTitle}; matches ${sharedSkills.slice(0, 3).join(", ") || "few skills"}. (Heuristic score — AI scorer unavailable.)`;

  return {
    ...candidate,
    score,
    subscores,
    blurb,
    scoredBy: "heuristic",
  };
}
