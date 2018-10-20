// its recursive because it has to walk ALL implications in order to know if its a good move.
// this implies that tech-debt decisions should be limited in scope or else its hard to know
// whether you're making good decisions. just because at one particular point your interest
// exceeds your dividends, doesn't mean you shouldn't have taken out the loan. nor does it
// mean that you should pay the loan back at that point.

// merely _possible_ interest
const shouldWriteCrappyCode = (projects, possibleInterest) => {
  const recurse = (
    currentProjects,
    value,
    savedTime,
    currentPossibleInterest,
    date
  ) => {
    if (currentProjects.empty()) {
      return value > possibleInterest;
    }
    const bestProject = currentProjects.popStartableProjectWithHighestExpectedValue(
      date
    );
    const { expectedValue, deliveryDate, newPossibleInterest } = bestProject.deliver(
      date,
      savedTime,
      currentPossibleInterest
    );
    return recurse(
      currentProjects,
      value + expectedValue,
      savedTime,
      currentPossibleInterest.add(newPossibleInterest),      
      deliveryDate
    );
  };
  // insights: time is irreducible, projects have only expected value
  const bestProject = projects.popStartableProjectWithHighestExpectedValue(
    new Date()
  );
  const {
    acceleratedDeliveryDate,
    newPossibleInterest,
    savedTime
  } = bestProject.loan();
  return recurse(
    projects,
    0,
    savedTime,
    0,
    possibleInterest.add(newPossibleInterest),
    acceleratedDeliveryDate
  );
};

class Project {
  deliver() {
    return {
      expectedValue:
        this.immediateBusinessValue + this.calculateDividends(savedTime)
    };
  }
  loan(projects) {
    return this.x + projects;
  }
}

class Projects {}

describe("when to write crappy code", () => {
  it("should save your company from death", () => {
    expect(shouldWriteCrappyCode(1e200, 1e20, 0)).toBeTruthy();
  });
  it("shouldn't kill your company", () => {
    expect(shouldWriteCrappyCode(-1e200, 1e20, 0)).toBeFalsy();
  });
});
