/**
 * PDF Proxy API Route
 * Streams PDF from GCS for development environments where signed URLs aren't available
 * 
 * SECURITY: 
 * - Validates org slug and UUID format
 * - Rate limited (20 requests per minute per IP)
 * - Requires valid session cookie (same auth as viewing the report)
 * - Only serves PDFs that exist in the expected GCS path
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { streamImpactPdf, verifyImpactPassword, getImpactReportByOrgAndUuid } from '@/lib/services/gcs-impact.service';
import { checkRateLimit, validateOrgSlug, validateUuid } from '@/lib/security/validation';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; uuid: string }> }
) {
  const { org, uuid } = await params;
  
  console.log('[PDF Proxy] Request for org:', org, 'uuid:', uuid);
  
  // SECURITY: Validate inputs (prevents path traversal and injection)
  if (!validateOrgSlug(org) || !validateUuid(uuid)) {
    console.warn('[PDF Proxy] Invalid params - possible attack attempt');
    return new NextResponse('Not Found', { status: 404 });
  }
  
  // SECURITY: Rate limiting (20 requests per minute per IP)
  const headersList = await headers();
  const clientIp = 
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    '0.0.0.0';
  
  if (!checkRateLimit(clientIp)) {
    console.warn('[PDF Proxy] Rate limit exceeded for IP:', clientIp.substring(0, 10) + '...');
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // SECURITY: Check if report exists and requires password
  let requiresPassword = false;
  try {
    const reportData = await getImpactReportByOrgAndUuid(org, uuid);
    requiresPassword = !!reportData.metadata.password_hash;
  } catch {
    // Report doesn't exist or is expired
    return new NextResponse('Not Found', { status: 404 });
  }
  
  // SECURITY: Authenticate session cookie if password is required
  const cookieStore = await cookies();
  const sessionPassword = cookieStore.get(`impact_pwd_${org}_${uuid}`)?.value;
  
  if (requiresPassword) {
    if (!sessionPassword) {
      // No session cookie but password is required - must authenticate first
      console.warn('[PDF Proxy] No session cookie for password-protected report');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const isValid = await verifyImpactPassword(org, uuid, sessionPassword);
    if (!isValid) {
      console.warn('[PDF Proxy] Invalid session password');
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  
  // Stream PDF from GCS
  const result = await streamImpactPdf(org, uuid);
  
  if (!result) {
    console.warn('[PDF Proxy] PDF not found');
    return new NextResponse('Not Found', { status: 404 });
  }
  
  console.log('[PDF Proxy] Streaming PDF, size:', result.contentLength);
  
  // Convert Node.js readable stream to Web ReadableStream
  const webStream = Readable.toWeb(result.stream as Readable) as ReadableStream<Uint8Array>;
  
  return new NextResponse(webStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': result.contentLength.toString(),
      'Content-Disposition': `inline; filename="impact-recap.pdf"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
