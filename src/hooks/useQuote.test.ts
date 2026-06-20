import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuote } from "./useQuote";

describe("useQuote", () => {
  it("초기 result는 기본 입력으로 계산됨", () => {
    const { result } = renderHook(() => useQuote());
    expect(result.current.result.tco).toBeGreaterThan(0);
  });
  it("set으로 기기 수량 변경 시 result 재계산", () => {
    const { result } = renderHook(() => useQuote());
    act(() => result.current.set("devices", { note: 2, notePin: 0, notePro: 0 }));
    expect(result.current.result.hardwareCost).toBe(538000);
  });
});
