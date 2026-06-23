import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { FAMILY } from './family';
import { appName, docsRoute, familyKey, gitConfig } from './shared';

// The "Family" navbar switcher: every Spine site lists all four siblings so a
// reader can hop between them. The current site is highlighted and links to its
// own apex; the others are absolute cross-domain links.
const familyMenu: LinkItemType = {
  type: 'menu',
  text: 'Family',
  items: FAMILY.map((member) => {
    const current = member.key === familyKey;
    return {
      text: member.name,
      description: member.tagline,
      url: member.url,
      external: !current,
      active: current ? 'url' : 'none',
    };
  }),
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported.
      title: (
        <>
          <Logo className="h-6 w-6" />
          <span className="font-mono text-[0.95rem] font-medium tracking-tight">{appName}</span>
        </>
      ),
    },
    links: [
      {
        text: 'Documentation',
        url: docsRoute,
        active: 'nested-url',
      },
      familyMenu,
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
