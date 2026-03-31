import type { HTMLAttributes, ReactNode } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

function joinClasses(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** `popcorn-globals.css` 가 로드되어 있어야 합니다. */
export function PopcornContainer({
  children,
  className,
  ...props
}: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={joinClasses(
        "w-full popcorn-container mx-auto space-y-6 md:space-y-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopcornContainerNarrow({
  children,
  className,
  ...props
}: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={joinClasses("w-full popcorn-container-narrow mx-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopcornDashboardCard({
  children,
  className,
  ...props
}: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={joinClasses("popcorn-dashboard-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopcornCardMinTall({
  children,
  className,
  ...props
}: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={joinClasses("popcorn-card-min-tall", className)}
      {...props}
    >
      {children}
    </div>
  );
}
