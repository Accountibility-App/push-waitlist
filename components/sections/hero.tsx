"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/waitlist-form";

interface HeroProps {
  refCode?: string | null;
}

export function Hero({ refCode }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Push – dein Fitness-Buddy
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Bleib dran. Setz Ziele. Erreiche sie. Sichere dir jetzt einen Platz auf der Warteliste.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <a href="#waitlist">
            <Button size="lg" className="min-w-[200px]">
              Join the waitlist
            </Button>
          </a>
          <a href="#how-it-works">
            <Button variant="outline" size="lg">
              How it works
            </Button>
          </a>
        </motion.div>
      </div>

      <motion.div
        id="waitlist"
        className="mx-auto mt-16 max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Jetzt anmelden</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            E-Mail bestätigen – fertig. Mit Referrals rückst du nach vorne.
          </p>
          <WaitlistForm refCode={refCode} className="mt-4" />
        </div>
      </motion.div>
    </section>
  );
}
