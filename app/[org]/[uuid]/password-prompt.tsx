'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { verifyPasswordAction } from './actions';

interface PasswordPromptProps {
  org: string;
  uuid: string;
  error?: string;
}

export function PasswordPrompt({ org, uuid, error: initialError }: PasswordPromptProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!password.trim()) {
      setError('Please enter the password');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await verifyPasswordAction(org, uuid, password);
      
      if (!result.success) {
        setError(result.error || 'Incorrect password');
        setIsSubmitting(false);
        return;
      }
      
      router.refresh();
    } catch {
      setError('Verification failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="text-center max-w-[400px] w-full px-4">
        {/* Logo Icon */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/codefour/branding/icon.png"
            alt="Code Four"
            width={64}
            height={64}
            priority
            className="rounded-full"
          />
        </div>

        {/* Heading */}
        <h1 className="text-white text-xl font-light mb-2">
          Password Required
        </h1>

        <p className="text-white/60 text-sm mb-8">
          This impact report is password-protected
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter password"
            disabled={isSubmitting}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-white/5 border text-white text-sm
              font-mono outline-none transition-all
              placeholder:text-white/40
              ${error ? 'border-red-500' : 'border-white/10 focus:border-white/20'}
              ${isSubmitting ? 'opacity-60' : ''}
            `}
            autoFocus
          />

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-3 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full mt-4 py-3 rounded-lg
              bg-white text-black font-medium
              transition-opacity
              ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}
            `}
          >
            {isSubmitting ? 'Verifying...' : 'Access Report'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm">
          <span className="text-white/40">Powered by</span>{' '}
          <a
            href="https://codefour.us"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white/60 transition-colors"
          >
            Code Four
          </a>
        </p>
      </div>
    </div>
  );
}
