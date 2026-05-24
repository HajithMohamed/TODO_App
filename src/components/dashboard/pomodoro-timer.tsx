"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const focusSeconds = 25 * 60;
const breakSeconds = 5 * 60;

export function PomodoroTimer() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [remaining, setRemaining] = useState(focusSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current > 1) return current - 1;
        const nextMode = mode === "focus" ? "break" : "focus";
        setMode(nextMode);
        return nextMode === "focus" ? focusSeconds : breakSeconds;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, running]);

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  const progress = useMemo(() => {
    const total = mode === "focus" ? focusSeconds : breakSeconds;
    return Math.round(((total - remaining) / total) * 100);
  }, [mode, remaining]);

  const reset = () => {
    setRunning(false);
    setRemaining(mode === "focus" ? focusSeconds : breakSeconds);
  };

  const switchMode = (nextMode: "focus" | "break") => {
    setMode(nextMode);
    setRunning(false);
    setRemaining(nextMode === "focus" ? focusSeconds : breakSeconds);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Focus Timer</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "focus" ? "Deep work sprint" : "Short reset"}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div
            className="grid size-44 place-items-center rounded-full"
            style={{ background: `conic-gradient(var(--primary) ${progress}%, var(--muted) ${progress}% 100%)` }}
            aria-label={`${progress}% complete`}
          >
            <div className="grid size-36 place-items-center rounded-full bg-card">
              <span className="text-4xl font-semibold tabular-nums">
                {minutes}:{seconds}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant={mode === "focus" ? "default" : "outline"} onClick={() => switchMode("focus")}>
            Focus
          </Button>
          <Button type="button" variant={mode === "break" ? "default" : "outline"} onClick={() => switchMode("break")}>
            Break
          </Button>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <Button type="button" size="icon" variant="outline" aria-label={running ? "Pause timer" : "Start timer"} onClick={() => setRunning((value) => !value)}>
            {running ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Reset timer" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
