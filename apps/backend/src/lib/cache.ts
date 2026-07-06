import { createHash } from "crypto";
import { supabase } from "./supabase.js";
import type { FilterSet } from "../providers/types.js";

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function canonicalize(filters: FilterSet): string {
  const sorted = {
    industries: [...filters.industries].sort(),
    locations: [...filters.locations].sort(),
    maxYears: filters.maxYears,
    minYears: filters.minYears,
    seniority: [...filters.seniority].sort(),
    skills: [...filters.skills].sort(),
    titles: [...filters.titles].sort(),
  };
  return JSON.stringify(sorted);
}

function hashFilters(filters: FilterSet): string {
  return createHash("sha256").update(canonicalize(filters)).digest("hex");
}

export async function getCachedProfiles(
  filters: FilterSet
): Promise<unknown[] | null> {
  const hash = hashFilters(filters);
  const { data } = await supabase
    .from("live_profiles_cache")
    .select("profiles, fetched_at")
    .eq("query_hash", hash)
    .single();

  if (!data) return null;

  const fetchedAt = new Date(data.fetched_at).getTime();
  if (Date.now() - fetchedAt > TTL_MS) {
    // Expired — delete and return null
    await supabase.from("live_profiles_cache").delete().eq("query_hash", hash);
    return null;
  }

  return data.profiles as unknown[];
}

export async function cacheProfiles(
  filters: FilterSet,
  profiles: unknown[],
  totalCount: number
): Promise<void> {
  const hash = hashFilters(filters);
  await supabase.from("live_profiles_cache").upsert({
    query_hash: hash,
    filters: filters as unknown as Record<string, unknown>,
    profiles,
    total_count: totalCount,
    fetched_at: new Date().toISOString(),
  });
}
