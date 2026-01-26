import type { FC } from "hono/jsx";
import { Noise } from "./Noise";


export const Layout: FC = (props) => {
  return (
    <div className="min-h-svh bg-background relative">
      <Noise />
      <main class="contents">{props.children}</main>
    </div>
  );
};
