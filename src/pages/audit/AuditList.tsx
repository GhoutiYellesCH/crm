import { useTranslation } from "react-i18next";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditList() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("audit.title")}</h1>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("audit.new")}
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed rounded-lg">
        <Shield className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">{t("common.noData")}</p>
        <p className="text-xs mt-1 opacity-60">Phase 7 — Coming soon</p>
      </div>
    </div>
  );
}
