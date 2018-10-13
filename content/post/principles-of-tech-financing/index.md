+++
draft = true
date = 2018-10-11T19:27:11-04:00
slug = "principles-of-tech-financing"
tags = ["programming","business"]
image = "/images/debt.jpg"
comments = true	# set false to hide Disqus
share = true	# set false to hide share buttons
menu= ""		# set "main" to add this content to the main menu
author = ""
title = "Test Driven Principles of Tech Financing: When to write or re-write crappy code"
+++

Because I'm currently working with 2 startups, I've been thinking a lot about tech debt lately. One startup is _very young_ and doesn't have much technology. They're rocking a concierge MVP and doing a lot of stuff manually. Another startup is more mature and took on some technical debt early to ensure that it could make key moves that helped it survive. Because of this, I'm daily faced with two, related questions:

* When should I take on more technical debt to help the business?
* When should I pay back technical debt the business has already incurred?

Here are some answers to these questions:

* Take on debt if the business would gain more from the tech debt than they'll pay on interest in the tech loan.
* Pay down debt only if the interest the business is paying on that debt over time _t_ is greater than what the business will gain by you doing anything else during time _t_. 

These principles seem obvious, and yet I _know_ that I often don't follow them. In practice, my tech debt principles are often more like the following:

* Take on debt if its 8pm on a Friday and you're still not done.
* Pay down debt when you can't stand to look at that crappy code any longer.

Even when I'm more thoughtful about my tech-debt decisions, I still think I often make bad calls. This post is an attempt improve my decisions about technical debt by bringing to the fore the factors and principles at play when making these decisions. 

One way to do this would be to start with the above first-approximation of principles and then try to defend and refine the principles with examples. This is often how philosophers write papers. 

I think it'll be more fun and maybe more clear to express these principles as functions, the factors as parameters, and the examples as test cases. Then, we can test drive the development of functions that express principles of how we should make tech-debt decisions.

## Test-driving when to Write Crappy Code

### First approximation

Let's start with our first-approximation of what we'll call the "when to write crappy code" principle:

>Take on debt if the business would gain more from the tech debt than they'll pay on interest in the tech loan.

Here's a first approximation at the function:

```javascript
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
```

Here's an easy, extreme example where this principle applies. Lets suppose your startup is a week from going under because you have a critical bug and your only customer is threatening to cancel your contract if the bug is not fixed in one week. And let's suppose that the only way to fix the bug in that time frame is to write truly terrible code. Obviously, in this case, _no matter how bad the code is_, you take on the tech debt to fix the bug. The business gains more from the tech debt (it gets to live) than it'll pay in interest on the tech loan.

We can express this example as a test case:

```javascript
describe('when to write crappy code', () => {
  it("should save your company from death", () => {
    expect(shouldWriteCrappyCode(Infinity, 1e20000000)).toBeTruthy();
  });
});
```

Let's add more nuance to this example. 

On the business side, imagine the same scenario as above, but the customer is giving us 2 weeks to fix the critical bug. However, they really want to see significant results in one week and have made it pretty clear that they'll be pissed if they don't see results. Now, we suspect that they won't actually cancel the contract if they don't see this progress in that time period. They'll just be cheesed off. 

On the technical side, imagine that we can build a solution in one week that will show significant results, but that building this solution will incur some debt that will lead to failing to solve the overall problem in two weeks. However, if we simply miss the 1 week deadline, we can build something that will solve the overall problem in 2 weeks.

In this case, we don't take on the technical debt. The business will pay more on the interest of their tech debt than they'll gain by taking it on. The interest on the tech loan leads to missing the bigger, more important deadline. Engineering should ask accounts to sweet talk the customer out of the 1 week checkpoint deadline. 

With a new test case expressing this, here's where we stand:

```javascript
const shouldWriteCrappyCode = (businessValue, interest) => 
  businessValue > interest;

describe('when to write crappy code', () => {
  it("should save your company from death", () => {
    expect(shouldWriteCrappyCode(1e200, 1e20)).toBeTruthy();    
  });
  it("shouldn't kill your company", () => {
    expect(shouldWriteCrappyCode(-1e200, 1e20)).toBeFalsy();
  });
});
```

Pretty boring so far, but we've already said enough to know that we need to refine our function a bit. In that last example, we had to do a little work to conclude that taking short-cuts for the 1 week checkpoint deadline is actually a bad play. This work is captured when we express the principle in prose, but let's push that work down into the function. To fix this, our function needs to be able to consider multiple commitments, to have a notion of when debt must be paid, and to know the current available resources of a company. Here's what the updated test case would look like:

```javascript
it("shouldn't kill your company", () => {
    expect(
      shouldWriteCrappyCode([
        { businessValue: 0, interest: 1e100 }, // checkpoint deliverable
        { businessValue: 1e100, interest: 0 } // full bug fix
      ], 100) // <- Current business resources
    ).toBeFalsy();
});
```

To get this to pass, the function will _assume_ that projects that occur later in the array depend on projects occurring earlier. Here's the implementation:

```javascript
const shouldWriteCrappyCode = (projects, currentResources) =>
  projects.reduce(
    (acc, { businessValue, interest }) => acc + (businessValue - interest),
    currentResources
  ) > 0;
```

Game over for your startup is represented by the inequality here. If at any point running through your projects, your current resources drops below 0, you lose. 

### Adding Uncertainty

Rarely is our situation so clear cut as the 2 examples I've given above. For example, we are often uncertain about the business value of our projects. It might turn out, to continue the above example, that hitting the checkpoint delivery deadline could delight our customers so much that they forgive us for missing the bigger deadline one week later. We might also be unsure whether we can hit the 2 week deadline at all. We can capture uncertainty in our `projects` parameter:

```typescript
interface Project {
  interest: number
  businessValue: number
  expectation: number // <- between 0 and 1
}

const shouldWriteCrappyCode = (projects: Project[], currentResources) => //...
```

Adding this lets us write a few more test cases:

```typescript
describe("when to write crappy code", () => {
  describe("should allow your company to make smart bets", () => {
    it ("should allow your company to bet on accounts",  () => {
      expect(
        shouldWriteCrappyCode(
          [
            { businessValue: 100, interest: 50, expectation: .9 }, // checkpoint deliverable
            {
              businessValue: 100, interest: 0, expectation: .2 // full bug fix
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
            { businessValue: 100, interest: 50, expectation: .001 }, // checkpoint deliverable
            {
              businessValue: 100, interest: 0, expectation: .8 // full bug fix
            }
          ],
          100
        )
      ).toBeFalsy();
    })
  });
});
```

If writing crappy code can be leveraged by accounts to buy more time and save the company, write crappy code. If the right way is the only way and that means missing a checkpoint deadline, accounts has to deal.


When I first got clear on these principles, I felt that they were so obvious that they were hardly worth writing down.

Of course, there are other ways of thinking about technical debt.

## When to Rewrite Crappy Code

### An Objection: "Let the engineers decide"

## Serious objections

### Following these principles leads to losses in the long-term

## Nuances

### Variable interest rate

### Possible gains

## Implications

### The importance of measuring/data

### More tech debt

### The right tech debt