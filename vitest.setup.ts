import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Testing Library only drains its own async work under fake timers when it
// detects Jest. Without this, user-event calls hang once vi.useFakeTimers() is on.
Object.assign(globalThis, { jest: { advanceTimersByTime: vi.advanceTimersByTime } });

afterEach(cleanup);
