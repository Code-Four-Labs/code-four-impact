'use server';

import { cookies, headers } from 'next/headers';
import { verifyImpactPassword, getImpactPdfSignedUrl } from '@/lib/services/gcs-impact.service';
import { checkRateLimit, validateOrgSlug, validateUuid } from '@/lib/security/validation';

/**
 * Server Action to verify password and set session cookie
 * SECURITY: Password verification happens server-side only
 */
export async function verifyPasswordAction(
  org: string,
  uuid: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isValid = await verifyImpactPassword(org, uuid, password);
    
    if (!isValid) {
      return { success: false, error: 'Incorrect password' };
    }
    
    // SECURITY: Set session cookie with strict settings
    const cookieStore = await cookies();
    cookieStore.set(`impact_pwd_${org}_${uuid}`, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 600, // 10 minutes
      path: `/${org}/${uuid}`,
    });
    
    return { success: true };
  } catch (error) {
    console.error('[Password Verify Action] Error:', error);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Server Action to get PDF download URL
 * SECURITY: Requires authenticated session, rate limited
 */
export async function getPdfDownloadUrlAction(
  org: string,
  uuid: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  console.log('[PDF Download Action] Called with org:', org, 'uuid:', uuid);
  
  try {
    // SECURITY: Validate inputs
    const orgValid = validateOrgSlug(org);
    const uuidValid = validateUuid(uuid);
    console.log('[PDF Download Action] Validation - org:', orgValid, 'uuid:', uuidValid);
    
    if (!orgValid || !uuidValid) {
      return { success: false, error: 'Invalid request' };
    }
    
    // SECURITY: Rate limiting
    const headersList = await headers();
    const clientIp = 
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      headersList.get('cf-connecting-ip') ||
      '0.0.0.0';
    
    if (!checkRateLimit(clientIp)) {
      return { success: false, error: 'Too many requests. Please try again.' };
    }
    
    // SECURITY: Check session cookie exists (user is authenticated)
    const cookieStore = await cookies();
    const sessionPassword = cookieStore.get(`impact_pwd_${org}_${uuid}`)?.value;
    
    // SECURITY: Check if report requires password
    const { getImpactReportByOrgAndUuid } = await import('@/lib/services/gcs-impact.service');
    let requiresPassword = false;
    try {
      const reportData = await getImpactReportByOrgAndUuid(org, uuid);
      requiresPassword = !!reportData.metadata.password_hash;
    } catch {
      return { success: false, error: 'Report not found' };
    }
    
    // Verify password if required
    if (requiresPassword) {
      if (!sessionPassword) {
        return { success: false, error: 'Authentication required. Please refresh the page.' };
      }
      const isValid = await verifyImpactPassword(org, uuid, sessionPassword);
      if (!isValid) {
        return { success: false, error: 'Session expired. Please refresh the page.' };
      }
    }
    
    // Get signed URL for PDF
    console.log('[PDF Download Action] Getting signed URL...');
    const signedUrl = await getImpactPdfSignedUrl(org, uuid);
    console.log('[PDF Download Action] Signed URL result:', signedUrl ? 'SUCCESS' : 'NULL');
    
    if (!signedUrl) {
      return { success: false, error: 'PDF not available' };
    }
    
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error('[PDF Download Action] Error:', error);
    return { success: false, error: 'Failed to generate download link' };
  }
}
