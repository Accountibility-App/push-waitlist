import { Hero } from "@/components/sections/hero";
import { ValueProps } from "@/components/sections/value-props";
import { ReferralTeaser } from "@/components/sections/referral-teaser";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Background3D } from "@/components/background-3d";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Push – Join the Waitlist",
  description:
    "Join the Push waitlist. Be the first to get access. Invite friends and move up in line.",
};

type SearchParams = Promise<{ ref?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const refCode = params.ref ?? null;
  return (
    <div className="min-h-screen flex flex-col relative">
      <Background3D />
      <div className="relative z-10 flex flex-col flex-1">
        <main className="flex-1">
          <Hero refCode={refCode} />
          <ValueProps />
          <ReferralTeaser />
          <FAQ />
        </main>
        <Footer />
      </div>
    </div>
  );
}
