import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Push</p>
        <nav className="flex gap-6 text-sm">
          <Link href="/impressum" className="text-muted-foreground hover:text-foreground">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-muted-foreground hover:text-foreground">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
