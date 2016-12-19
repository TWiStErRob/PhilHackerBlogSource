+++
title = "Build Variants and Link Seams"
share = true
author = ""
comments = true
date = "2016-12-18T15:39:11-05:00"
slug = "build-variants-and-link-seams"
image = "images/chain.jpg"
menu = ""
draft = false
tags = [
  "android",
  "testing",
]
+++

*This post is just another installment in a series of posts that are a written version of [my Florida dev fest talk](https://devfestflorida.org/schedule/day1?sessionId=113). [Last time]({{< relref "post/object-seams-and-mvp-for-testability.md" >}}), we talked about object seams and how they make our apps more testable. This time, we'll talk about how link seams help you write more testable apps and how build variants are used to create link seams.*

### What are link seams?

>“[code] contains calls to code in other files. Linkers…resolve each of the calls so that you can have a complete program at runtime…you can usually exploit [this] to substitute pieces of your program”

>-Michael Feathers

The above quotation is Feathers' definition of a link seam. Recall that a seam is just something that allows us to change the behavior of a particular piece of code without modifying that code in that place.

Let's try to clarify this concept of a link seam by looking at one way of solving the "dr. jekyll/mr. hyde" smell I mentioned in [my first post]({{< relref "post/what-makes-android-apps-testable.md" >}}) in this series. Hopefully, this picture will help jog your memory of that smell:

![Dr. Jekyll and Mr. Hyde](/images/dr-jekyll-poster.jpg)

Here's the smelly code that used to live in the Google I/O app:

{{< highlight java "style=default, hl_lines= 8 16" >}}
public class PresenterFragmentImpl extends Fragment
        implements Presenter, UpdatableView.UserActionListener,
        LoaderManager.LoaderCallbacks<Cursor> {

    @Override
    public Loader<Cursor> onCreateLoader(int id, Bundle args) {
        Loader<Cursor> cursorLoader = createLoader(id, args);
        mLoaderIdlingResource.onLoaderStarted(cursorLoader);
        return cursorLoader;
    }

    @Override
    public void onLoadFinished(Loader<Cursor> loader,
                               Cursor data) {
        processData(loader, data);
        mLoaderIdlingResource.onLoaderFinished(loader);
    }
}
{{< / highlight >}}

The two highlighted lines point to a smell: this code mixes testing responsibilities in with production code. Idling resources, in case you didn't know, are used to tell espresso when it can continue executing tests. They're used to avoid having to place `sleep` calls all over your tests.

Now, we *could* actually solve this issue by using link seams. As we'll see later, using link seams to solve this problem directly is probably a bad idea, but its a useful example for introducing link seams and showing why they might be useful.

Before we see how this is possible, let's step back and remember that build variants are a thing. Build variants create special source sets that will get loaded onto the classpath whenever we are building a particular variant apk.

The typical example of build variants are "free" and "paid" versions of your app, but those variants wouldn't solve our problem. Our problem is this:

1. The app needs to be in a state we can use for testing that'll have a way of telling espresso to wait for some long-running operation to complete.

1. We also want a normal state for the app that we'd use for production that doesn't care about espresso at all.

So, let's say we created build variants for these to two states. Suppose we had a "mock" build variant that we wanted to use for testing and a "prod" version that we wanted to use for production. If we had those variants, we'd have special source sets and our project structure would look something like this:

![debug and mock source sets](/images/sourcesets-testable-apps-3.png)

If we had these different source sets, we could create two different `PresenterFragmentImpl.java` files. One would live in the `mock` build variant. The other would live in the `prod` variant. Common functionality could be abstracted to a superclass that lives in the `main` sourceset.<sup>1</sup>

If we've got things setup this way, then when the `PresenterFragmentImpl` gets instantiated, we'll have different implementations depending on whether we're building a `prod` or `mock` build variant. In that case, we can change the behavior of our program while also leaving the code that instantiates and uses our `PresenterFragmentImpl` alone:

{{< highlight java "style=default" >}}
public PresenterFragmentImpl addPresenterFragment(int uVResId,
                                  Model model,
                                  QueryEnum[] queries,
                                            UserActionEnum[] actions){
//...
  if (presenter == null) {
    //Create, set up and add the presenter.
    presenter = new PresenterFragmentImpl();
  } //...
  return presenter;
}
{{< / highlight >}}

What we've done perfectly fits the definition of a link seam: we've manipulated the classpath to link together different files in such a way that we can modify the behavior of the code that instantiates and uses `PresenterFragmentImpl` without actually modifying the source files that create and use `PresenterFragmentImpl`.

### What should they be used for?

Now that we (hopefully) have an idea of what link seams are, we can ask, "How *should* we use link seams to make our Android apps testable?"

I think link seams are most appropriately used for espresso tests.<sup>2</sup> However, there are a lot of *disadvantages* with the way I was using link seams above. I don't want to really spend any time on why I think this, but basically it boils down to this: once your object graph / dependency situation starts getting more complicated, your seams can wind up looking very messy.

In order to understand a better way to exploit link seams, it helps to be familiar with Feathers' concept of an "enabling point." Feathers defines an enabling point as follows:

>Every seam has an enabling point, a place where you can make the decision to use one behavior or another.

The enabling point for object seams is the point where those objects are instantiated, which is why dependency injection creates seams. If you instantiate a dependency within the client object, that client is tightly coupled with a particular implementation of that dependency. You can't change the behavior of that object without changing the source code of the class. Inverting the control of dependency implementation selection, on the other hand, creates an object seam whose enabling point is the point at which the dependency of a particular object is instantiated.

The enabling point for link seams created by build variants is the point when we make the decision to run `assembleMockDebug` or `assembleProdDebug`. That's the point at which we choose which behavior the app is going to have.

Instead of using link seams directly to make our code testable, I think, we're better off using link seams as an *enabling point* for object seams. As we said [last time]({{< relref "post/object-seams-and-mvp-for-testability.md" >}}), object seams are often created via dependency injection. So, what I'm suggesting is that we're better off setting up our code so that the different build variants choose how our dependency injection gets setup.

Let's flesh suggestion out by seeing how it would apply to the above example. Instead of having a `PresenterFragmentImpl` for each sourceset, we'd have a different factory for each sourceset.

{{< highlight java "style=default, hl_lines= 4 10" >}}
// prod sourcest
public class FragFactory {
    public PresenterFragmentImpl make() {
        return new PresenterFragmentImpl();
    }
}
// mock sourcest
public class FragFactory {
    public PresenterFragmentImpl make() {
        return new MockPresenterFragmentImpl();
    }
}
{{< / highlight >}}

Then, instead of directly instantiating a `PresenterFragmentImpl`, we'd get one from a factory.

{{< highlight java "style=default" >}}
public PresenterFragmentImpl addPresenterFragment(int uVResId,
                                  Model model,
                                  QueryEnum[] queries,
                                  UserActionEnum[] actions) {
  //...
  if (presenter == null) {
      //Create, set up and add the presenter.
      presenter = mFragFactory.make();
  } //...        
  return presenter;
}
{{< / highlight >}}

Getting the instance from a factory actually allows us the ability to change our apps behavior at run time instead of compile time, which can be very useful. [Square, for example, has a "mock mode"](https://speakerdeck.com/jakewharton/android-apps-with-dagger-devoxx-2013?slide=168) in their applications for testing where they can pull out a navigation drawer and tell the app to stub network responses instead of hitting their servers. The app restarts and does exactly that. This allows the stubbing code they wrote to be useful both for automated and manual testing.

Mock mode is neat, but there's a more important reason for using link seams as an enabling point for object seams: it opens us up to the possibility of using some kind of dependency injection library for managing the different states we want the app to be in for testing purposes. For example, we can set up our dagger modules differently depending on what build variant is being built and clients can consume all of the appropriate dependencies exposed by dagger.<sup>3</sup> Solutions like this give us a clean way of managing our seams.

### Conclusion

Link seams are ways of changing the behavior of a particular piece of code without editing that code in place by exploiting the way that files are linked together. With android, we do this via build variants. Link seams are useful for espresso tests, but shouldn't be used directly to put the app into a testable state. Instead, link seams should be used as an enabling point for object seams. This enables us to put our apps into a more testable state at run time (e.g., square's mock mode) and it helps us keep our seams clean, especially if we use a DI library.


### Notes:

1. If you already have a free and paid build variant, for example, and you're worried about how you would create mock and prod variants of those variants, you should look into [flavor dimensions](http://tools.android.com/tech-docs/new-build-system/user-guide#TOC-Multi-flavor-variants).

1. However, if you're trying to get unit tests around a particularly gnarly class whose dependencies aren't injected, it may be appropriate to use link seams.

1. Turns out there's actually [a guide in the dagger 2 docs](https://google.github.io/dagger/testing.html) that specifically addresses how to do this.
