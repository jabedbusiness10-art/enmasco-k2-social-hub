"use client";

import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { TranslationDashboard } from "@/components/localization/TranslationDashboard";
import { LanguageMenu } from "@/components/localization/LanguageMenu";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LocalizationPage() {
  const { t } = useLocale();
  return (
    <div>
      <PageHeader title={t("localization.title")} description="Enterprise multilingual platform — manage languages, translations and regional formatting." />
      <div className="mb-4 flex justify-end"><LanguageMenu /></div>
      <BackupCard className="p-4">
        <TranslationDashboard />
      </BackupCard>
    </div>
  );
}
