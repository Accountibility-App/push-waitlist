"use client";

import { motion } from "framer-motion";
import { Target, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const items = [
  {
    icon: Target,
    title: "Klare Ziele",
    description: "Setze messbare Ziele und behalte Fortschritt im Blick.",
  },
  {
    icon: Zap,
    title: "Einfach & schnell",
    description: "Minimaler Aufwand, maximale Wirkung – für den Alltag gemacht.",
  },
  {
    icon: Users,
    title: "Gemeinsam stärker",
    description: "Mit Freunden oder Teams motiviert ihr euch gegenseitig.",
  },
];

export function ValueProps() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          Warum PUSH?
        </motion.h2>
        <motion.p
          className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          Ein Tool, das sich deinem Alltag anpasst – nicht umgekehrt.
        </motion.p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <item.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
