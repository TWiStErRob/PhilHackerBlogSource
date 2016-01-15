---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-06-06T11:08:03Z
slug: unit-testing-dynamically-constructed-views
title: Unit Testing Dynamically Constructed Views
url: /2015/06/06/unit-testing-dynamically-constructed-views/
wordpress_id: 3
---

Some view hierarchies in Android are specified statically. The structure of these hierarchies does not change at run-time. Occasionally, we need to have dynamically constructed view hierarchies, hierarchies whose structure change at run-time. We might need to, for example, add or remove a view depending on some data we've fetched or in response to some input. The `SessionDetailActivity` in Google's IOSched app has a dynamically constructed view hierarchy. The number of tags associated with a particular IO session determines how many tag views are added to the `SessionDetailActivity`'s view hierarchy.

[![IO Testing Talk-04](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png)



In this screenshot, the "Distribute," "Android," and "Games" tags are added to the view hierarchy based on the tags associated with the "Going global with Google Play" IO session. In this post, I'll outline an approach that I used to write the code that is both unit testable and able to dynamically construct the `SesisonDetailActivity`'s view hierarchy. This post is a part of a series of parts in which I discuss how we can take steps towards [making Google's IOSched app unit testable](http://www.philosophicalhacker.com/2015/05/31/towards-a-unit-testable-fork-of-googles-iosched-app/).

<!--more-->

As [I've stated elsewhere](http://www.philosophicalhacker.com/2015/05/22/what-ive-learned-from-trying-to-make-an-android-app-unit-testable/), dependency injection is key to making our apps unit testable. Because the MVP pattern allows us to inject dependencies into Presenters, objects which contain much of our app's business logic, the pattern plays a key role in making our apps unit testable in general. Unsurprisingly, the pattern also plays a role in helping us write unit testable dynamically constructed views.

If you're not familiar with MVP, you should check out [this post](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html) in which Square talks about how they use MVP to get rid of fragments and to facilitate unit testing. [This post](http://hannesdorfmann.com/android/mosby/) in which Hannes Dorfmann introduces a library he wrote to facilitate the application of the MVP pattern also contains a decent introduction to the pattern.

Before I outline my approach to refactoring the `SessionDetailActivity` so that we can have unit testable, view constructing code, let's try to get a handle on how the `SessionDetailActivity `works without any kind of refactoring. Here's what the code currently looks like:



There are few important things to notice about this code fragment.

First, note that there's business logic that _determines the structure of the view hierarchy that's being built_ by this method. For example, if one of the tags has an id that's equal to the keynote speaker tag id, we don't want to add a view to the tags container for that tag (lines 18-31). Let's call this kind of business logic "view-hierarchy-affecting business logic."

Also note that there's business logic that determines the properties of the views that have been added by the view-hierarchy-affecting business logic. More specifically, it contains code that determines how the _how the app should respond when the user interacts with the views that are a part of the dynamically constructed view hierarchy_. Here I have in mind the piece of the method that set's up the tag view's `OnClickListener` to show them a list of IO sessions that have the tag associated with the tag view the user selected (lines 55 - 64). Let's call this kind of business logic "view-property-affecting business logic."

The problem of creating unit testable, dynamically constructed views is basically the problem of finding sensible places to put these two different kinds of business logic. Here's what I suggest, the view-hierarchy-affecting business logic should go in a `SessionDetailPresenter`:



The `SessionDetailActivity` in this code segment is acting as the View within the MVP triad, and as such, it should not contain any business logic. Thus, we know that the view-property-affecting business logic should not be within the `SessionDetailActivity`. Instead of placing the view-property affecting business logic within the `SessionDetailActivity`, we have the `SessionDetailActivity` delegate that logic out to another View-Presenter pair:



The "SessionTagViewTranslator" in this code segment is really just the View within the View-Presenter pair. For reasons that I discuss [here](http://www.philosophicalhacker.com/2015/04/05/dont-call-it-mvp/), I prefer the name "ViewTranslator" over "View" because it more clearly marks the difference between an MVP View and an Android View. Astute readers will notice that the SessionDetailActivity shouldn't be responsible for forwarding the click event on the view to the TagPresenter. This problem arises because of a circular dependency between MVP Views and Presenters. I'll discuss how to break this dependency in my next post. The `TagPresenter` is fairly trivial, but here's what it looks like:



The SesionTagViewTranslator is even more trivial, so I won't bother showing the code for that.


## Conclusion


To sum it all up: dynamically constructed views often have two different types of business logic: view-hierarchy-affecting business logic and view-property-affecting business logic. Making these views unit testable consists of two steps: First, place the view-hierarchy-affecting business logic in a top level presenter like the `SessionDetailPresenter`. Second have an MVP-View (like the `SessionDetailActivity`) create View-Presenter pairs for each Android view that's added to the view hierarchy.
