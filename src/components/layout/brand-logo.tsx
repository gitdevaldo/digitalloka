import Link from 'next/link';

export function BrandLogo() {
  return (
    <Link href="/" className="brand-logo">
      <span className="brand-box">Digital<span className="brand-loka">Loka</span></span>
    </Link>
  );
}
