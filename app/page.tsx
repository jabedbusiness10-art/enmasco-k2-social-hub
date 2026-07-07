import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import HeroPanel from "@/components/dashboard/HeroPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505]">

      <Header />

      <div className="flex">

        <Sidebar />

        <section className="flex-1 p-10">
          <HeroPanel />
          <div className="mt-6">
            <DashboardGrid />
          </div>
        </section>

      </div>

    </main>
  );
}
