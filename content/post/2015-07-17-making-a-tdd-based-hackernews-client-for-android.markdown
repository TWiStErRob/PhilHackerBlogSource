---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-07-17T11:53:55Z
slug: making-a-tdd-based-hackernews-client-for-android
title: Making a TDD-based HackerNews client for Android
url: /2015/07/17/making-a-tdd-based-hackernews-client-for-android/
wordpress_id: 624
tags:
  - android
  - testing
---

I'm using TDD to write a HackerNews client for Android. This post (and the ones that will likely follow it) share a little bit about some of the techniques I used to follow a TDD-based work-flow for developing this application. It also discusses the architecture that arises when Android apps are built with testability in mind from the ground up.

<!--more-->


## Testing a Walking Skeleton


The first step in kick-starting a TDD workflow, according to Steve Freeman and Nat Pryce in _Growing Object Oriented Software Guided by Tests_, is to "test a walking skeleton." A walking skeleton, as they define it, is this:


<blockquote>A “walking skeleton” is an implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end.

pg. 69-70</blockquote>


A walking skeleton for a HackerNews client, as I see it, should just display a list of HackerNews story ids. To implement this test, I use a simple espresso test that looks like this:

{{< gist kmdupr33 a25db0930e583db05535 >}}


### How I Got Consistent Test Data


Here's a question that arose immediately when writing this test: How can we ensure that the MainActivity was fetching the same data for every test run so that the value 9897306 that we're checking against is always appropriate. [Jake Wharton's discussion](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=jake%20wharton%20dagger%20parley) on Dagger modules that can override the dependencies that are injected into your Android objects came to mind here, so I decided to use this approach to ensure that the data the test uses is always the same.

Let me briefly describe how I used this approach in my application.

Objects in PhilHackerNews access the Dagger object graph from the `PhilHackerNewsApplication` subclass. That class is responsible for making the `ObjectGraph`:

{{< gist kmdupr33 eb4565747da03d9f1309 >}}

So, when I'm running a test, I use a custom test runner that creates a subclass of `PhilHackerNewsApplication` to create the `ObjectGraph` with the overridden module:

{{< gist kmdupr33 d8a344157014e3cf0c8a >}}

The `TestApplication` class creates the `ObjectGraph` with a module that overrides the dependencies responsible for fetching HackerNews data:

{{< gist kmdupr33 36c1e516b335092057c2 >}}

`TestLoaderModule` is the module that provides the overridden dependency. It provides a HackerNewsRestAdapter that simply loads HackerNews data from memory instead of the server:


### The Current State of App's Architecture


Let me point out a few things about the architecture needed to get this test to pass. First off, I want to say that this architecture is likely to change for the same reasons that Pryce and Freeman point out:


<blockquote>[When testing a walking skeleton, w]e’re not trying to elaborate the whole design down to classes and algorithms before we start coding. Any ideas we have now are likely to be wrong, so we prefer to discover those details as we grow the system.

Pg. 73</blockquote>


Here's something interesting about the state of the architecture currently: it uses a combination of RxJava and Loaders to ensure that




  * The network calls are made and delivered properly even if the MainActivity and its Fragment are destroyed because of a configuration change


  * The classes in the "Application Layer" of this app are freed from having to worry about the Android-specific problem of asynchronous data loading for app components that can be destroyed and recreated at any time.


The inspiration for this decision comes from Freeman and Pryce's advice:


<blockquote>We don’t want technical concepts to leak into the application model, so we write interfaces to describe its relationships with the outside world in its terminology (Cockburn’s ports ). Then we write bridges between the application core and each technical domain (Cockburn’s adapters ).

Pg. 90</blockquote>


The problem that Loaders attempt to solve, as I see it, is a technical one that doesn't belong in the Application Layer. To shield application layer objects from this technical detail, I've created and pass around an Observable that, upon subscription, initializes a load from a Loader using a LoaderManager:

{{< gist kmdupr33 c6c1641ed1a24e07e062 >}}

Rather than dealing with loaders directly, clients that want to consume the "loaded" data subscribe to the `Observable` that's created with a `LoaderInitializingOnSubscribe`. In my application, Activities/Fragments/Presenters will not interact with this Observable directly, however. Instead, they'll interact with a StoryRepository that will (eventually) be responsible for deciding whether data gets loaded from the cache or from the network. Here's what that class looks like at the moment:

{{< gist kmdupr33 378997639d5bac95a392 >}}

And here's a relevant snippet of the Fragment that uses this class to load the HackerNews data:

{{< gist kmdupr33 fb1c638f2fdbe6a8bd68 >}}


If you want to have a closer look at what I've done, feel free to take a look at [the repo for this project](https://github.com/kmdupr33/PhilHackerNews).
