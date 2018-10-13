const shouldWriteCrappyCode = (projects, currentResources) =>
  projects.reduce(
    (acc, { businessValue, interest }) => acc + (businessValue - interest),
    currentResources
  ) > 0;

describe("when to write crappy code", () => {
  it("shouldn't kill your company", () => {
    expect(
      shouldWriteCrappyCode(
        [
          { businessValue: 0, interest: 1e10 },
          {
            businessValue: 0,  interest: 0
          }
        ],
        100
      )
    ).toBeFalsy();
  });
});
