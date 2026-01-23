/**
 * Impact Report Page - Password Protected
 * URL: /[org]/[uuid]
 * 
 * Reads impact report data from c4-impact GCS bucket
 * Path: organizations/{org-slug}/{uuid}/metadata.json
 * Server-side password enforcement
 */

import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { getImpactReportByOrgAndUuid, verifyImpactPassword, checkImpactPdfExists } from '@/lib/services/gcs-impact.service';
import { checkRateLimit, validateUuid, validateOrgSlug } from '@/lib/security/validation';
import { PasswordPrompt } from './password-prompt';
import { ImpactViewer } from './impact-viewer';

interface PageProps {
  params: Promise<{
    org: string;
    uuid: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: 'Impact Report | Code Four',
    description: 'View your trial impact report',
    robots: 'noindex, nofollow',
  };
}

export default async function ImpactPage({ params }: PageProps) {
  const { org, uuid } = await params;
  
  // SECURITY: Validate URL params at entry point
  if (!validateOrgSlug(org) || !validateUuid(uuid)) {
    console.warn('[Security] Invalid URL params:', { org: org?.substring(0, 10), uuidLen: uuid?.length });
    notFound();
  }
  
  try {
    // SECURITY: Rate limiting
    const headersList = await headers();
    const clientIp = 
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      headersList.get('cf-connecting-ip') ||
      '0.0.0.0';
    
    if (!checkRateLimit(clientIp)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">Too Many Requests</h1>
            <p className="text-white/60">
              Please wait a moment before trying again.
            </p>
          </div>
        </div>
      );
    }
    
    // 1. Read impact report from GCS
    const impactData = await getImpactReportByOrgAndUuid(org, uuid);
    
    // 2. Check if password is required (always required for impact reports)
    const requiresPassword = !!impactData.metadata.password_hash;
    
    if (requiresPassword) {
      const cookieStore = await cookies();
      const sessionPassword = cookieStore.get(`impact_pwd_${org}_${uuid}`)?.value;
      
      if (!sessionPassword) {
        return <PasswordPrompt org={org} uuid={uuid} />;
      }
      
      // SECURITY: Server-side password verification
      const isValid = await verifyImpactPassword(org, uuid, sessionPassword);
      
      if (!isValid) {
        return <PasswordPrompt org={org} uuid={uuid} error="Incorrect password" />;
      }
    }
    
    // 3. Check if PDF exists for download button
    const hasPdf = await checkImpactPdfExists(org, uuid);
    
    // 4. Render impact viewer with PDF availability and org/uuid for download action
    return <ImpactViewer data={impactData} hasPdf={hasPdf} org={org} uuid={uuid} />;
    
  } catch (error) {
    console.error('[Impact Page] Error:', error);
    notFound();
  }
}
