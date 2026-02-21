"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";

export function ReferralTeaser() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div
          className="rounded-xl border border-border bg-muted/30 p-8 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Gift className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Invite friends, move up</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dein Rang auf der Warteliste wird zuerst durch dein Anmeldedatum bestimmt. Wer Freunde
            einlädt, rückt bei gleichem Datum vor – mehr Referrals = bessere Position. Teile deinen
            persönlichen Link nach der Bestätigung.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
