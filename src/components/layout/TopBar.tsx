import { useTranslation } from "react-i18next";
import { Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { LANGUAGES } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { t } = useTranslation();
  const { theme, language, toggleTheme, setLanguage } = useUIStore();

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/95 backdrop-blur-sm">
      {/* Left: breadcrumb placeholder */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {/* Route title rendered by each page */}
        </span>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-8 px-3">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">
                {currentLang?.flag} {currentLang?.code.toUpperCase()}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as "en" | "fr" | "ar")}
                className="gap-2"
              >
                <span>{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {language === lang.code && (
                  <span className="text-primary text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          title={t("theme.toggle")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
