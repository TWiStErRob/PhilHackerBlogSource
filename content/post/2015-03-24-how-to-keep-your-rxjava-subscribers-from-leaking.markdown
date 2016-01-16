---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-03-24T23:56:32Z
slug: how-to-keep-your-rxjava-subscribers-from-leaking
title: How to Keep your RxJava Subscribers from Leaking
url: /2015/03/24/how-to-keep-your-rxjava-subscribers-from-leaking/
wordpress_id: 257
---

**Edit:** Shortly after writing this, I realized that the solution that I present here isn't very good. I'm leaving it here just in case it can serve as a building block for better solutions.

Sometimes you don't have control over the lifecycle of your `Subscribers`. In these cases, to avoid leaking your `Subscriber`, you have to unsubscribe from your `Observable` when you're notified that your `Subscriber` is about to be destroyed. It can be really annoying to have to worry about unsubscribing your `Subscriptions `to avoid memory leaks, so in this post, I'll show how, with a few lines of code, you can stop worrying about leaking your `Subscribers`.

Before I try to show how to memory-leak-proof your `Subscribers`, I want to give a concrete example that shows when memory-leak-proof `Subscribers` might be useful. This example will also clarify the problem that memory-leak-proof `Subscribers` are trying to solve. I spend most of my time doing Android development these days, so an Android example is the most natural way for me to elaborate on this problem, so here's an Android-specific use-case: You'd probably want want a memory-leak-proof `Subscriber` when you're writing an `Activity`.

An Android `Activity` is basically a screen that you see when you're using an Android app. The Android framework manages the lifecycle of `Activities`. `Activities`, moreover, are also often responsible for responding to touch events.

Sometimes you want to fetch some data and then update the UI with that data in response to a touch event, and sometimes fetching data can't be done on the main thread. `Observables` can be a nice way to handle this problem:

{{< gist kmdupr33 ef8023275ca36d201360>}}

However, if the Android framework wants to destroy your `Activity` while your `Observable` is doing its thing, you run into a problem: The `Observable` will keep your Activity from being garbage collected, because your `Activity` contains a reference to an anonymous inner `Subscriber` and this `Subscriber` implicitly contains a reference to your `Activity`.

The straightforward solution to this is to unsubscribe from your `Observable` when the `Activity` is about to be destroyed:

{{< gist kmdupr33 338f863a42f53b736bdd >}}

Although this solution is straightforward, it puts you in an unfortunate dilemma:




  * Horn 1: You have to worry about unsubscribing from your `Observer` in all of your `Activities` in your app




**OR**







  * Horn 2: You have to unsubscribe in a base `Activity` class that calls unsubscribe on a `CompositeSubscription`, have subclasses add `Subscriptions` to the base `Activity`'s `CompositeSubscription`, and make all of your `Activities` extend that base class.¹


I think there might be a better solution: If we subclass `Observable` to wrap our `Subscribers` in a `Subscriber` [decorator](http://en.wikipedia.org/wiki/Decorator_pattern) that delegates work to its weakly held, wrapped `Subscriber`, we can keep clients from having to worry about leaking their `Subscribers` _without forcing them to write boilerplate code._

To see how this would work, let's start by defining the `Subscriber` decorator:

{{< gist kmdupr33 b5fe4b2a67a3473e20c7 >}}

Next, we define the Observable subclass that adds a `safeSubscribe()` method to wrap the `Subscriber` passed in:

{{< gist kmdupr33 057612a1d383cc196c9a >}}

And that's it. Now, clients can subscribe to an `Observable` without having to worry about leaking an object with a big memory footprint. Instead, only the `Subscriber` decorator is leaked, and since the Subscriber decorator doesn't have a big memory footprint, its not a huge deal if it sticks around until the `Observer` is done doing its thing.

I would love to hear what you all think about this approach.

**Edit: **Conversation with jackhexen on the Reddit machine has made me realize that this solution is not as clean as I've presented it here. Activities won't maintain strong references to their anonymous inner classes unless you store those classes in an instance variable, so technically, you'd have to store your `Subscribers` in instance variables to prevent them for being garbage collected. This makes the solution presented here seem significantly less appealing because I was hoping to offer a solution that kept clients from having to worry about memory management. This solution clearly doesn't do that.

Notes:

1. This solution is discussed in [the 4th part of Dan Lew's helpful introduction to RxJava for Android](http://blog.danlew.net/2014/10/08/grokking-rxjava-part-4/).
