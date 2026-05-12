import * as React from "react";
import { Camera, Mic, Sparkles, Shield, type LucideIcon } from "lucide-react";
import { landing } from "@/lib/landing-content";

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  mic: Mic,
  sparkles: Sparkles,
  shield: Shield,
};

export function FeatureStripSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden bg-border lg:grid-cols-4">
        {landing.feature_strip.map((item) => {
          const Icon = ICONS[item.icon_name] ?? Sparkles;
          return (
            <div
              key={item.title}
              className="group flex flex-col gap-2 bg-background p-6 transition-colors hover:bg-card sm:p-8"
            >
              <Icon className="size-5 text-primary transition-transform group-hover:scale-110" />
              <h3 className="mt-2 text-base font-semibold tracking-tight">{item.title}</h3>
              <p className="text-pretty text-sm text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
