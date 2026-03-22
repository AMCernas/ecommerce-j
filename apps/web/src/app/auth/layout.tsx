import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <span className="text-3xl">🌱</span>
            <span className="font-bold text-xl text-green-700">Jardín Verde</span>
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
