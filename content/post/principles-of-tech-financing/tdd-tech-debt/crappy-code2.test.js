const shouldWriteCrappyCode = (projects, currentResources) =>
  projects.reduce(
    (acc, { businessValue, interest }) => acc + (businessValue - interest),
    currentResources
  ) > 0;

describe("when to write crappy code", () => {
  describe("should allow your company to make smart bets", () => {
    it("should allow your company to bet on accounts", () => {
      expect(
        shouldWriteCrappyCode(
          [
            { businessValue: 100, interest: 50, expectation: 0.8 },
            {
              businessValue: 100,
              interest: 0,
              expectation: 0.2
            }
          ],
          100
        )
      ).toBeTruthy();
    });
    it("should allow your company to bet on engineering", () => {
      expect(
        shouldWriteCrappyCode(
          [
            { businessValue: 100, interest: 50, expectation: 0.2 },
            {
              businessValue: 100,
              interest: 0,
              expectation: 0.8
            }
          ],
          100
        )
      ).toBeFalsy();
    });
  });
});
