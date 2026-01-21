import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/codefour/branding/logo.svg"
            width={200}
            height={45}
            alt="Code Four"
            className="mx-auto"
            priority
          />
        </div>

        {/* Learn More Link */}
        <Link
          href="https://codefour.us"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-lg"
        >
          Learn More
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>

        {/* Footer */}
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm">
          © {new Date().getFullYear()} Code Four Labs, Corp.
        </p>
      </div>
    </div>
  );
}
