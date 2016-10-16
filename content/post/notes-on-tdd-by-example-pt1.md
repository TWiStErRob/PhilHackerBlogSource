+++
comments = true
date = "2016-10-16T13:32:57-04:00"
draft = false
share = true
slug = "tdd-and-startups"
tags = ["testing", "tdd by example", "startups"]
title = "TDD and Startups"
+++

Beck introduces *TDD by Example* with a little story meant to show the business value of automated testing:

> Early one Friday, the boss came to Ward Cunningham to introduce him to Peter, a prospective customer for WyCash, the bond portfolio management system the company was selling. Peter said..."I'm starting a new bond fund, and my strategy requires that I handle bonds in different currencies.” The boss turned to Ward, “Well, can we do it?"...The trick now was to make space for the new functionality without breaking anything that already worked. What would happen if Ward just ran the tests? After the addition of a few unimplemented operations to Currency, the bulk of the tests passed. By the end of the day, all of the tests were passing. Ward checked the code into the build and went to the boss. “We can do it,” he said confidently. Let's think a bit about this story. In two days, the potential market was multiplied several fold, multiplying the value of WyCash several fold. The ability to create so much business value so quickly was no accident, however.

This little parable actually reminded me of the way that Steve Freeman and Nat Pryce talk about the business value of automated testing in *Growing Object Oriented Software Guided by Tests*:

>We’ve found that we need two technical foundations if we want to grow a system reliably and to cope with the unanticipated changes that always happen. First, we need constant testing to catch regression errors, so we can add new features without breaking existing ones. For systems of any interesting size, frequent manual testing is just impractical...Second, we need to keep the code as simple as possible, so it’s easier to understand and modify...The test suites in the feedback loops protect us against our own mistakes as we improve (and therefore change) the code.

I think these two snippets are making similar points: automated tests can create immense business value because it allows deep changes to be made to an existing system while preserving confidence that the system will continue working as expected. I think this ability is especially important for startups who are trying to find product-market fit or beat out a competitor.

I sometimes suspect that Facebook's success over Friendster and MySpace is partially due to the fact that they had the automated tests in place to experiment a ton with the features of Facebook and that these experiments let them iterate faster (Zuckerberg actually talks about this in [his "How to Build the Future" episode](https://www.youtube.com/watch?v=Lb4IcGF5iTQ)). Iterating faster, according to Eric Reis in *The Lean Startup*, isn't just the key to maximizing chances of building something people want. It's also a great way to gain a competitive edge:

> The reason to build a new team to pursue an idea is that you believe you can accelerate through the Build-Measure-Learn feedback loop faster than anyone else can. If that’s true, it makes no difference what the competition knows. If it’s not true, a startup has much bigger problems...

I actually think this is one of the most under-rated arguments for TDD. When considering whether to write tests, I suspect a lot of developers think, "Well, I can get it working without tests, so why bother writing them?" Unfortunately, this overlooks the key issue, which, if Beck, Freeman and Pryce, and Reis are right, is this: "How can I structure my system so that I can make the biggest possible changes while maintaining confidence that the functionality is correct?"<sup>1</sup> If TDD folks are right, moreover, the answer to this key question is of course to do TDD.

If this is right, then it means that a comment that Beck makes later on in the first part of TDD by Example may need refinement. He says:

>For TDD to make economic sense, you'll need to be able to either write twice as many lines per day as before, or write half as many lines for the same functionality. You'll have to measure and see what effect TDD has on your own practice. Be sure to factor debugging, integrating, and explaining time into your metrics, though.

This remark may in fact be consistent with the idea that there's immense value in the flexible architectures that emerge as a result of TDD. Its hard to tell exactly what Beck is saying here. Beck's intent aside, I think this passage should have made it clearer that there's a lot of value in being able to change code confidently, and this may make TDD worth it even if we wind up writing more code when we factor in the code we need to write tests.

### Notes:

1. Of course, if you're not building a product whose features are likely to change, then this argument for testing doesn't apply.
