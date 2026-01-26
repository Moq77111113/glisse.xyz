import type { JSX, PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<
  JSX.IntrinsicElements["button"] & {
    className?: string;
  }
>;

export function Button(props: Props) {
  const { children, className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`relative cursor-pointer font-mono text-sm uppercase tracking-[0.2em] bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/80 transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
