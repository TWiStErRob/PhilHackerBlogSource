+++
slug = "why-im-skeptical-about-kotlin-coroutines-for-android-development"
date = "2017-03-19T00:34:58-04:00"
title = "Why Im Skeptical about Kotlin Coroutines for Android Development"
comments = true
draft = false
share = true
menu = ""
author = ""
tags = [
  "android",
  "rxjava",
  "kotlin",
  "coroutines"
]
image = ""
+++

A few weeks ago, the folks working on Kotlin announced the 1.1 release. Kotlin's 1.1 release has experiment support for coroutines. Here's the elevator pitch for coroutines from their blog post announcing the release:

>Asynchronous programming is taking over the world, and the only thing that is holding us back is that non-blocking code adds considerable complexity to our systems. Kotlin now offers means to tame this complexity by making coroutines first-class citizens in the language through the single primitive: suspending functions. Such a function (or lambda) represents a computation that can be suspended (without blocking any threads) and resumed later.

Coroutines are neat and they may actually be very useful in many cases, but I'm not actually sure how useful they'll be in Android development. This post is about why I'm skeptical that coroutines really matter for Android development. Here's the short answer: I suspect that RxJava actually gives us a better way of "taming asynchronous complexity" than coroutines do.

### Observables give us an apt model for many problems in Android development

In order to see why I'm skeptical about coroutines, let's start by noting that streams give us an *explicit* way of modeling many problems in Android development. When you really start getting into rxjava, it changes *the way you think* about your problems. You start to think with `Observable`s and you realize that most of your problems are about how to compose your `Observable`s with various operators to get the data you're actually interested in.

When you've stumbled upon a good way to model your problems, your life gets easier and you get to be continually amazed at how many problems your model helps you solve. Something like this happened when we started using functional programming to work with collections:

>Richard Waters...developed a program that automatically analyzes traditional Fortran programs, viewing them in terms of maps, filters, and accumulations. He found that fully 90 percent of the code in the Fortran Scientific Subroutine Package fits neatly into this paradigm.

>-Abelson et. al, Structure and Interpretation of Computer Programs

What's interesting is that when you find a good way to explicitly model your problems in code, you actually start to think with that model, *even if you aren't actively using it in code.* For example, suppose I'm looking at the following code:

{{< highlight java "style=default" >}}
int[] ints = {0, 1, 2};
int sum = 0;
for (int i = 0; i < ints.length; i++) {
  ints[i] *= ints[i];
}
for (int anInt : ints) {
  sum += anInt;
}
System.out.println(sum);
{{< / highlight >}}

I think about this code by thinking in terms of maps and reduces, even if I'm not working with a Java `Stream` that has those methods. The same is true about `Observable`: its such a good way of modeling the problems that I face that I think in terms of it, even if I'm not lucky enough to use RxJava.

Coroutines, on the other hand, dont give us any model of what we're trying to accomplish with our asynchronous data at all. Rather, coroutines just give us a way to write code that feels *imperative,* even if it is asynchronous. Here's an example from the blog post announcing coroutines:

{{< highlight kotlin "style=default" >}}
// launches new coroutine in UI context
launch(UI) {
    // wait for async overlay to complete
    val image = asyncOverlay().await()
    // and then show it in UI
    showImage(image)
}
{{< / highlight >}}

`asyncOverlay` does some async work, but we get to avoid writing callbacks. The code just "stops" while waiting for that async work to complete *without blocking the main thread*. Its neat, but, again, there's no modeling of problems that's happening here.

### Observable is a better abstraction of synchronicity

RxJava does more than just allow us to model asynchronous events and data. It actually allows us to abstract over synchronicity when we're thinking about streams or collections of data. Ordered synchronous and asynchronous data have the same API. If we want to model sequential data in our code, when we're using RxJava, we don't *necessarily* have to care whether that data arrives synchronously or asynchronously. Here's [the reactivex.io site's](http://reactivex.io/intro.html) pitch on this:

>The ReactiveX Observable model allows you to treat streams of asynchronous events with the same sort of simple, composable operations that you use for collections of data items like arrays. It frees you from tangled webs of callbacks, and thereby makes your code more readable and less prone to bugs.

Here's something that I regularly do that demonstrates this delightful abstraction:

{{< highlight java "style=default" >}}
clicksObservable
  .flatMapSingle(click -> githubApi.listRepos())
  .flatMap(repos -> Observable.fromIterable(repos))
  .filter(repo -> isMine(repo))
  .subscribe(repo -> { displayInList(repo)})
{{< / highlight >}}

I start with a stream of clicks and wind up with a list view that displays only the repos that aren't mine. Along the way, I work with an `Iterable` of repos, but I can easily turn that `Iterable` into an `Observable` and then it doesn't even matter whether the repos are in memory or retrieved asynchronously. The `Observable` cascade doesn't get broken and the periods line up beautifully.

Coroutines, on the other hand, don't let us abstract over synchronous and asynchronous data like this. For synchronous data/operations, we use normal functions. For asynchronous data, we need to use suspecting functions wrapped in blocks that start coroutines.

### Observables lets us work at a higher level of abstraction

`Observable`s do more than just model our problems and abstract over synchronicity. They do this in a way that lets us work at a higher level of abstraction than imperative code. I can write a map an array imperatively like this:

{{< highlight java "style=default" >}}
int[] ints = {0, 1, 2};    
for (int i = 0; i < ints.length; i++) {
  ints[i] *= ints[i];
}
{{< / highlight >}}

Or I can do it declaratively like this:

{{< highlight java "style=default" >}}
Observable.fromArray(ints).map(aInt -> aInt * aInt)
{{< / highlight >}}

Coroutines, in my opinion, when used to handle problems that are well modeled by `Observable`s are merely the for loops of the asynchronous world.

### Conclusion

None of this is meant to suggest that coroutines aren't useful full stop. That's nonsense. They have their uses. I just double that they are going to be nearly as essential to Android development as RxJava.