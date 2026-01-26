"use client";

import { Button } from "./Button";
import { PinInputs } from "./PinInputs";

export function Lobby() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 md:px-[15vw]">
      <div className="mb-20">
        <a href="/">
          <h1 className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            oop
          </h1>
        </a>
      </div>

      <div className="space-y-16 max-w-md">
        <div className="space-y-4">
          <form method="post" action="/create">
            <Button type="submit" className="group w-full">
              <span>Create Room</span>
              <span className="absolute inset-0 border border-primary group-hover:border-foreground transition-colors translate-x-1 translate-y-1 -z-10" />
            </Button>
          </form>
          <p className="font-mono text-xs text-muted-foreground tracking-[0.15em]">
            Start a new session
          </p>
        </div>

        <div className="w-12 h-px bg-border" />

        <div className="space-y-5">
          <form method="get" action="/join" id="join-form">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em] mb-5">
              Join existing room
            </p>
            <input type="hidden" name="code" id="room-code-input" />
            <div data-pin-wrapper>
              <PinInputs />
            </div>
            <p className="font-mono text-xs text-muted-foreground/60 tracking-widest mt-5">
              Enter 4-digit code
            </p>
          </form>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 md:left-[15vw]">
        <p className="font-mono text-xs text-muted-foreground/40 tracking-[0.15em]">
          P2P · E2EE · No storage
        </p>
      </div>
    </div>
  );
}
