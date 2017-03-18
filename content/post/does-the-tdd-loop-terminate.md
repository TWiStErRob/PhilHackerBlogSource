+++
share = true
menu = ""
draft = true
title = "Does the TDD loop terminate?"
slug = "does-the-tdd-loop-terminate"
comments = true
author = ""
date = "2017-03-13T17:31:42-04:00"
tags = [
  "testing",
  "architecture",
]
image = ""
+++

# This post is stupid and probably should be deleted

![Ascending Descending Escher](/images/ascending-and-descending-escher.jpg)

TDD, like climbing a typical staircase, is a finite procedure: Write a failing test. Write the code to make it pass.

If, however, you placed yourself in this remarkable optical illusion, and if I asked you climb to the top of the stairs, you would be stuck in an infinite loop. This impossible structure is called the "Penrose stairs." 

If some of [Uncle Bob's recent remarks](http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html) on TDD and architecture are correct, then "doing TDD right" may actually be more like climbing Penrose stairs that ordinary ones. On this view, TDD may force us into a kind of infinite Penrosian climb towards better design. Since we're finite, an infinite climb is one we can't attempt, so TDD winds up looking useless with respect to improving our design. 

I don't think TDD is useless, so I'm committed to thinking that either Uncle Bob has made a mistake in his recent article or, perhaps less presumptuously, that the obvious interpretation of Uncle Bob's article is wrong. Uncle Bob is likely smarter than me and definitely more experienced than me. Moreover, I'm sympathetic with Uncle Bob on a lot of issues, but I found the central point in his recent blog post to be either unclear and unhelpful or just wrong. 

Uncle Bob made this point in response to the charge that TDD damages our designs by making production code harder to change, so in this post, I try to do three things:

1. Say why Uncle Bob's view leads to a non-terminating TDD loop
1. Offer an alternative explanation for why tests can make production code hard to change
1. Show how this explanation breaks the TDD loop.

### A Non-terminating TDD loop  

Uncle Bob's central concern in his post is the idea that TDD harms your architecture by making your code harder to change. The specific complaint was this:

>The more tests you have, the harder it is to change the production code; because so many tests can break and require repair. Thus, tests make the production code rigid.

His basic response is that the reason so many tests are breaking with small production code changes is because the tests are poorly designed. He then admits that if we don't apply design principles to our tests, then TDD can actually make the design of our code worse:

>Can TDD harm your design and architecture? Yes! If you don’t employ design principles to evolve your production code, if you don’t evolve the tests and code in opposite directions, if you don’t treat the tests as part of your system, if you don’t think about **decoupling, separation and isolation**, you will damage your design and architecture – TDD or no TDD.

For a while now, [I've been claiming]({{<relref "what-unit-tests-are-trying-to-tell-us-about-activities-pt-1.md">}}), following Steve Freeman and Nat Pryce, that TDD helps us write android code that's loosely coupled and highly cohesive.<sup>1</sup> I think that this is a pretty standard view about the architectural benefits of doing TDD. It seems likely that even Uncle Bob would agree that TDD helps us design code that has these properties:

>this does not mean that designs do not emerge from TDD – they do; just not at the highest levels. The designs that emerge from TDD are one or two steps above the code; and they are intimately connected to the code, and to the red-green-refactor cycle

[David Laprade](https://davidlaprade.github.io), a fellow philosophical hacker, pointed out that if Uncle Bob is right in claiming that doing TDD well requires that our test code is *already loosely coupled and highly cohesive code*, then there's a problem with the idea that doing TDD can actually provide any design insight. I think the problem is that we could never actually finish test driving any code. We'd be stuck in a loop:

{{< highlight java "style=default" >}}

class Programmer {

  void work() {
    Code code = new Code();
    testDrive(code) // makes the code loosely coupled an highly cohesive
  }

  void testDrive(code) {
    Code testCode = new TestCode();
    /* 
      test code must be loosely coupled and highly cohesive 
      in order provide design insight, so we test drive it
    */
    testDrive(testCode);
    // Never executed :(  
    testCode.driveLooseCoupling(code);
    testCode.driveHighCohesion(code);
  }
}
{{< / highlight >}}

You could escape this infinite loop by saying that you can *always easily* write loosely coupled and highly cohesive test code without test driving it, but that would be hard sell, and in any case, that response isn't available to Uncle Bob since the main point of his article is that tests can be poorly designed, which means that it isn't always easy to write loosely coupled and highly cohesive test code. 

I'm going to make the following argument for the remainder of this post:

1. The relevant solution to fragile tests problem that Uncle Bob is describing is -- as the book he links suggests -- about encapsulating the SUT, not about evolving production and test code "in opposite directions" and "think[ing] about decoupling, separation and isolation." 

1. Encapsulating the SUT is a natural consequence of eliminating duplication, the third step in the TDD process as stated by Kent Beck.<sup>3</sup> This means that if you follow Kent Beck's style of TDD, you can't have fragile tests in the first place. 

1. If eliminating duplication is the only design principle you need to get the rest of the design insights for TDD, then TDD still looks like a pretty good way to drive your code to be loosely coupled and highly cohesive.

I'm an Android developer, so the our guiding example will be Android-centric. We'll look at some code from the Google I/O app. You should be able to follow along even if you aren't an android dev.

### Fragile tests? Encapulsate the SUT

Let's start by looking at an example of some fragile tests.
The "decoupling, separation, and isolation" Martin mentions here is closely related to his idea of "evolving tests and code in opposition directions":

>As tests of ever greater complexity and constraint are added to the suite, the production code continues to grow in response. From time to time, relatively frequently, the programmers clean that production code up. They may extract new classes. They may even pull out new modules. And yet the tests remain unchanged. The tests still cover the production code; but they no longer have a similar structure.

>And so, to bridge the different structure between the tests and the production code, an API emerges. This API serves to allow the two streams of code to evolve in very different directions, responding to the opposing forces that press upon tests and production code.

### Duplication is symptom, encapsulation the cure

### So, The TDD Loop Terminates

### Notes: 

1. Steve Freeman and Nat Pryce, *Growing Object Oriented Software Guided by Tests*, 43.

1. Kent Beck, *TDD By Example*, x.