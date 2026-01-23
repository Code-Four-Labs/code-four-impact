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
 * Check if PDF exists for an impact report
 * Path: organizations/{org-slug}/{uuid}/impact-recap.pdf
 */
export async function checkImpactPdfExists(
  orgSlug: string,
  uuid: string
): Promise<boolean> {
  // SECURITY: Validate inputs
  if (!validateOrgSlug(orgSlug) || !validateUuid(uuid)) {
    return false;
  }
  
  try {
    const pdfPath = `organizations/${orgSlug}/${uuid}/impact-recap.pdf`;
    const file = storage.bucket(IMPACT_BUCKET).file(pdfPath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error('[GCS Impact] Error checking PDF exists:', error);
    return false;
  }
}

/**
 * Get service account email from GCP metadata server
 * Returns the email of the service account running this instance
 */
async function getServiceAccountEmail(): Promise<string | null> {
  try {
    const response = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email',
      { 
        headers: { 'Metadata-Flavor': 'Google' },
        signal: AbortSignal.timeout(1000), // 1 second timeout
      }
    );
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if running in Cloud Run/GCE environment
 */
async function isRunningInGCP(): Promise<boolean> {
  const email = await getServiceAccountEmail();
  return email !== null;
}

/**
 * Generate a signed URL for the impact report PDF
 * Path: organizations/{org-slug}/{uuid}/impact-recap.pdf
 * SECURITY: URL expires after 60 minutes
 * 
 * In production (Cloud Run): Service account has signing permissions, 
 *   so getSignedUrl() works directly
 * In development: Falls back to proxy URL that streams through the server
 */
export async function getImpactPdfSignedUrl(
  orgSlug: string,
  uuid: string
): Promise<string | null> {
  // SECURITY: Validate inputs
  if (!validateOrgSlug(orgSlug)) {
    console.warn('[Security] Invalid org slug format in getImpactPdfSignedUrl');
    return null;
  }
  
  if (!validateUuid(uuid)) {
    console.warn('[Security] Invalid UUID format in getImpactPdfSignedUrl');
    return null;
  }
  
  const pdfPath = `organizations/${orgSlug}/${uuid}/impact-recap.pdf`;
  console.log('[GCS Impact] Attempting to get signed URL for:', pdfPath);
  
  try {
    const file = storage.bucket(IMPACT_BUCKET).file(pdfPath);
    
    // Check if file exists first
    const [exists] = await file.exists();
    console.log('[GCS Impact] File exists check:', exists, 'for path:', pdfPath);
    
    if (!exists) {
      console.warn('[GCS Impact] PDF not found:', pdfPath);
      return null;
    }
    
    // Check if we're in GCP environment (Cloud Run)
    const inGCP = await isRunningInGCP();
    
    if (inGCP) {
      // In Cloud Run: Service account can sign URLs directly
      const serviceAccountEmail = await getServiceAccountEmail();
      console.log('[GCS Impact] Running in GCP with service account:', serviceAccountEmail);
      console.log('[GCS Impact] Generating signed URL...');
      
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 60 minutes
        version: 'v4',
      });
      
      console.log('[GCS Impact] Signed URL generated successfully');
      return signedUrl;
    } else {
      // In local development: Use proxy URL (streaming through server)
      console.log('[GCS Impact] Running locally, using proxy URL');
      const proxyUrl = `/api/pdf/${orgSlug}/${uuid}`;
      return proxyUrl;
    }
  } catch (error) {
    console.error('[GCS Impact] Error generating signed URL for path:', pdfPath);
    console.error('[GCS Impact] Error details:', error);
    
    // Fallback to proxy URL on any error
    const proxyUrl = `/api/pdf/${orgSlug}/${uuid}`;
    console.log('[GCS Impact] Falling back to proxy URL:', proxyUrl);
    return proxyUrl;
  }
}

/**
 * Stream PDF file contents from GCS
 * Used by the proxy API route in development
 */
export async function streamImpactPdf(
  orgSlug: string,
  uuid: string
): Promise<{ stream: NodeJS.ReadableStream; contentLength: number } | null> {
  // SECURITY: Validate inputs
  if (!validateOrgSlug(orgSlug) || !validateUuid(uuid)) {
    return null;
  }
  
  try {
    const pdfPath = `organizations/${orgSlug}/${uuid}/impact-recap.pdf`;
    const file = storage.bucket(IMPACT_BUCKET).file(pdfPath);
    
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }
    
    const [metadata] = await file.getMetadata();
    const contentLength = parseInt(metadata.size as string, 10) || 0;
    
    return {
      stream: file.createReadStream(),
      contentLength,
    };
  } catch (error) {
    console.error('[GCS Impact] Error streaming PDF:', error);
    return null;
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
