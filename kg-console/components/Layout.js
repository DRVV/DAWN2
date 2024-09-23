import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <nav>
        <Link href="/">
          Home
        </Link>
        {/* Add more navigation links if needed */}
      </nav>
      <main>{children}</main>
    </div>
  );
}
