import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Modo Claro", icon: Sun },
  { value: "dark", label: "Modo Escuro", icon: Moon },
  { value: "system", label: "Seguir Sistema", icon: Monitor },
] as const;

interface Props {
  className?: string;
  /** "options" = three-button selector (mobile surfaces); "icon" = single toggle button (desktop header). */
  variant?: "options" | "icon";
}

/** Theme selector; preference persists in localStorage ('theme') without login. */
export function ThemeToggle({ className, variant = "options" }: Props) {
  const { setTheme, theme = "system", resolvedTheme = "light" } = useTheme();

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Alternar entre modo claro e escuro"
        title="Alternar tema"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className={cn("relative h-8 w-8 hover:bg-muted hover:text-foreground", className)}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    );
  }

  return (
    <div role="radiogroup" aria-label="Tema do aplicativo" className={cn("inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5", className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors",
            theme === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
