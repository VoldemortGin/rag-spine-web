/**
 * The "Why spineagent" feature grid. Copy is drawn from the project README and
 * docs/llms/overview.md — no invented product claims.
 */
import {
  Bot,
  Boxes,
  type LucideIcon,
  Network,
  Plug,
  RotateCw,
  Share2,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: Bot,
    title: 'Agent protocol',
    body: 'LlmAgent over a corespine LLMProvider, plus FunctionAgent pure-function nodes.',
  },
  {
    icon: Wrench,
    title: 'Tools with provenance',
    body: 'Tool protocol, EchoTool / CalcTool, FunctionTool + the @function_tool decorator.',
  },
  {
    icon: RotateCw,
    title: 'Tool-using loops',
    body: 'ToolUsingAgent + SyntaxToolPolicy offline, FunctionCallingAgent for real function-calling.',
  },
  {
    icon: Network,
    title: 'Orchestration',
    body: 'Coordinator runs agents sequential / parallel / pipeline, with resilient fault-tolerance.',
  },
  {
    icon: Boxes,
    title: 'Agent-as-tool',
    body: 'AgentTool + ChainAgent compose hierarchical, supervisor-style multi-agent systems.',
  },
  {
    icon: Plug,
    title: 'MCP seam',
    body: 'McpClient / McpServer with an OfflineMcpStub and McpClientTool bridge.',
  },
  {
    icon: Share2,
    title: 'A2A seam',
    body: 'A2AAgent with an OfflineA2AStub and an A2AAgentAdapter that joins orchestration.',
  },
  {
    icon: ShieldCheck,
    title: 'Conformance invariants',
    body: 'AGENT / TOOL / POLICY packs any implementation must pass — enforced, not hoped for.',
  },
];

function FeatureCard({ icon: Icon, title, body }: Feature) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card/40 p-6 transition-colors hover:border-fd-primary/40 hover:bg-fd-card/70">
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-fd-primary to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"
      />
      <Icon className="h-5 w-5 text-fd-primary" strokeWidth={1.75} aria-hidden />
      <h3 className="text-base font-semibold text-fd-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-fd-muted-foreground">{body}</p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  );
}
