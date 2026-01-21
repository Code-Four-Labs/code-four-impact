/**
 * GCS Impact Service
 * Reads impact report data from c4-impact bucket
 * Path structure: organizations/[org-slug]/[uuid]/metadata.json
 * SECURITY: Server-side password verification
 */

import { Storage } from '@google-cloud/storage';
import bcrypt from 'bcryptjs';
import { validateUuid, validatePasswordFormat, validateOrgSlug } from '../security/validation';

const storage = new Storage();
const IMPACT_BUCKET = 'c4-impact';

export interface ReportLocation {
  lat: number;
  lon: number;
  count: number;
}

export interface LeaderboardEntry {
  name: string;
  reports: number;
  rank: number;
}

export interface ImpactMetadata {
  uuid: string;
  org_slug: string;
  password_hash: string | null;
  created_at: string;
  expires_at: string | null;
  report: {
    orgName: string;
    trialPeriod: string;
    reportsGenerated: number;
    minutesProcessed: number;
    activeUsers: number;
    avgWordLength: number;
    avgIncidentLength: string;
    leaderboard: LeaderboardEntry[];
    reportLocations: ReportLocation[];
  };
}

export interface ImpactReportData {
  metadata: ImpactMetadata;
}

/**
 * Get impact report data from GCS
 * Path: organizations/{org-slug}/{uuid}/metadata.json
 */
export async function getImpactReportByOrgAndUuid(
  orgSlug: string,
  uuid: string
): Promise<ImpactReportData> {
  // SECURITY: Validate inputs
  if (!validateOrgSlug(orgSlug)) {
    console.warn('[Security] Invalid org slug format in getImpactReportByOrgAndUuid');
    throw new Error('Invalid impact report');
  }
  
  if (!validateUuid(uuid)) {
    console.warn('[Security] Invalid UUID format in getImpactReportByOrgAndUuid');
    throw new Error('Invalid impact report');
  }
  
  try {
    // Read metadata.json from GCS - new nested structure
    const metadataPath = `organizations/${orgSlug}/${uuid}/metadata.json`;
    const metadata = await readJsonFile<ImpactMetadata>(IMPACT_BUCKET, metadataPath);
    
    if (!metadata) {
      throw new Error('Impact report not found');
    }
    
    // Validate expiration
    if (metadata.expires_at && new Date(metadata.expires_at) < new Date()) {
      throw new Error('Impact report expired');
    }
    
    return {
      metadata,
    };
  } catch (error) {
    console.error('[GCS Impact] Error reading impact report:', error);
    throw error;
  }
}

/**
 * Verify password for an impact report
 * SECURITY: Uses bcrypt for timing-safe comparison
 */
export async function verifyImpactPassword(
  orgSlug: string,
  uuid: string,
  password: string
): Promise<boolean> {
  // SECURITY: Validate inputs
  if (!validateOrgSlug(orgSlug)) {
    console.warn('[Security] Invalid org slug format in password verify');
    await artificialDelay();
    return false;
  }
  
  if (!validateUuid(uuid)) {
    console.warn('[Security] Invalid UUID format in password verify');
    await artificialDelay();
    return false;
  }
  
  if (!validatePasswordFormat(password)) {
    console.warn('[Security] Invalid password format');
    await artificialDelay();
    return false;
  }
  
  try {
    const metadataPath = `organizations/${orgSlug}/${uuid}/metadata.json`;
    const metadata = await readJsonFile<ImpactMetadata>(IMPACT_BUCKET, metadataPath);
    
    if (!metadata) {
      await artificialDelay();
      return false;
    }
    
    // No password required
    if (!metadata.password_hash) {
      return true;
    }
    
    // SECURITY: Verify with bcrypt (timing-safe)
    const isValid = await bcrypt.compare(password, metadata.password_hash);
    
    if (!isValid) {
      await artificialDelay();
    }
    
    return isValid;
  } catch (error) {
    console.error('[GCS Impact] Error verifying password:', error);
    await artificialDelay();
    return false;
  }
}

/**
 * SECURITY: Artificial delay to prevent timing attacks
 */
async function artificialDelay(): Promise<void> {
  const baseDelay = 100;
  const jitter = Math.random() * 50;
  await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
}

/**
 * Read JSON file from GCS
 */
async function readJsonFile<T>(bucket: string, path: string): Promise<T | null> {
  try {
    const file = storage.bucket(bucket).file(path);
    const [exists] = await file.exists();
    
    if (!exists) {
      return null;
    }
    
    const [contents] = await file.download();
    return JSON.parse(contents.toString('utf-8'));
  } catch (error) {
    console.error(`[GCS] Error reading ${path}:`, error);
    return null;
  }
}
