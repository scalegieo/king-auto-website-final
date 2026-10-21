export type Risk = "low" | "medium" | "high";

export type NormalizedVehicle = {
  key: string;
  id: string;
  vin?: string;
  stockNumber?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price?: number;
  mileage?: number;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  mpgCity?: number;
  mpgHighway?: number;
  images: string[];
  path: string;
  availability: "available" | "pending";
  firstSeen: string;
  lastSeen: string;
};

export type SoldSuggestion = {
  action: "leave_404" | "review_redirect";
  destination?: string;
  reason: string;
};

export type InventoryEvent = {
  type: "new" | "sold" | "price" | "mileage" | "images" | "details";
  key: string;
  name: string;
  path: string;
  from?: number;
  to?: number;
  delta?: number;
  added?: number;
  removed?: number;
  fields?: string[];
  suggestion?: SoldSuggestion;
};

export type InventorySnapshot = {
  runId: string;
  at: string;
  vehicles: NormalizedVehicle[];
};

export type SEOIssue = {
  id: string;
  runId: string;
  path: string;
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
  createdAt: string;
};

export type SEORecommendation = {
  id: string;
  runId: string;
  path: string;
  type: string;
  current: string;
  proposed: string;
  reason: string;
  confidence: number;
  risk: Risk;
  impact: string;
  status: "pending" | "applied" | "rejected" | "superseded";
  safeToAutoApply: boolean;
  field?: "title" | "description";
  createdAt: string;
};

export type SEOChange = {
  id: string;
  runId: string;
  recommendationId?: string;
  path: string;
  changeType: string;
  field?: "title" | "description";
  before: string;
  after: string;
  /** Override that was live before this change. Null means the page used the generator. */
  overridesBefore: { title?: string; description?: string } | null;
  reason: string;
  confidence: number;
  risk: Risk;
  status: "applied" | "pending" | "rejected" | "rolled_back";
  createdAt: string;
  resolvedAt?: string;
};

export type KeywordPerformance = {
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  startDate: string;
  endDate: string;
};

export type InternalLinkOpportunity = {
  id: string;
  from: string;
  to: string;
  anchor: string;
  reason: string;
  createdAt: string;
};

export type AutomationRun = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "failed" | "completed_not_persisted";
  week: number;
  theme: string;
  vehiclesScanned: number;
  pagesScanned: number;
  changesApplied: number;
  changesQueued: number;
  errors: string[];
  notes: string[];
  persistence: "file" | "remote" | "file+remote" | "none";
};

export type ScoreSet = {
  overall: number;
  technical: number;
  content: number;
  inventory: number;
  local: number;
  indexing: number;
  performance: number | null;
};

export type WeeklyReport = {
  id: string;
  runId: string;
  week: number;
  theme: string;
  rangeStart: string;
  rangeEnd: string;
  scores: ScoreSet;
  previousScores?: ScoreSet;
  inventory: {
    active: number;
    added: number;
    sold: number;
    priceChanges: number;
    byMake: Array<{ name: string; count: number }>;
    byModel: Array<{ name: string; count: number }>;
  };
  search: {
    connected: boolean;
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
    note: string;
  };
  work: string[];
  opportunities: Array<{
    title: string;
    detail: string;
    score: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
  }>;
  nextWeek: string[];
  createdAt: string;
};

export type PageOverride = {
  title?: string;
  description?: string;
};

export type SeoStore = {
  version: 1;
  programStartedAt: string | null;
  vehicles: Record<string, NormalizedVehicle>;
  snapshots: InventorySnapshot[];
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  changes: SEOChange[];
  overrides: Record<string, PageOverride>;
  linkOpportunities: InternalLinkOpportunity[];
  runs: AutomationRun[];
  reports: WeeklyReport[];
  searchRows: KeywordPerformance[];
  searchNote: string;
  running: { id: string; startedAt: string } | null;
  /** Checklist item id -> ISO time it was checked. */
  checklist: Record<string, string>;
};

export function emptyStore(): SeoStore {
  return {
    version: 1,
    programStartedAt: null,
    vehicles: {},
    snapshots: [],
    issues: [],
    recommendations: [],
    changes: [],
    overrides: {},
    linkOpportunities: [],
    runs: [],
    reports: [],
    searchRows: [],
    searchNote: "Search Console is not connected.",
    running: null,
    checklist: {},
  };
}
