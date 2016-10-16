+++
tags = [
  "testing",
  "TDD",
]
comments = true
draft = false
slug = "the-goal-of-refactoring-during-tdd"
share = true
author = ""
title = "The goal of refactoring During TDD"
date = "2016-10-16T16:35:28-04:00"
+++

Red, green, refactor. That's the TDD flow. That much was obvious to me.

However, refactoring is a pretty broad term. There are many reasons you may want to refactor code and as a result of this, I didn't really understand what exactly was supposed to happen during the refactor step of the TDD loop until I finished the first part of Kent Beck's *TDD by Example.*

Actually, in the first description of TDD, Beck uses a more helpful description of the "refactor step." After getting our tests to pass, he says that we should "*refactor to remove duplication.*" This is helpful, as it restricts the reasons we might refactor a piece of code while working. I've sometimes found myself deep down a rabbit-hole of refactoring. This restriction gives me a principled way of determining what I should refactoring.

(As a bit of an aside, it was interesting to see how Beck recommends that we write down the tasks that need to be accomplished in a kind of todo-list. I wonder if I could leverage the TODO feature in most ideas to create this kind of todo-list)

The reason duplication is targeted for elimination is because duplication is indicative of dependency between the code and the test, which means that you can't change one without the other. This thwarts the TDD flow, which demands that after we get a test passing we, we want to write another test that "'makes sense' to us without having to change the code." Beck makes this point even more explicit by saying this:

> By eliminating duplication before we go on to the next test, we maximize our chance of being able to get the next test running with one and only one change.

One thing that's been really interesting about reading Beck's take on TDD is that he really emphasizes how TDD enables us to make progress through *very* small changes. More on that in a second.

Another interesting thing about Beck's take on duplication is how he recommends we spot it:

>Duplication most often takes the form of duplicate logic—the same expression appearing in multiple places in the code.

When I first read this, I thought spotting duplication would merely involve looking for identical if-then statements, but Beck sees duplication in similar *expressions*, even if those expressions aren't expressed in code in identical ways:

>Usually you see duplication between two pieces of code, but here the duplication is between the data in the test and the data in the code.

We see this in his refactoring of the first test he writes. Here's the test code:

{{< highlight java "style=default" >}}
public void testMultiplication() {
   Dollar five= new Dollar(5);
   five.times(2);
   assertEquals(10, five.amount);
}
{{< / highlight >}}

And the model code:

{{< highlight java "style=default" >}}
class Dollar {
  int amount = 10;  
}
{{< / highlight >}}

He reveals the duplication by pointing out that we set `amount` equal to `10` because we've multiplied `5` by `2` in our heads to get the test to pass quickly. If we write our assigmnet of `amount` as `int amount = 5 * 2`, we see that `5` and `2` appear in both the model code and in the test code. That's duplication that's got to go.

The step that Beck takes towards eliminating the duplication is small and it doesn't even really eliminate the duplication:

{{< highlight java "style=default" >}}
class Dollar {  
  void times() {
    amount = 5 * 2;
  }
}
{{< / highlight >}}

He then says something interesting about TDD and the size of the step he took:

>Do these steps seem too small to you? Remember, TDD is not about taking teeny-tiny steps, it's about being able to take teeny-tiny steps. Would I code day-to-day with steps this small? No. But when things get the least bit weird, I'm glad I can...If you can make steps too small, you can certainly make steps the right size. If you only take larger steps, you'll never know if smaller steps are appropriate.

This is interesting, and it points to an issue related to getting stuck down a rabbit-hole of refactoring. I think a part of the reason this rabbit-hole happens, especially during Android development, is because we don't have the tests in place to make very small steps. (Although, I wouldn't be surprised if it happened more often in my case due to lack of discipline.) An inability to make small changes is a huge bummer because if something breaks, your search space for tracking down the bug is going to be large in proportion to the number of changes you've made.
