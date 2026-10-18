# Journeyman reveals and scoring

Each question starts at 10 points, preserving a 100-point maximum over ten answered questions. A correct answer still awards 80 XP; incorrect answers score zero. Skip replaces the current question without awarding or deducting score or XP.

Let H be the initially hidden club count (total stops minus the two visible bookends), f the number of paid reveals divided by H, and s the sequential-reveal count divided by H:

```text
idealPotential = 10 - 8*f - 4*s*(1-f)
```

The formula gives a cumulative target. After each reveal, round that target to the nearest half point, charge at least 0.5 points, and keep the potential at or above 2. Random costs no more than Next from the same state; half-point rounding can make their prices equal. A fully revealed trail always leaves 2 points, irrespective of reveal method.

- Up to `min(9, H)` paid reveals per question.
- Random samples uniformly from unrevealed interior positions; no duplicate positions or bookends.
- Next reveals the earliest hidden position, skipping previous random picks.
- With one hidden club left, both actions become one Final Club action. It has no random discount.
- Reaching the nine-reveal cap can leave some clubs hidden. Buttons disable and report the cap; they must not claim that all clubs were revealed.
- Store each paid position and its method. Automatic disclosure after a correct or incorrect answer does not create paid reveals or deduct points.
- Actual deductions and awarded scores use half-point steps. Round the cumulative target rather than each raw deduction to avoid rounding drift. Button prices are the actual before/after potential difference, so the quoted price exactly matches the score change.
- Reset the reveal history for each new question and round. Results retain reveal counts and sequential counts.
- Each ten-question round allows three skips. Skip replaces the player in the current slot, keeping the question number, completed answers, score, and progress unchanged. It resets guess attempts and starts the replacement at 10 potential points. It never records a failed game or adds a result.
- Replacements exclude every player in the deck and previously discarded players. Prefer the same trail-length difficulty band; fall back to another available band if needed. If there is no eligible replacement, leave state and the skip budget unchanged.
- Skipping is allowed only before any paid reveal on that question; a wrong guess alone does not lock it. Advancing after a correct or incorrect answer is a separate action and remains available when skips are exhausted. Even after skipping on question 10, the user must answer its replacement before completing the round. A new round restores all three skips and avoids the previous deck and discarded players.

Examples: revealing one of four hidden stops leaves 8 points via Random or 7.5 via Next. Revealing two of eight hidden stops gives the same scores. The sole reveal on a three-stop trail costs 8 points and leaves 2.

Blue remains the Submit action. All reveal buttons share the same teal gradient, with their name and actual deduction on one line (for example, "Reveal next club (-1.5 points)"). Skip remains neutral, shows the remaining budget, and disables with an explanatory tooltip after a reveal or when all three skips are used. Narrow containers stack controls to keep their labels intact.
