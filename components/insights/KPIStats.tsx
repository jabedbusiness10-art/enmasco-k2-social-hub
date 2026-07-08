"use client";

import { motion } from "framer-motion";
import { TrendingUp, Heart, Users, Bot, Zap, DollarSign } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import type { KPIMetric } from "@/types/insights";

type KPIStatsProps = {
  metrics: KPIMetric[];
};

const iconMap: Record<string, any> = {
  "Total Reach": TrendingUp,
  "Engagement Rate": Heart,
  "Followers Growth": Users,
  "AI Usage": Bot,
  "Automation Success": Zap,
  "Campaign Performance": DollarSign,
};

export default function KPIStats({ metrics }: KPIStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {metrics.map((metric, index) => {
        const Icon = iconMap[metric.label] ?? TrendingUp;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
          >
            <GlassCard className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">{metric.label}</div>
                <Icon className="h-4 w-4 text-white/60" strokeWidth={1.8} />
              </div>
              <div className="text-2xl font-semibold text-white">{metric.value}</div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
