+++
draft = true
date = 2018-10-11T19:27:11-04:00
slug = "principles-of-tech-financing"
tags = ["programming","startups"]
image = "/images/debt.jpg"
comments = true	# set false to hide Disqus
share = true	# set false to hide share buttons
menu= ""		# set "main" to add this content to the main menu
author = ""
title = "Why I'm Bad at Managing Tech Debt"
+++

I _love_ programming. Unfortunately, I think my love for programming often gets in the way of thinking clearly about how to manage technical debt. Since technical debt management is one of the key responsibilities of technology leadership, there's some irony here: my love for programming actually makes me a crappier technology leader.[^1]

Specifically, I think this irony plays out in two ways: I often wind up focusing on technical goals that aren't aligned with business goals and even when I'm focused on business goals, my thinking about how to manage technical debt to achieve those goals is shallow.

For example, recently, I rewrote some code that I couldn't stand looking at anymore and it led to some pretty subtle bugs that took a long time for us to discover and fix. This was a bad call, and it made me wonder why I'm so bad at making decisions about technical debt.

Here's what I came up with:

Because of how much I like programming, the way that I think about technical debt is, at best, undisciplined and, at worst, actively hostile to the goals of a startup.

## Hostile and Undisciplined: On Typical Tech-debt Thinking


### Hostile

Let's start with misaligned technical goals. 

It shouldn't surprise me that the technical goals I have are often misaligned with the business. After all, programmers are often given permission to satisfy their hacker urges and "fix" whatever is urking them about their code. I once attended a conference where an engineer from Yahoo! told me about a "developer happiness" card they could play during sprint planning to justify spending time rewriting some bad code. The authors of _Peopleware_ even go as far as suggesting that ensuring developer happiness is the optimal way build successful products:

>We all tend to tie our self-esteem strongly to the quality of the product we product...A market-derived quality standard seems to make good sense only as long as you ignore the effect on the builder's attitude and effectiveness...Quality, far beyond that required by the end user, is a means to higher productivity.[^2]

I certainly hope this isn't true. Startups are hard enough as it is without having to worry about appeasing our seemingly fragile egos as programmers. A startup can often turn into a war to survive, and I really hope that I can build a team of soldiers who aren't stuck in their trenches polishing their rifles because it makes them feel better while I'm trying to take a hill.

Beyond merely hoping that this isn't true, Marty Cagan --- former product leader at HP, ebay, and Netscape --- notes that there are teams made of people who are "missionaries, not mercenaries."[^3] These are people who are passionate about the mission of the company rather than simply sticking around for some other extrinsic gain, which, in this case, is the opportunity to write quality code that solves interesting problems. This suggests that the authors of _Peopleware_ are wrong. We can have stellar, motivated teams without necessarily building a product whose quality outstrips market demand.

I'm not saying that there's anything wrong with caring about quality or interesting problems.[^4] I just think that at a startup, the mission has to come first. Because startups don't have many resources, we put ourselves in a precarious position insofar as we prioritize our hacker aesthetic over business goals.

### Undisciplined

'Nuff said about misaligned technical goals. Let's move on to undisciplined thinking about technical debt. Even when we're focused on business goals, the decisions we make around technical debt aren't really grounded in any deep thinking about the impact of that debt on the business.

Our gut feelings about the risks and impact of technical debt are not enough. These intuitive judgments are going to run through the affect heuristic, a mental shortcut we use to judge the riskiness of X by considering our emotional reaction towards X. As programmers, we don't like crap code, so we're likely to over-estimate the risk that code poses to the business. 

Presumably, this is a part of why I found the following statements so surprising when I first read them, and it's why I'm willing to bet you'll find them surprising as well:

>Good engineering is maybe 20 percent of a project's success. Bad engineering will certainly sink projects, but modest engineering can enable project success as long as the other 80 percent lines up right. From this perspective, TDD is overkill.
>
>--Kent Beck, TDD by Example

>For the overwhelming majority of the bankrupt projects we studied, there was not a single technological issue to explain the failure. The cause of failure most frequently cited by our survey participants was “politics.”
>
>--Tom Demarco and Timothy Lister, Peopleware

Here's a second reason to think we're not disciplined with how we manage tech debt: The mark of serious thinking about a problem is often some kind of measurement. In software, we've already seen the development of measuring work with "story points" and "velocity," and lots of software has been built that makes these concepts first-class tools in thinking about software projects. However, this hasn't happened with the concept of technical debt. 

The "technical debt" metaphor can mislead us in our thinking about when to write or re-write crappy code
  it makes us think that its always bad
  its a boogie-man

---

## Notes

[^1]: Hopefully, this suggestion isn't too shocking. I'm not the only one who's suggested that our love for programming might actually make us worse at our jobs. Eric Evans in _Domain Driven Design_ suggests the same thing when he points out that because programmers often don't care about the domain their software models, their code winds up being more complicated and more difficult to maintain than it needs to be.

[^2]: Timothy Lister and Tom Demarco, _Peopleware_ 35-37.

[^3]: "Missionaries vs. Mercenaries," Margy Cagan, https://svpg.com/missionaries-vs-mercenaries/.

[^4]: Erik Dietrich in _Developer Hegemony_ demands more from us here. He says, “You also need to swallow whatever joy you extract from correct, elegant implementations and adopt a willingness to sacrifice Cadillac quality for time to market. You must sell out and believe in selling out, taking your joy of working with the tech and completely compartmentalizing it. Fun with toys is for outside the office. Programming is not a calling, and it’s not a craft. It’s just automation that increases top line revenue through product or reduces bottom line costs through efficiency.” He's probably too extreme on this point, but the deep challenge he's issuing to our hacker sensibilities is worth pondering.

[^5]: This is from the "Technical Debt" entry on Ward's wiki: http://wiki.c2.com/?TechnicalDebt