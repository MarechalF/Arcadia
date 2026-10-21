import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { clsx } from "clsx";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps): React.ReactElement {
  return <div className={clsx("rounded-xl border border-bord bg-carte p-4 shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: DivProps): React.ReactElement {
  return <div className={clsx("mb-3 flex items-center justify-between gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): React.ReactElement {
  return <h2 className={clsx("text-sm font-semibold text-slate-100", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps): React.ReactElement {
  return <div className={clsx("text-sm text-slate-300", className)} {...props} />;
}

type BadgeVariant = "default" | "rigide" | "positif" | "negatif" | "delta";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-slate-800 text-slate-200",
  rigide: "bg-amber-900/60 text-amber-200",
  positif: "bg-emerald-900/60 text-emerald-200",
  negatif: "bg-rose-900/60 text-rose-200",
  delta: "bg-blue-900/60 text-blue-200",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }): React.ReactElement {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>): React.ReactElement {
  return (
    <input
      className={clsx(
        "rounded-md border border-bord bg-slate-900 px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>): React.ReactElement {
  return <label className={clsx("text-xs font-medium text-slate-400", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>): React.ReactElement {
  return (
    <select
      className={clsx(
        "rounded-md border border-bord bg-slate-900 px-2 py-1 text-sm text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className, ...props }: DivProps): React.ReactElement {
  return <div role="separator" className={clsx("h-px w-full bg-bord", className)} {...props} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
  danger: "bg-rose-700 text-white hover:bg-rose-600",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-800",
};

export function Button({ variant = "secondary", className, ...props }: ButtonProps): React.ReactElement {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>): React.ReactElement {
  return (
    <SwitchPrimitive.Root
      className={clsx(
        "peer inline-flex h-5 w-9 items-center rounded-full bg-slate-700 transition-colors data-[state=checked]:bg-blue-600",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[1.125rem]" />
    </SwitchPrimitive.Root>
  );
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>): React.ReactElement {
  return (
    <th
      scope="col"
      className={clsx(
        "border-b border-bord px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>): React.ReactElement {
  return <td className={clsx("border-b border-bord/60 px-3 py-2 text-slate-200", className)} {...props} />;
}
