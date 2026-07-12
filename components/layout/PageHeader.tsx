import Breadcrumb from "@/components/layout/Breadcrumb";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

/**
 * Generic page header used by all /dashboard/* routes.
 * Kept visually neutral (no theme change) — wraps breadcrumb + title + description + actions.
 */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
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
    </div>
  );
}
