'use client';

import { Maximize2, Minus, Plus } from 'lucide-react';
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type {
  WorkflowPreview,
  WorkflowPreviewEdge,
  WorkflowPreviewNode,
} from '../../../lib/workflow-catalog-core';

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const BOUNDS_PADDING = 56;
const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

const CONTROL_CLASS =
  'inline-flex h-11 w-11 items-center justify-center rounded-lg border border-fd-border bg-fd-background/85 text-fd-muted-foreground transition-colors hover:border-fd-primary/35 hover:text-fd-foreground disabled:cursor-not-allowed disabled:opacity-35';

const NODE_TONES: Readonly<Record<string, string>> = {
  answer: '#2563eb',
  end: '#2563eb',
  'if-else': '#d97706',
  iteration: '#db2777',
  'iteration-start': '#db2777',
  'knowledge-retrieval': '#0891b2',
  llm: '#7c3aed',
  'parameter-extractor': '#ea580c',
  start: '#0d9488',
  'template-transform': '#4f46e5',
};

export interface WorkflowPreviewBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowPreviewEdgeGeometry {
  labelX: number;
  labelY: number;
  path: string;
}

interface PreviewPan {
  x: number;
  y: number;
}

interface DragState {
  clientX: number;
  clientY: number;
  pan: PreviewPan;
  pointerId: number;
}

export interface WorkflowPreviewFlowProps {
  name: string;
  preview: WorkflowPreview;
}

function nodeTone(type: string): string {
  return NODE_TONES[type] ?? '#64748b';
}

function isContainerNode(node: WorkflowPreviewNode): boolean {
  return node.type === 'iteration' || node.type === 'loop';
}

function displayNodeType(type: string): string {
  return type.replaceAll('-', ' ').replaceAll('_', ' ').toUpperCase();
}

export function truncatePreviewLabel(value: string, limit = 30): string {
  const characters = Array.from(GRAPHEME_SEGMENTER.segment(value), ({ segment }) => segment);
  if (characters.length <= limit) return value;
  return `${characters.slice(0, Math.max(1, limit - 1)).join('')}…`;
}

export function workflowPreviewBounds(preview: WorkflowPreview): WorkflowPreviewBounds {
  if (preview.nodes.length === 0) {
    return { height: 2 * BOUNDS_PADDING, width: 2 * BOUNDS_PADDING, x: 0, y: 0 };
  }

  const minX = Math.min(...preview.nodes.map((node) => node.x));
  const minY = Math.min(...preview.nodes.map((node) => node.y));
  const maxX = Math.max(...preview.nodes.map((node) => node.x + node.width));
  const maxY = Math.max(...preview.nodes.map((node) => node.y + node.height));

  return {
    height: Math.max(1, maxY - minY) + 2 * BOUNDS_PADDING,
    width: Math.max(1, maxX - minX) + 2 * BOUNDS_PADDING,
    x: minX - BOUNDS_PADDING,
    y: minY - BOUNDS_PADDING,
  };
}

export function workflowPreviewEdgeGeometry(
  edge: WorkflowPreviewEdge,
  nodesById: ReadonlyMap<string, WorkflowPreviewNode>,
): WorkflowPreviewEdgeGeometry | null {
  const source = nodesById.get(edge.source);
  const target = nodesById.get(edge.target);
  if (source === undefined || target === undefined) return null;

  const sourceX = source.x + source.width;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x;
  const targetY = target.y + target.height / 2;
  const direction = targetX >= sourceX ? 1 : -1;
  const bend = Math.max(48, Math.abs(targetX - sourceX) * 0.42);
  const controlOneX = sourceX + direction * bend;
  const controlTwoX = targetX - direction * bend;
  const labelX = (sourceX + 3 * controlOneX + 3 * controlTwoX + targetX) / 8;
  const labelY = (sourceY + 3 * sourceY + 3 * targetY + targetY) / 8;

  return {
    labelX,
    labelY,
    path: [
      'M',
      sourceX,
      sourceY,
      'C',
      controlOneX,
      sourceY,
      controlTwoX,
      targetY,
      targetX,
      targetY,
    ].join(' '),
  };
}

function viewBoxFor(
  bounds: WorkflowPreviewBounds,
  zoom: number,
  pan: PreviewPan,
): WorkflowPreviewBounds {
  const width = bounds.width / zoom;
  const height = bounds.height / zoom;
  return {
    height,
    width,
    x: bounds.x + (bounds.width - width) / 2 + pan.x,
    y: bounds.y + (bounds.height - height) / 2 + pan.y,
  };
}

function clampPan(pan: PreviewPan, bounds: WorkflowPreviewBounds, zoom: number): PreviewPan {
  if (zoom <= 1) return { x: 0, y: 0 };
  const maxX = (bounds.width - bounds.width / zoom) / 2;
  const maxY = (bounds.height - bounds.height / zoom) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, pan.x)),
    y: Math.max(-maxY, Math.min(maxY, pan.y)),
  };
}

function PreviewContainerNode({ node }: { node: WorkflowPreviewNode }) {
  const tone = nodeTone(node.type);
  return (
    <g data-workflow-container={node.id} data-node-type={node.type} aria-hidden="true">
      <title>{`${node.title} · ${displayNodeType(node.type)}`}</title>
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx="20"
        fill="var(--color-fd-card)"
        stroke={tone}
        strokeOpacity="0.66"
        strokeWidth="2"
        strokeDasharray="8 7"
      />
      <rect
        x={node.x + 1}
        y={node.y + 1}
        width={node.width - 2}
        height="40"
        rx="19"
        fill={tone}
        fillOpacity="0.1"
      />
      <circle cx={node.x + 18} cy={node.y + 21} r="5" fill={tone} />
      <text
        x={node.x + 31}
        y={node.y + 25}
        fill="var(--color-fd-foreground)"
        fontSize="13"
        fontWeight="700"
      >
        {truncatePreviewLabel(node.title, 38)}
      </text>
      <text
        x={node.x + node.width - 15}
        y={node.y + 25}
        fill={tone}
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.08em"
        textAnchor="end"
      >
        {displayNodeType(node.type)}
      </text>
    </g>
  );
}

function PreviewLeafNode({ node }: { node: WorkflowPreviewNode }) {
  const tone = nodeTone(node.type);
  const compact = node.width < 90 || node.height < 64;

  if (compact) {
    return (
      <g data-workflow-node={node.id} data-node-type={node.type} aria-hidden="true">
        <title>{`${node.title} · ${displayNodeType(node.type)}`}</title>
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx="12"
          fill="var(--color-fd-card)"
          stroke={tone}
          strokeWidth="2"
        />
        <path
          d={[
            'M',
            node.x + node.width * 0.38,
            node.y + node.height * 0.3,
            'L',
            node.x + node.width * 0.7,
            node.y + node.height / 2,
            'L',
            node.x + node.width * 0.38,
            node.y + node.height * 0.7,
            'Z',
          ].join(' ')}
          fill={tone}
        />
      </g>
    );
  }

  return (
    <g data-workflow-node={node.id} data-node-type={node.type} aria-hidden="true">
      <title>{`${node.title} · ${displayNodeType(node.type)}`}</title>
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx="15"
        fill="var(--color-fd-card)"
        stroke="var(--color-fd-border)"
        strokeWidth="2"
      />
      <rect x={node.x + 1} y={node.y + 1} width="6" height={node.height - 2} rx="4" fill={tone} />
      <circle cx={node.x + 24} cy={node.y + 23} r="5" fill={tone} />
      <text
        x={node.x + 36}
        y={node.y + 27}
        fill={tone}
        fontSize="10"
        fontWeight="750"
        letterSpacing="0.08em"
      >
        {displayNodeType(node.type)}
      </text>
      <text
        x={node.x + 18}
        y={node.y + 58}
        fill="var(--color-fd-foreground)"
        fontSize="15"
        fontWeight="700"
      >
        {truncatePreviewLabel(node.title)}
      </text>
    </g>
  );
}

export function WorkflowPreviewFlow({ name, preview }: WorkflowPreviewFlowProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PreviewPan>({ x: 0, y: 0 });
  const rawId = useId().replaceAll(':', '');
  const titleId = `workflow-preview-title-${rawId}`;
  const descriptionId = `workflow-preview-description-${rawId}`;
  const markerId = `workflow-preview-arrow-${rawId}`;
  const gridId = `workflow-preview-grid-${rawId}`;
  const bounds = useMemo(() => workflowPreviewBounds(preview), [preview]);
  const nodesById = useMemo(
    () => new Map(preview.nodes.map((node) => [node.id, node] as const)),
    [preview.nodes],
  );
  const containers = useMemo(
    () => preview.nodes.filter((node) => isContainerNode(node)),
    [preview.nodes],
  );
  const leaves = useMemo(
    () => preview.nodes.filter((node) => !isContainerNode(node)),
    [preview.nodes],
  );
  const edgeGeometries = useMemo(
    () =>
      preview.edges.flatMap((edge) => {
        const geometry = workflowPreviewEdgeGeometry(edge, nodesById);
        return geometry === null ? [] : [{ edge, geometry }];
      }),
    [nodesById, preview.edges],
  );
  const viewBox = viewBoxFor(bounds, zoom, pan);

  const updateZoom = useCallback(
    (requested: number) => {
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, requested));
      setZoom(next);
      setPan((current) => clampPan(current, bounds, next));
    },
    [bounds],
  );
  const fitView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const onPointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0 || zoom <= 1) return;
      dragRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        pan,
        pointerId: event.pointerId,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [pan, zoom],
  );
  const onPointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (drag === null || svg === null || drag.pointerId !== event.pointerId) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const next = {
        x: drag.pan.x - ((event.clientX - drag.clientX) * viewBox.width) / rect.width,
        y: drag.pan.y - ((event.clientY - drag.clientY) * viewBox.height) / rect.height,
      };
      setPan(clampPan(next, bounds, zoom));
    },
    [bounds, viewBox.height, viewBox.width, zoom],
  );
  const endPointerDrag = useCallback((event: PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);
  const onKeyDown = useCallback(
    (event: KeyboardEvent<SVGSVGElement>) => {
      const panStep = 32 / zoom;
      let nextPan: PreviewPan | null = null;
      if (event.key === 'ArrowLeft') nextPan = { x: pan.x - panStep, y: pan.y };
      if (event.key === 'ArrowRight') nextPan = { x: pan.x + panStep, y: pan.y };
      if (event.key === 'ArrowUp') nextPan = { x: pan.x, y: pan.y - panStep };
      if (event.key === 'ArrowDown') nextPan = { x: pan.x, y: pan.y + panStep };
      if (nextPan !== null) {
        event.preventDefault();
        setPan(clampPan(nextPan, bounds, zoom));
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        updateZoom(zoom + ZOOM_STEP);
      }
      if (event.key === '-') {
        event.preventDefault();
        updateZoom(zoom - ZOOM_STEP);
      }
      if (event.key === '0') {
        event.preventDefault();
        fitView();
      }
    },
    [bounds, fitView, pan, updateZoom, zoom],
  );

  return (
    <section className="mt-6" aria-labelledby={titleId}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id={titleId} className="text-sm font-semibold text-fd-foreground">
            Workflow map
          </h3>
          <p className="mt-0.5 text-xs text-fd-muted-foreground">
            {preview.nodes.length} nodes · {preview.edges.length} connections · read-only preview
          </p>
        </div>
        <div className="flex items-center gap-1.5" aria-label="Workflow map controls">
          <button
            type="button"
            className={CONTROL_CLASS}
            onClick={() => {
              updateZoom(zoom - ZOOM_STEP);
            }}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out workflow map"
            title="Zoom out"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={CONTROL_CLASS}
            onClick={fitView}
            disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
            aria-label="Fit workflow map to view"
            title="Fit view"
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={CONTROL_CLASS}
            onClick={() => {
              updateZoom(zoom + ZOOM_STEP);
            }}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in workflow map"
            title="Zoom in"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
          <span
            className="min-w-12 text-right font-mono text-[0.68rem] text-fd-muted-foreground"
            aria-live="polite"
          >
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      <div className="relative h-[18rem] overflow-hidden rounded-xl border border-fd-border bg-fd-muted/35 sm:h-[22rem]">
        <svg
          ref={svgRef}
          viewBox={[viewBox.x, viewBox.y, viewBox.width, viewBox.height].join(' ')}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full select-none outline-none"
          style={{
            cursor: zoom > 1 ? 'grab' : 'default',
            touchAction: zoom > 1 ? 'none' : 'pan-y',
          }}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointerDrag}
          onPointerCancel={endPointerDrag}
          data-workflow-preview={name}
        >
          <title>{`${name} workflow map`}</title>
          <desc id={descriptionId}>
            {preview.nodes.length} nodes and {preview.edges.length} directed connections. Use the
            controls to zoom; after zooming, drag the map or use arrow keys to pan.
          </desc>
          <defs>
            <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
              <circle
                cx="1"
                cy="1"
                r="1"
                fill="var(--color-fd-muted-foreground)"
                fillOpacity="0.35"
              />
            </pattern>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="8.2"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-fd-muted-foreground)" />
            </marker>
          </defs>
          <rect
            x={viewBox.x}
            y={viewBox.y}
            width={viewBox.width}
            height={viewBox.height}
            fill={`url(#${gridId})`}
          />

          {containers.map((node) => (
            <PreviewContainerNode key={node.id} node={node} />
          ))}

          {edgeGeometries.map(({ edge, geometry }) => {
            const sourceTone = nodeTone(nodesById.get(edge.source)?.type ?? '');
            const displayLabel =
              edge.label === undefined ? undefined : truncatePreviewLabel(edge.label, 18);
            const labelWidth =
              displayLabel === undefined ? 0 : Math.max(38, displayLabel.length * 8 + 18);
            return (
              <g key={edge.id} data-workflow-edge={edge.id} aria-hidden="true">
                <path
                  d={geometry.path}
                  fill="none"
                  stroke="var(--color-fd-muted-foreground)"
                  strokeOpacity="0.7"
                  strokeWidth="2"
                  markerEnd={`url(#${markerId})`}
                />
                {displayLabel === undefined ? null : (
                  <g data-edge-label={displayLabel}>
                    <rect
                      x={geometry.labelX - labelWidth / 2}
                      y={geometry.labelY - 12}
                      width={labelWidth}
                      height="24"
                      rx="12"
                      fill="var(--color-fd-card)"
                      stroke={sourceTone}
                      strokeWidth="1.5"
                    />
                    <text
                      x={geometry.labelX}
                      y={geometry.labelY + 4}
                      fill={sourceTone}
                      fontSize="10"
                      fontWeight="800"
                      letterSpacing="0.06em"
                      textAnchor="middle"
                    >
                      {displayLabel}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {leaves.map((node) => (
            <PreviewLeafNode key={node.id} node={node} />
          ))}
        </svg>
      </div>

      <div className="sr-only">
        <p>Nodes</p>
        <ol>
          {preview.nodes.map((node) => (
            <li key={node.id}>{`${node.title}, ${displayNodeType(node.type)} node`}</li>
          ))}
        </ol>
        <p>Connections</p>
        <ul>
          {preview.edges.map((edge) => {
            const source = nodesById.get(edge.source)?.title ?? edge.source;
            const target = nodesById.get(edge.target)?.title ?? edge.target;
            return (
              <li key={edge.id}>
                {source} to {target}
                {edge.label === undefined ? null : ` via ${edge.label}`}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
