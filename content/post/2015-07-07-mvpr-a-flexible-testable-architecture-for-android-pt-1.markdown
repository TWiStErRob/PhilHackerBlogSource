---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-07-07T18:29:16Z
slug: mvpr-a-flexible-testable-architecture-for-android-pt-1
title: 'MVPR: A Flexible, Testable Architecture for Android (Pt. 1)'
url: /2015/07/07/mvpr-a-flexible-testable-architecture-for-android-pt-1/
wordpress_id: 499
tags:
- android
- testing
---

<blockquote>Thorough unit testing helps us improve the internal quality because, to be tested, a unit has to be structured to run outside the system in a test fixture. A unit test for an object needs to create the object, provide its dependencies, interact with it, and check that it behaved as expected. So, for a class to be easy to unit-test, the class must have explicit dependencies that can easily be substituted and clear responsibilities that can easily be invoked and verified. In software engineering terms, that means that the code must be loosely coupled and highly cohesive —in other words, well-designed.

Steve Freeman and Nat Pryce, _Growing Object Oriented Software Guided by Tests_</blockquote>


Lately, I've been working towards making Google's IO app unit testable. A part of the reason I'm doing this is to test the claims that Freeman and Pryce make in the above quotation about unit testing. Although I'm still not even done with refactoring one Activity in Google's IOSched app, I'm already finding some truth to what they're saying.

The `Activity` that I've been working on is the `SessionDetailActivity`. If you've been following me for a while, you know exactly what Activity I'm talking about, but if you're tuning in the first time, here's what the `SessionDetailActivity` UI looks like:

[![IO Testing Talk-04](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png)



As I mentioned in [the post that introduced this series](http://www.philosophicalhacker.com/2015/05/31/towards-a-unit-testable-fork-of-googles-iosched-app/), there have been several challenges to making the `SessionDetailActivity` unit testable. Unit testing its dynamically constructed views was a challenge that I discussed in [my last post in this series](http://www.philosophicalhacker.com/2015/06/06/unit-testing-dynamically-constructed-views/), but in that post, I noted that my strategy for testing dynamically constructed views wasn't entirely clean because of a circular dependency between `Views` and `Presenters`.

This circular dependency is a symptom of a larger problem with how we structure our Android applications: both `Activities` and `Presenters` violate the principle of single responsibility. They are often responsible for at least two things: binding data to a `View` and responding to user input. This is a part of the reason why [the `SessionDetailActivity`](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/samples/apps/iosched/ui/SessionDetailActivity.java), a class that's supposed to serve as a model for Android development, is over 1000 lines long.

I think there's a better way to structure our applications. In the next few posts, I'll propose a new architecture that has the following properties:




  1. It breaks up the multiple responsibilities typically handled by `Presenters` and `Activities`


  2. It breaks the circular dependency that traditionally exists between Views on the one hand and Activities or Presenters on the other hand.


  3. It enables us to use constructor dependency injection for all of our objects that present data to the user and respond to user input.


  4. It makes our ui-related business logic classes easier to unit test, impossible to construct without the dependencies necessary to fulfill their responsibilities, and (slightly) more amenable to the use of composition and polymorphism to extend and/or modify object behavior.


In this post, I will try to give some reasons why we might consider a new architecture for Android development in the first place.

<!--more-->


## Why a New Architecture?




### Activities/Fragments/Presenters can become Bloated


`Activities` and `Fragments` (I'm just going say "Activities" from now on, but what I say applies equally to `Fragments`.) are egregious violators of the principle of single responsibility. At Droidcon Montreal, Richa Khandelwal [listed the responsibilities](https://speakerdeck.com/richk/clean-android-architecture) that often wind up in an `Activity`:




  * Handle View Events


  * Update Model


  * Invoke another View


  * Interact with System Components


  * Handle System Events


  * Update View based on System Events


As Richa shows later in the presentation, many of these responsibilities can be moved out of Activities, but even if we do that, Activities still violate the principle of single responsibility. Even the slimmest Activities are still responsible for binding a model's data to the View and for responding to user input. Here's an example:

The SessionDetailActivity in Google's IOSched app is actually a good example of how bloated an Activity can get even if its only concerned with the two responsibilities of binding data to views and responding to user input. ~70% of the 1000+ lines of SessionDetailActivity are only concerned with these two responsibilities, so even if we moved all other code out of the SessionDetailActivity, we'd still have a class that's about 700 lines long. Don't believe me? Take a look at [the source code](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/samples/apps/iosched/ui/SessionDetailActivity.java). Presenters can become bloated for the same reason an Activity does: Presenters are typically responsible for binding data to a View and for responding to user input, so a Presenter would be just as long as an Activity that's slimmed down by removing all of its other extra responsibilities. 



### Activities/Fragments/Presenters often have a Circular Dependency on their Views



Activities typically fulfill their responsibilities of binding data to views and responding to user input by creating a circular dependency between themselves and the Views that make up their Content View (i.e., the view passed in to the setContentView() method). There's a piece of code in the same gist that I showed above that provides an example of this.

The `SessionDetailActivity` has a reference to `mAddScheduleButton` and `mAddSchedule` button has a reference to `SessionDetailActivity`. As we'll see later, this circular dependency limits the approaches we can take to implementing the UI-related business logic that's typically found in Activities.

MVP Presenters have basically the same circular dependency between themselves and their Views. Before I can explain this in more detail, I have to make a brief distinction between MVP-Views and Android-Views.

An MVP-View, as I'm defining it, is just an object that's a part of the MVP triad. It's typically defined as an interface, and it may be implemented by an Activity, Fragment, or an Android-View. An Android-View, as the name implies, is a class that is a part of the Android framework. More specifically, it's a subclass of the `View` class.

Using MVP-Views and Presenters just recreates virtually the same circular dependency between MVP-Views and Presenters that exists between Android-Views and Activities.

[![CircularDependency-01](http://www.philosophicalhacker.com/wp-content/uploads/2015/07/CircularDependency-011-300x222.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/07/CircularDependency-011.png)

[![CircularDependency-02](http://www.philosophicalhacker.com/wp-content/uploads/2015/07/CircularDependency-021-300x222.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/07/CircularDependency-021.png)

Presenters need MVP-Views so that they can bind data to the MVP-View. The MVP-View needs a reference to the Presenter so that it can forward clicks and other ui-related events to the Presenter. Square's [post against Fragments](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html) has an MVP implementation that exhibits this circular dependency. Hannes Dorfmann's [post introducing his library to help implement MVP](http://hannesdorfmann.com/android/mosby/) also has some code that has this circular dependency.

Circular dependencies pose a problem when you try to construct objects for unit testing (or in general). However, typically, we don't see the circular dependency between MVP-Views and Presenters or Activities and their Android-Views as a problem because Activities and Fragments are instantiated by the system and because we don't usually use dependency injection to inject an Activity and/or Fragment's dependencies. Instead, we just instantiate whatever dependences the Activity needs in onCreate():

Instantiating concrete classes of our dependencies in onCreate(), however, limits our ability to use composition and polymorphism to implement our ui-related business logic. Here's an example where you might wish you could use polymorphism to implement ui-related business logic: Suppose your implementing an application that has users. Suppose further that the users have different privileges based on the level they attain. They might attain higher levels by verifying an email or by answering a question that others users have asked (StackOverflow style). Finally, suppose that the user interface that's presented to the user is largely dependent on the level they have attained as a user. We might imagine that there a many buttons that do different things depending on the level the user has achieved or that the initial state of the view depends on the user's level.

Polymorphism provides us with a clean, scalable way to implement this kind of logic: we can have a Presenter for each level the user can attain. Regardless of the level the user has attained, we can pass the same MVP-View to into a particular Presenter subclass and let that particular subclass appropriately handle clicks or present the initial UI based on the user's level. Of course, there are ways of architecting Android apps so that we can take advantage of polymorphism in spite of the circular dependency between Presenters and MVP-Views, but none of the approaches that I've seen are particularly pretty, nor do they do a great job of facilitating unit testing. 

I don't have the space here to go over all of those different solutions that I have in mind, but I can briefly say why one easy way of resolving the circular dependency between MVP-Views and Presenters is not ideal. You might think that we can just create an MVP-View or Presenter without the dependencies they need to fulfill their responsibilities. We could, in other words, do something like this:

This would allow us to use polymorphism to solve problems like the one I mentioned above, but it doesn't really break the circular dependency between MVP-Views and Presenters. All it does is allow us to create an object in an invalid state. This isn't cleanest solution. To put the point in Freeman and Pryce's words:


<blockquote>“New or new not, there is no try”

We try to make sure that we always create a valid object…Partially creating an object and then finishing it off by setting its properties is brittle…</blockquote>




## Conclusion


Presenters and Activities violate the principle of single responsibility. They are often responsible for binding data to a View and for responding to user input/actions. This can cause both Activities and Presenters to become bloated.

Presenters and Activities often carry out their multiple responsibilities by creating a circular dependency between themselves and their Views. Although this circular reference doesn't appear to be a problem, it can make it more difficult to unit test our Views and/or Presenters and it can limit our ability to use polymorphism to implement ui-related business logic.

As I said before, I think there's a way of structuring our applications that doesn't have these disadvantages, and in the next post, I'll go over this alternative architecture.



* * *



Below, Hannes Dorfmann has a great comment to this article. I've responded to that [here](http://www.philosophicalhacker.com/2015/07/08/my-response-to-hannes-dorfmann-on-the-circular-dependency-problem/).
