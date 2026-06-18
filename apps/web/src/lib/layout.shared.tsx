import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { appName, docsRoute, gitConfig } from './shared';

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
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
