+++
comments = true
date = "2016-06-29T15:16:00-04:00"
draft = true
share = true
slug = "a-unit-test-recorder"
tags = ["regression testing", "android"]
title = "How to make a Unit Test Recorder"
+++

In [my last post](http://www.philosophicalhacker.com/post/vice-a-regression-test-generation-library/), I demonstrated a prototype library I call "Vice." Vice can generate regression tests simply be exercising the code for which we want regression tests. Vice, as it stood last week, required us to write special code to do this.

It turns out we can do better than this.

If we leverage the same tools used to build Vice, we can actually generate regression tests *simply by running our applications*. In other words, we can make Vice a unit-level regression test recording library, a library with functionality similar to the [Google's espresso test recorder](http://android-developers.blogspot.com/2016/05/android-studio-22-preview-new-ui.html) or [apple's iOS test recorder](https://developer.apple.com/library/mac/documentation/ToolsLanguages/Conceptual/Xcode_Overview/RecordingUITests.html).

They key advantage of this kind library over Google and Apple's functional UI test recorders is that unit-level tests can run much more quickly, so they can actually serve as, to use Michael Feathers' metaphor, a "software vice" when we're refactoring or adding features. Having to wait 5+ minutes to know if you're refactoring has broken anything is way too long for functional UI tests to be useful feedback for refactoring.

This post sketches a strategy for implementing a unit test recording library. Here is the source code with a proof-of-concept implementation of the strategy I've sketched here.

### The Demo

Before I get into the details of how this works, let me show you a working unit test recorder.

{{< youtube  >}}

I think this is pretty neat. Now, on to "the how."

### The Strategy

Call the classes for which we want to generate tests "target classes."

As I said [before](http://www.philosophicalhacker.com/post/vice-a-regression-test-generation-library/), Vice already works by rewriting target classes so that instances of those classes record their method invocations. More specifically, these instances record both the arguments and return value of their method invocations. Let's call these rewritten classes "Recorders."

Once this information is recorded, we can use it to generate regression tests that ensure that the behavior of our code remains unchanged. Those tests simply assert that target classes either a) return proper values or b) interact appropriately with their collaborators when their methods are invoked.

Making Vice into a test recording library is as simple as rewriting the *providers* of instances of the target classes so that these methods return a recorder.

When I say "provider" here, I just mean any method that is responsible for providing an object that is used by our application. Providers may be constructors, ordinary factory methods, or special methods in some DI-framework module class (e.g., `@Provides` annotated methods in [Dagger](http://google.github.io/dagger/)).

If all the instances in an application are recorders, then generating unit tests is fairly trivial.

### Some quick thoughts on implementation

Importantly, I think this strategy can work for all languages and platforms. In fact, getting this to work for Android development is probably the hardest application of this strategy. Doing this for web apps in javascript, for example, seems like it would be much easier.

Applications that use DI frameworks are in a particularly good position to implement this strategy. At this point, building unit test recorders that work off of DI frameworks seems like the most promising way to proceed. DI frameworks place all of the providing methods in one place, so we can rewrite all of these methods to provide recorders for all objects in an application. In cases where we understand where the providers of the DI frameworks are in advance, users of Vice should only have to add one or two lines of code and they can generate tons of regression tests simply by running their applications.

### Call for Contributors

I'd like to start by implementing this library for Android, and I'm looking for contributors. However, it would be neat if we had a standard way of recording regression tests across languages and platforms, so I've created a github organization that can host the various repos that will be required to do this. Contributing instructions can be found [here]().