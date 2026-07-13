import Breadcrumb from "@/components/layout/Breadcrumb";
import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Primary action buttons (right-aligned). */
  actions?: ReactNode;
  /** Optional filter row rendered between description and content. */
  filters?: ReactNode;
};

/**
 * Shared Page Template (PART 10) — every module inherits this exact structure:
 *   Breadcrumb → Page Title → Description → Primary Actions → (Filters) → Content
 * Kept visually neutral (no theme change). Do NOT patch per-page; extend via props.
 */
export default function PageHeader({ title, description, actions, filters }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-white/10 pb-5">
      <Breadcrumb />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-white/55">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {filters && <div className="mt-4 flex flex-wrap items-center gap-2">{filters}</div>}
    </div>
  );
}
