import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { FAMILY, type FamilyKey } from './family';
import { defaultLocale, localizedRoute, type Locale } from './i18n';
import { appName, docsRoute, familyKey, gitConfig } from './shared';

const navigationCopy: Record<Locale, { documentation: string; workflows: string; family: string }> =
  {
    en: { documentation: 'Documentation', workflows: 'Workflows', family: 'Family' },
    zh: { documentation: '文档', workflows: '工作流', family: 'Spine 家族' },
    ja: { documentation: 'ドキュメント', workflows: 'ワークフロー', family: 'Spine ファミリー' },
    it: {
      documentation: 'Documentazione',
      workflows: 'Flussi di lavoro',
      family: 'Famiglia Spine',
    },
  };

const familyTaglines: Record<Locale, Record<FamilyKey, string>> = {
  en: Object.fromEntries(FAMILY.map((member) => [member.key, member.tagline])) as Record<
    FamilyKey,
    string
  >,
  zh: {
    corespine: '轻量共享核心——领域中立的接口、追踪、LLM、速率限制、配置、队列和一致性测试。',
    ragspine: '面向财务与运营指标的 RAG——防编造并保留来源溯源。',
    spineagent: 'Agent 编排——通过多 LLM 适配器支持 MCP、A2A 和工具循环。',
    pdfspine: '使用纯 Rust 重新实现 PyMuPDF，并在 wheel 中内置 PP-OCRv5。',
  },
  ja: {
    corespine:
      '軽量な共有コア——ドメイン中立のインターフェース、トレース、LLM、レート制限、設定、キュー、適合性テスト。',
    ragspine: '財務・業務指標向け RAG——捏造を防ぎ、出典を追跡します。',
    spineagent: 'Agent オーケストレーション——複数 LLM 対応の MCP、A2A、ツールループ。',
    pdfspine: 'PyMuPDF を純 Rust で再実装し、PP-OCRv5 を wheel に同梱。',
  },
  it: {
    corespine:
      'Core condiviso essenziale: interfacce, tracce, LLM, limiti, configurazione, code e conformità indipendenti dal dominio.',
    ragspine:
      'RAG per metriche finanziarie e operative, con prevenzione delle risposte inventate e provenienza delle fonti.',
    spineagent: 'Orchestrazione di agenti: MCP, A2A e cicli di strumenti con adattatori multi-LLM.',
    pdfspine: 'Reimplementazione di PyMuPDF in puro Rust con PP-OCRv5 incluso nel wheel.',
  },
};

function getFamilyMenu(locale: Locale): LinkItemType {
  return {
    type: 'menu',
    text: navigationCopy[locale].family,
    items: FAMILY.map((member) => {
      const current = member.key === familyKey;
      return {
        text: member.name,
        description: familyTaglines[locale][member.key],
        url: current ? localizedRoute(docsRoute, locale) : member.url,
        external: !current,
        active: current ? 'url' : 'none',
      };
    }),
  };
}

export function baseOptions(locale: Locale = defaultLocale): BaseLayoutProps {
  const copy = navigationCopy[locale];
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
        text: copy.documentation,
        url: localizedRoute(docsRoute, locale),
        active: 'nested-url',
      },
      {
        text: copy.workflows,
        // The workflow gallery is canonical configuration data and remains language-neutral.
        url: '/workflows',
        active: 'url',
      },
      getFamilyMenu(locale),
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
