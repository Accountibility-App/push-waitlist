import { readFile } from "fs/promises";
import { join } from "path";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Datenschutz – Push",
  description: "Datenschutzerklärung",
};

export default async function DatenschutzPage() {
  const path = join(process.cwd(), "content", "datenschutz.md");
  const content = await readFile(path, "utf-8").catch(() => "# Datenschutz\n\nInhalt nicht geladen.");
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            ← Zurück
          </Button>
        </Link>
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
