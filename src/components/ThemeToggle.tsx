import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Modo Claro", icon: Sun },
  { value: "dark", label: "Modo Escuro", icon: Moon },
  { value: "system", label: "Seguir Sistema", icon: Monitor },
] as const;

/** Three-way theme selector; preference persists in localStorage ('theme') without login. */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme = "system" } = useTheme();
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
