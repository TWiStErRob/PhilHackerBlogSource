---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2014-10-03T03:02:54Z
slug: an-alternative-multiproject-setup-for-android-studio
tags:
- android
- android studio
- multiproject setups
title: An Alternative Multiproject Setup for Android Studio
url: /2014/10/03/an-alternative-multiproject-setup-for-android-studio/
wordpress_id: 220
---

Google's [Gradle Plugin user guide recommends](http://tools.android.com/tech-docs/new-build-system/user-guide) a method for configuring your gradle files to build multiple projects. That method has some shortcomings. In this post, I will briefly explain Google's recommended configuration, note its shortcomings, and  recommend a different way to configure your gradle files to support multi-project setups in Android Studio.


## The Google Way


[![Screen Shot 2014-10-02 at 9.31.31 PM](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-9-31-31-pm.png?w=620)](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-9-31-31-pm.png)

This picture illustrates how Google suggests we handle multi-project setups: our main "app" module is supposed to depend on library modules that reside within the project directory. When the library modules are within the project directory, telling gradle to build them is easy. Our `settings.gradle` file looks like this:

[![Screen Shot 2014-10-02 at 9.34.33 PM](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-9-34-33-pm.png?w=620)](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-9-34-33-pm.png)

And our `build.gradle` looks like this:

[![Screen Shot 2014-10-02 at 10.38.08 PM](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-10-38-08-pm.png?w=620)](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-10-38-08-pm.png)

As you can see, Google's suggested configuration is simple, and its even simpler if you use the Android Studio UI to configure you gradle files for you. In spite of it's simplicity, there are several reasons why we might want to avoid this configuration. I discuss those reasons in the next section.


## Some Unfortunate Features of "The Google Way"


Both of the unfortunate features of the "Google way" of handling multi-project setups only arise if your working on several apps that depend on the same libraries. If you only ever work on one app and you know for sure you wont have multiple apps that depend on the same library, feel free to skip the rest of this post and continue blissfully using the simple configuration for multiple projects in Android Studio. If, on the other hand, you are working on several apps that depend on the same libraries, read on.

Suppose you've got a project structure that looks something like this:


>App1 depends on the [StickyListHeaders](https://github.com/emilsjolander/StickyListHeaders) library

>App2 depends on the StickyListHeaders library</blockquote>


If you were to follow the Google's user guide in setting up your projects, then you would create two projects, one for App1 and another for App2. The project directories for App1 and App2 would each contain a submodule that has the code from the StickyListHeaders library that each app needs to build successfully.

It doesn't take make to see the unfortunate features of this setup. First off, you have to have copies of a library for every app that depends on it.

If you frequently make changes to that library, you're going to want it to be versioned, and you probably want to have the library in a repository that's separate from your app so that you can checkout the library and reuse it for any app that needs it. Since the library module is a subdirectory within the project, you'll have to use git submodules to achieve this. As [others have noted](http://codingkilledthecat.wordpress.com/2012/04/28/why-your-company-shouldnt-use-git-submodules/), however, git submodules aren't really that great.

So, if you follow the Google way, you're sort of¹ forced to have copies of your libraries for all of your apps that depend on those libraries and if you change those libraries often, then you might have to start using git submodules.²


## A Different Way


It turns out there's a better way to manage multiple projects in Android Studio. The trick is to create separate Android Studio projects for your libraries and to tell gradle that the module for the library that your app depends on is located in the library's project directory. If you wanted to use this method with the project structure I've described above, you would do the following:




  1. Create an Android Studio project for the StickyListHeaders library


  2. Create an Android Studio project for App2


  3. Create an Android Studio project for App1


  4. Configure App1 and App2 to build the modules in the StickyListHeaders project.


The 4th step is the hard part, so that's the only step that I'll describe in detail. You can reference modules that are external to your project's directory by adding a `project` statement in your `settings.gradle` file and by setting the `projectDir` property on the `ProjectDescriptor` object that's returned by that `project` statement:

[![Screen Shot 2014-10-02 at 10.29.45 PM](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-10-29-45-pm.png?w=620)](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-10-29-45-pm.png)

If you've done this correctly, you'll notice that the modules referenced by your project will show up in the project navigator, even if those modules are external to the project directory:

[![Screen Shot 2014-10-02 at 10.31.30 PM](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-10-31-30-pm.png?w=620)](http://www.philosophicalhacker.com/wp-content/uploads/2014/10/screen-shot-2014-10-02-at-10-31-30-pm.png)

This allows you to work on library code and app code simultaneously. Version control integration also works just fine when you reference modules externally this way. You can commit and push your modifications to the library code just like you can commit and push modifications to your app code.

This way of setting up multiple projects avoids the difficulties that plague Google's recommended configuration. Because we are referencing a module that is outside of the project directory we don't have to make extra copies of the library module for every app that depends on it and we can version our libraries without any sort of git submodule nonsense.

Unfortunately, this other way of setting up multiple projects is very difficult to find. Obviously, its not something you'll figure out from looking at Google's guide, and at this point, there's no way to configure your projects in this way by using the UI of Android Studio. I'm hoping that'll change by the time Android Studio hits 1.0

If you've got any concerns with this setup or if you have a better alternative, I'd love to hear it!


## Notes:


1. I say "sort of" because you aren't exactly stuck between the two options I've discussed here. You could also turn your libraries into maven artifacts and include them into your app that way. This method, however, does not allow you to work on your library code and app code simultaneously unless you run multiple instances of Android Studio. Aint nobody got the memory for that.

2. Well, there are alternatives to git submodules that might offer a decent solution here, but why make things so complicated, when you can simply do what I've suggested in this post.
