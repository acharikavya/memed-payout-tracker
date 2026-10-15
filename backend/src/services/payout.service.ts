
export interface Milestone {
  views: number;
  payout: number;
}

export interface PayoutAllocation {
  targetPayout: number;
  additionalPayout: number;
  totalPaid: number;
}

export function calculateTargetPayout(
  views: number,
  milestones: readonly Milestone[],
): number {
  if (!Number.isSafeInteger(views) || views < 0) {
    throw new Error("Views must be a non-negative safe integer");
  }

  // Find the last milestone whose view threshold has been reached.
  let low = 0;
  let high = milestones.length - 1;
  let targetPayout = 0;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const milestone = milestones[mid];

    if (milestone.views <= views) {
      targetPayout = milestone.payout;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return targetPayout;
}

export function allocatePayout(
  targetPayout: number,
  alreadyPaid: number,
  remainingBudget: number,
): PayoutAllocation {
  for (const amount of [targetPayout, alreadyPaid, remainingBudget]) {
    if (!Number.isSafeInteger(amount) || amount < 0) {
      throw new Error("Payout amounts must be non-negative safe integers");
    }
  }

  if (alreadyPaid > targetPayout) {
    throw new Error("Amount already paid exceeds the target payout");
  }

  const due = targetPayout - alreadyPaid;
  const additionalPayout = Math.min(due, remainingBudget);

  return {
    targetPayout,
    additionalPayout,
    totalPaid: alreadyPaid + additionalPayout,
  };
}
