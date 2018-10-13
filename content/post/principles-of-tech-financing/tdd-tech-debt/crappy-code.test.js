const shouldWriteCrappyCode = projects => {
  const bestProject = projects.getStartableProjectWithHighestExpectedValue();  
  const {
    acceleratedDeliveryDate,
    expectedInterest,
    savedTime
  } = bestProject.loan();
  const nextBestProject = projects
    .canStartBy(acceleratedDeliveryDate)
    .sortByHighestExpectedValue()
    .first();
  return (
    nextBestProject.expectedValueFromSoonerDelivery(savedTime) >
    expectedInterest
  );
};

describe("when to write crappy code", () => {
  it("should save your company from death", () => {
    expect(shouldWriteCrappyCode(1e200, 1e20, 0)).toBeTruthy();
  });
  it("shouldn't kill your company", () => {
    expect(shouldWriteCrappyCode(-1e200, 1e20, 0)).toBeFalsy();
  });
});
