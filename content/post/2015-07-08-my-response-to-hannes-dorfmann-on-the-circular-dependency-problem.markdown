---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-07-08T13:42:14Z
slug: my-response-to-hannes-dorfmann-on-the-circular-dependency-problem
title: My Response to Hannes Dorfmann on "the Circular Dependency Problem"
url: /2015/07/08/my-response-to-hannes-dorfmann-on-the-circular-dependency-problem/
wordpress_id: 551
---

In [my last post](http://www.philosophicalhacker.com/2015/07/07/mvpr-a-flexible-testable-architecture-for-android-pt-1/), I argued that there are two disadvantages to `Activities` and Presenters. The first disadvantage is that they are often bloated classes. The second disadvantage is that these classes often have a circular dependency between themselves and their Views. Yesterday, Hannes Dorfmann made a comment on my post that was so thoughtful and excellent that I think its worth dedicating an entire post to responding to it.

<!--more-->

Specifically, Hannes' comments challenge my claim that the circular dependency between Activities/Fragments/Presenters and their Views are a problem.


<blockquote>...Regarding circular dependencies: Imho I don’t think that circular dependencies are a bad thing as long as you program against an interface and not the implementation:

1. Presenter program against View interface. This makes your presenter easily testable since you can replace the view with a mock view while unit testing

2. View program against Presenter interface. During testing you can replace the presenter with a mock presenter easily. Therefore view is testable. I guess the problem you face here is that the view (like Activity) is creating a presenter with new Presenter(). But with dependency injection you can inject a MockPresenter while unit testing.</blockquote>


These are interesting points. I think I agree that programming against interfaces makes code more unit testable in certain situations, but I'm not sure that this addresses the disadvantage created by the circular dependencies between Activities/Presenters and their Views. Here's why: if an MVP-View is instantiating a concrete implementation of a Presenter, then the only way for us to swap out its dependency is by using setter injection. Setter injection, as I pointed out in the last post is generally less preferable to constructor injection. Steve Freeman and Nat Pryce say this in [their book](http://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627). Martin Fowler, following Kent Beck, says something similar in [his article on dependency injection](http://martinfowler.com/articles/injection.html#ConstructorVersusSetterInjection).

Hannes' comment challenges my claim here too, however:


<blockquote>...Actually, also the Observer pattern has circular dependencies. I.e. Activity implements OnClickListener and displays a Button and registers himself as OnClickListener on the button. Activity has dependency to Button since Activity needs the reference to the Button to register himself. On the other side Button has a reference to the OnClickListener, which actually is the Activity.

From my point of view its completely fine since Button programs against the OnClickInterface. Therefore, it’s not a „hard“ dependency to the Activity (which is the OnClickListener) and I wouldn’t call it circular dependency. This is the same as View and Presenter. Presenter is programming against the View interface and therefore completely fine.</blockquote>


This is a great argument. Hannes builds on the argument later in his comment:


<blockquote>Regarding invalid state of an object:
That’s open to dispute. [Is] a presenter...in an invalid state without a View? [Is] a Button...in an invalid state without having set an OnClickListener?</blockquote>


I see Hannes as making two parallel arguments from analogy here, both of which support the conclusion that there's no problem with the circular dependency between Activities/Presenters and Views. Here's the first argument:



	
  1. There really isn't a problematic circular dependency between an `Activity` and a `Button` because the `Button` only sees the `Activity` as an `OnClickListener` interface.

	
  2. A `Presenter` programs against a `View` interface in the same way that a `Button` programs against the `OnClickListener` interface.

	
  3. So, the circular dependency between an `Presenter` and a `View` is just as unproblematic as the circular dependency between the `Activity` and the `Button`.


Here's the second argument:

	
  1. A `Button` isn't in an invalid state just because its created without a click listener.

	
  2. A `Presenter` programs against an `View` interface just as a `Button` programs against a `OnClickListener`

	
  3. So, a `Presenter` isn't in an invalid state just because its created without its `View`.


I have a response to these arguments, but I'm not quite sure how well it stands up to Hannes' arguments. I'm sure further discussion will help us hash all of this out.

I think that a good response to both arguments requires us to get clearer on how we're using the word "dependency." My definition of a dependency is basically the one offered by Freeman and Pryce in their book:


<blockquote>Services that the object requires from its peers so it can perform its responsibilities. The object cannot function without these services. It should not be possible to create the object without them. For example, a graphics package will need something like a screen or canvas to draw on—it doesn’t make sense without one.

_Growing Object Oriented Software Guided by Tests, _pg. 94</blockquote>


A dependency, however, is only one of three different types of "peers" that an object may have. There's also something called a "notification," which they define in the following passage:


<blockquote>Peers that need to be kept up to date with the object’s activity. The object will notify interested peers whenever it changes state or performs a significant action. Notifications are “fire and forget”; the object neither knows nor cares which peers are listening. Notifications are so useful because they decouple objects from each other. For example, in a user interface system, a button component promises to notify any registered listeners when it’s clicked, but does not know what those listeners will do.

_Ibid., _pg. 94</blockquote>


With this distinction in mind, we can now start to respond to Hannes' arguments. The OnClickListener, from a `Button's` perspective, is really a notification, not a dependency, so I agree with the first premise in Hannes' argument: there's nothing _necessarily_ problematic with creating a `Button` without a click listener. I also agree with Hannes' second premise: A `Presenter` can program against a `View` interface just as a `Button` can program against an `OnClickListener` interface.

Here's where we may start to disagree: there's a key difference between an `OnClickListener` and an MVP-View. An MVP-View, from the perspective of a Presenter within a particular application, is _necessarily _a dependency, not a notification. A Presenter shouldn't exist at all if its not going to present a View because that's its _sole responsibility._ To create a Presenter without a View is to create an object that cannot fulfill its responsibility. On the other hand, a Button without a click listener can still perform its responsibilities without a click listener. Its responsibility is to draw itself to the screen and notify any _registered _listeners that the button has been clicked. If there aren't any registered listeners, then a Button can still exercise its responsibility of drawing itself to the screen and it can still notify any listeners that may register with it in the future.

I should qualify what I've just said. I used and emphasized the word "necessarily" above because whether something is a dependency or a notification is often context-dependent. I agree with Freeman and Pryce when they say:


<blockquote>What matters most is the context in which the collaborating objects are used. For example, in one application an auditing log could be a dependency, because auditing is a legal requirement for the business and no object should be created without an audit trail. Elsewhere, it could be a notification, because auditing is a user choice and objects will function perfectly well without it.

_Ibid._, pg. 94-95</blockquote>


So, its possible that, depending on the context, an `OnClickListener` could be either a dependency or a notification. I think that in the context of the design of the Android framework, an `OnClickListener` is a notification. I think, however, that in the context of the development of an application, a button's `OnClickListener` can often actually be a dependency. When we create a `Button` in our application, we plug in the domain-specific responsibilities we have in mind for it. We might say, for example, "this button registers the user for our service and takes them to a welcome screen."

Once we've added this domain-specific responsibility to a `Button`, it doesn't make sense for the `Button` to exist without its `OnClickListener`, the object it needs to fulfill its (now) domain-specific responsibility. Of course, we can't modify the `Button's` api to accommodate this fact that the `Button`, in the context of our application, now has a dependency on a particular `OnClickListener`, but we can wrap the Android button into a new domain-specific Button object that reflects the fact that, in the context of our application, it doesn't make sense for this Button to exist without its click listener. There's actually a strong relationship between this suggestion and the suggestion that I'll make in my next post when I present the MVPR architecture.

By now, you can probably guess what I would say to Hannes' first argument: I would deny its first premise. I would say, in other words, that there's something fishy about the circular dependency between an `Activity` and its `Button` in the first place and I think there's something fishy about it, regardless of whether the `Button` programs against an interface. Whether the `Button` programs against an interface has nothing to do with the fact that, in the context of our application, it has a dependency on a click listener and that setting an `Activity` as a Button's click listener makes it more difficult for the button to have a different click listener, a difficulty we might want to avoid if we want to take full advantage of polymorphism in implementing ui-related business logic.

Regardless of whether I'm right or wrong to criticize the circular dependency between Activities/Presenters and their Views, I've learned a lot by thinking about this and by engaging with Hannes in this discussion. So thanks, Hannes, and thanks to everyone who takes the time to make thoughtful comments on what I've written. I owe you.


