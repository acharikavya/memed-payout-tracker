
import {
  calculateTargetPayout,
  allocatePayout,
  type Milestone,
} from "../src/services/payout.service";

const milestones: Milestone[] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
  { views: 100_000, payout: 5_000 },
];

describe("calculateTargetPayout", () => {
  it("returns zero below the first milestone", () => {
    expect(calculateTargetPayout(9_999, milestones)).toBe(0);
  });

  it("pays the first milestone at its exact threshold", () => {
    expect(calculateTargetPayout(10_000, milestones)).toBe(500);
  });

  it("selects the highest milestone crossed", () => {
    expect(calculateTargetPayout(75_000, milestones)).toBe(2_000);
  });

  it("selects the highest payout above the final threshold", () => {
    expect(calculateTargetPayout(150_000, milestones)).toBe(5_000);
  });

  it("returns zero when there are no milestones", () => {
    expect(calculateTargetPayout(100_000, [])).toBe(0);
  });
});

describe("allocatePayout", () => {
  it("pays only the additional amount due", () => {
    expect(allocatePayout(2_000, 500, 5_000)).toEqual({
      targetPayout: 2_000,
      additionalPayout: 1_500,
      totalPaid: 2_000,
    });
  });

  it("never allocates more than the remaining budget", () => {
    expect(allocatePayout(2_000, 0, 1_000)).toEqual({
      targetPayout: 2_000,
      additionalPayout: 1_000,
      totalPaid: 1_000,
    });
  });

  it("does not pay twice after the target has been paid", () => {
    expect(allocatePayout(2_000, 2_000, 1_000)).toEqual({
      targetPayout: 2_000,
      additionalPayout: 0,
      totalPaid: 2_000,
    });
  });

  it("does not pay anything when the budget is exhausted", () => {
    expect(allocatePayout(5_000, 0, 0)).toEqual({
      targetPayout: 5_000,
      additionalPayout: 0,
      totalPaid: 0,
    });
  });
});
