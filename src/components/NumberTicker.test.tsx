import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberTicker } from "./NumberTicker";

describe("NumberTicker", () => {
  it("최종값을 렌더한다", async () => {
    render(<NumberTicker value={269000} suffix="원" />);
    // 애니메이션 후 최종 텍스트에 269,000 포함
    expect(await screen.findByText(/269,000원/, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
