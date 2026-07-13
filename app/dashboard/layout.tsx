import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#0f172a] text-[#ededed]">
      {/* 40px grid layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to_right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to_bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* SVG noise texture layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        }}
      />

      {/* Foreground layout engine */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
