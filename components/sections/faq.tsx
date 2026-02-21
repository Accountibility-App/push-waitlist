"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Was passiert mit meinen Daten?",
    a: "Wir speichern nur, was für die Warteliste nötig ist (E-Mail, Plattform, Interesse). Details findest du in der Datenschutzerklärung. Wir geben deine Daten nicht weiter.",
  },
  {
    q: "Bekomme ich Spam?",
    a: "Nein. Du erhältst nur die Bestätigungs-E-Mail und gelegentlich Updates zu Push. Du kannst dich jederzeit abmelden.",
  },
  {
    q: "Wann startet Push?",
    a: "Sobald wir bereit sind, melden wir uns bei allen bestätigten Wartelisten-Nutzern – in der Reihenfolge deines Rangs.",
  },
  {
    q: "Wie funktioniert das Referral-Ranking?",
    a: "Zuerst zählt dein Bestätigungsdatum. Bei gleichem Datum zählt die Anzahl deiner bestätigten Referrals. Mehr Referrals = bessere Position.",
  },
];

export function FAQ() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">FAQ</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Häufige Fragen zu Warteliste und Datenschutz
        </p>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
