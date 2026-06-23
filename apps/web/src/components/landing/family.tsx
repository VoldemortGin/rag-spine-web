/**
 * The "Spine Family" section. One card per family member, each linking to its
 * own documentation site. Card styling mirrors the feature grid so the section
 * reads as part of the same landing page.
 */
import { ArrowUpRight } from 'lucide-react';
import { FAMILY, type FamilyMember } from '@/lib/family';
import { familyKey } from '@/lib/shared';

function FamilyCard({ member }: { member: FamilyMember }) {
  const { name, tagline, url } = member;
  const current = member.key === familyKey;
  return (
    <a
      href={url}
      target={current ? undefined : '_blank'}
      rel={current ? undefined : 'noreferrer'}
      className="group relative flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card/40 p-6 transition-colors hover:border-fd-primary/40 hover:bg-fd-card/70"
    >
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-fd-primary to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"
      />
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-base font-semibold text-fd-foreground">{name}</h3>
        {current ? (
          <span className="rounded-full border border-fd-primary/40 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-fd-primary">
            You are here
          </span>
        ) : (
          <ArrowUpRight
            className="h-4 w-4 text-fd-muted-foreground transition-colors group-hover:text-fd-primary"
            aria-hidden
          />
        )}
      </div>
      <p className="text-sm leading-relaxed text-fd-muted-foreground">{tagline}</p>
    </a>
  );
}

export function FamilyGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FAMILY.map((member) => (
        <FamilyCard key={member.key} member={member} />
      ))}
    </div>
  );
}
