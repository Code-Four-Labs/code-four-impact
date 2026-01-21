'use server';

import { cookies } from 'next/headers';
import { verifyImpactPassword } from '@/lib/services/gcs-impact.service';

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
