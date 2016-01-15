---
author: kmdupr33@gmail.com
categories:
- Philosophy
comments: true
date: 2015-01-24T05:20:31Z
slug: why-ayn-rands-psychology-is-probably-wrong
tags:
- coding
- philosophy
- programming
title: Why Ayn Rand's Psychology is Probably Wrong (or trivial)
url: /2015/01/24/why-ayn-rands-psychology-is-probably-wrong/
wordpress_id: 243
---

**Edit: **Some have pointed out that I've misrepresented Ayn Rand's position in this post. From what I can tell, they are right. Either way, I still think the argument presented here is interesting and accurate as long as we change the conclusion to "Psychological egoism is probably wrong (or trivial)"



* * *



I’ve met a surprising number of people in my life who believe that no one is capable of altruism. These people believe that _everyone_ _always_ acts to further their own interests. Many of these people are influenced by Ayn Rand. Back in my philosophy grad student days, we called these people “psychological egoists” and we called the thesis they endorse “psychological egoism.” I think that psychological egoism is either false or trivially true. This is the first of a (two part?) blog series in which I argue for this claim. In this first part of the series, I simply draw a (hacker friendly) distinction between "trivial truth" and "empirical truth" and I use this distinction to clarify my central claim.


## **Two Kinds of Truth**


I've just said that I want to argue psychological egoism is either false or "trivially true." My argument won’t be very convincing if we aren’t clear what claim I’m arguing for in the first place, so let’s take some time to make a distinction between two kinds of truth.


### **Trivial Truth**


What do I mean when I say that something is "trivially true?" To get a grip on what I mean by this phrase, let's think for a second about something that we do everyday when we're writing code: we define constants. [![Screen Shot 2015-01-23 at 10.27.57 PM](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-23-at-10-27-57-pm.png?w=660)](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-23-at-10-27-57-pm.png) When we define a constant, we simply _stipulate_ that an constant is equivalent to some literal value. Because we’ve stipulated that `TRIANGLE` is equal to `“three sided figure,”` any call to `isTriangleAThreeSidedFigure()` will _always_ return `true`. More importantly, `isTriangleAThreeSidedFigure()` will always return `true` because of a stipulation that we made earlier in the code. Because of this, calling `isTriangleAThreeSidedFigure()` is pretty much a waste of time. You would never write a method like this. Analogously, we’d think that anyone who asks “Is a triangle _really_ a three sided figure?,” is just trying to waste our time. We’d reply with, “Did you miss the part in elementary school where we just defined a triangle as a three sided figure?” Moreover, we’d think that anyone who wanted to deny that a triangle was a three sided figure was just choosing to use his words differently. Returning to our coding analogy, we’d treat them as if their source code looked like this: [![Screen Shot 2015-01-23 at 10.46.46 PM](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-23-at-10-46-46-pm.png?w=660)](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-23-at-10-46-46-pm.png) If `TRANGLE` is defined as a `“four sided figure,”` then (obviously) `isTrangleAThreeSidedFigure()` will return `false`, but the method that we’ve written here is equally pointless. We know that it’ll return `false` because of how we defined `TRIANGLE` above. Similarly, if someone wants to redefine the word “triangle” and then proceed to claim that a triangle is not a three-sided figure, arguing with them is pointless. They’ve defined their words so that their claim turns out to be true, so at that point we can say, “Hey, man. Use your words however you want. I’m interested in talking about non-trivial truths.”


### **Empirical Truth**


There’s another kind of truth that’s more interesting. Some claims are true because they “match up” with the world rather than with our own stipulations. "Alan Turing is dead," for example, is a claim that isn’t true by definition. In other words, we haven’t stipulated that the name “Alan Turring” _means _“dead guy.” ****[![Screen Shot 2015-01-23 at 11.04.27 PM](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-23-at-11-04-27-pm.png?w=660)](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-23-at-11-04-27-pm.png)******** **** If we want to know whether Alan Turring is dead, we look around and we do some research. In short, we ask the world, “Is Alan Turring really dead?” [![Screen Shot 2015-01-24 at 12.13.57 AM](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-24-at-12-13-57-am.png?w=660)](http://www.philosophicalhacker.com/wp-content/uploads/2015/01/screen-shot-2015-01-24-at-12-13-57-am.png) The return value for Bob’s `isAlanTurringDead()` call depends on the return value for the identically named method on `TheWorldInWhichWeLive`. It does not depend on any sort of stipulation that Bob (or any other human) came up with. Because of this calling `isAlanTurringDead()` isn't (obviously) pointless. The return value for `isAlanTurringDead()` may be interesting and surprising. Again, the above code illustrates how we actually think about truth in our conversations: If someone claimed that Alan Turring is still alive, we’d certainly want to know what evidence they had for that claim. Unlike the claim that a triangle is a three sided figure, the claim that Alan Turring is still alive is interesting and worth discussing. To sum it up: empirical truths are about the world and they’re interesting to debate. Trivial truths are truths _merely_ because of the definitions of our terms and they aren’t that interesting to debate.


## **So, whats my claim again?**


Now that we’re clear on the distinction between trivial and empirical truths, we’re in a better position to appreciate the thesis for which I’m arguing. Again, that thesis is this: **Psychological egoism is either (empirically) false or trivially true.** In other words, psychological egoism is either an interesting, albeit false claim or its an uninteresting trivial claim that’s true merely in virtue of the definition of the terms used to express it. Let’s flesh this claim out a bit more by thinking again about the claim that Alan Turing is alive. Clearly this claim is false, but suppose that I was debating with someone about this. The first thing I’d do is show them [the wikipedia article](http://en.wikipedia.org/wiki/Alan_Turing) that clearly shows that Alan Turing is dead. Now, let’s suppose that my interlocutor responded with the following:


<blockquote>Well, that article doesn’t really show that Alan Turing is dead! The word “dead” really means “no longer breathing and buried underground.” Since Alan Turing was cremated, he’s not really dead!</blockquote>


If someone responded this way, I’d feel that he was cheating in the debate, and I suspect that you’d feel the same way. I think we’d feel this way because we thought we were discussing a controversial, empirical claim about the world and because we were disappointed to find out that we were disagreeing simply because we were using our words differently. Once we get clear on our definitions, we can both agree that if we define dead as “no longer breathing and buried underground,” Alan Turring isn’t really “dead.”¹ **My central claim is that many psychological egoists make a similar, albeit much more subtle, mistake in their arguments for psychological egoism. **I’ll actually offer my argument for this claim in my next post. If you can’t jive with the distinction that I’ve drawn here between trivial and empirical truths, feel free to skip the next post. I won’t be defending that distinction and my argument relies on it. Notes: 1. I actually have no idea what happened to Alan Turing' body after he died.
