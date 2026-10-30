import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon, Key, Users, Palette, Globe, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { LANGUAGES, CURRENCIES } from "@/lib/utils";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useUIStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("settings.theme")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
          >
            🌙 {t("theme.dark")}
          </Button>
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
          >
            ☀️ {t("theme.light")}
          </Button>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t("settings.language")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage(lang.code as "en" | "fr" | "ar")}
            >
              {lang.flag} {lang.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t("settings.apiKeys")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { provider: "google_maps", label: "Google Maps / Places API" },
              { provider: "hunter_io", label: "Hunter.io" },
              { provider: "shodan", label: "Shodan" },
              { provider: "apollo", label: "Apollo.io" },
              { provider: "wappalyzer", label: "Wappalyzer" },
            ].map((api) => (
              <div
                key={api.provider}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50"
              >
                <span className="text-sm font-medium">{api.label}</span>
                <Button variant="outline" size="sm">
                  {t("settings.addApiKey")}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Phase 5 — Full API key management coming soon
          </p>
        </CardContent>
      </Card>

      {/* Team Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("settings.users")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Phase 8 — Team user management coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
