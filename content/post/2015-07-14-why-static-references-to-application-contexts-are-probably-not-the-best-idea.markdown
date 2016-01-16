---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-07-14T18:35:40Z
slug: why-static-references-to-application-contexts-are-probably-not-the-best-idea
title: Why Having Global Static References to Application Contexts is Probably not
  the Best Idea
url: /2015/07/14/why-static-references-to-application-contexts-are-probably-not-the-best-idea/
wordpress_id: 600
---

In my last post, I went over [6 things I wish I knew before I wrote my first Android app](http://www.philosophicalhacker.com/2015/07/09/6-things-i-wish-i-knew-before-i-wrote-my-first-android-app/). One of the things I listed in that post was this:

> 1. Don’t have static references to Contexts

The reason I warned against this is that static references to Contexts can cause memory leaks. An astute reader pointed out that a static reference to an application Context wouldn't cause a memory leak since the application Context is around for the lifetime the app is running anyway. I then qualified my warning by saying:


<blockquote>Note: Technically, you can hold a static reference to an application Context without causing a memory leak, but I wouldn’t recommend that you do that either.</blockquote>


In this post, I want to say a little more about why think having and using a static reference to an application Context is _less-than-ideal_. I emphasize "less-than-ideal" in the previous sentence as a way of highlighting what I'm not saying: I'm not saying that a kitten dies every time you use a static reference to an application Context. Once again, @codestandards is hilarious and relevant here:


{{< tweet 570224843536277504 >}}


Instead, all I'm doing in this post is offering a few points that suggest that using static references to Contexts is probably not the cleanest way of coding Android apps. <!--more-->



## 1. Classes/Methods that use static references to an application Context are "Liars"



This point is taken from [Google's Guide to Writing testable code](http://misko.hevery.com/code-reviewers-guide/flaw-brittle-global-state-singletons/). In that guide, they point out that



<blockquote>
Accessing global state statically doesn’t clarify those shared dependencies to readers of the constructors and methods that use the Global State. Global State and Singletons make APIs lie about their true dependencies. To really understand the dependencies, developers must read every line of code.
</blockquote>



Global static references to an application `Context` are no exception to this point: readers of that class cannot know that the class actually depends on a `Context` just by looking at its API. When a class has an expressive, "truthful" API that tells us about its dependencies, its easier to understand both that class' (or method's) responsibility and how it goes about fulfilling that responsibility.

Here's a quick example to illustrate this. Suppose you run across this method signature while you're looking at code:



When you encounter this signature, you have no idea how this method displays the string passed in as a parameter. Now, suppose instead that you encountered this signature:



With this signature you have a hint that maybe this method uses a `Toast` to display the string. Because `Context` is a god-object, knowing that a particular class or method depends on it doesn't always shed much light on what that class/method does or how it does it, but a little help in understanding what a class/method does is better than no help. 



## 2. Classes that use static references to an application Context are not encapsulated.



Encapsulation is one of those words that gets thrown around a lot without a precise definition. I'm not trying to add to that mess. When I say "encapsulation," I mean what Steve Freeman and Nat Pryce mean in _Growing Object Oriented Software Guided by Tests_:



<blockquote>
[It] Ensures that the behavior of an object can only be affected through its API. It lets us control how much a change to one object will impact other parts of the system by ensuring that there are no unexpected dependencies between unrelated components. -Pg. 92
</blockquote>



Because classes that use static references to application Contexts are accessing a globally available dependency, the behavior of instances of that class can be affected by changes to the shared Application Context. Because the shared application Context isn't a part of that class' API, this means that there can be changes to the object's behavior that aren't caused by an interaction with that object's API. It means, in other words, that using static references to application Contexts breaks encapsulation.

For the vast majority of cases, breaking encapsulation in this way probably wouldn't be a problem. In fact, the only examples I can imagine in which this would be a problem seem rather contrived. Still, I think that, all other things being equal, we ought to prefer architectures that work in all cases over architectures that work 99% of the time. Again, you're not killing a kitten if you use static references to application Contexts and break encapsulation, but you aren't using the most robust architecture either.



## 3. Classes that use static references to an application Context might be Harder to Unit Test



If one of your classes calls a method on an application Context and you would like to verify that that method has been called in a unit test, using an static reference will not make your life easy. As I've pointed out in [this post](http://www.philosophicalhacker.com/2015/04/24/why-android-unit-testing-is-so-hard-pt-2/), there are cases where you'll probably want to do this. Suppose you've got an ServiceLauncher object that launches an Android Service. If you've used dependency injection to pass in the Context upon which the ServiceLauncher depends, unit testing is easy:

 

If the ServiceLauncher used a static reference to an application Context, this class would more difficult to unit test. In this particular case, you could use the testing support library to verify that intents are sent with a UI test, but UI tests are slower than unit tests, and, in any case, there are methods on a Context that you might want to verify that don't use intents, so injecting a Context into a target object will give you more flexibility when testing than using a globally accessible static reference, even if you leverage the testing support library to help you verify that certain intents were sent.


## 4. Classes that use static references to an application Context might be more likely to violate the Law of Demeter


We often use a Context to get a hold of some other object we need. A particular object might need a Resources, SharedPreferences, or a PackageManager to exercise its responsibility. When we have a globally accessible application Context, we might be tempted to get a hold of these objects by doing something like this:This violates [the Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter). I was actually just complaining the other day about how law of demeter violations make apps harder to unit test:

{{< tweet 619470887536996352 >}}

But even if you don't care about unit testing, law of demeter violations are generally considered to be a code smell.


## Conclusion


I don't think I've said anything too controversial here. I see myself as simply applying general programming lessons learned from people who are smarter than me. Of course, as always, I'm open to being wrong about this.

If you are convinced that you should get rid of your static references to application Contexts, it really shouldn't be too difficult for you to inject your classes and methods with the Context they need to do their job. You might even find that you have a bunch of law of demeter violations that you can clean up along the way. Android Studio's intentions and refactoring capabilities make this kind of work trivial, even if it is a bit tedious.
