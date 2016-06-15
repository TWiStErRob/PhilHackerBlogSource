+++
comments = true
date = "2016-06-14T23:13:00-04:00"
draft = false
image = "images/main.png"
share = true
slug = "why-we-should-stop-putting-logic-in-activities"
tags = ["android", "testing"]
title = "Why we Should Stop Putting Logic in Activities"
+++

A while back, I wrote [a series of articles about why unit testing Android apps is so difficult and what we can do to make our apps more unit testable](www.philosophicalhacker.com/2015/04/10/against-android-unit-tests/). The upshot of the those articles is that dependency injection makes it easier to unit test our Android apps and we can't get proper dependency injection just by using Dagger (or any other DI framework for that matter) to inject dependencies into our `Activity`s (or `Fragment`s). I already consider this reason enough to stop putting non-trivial logic in our `Activity`s (or `Fragment`s).

More recently, however, I noticed that putting non-trivial logic in our `Activity`s (and `Fragment`s) also makes *functional* testing difficult. I noticed that [google's code sample contained code that mixed espresso test code with application code](www.philosophicalhacker.com/post/psa-dont-use-esprsso-idling-resources-like-this/), and I couldn't believe my eyes when I saw that the *the Google IO app*, an app that's supposed to serve as a model for Android developers, also [mixes espresso test code with application code](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/samples/apps/iosched/framework/PresenterFragmentImpl.java#L84).

If putting logic in our `Activity`s (or Frag...) is going to make functional *and* unit testing difficult, then we *all* should really consider alternatives ways of structuring our apps. This isn't just an issue for unit testing nerds anymore.

In this article, I argue that we should stop putting logic in our `Activity`s. I've already shown that putting logic in our `Activity`s makes them difficult to unit test, so I won't repeat that point here. I will, however, try to show why putting logic in our `Activity`s makes functional testing with espresso difficult. Spoiler: its difficult because we don't have proper dependency injection in `Activity`s. Next, drawing on [some recent comments by Diane Hackborn](https://plus.google.com/+DianneHackborn/posts/FXCCYxepsDU), I suggest that `Activity`s were never really designed for holding our app-logic in the first place.

![coffee art](/images/coffee-art.jpg)

## Why Functional Testing (with Espresso) is Hard

Let's look at an (abbreviated) snippet of code from the Google IO app:

{{< highlight java "style=default" >}}
public class PresenterFragmentImpl extends Fragment
        implements Presenter, UpdatableView.UserActionListener,
        LoaderManager.LoaderCallbacks<Cursor> {
  /**
   * The Idling Resources that manages the busy/idle state of the cursor loaders.
   */
  private LoaderIdlingResource mLoaderIdlingResource;

  /**
   * Returns the {@link LoaderIdlingResource} that allows the Espresso UI test framework to track
   * the idle/busy state of the cursor loaders used in the {@link Model}.
   */
  public LoaderIdlingResource getLoaderIdlingResource() {
      return mLoaderIdlingResource;
  }  

  @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);

        mLoaderIdlingResource =
                new LoaderIdlingResource(getClass().getName() + "/" + getId(), getLoaderManager());

        // Load data queries if any.
        if (mInitialQueriesToLoad != null && mInitialQueriesToLoad.length > 0) {
            LoaderManager manager = getLoaderManager();
            for (int i = 0; i < mInitialQueriesToLoad.length; i++) {
                manager.initLoader(mInitialQueriesToLoad[i].getId(), null, this);
            }
        } else {
            //...
        }
    }  

  @Override
  public Loader<Cursor> onCreateLoader(int id, Bundle args) {
      Loader<Cursor> cursorLoader = createLoader(id, args);
      mLoaderIdlingResource.onLoaderStarted(cursorLoader);
      return cursorLoader;
  }

  @Override
  public void onLoadFinished(Loader<Cursor> loader, Cursor data) {
      processData(loader, data);
      mLoaderIdlingResource.onLoaderFinished(loader);
  }
}
{{< / highlight >}}

So, here we're mixing espresso test code with application code. The reason the test code is mixed with application code is so that the espresso tests will "pause" while the data is being loaded during the functional UI tests. We can see that the `LoaderIdlingResource` gets registered with the espresso tests here:

{{< highlight java "style=default" >}}
@RunWith(AndroidJUnit4.class)
@LargeTest
public class VideoLibraryActivityTest {
  //...
  @Before
  public void setupMembersAndIdlingResource() {
      mPresenter = (PresenterFragmentImpl) mActivityRule.getActivity()
              .getFragmentManager().findFragmentByTag(BaseActivity.PRESENTER_TAG);
      Espresso.registerIdlingResources(mPresenter.getLoaderIdlingResource());
  }
}
{{< / highlight >}}

As I said in [my PSA](www.philosophicalhacker.com/post/psa-dont-use-esprsso-idling-resources-like-this/), mixing testing code with app code is gross. Unfortunately, separating the testing and application concerns in this case is not as simple as it was last time. In fact, I can understand why the engineers at Google decided to mix application code with test code in this case: it's because separating the Espresso code from the application code is a lot of work!

Here's the gist of how we can start to salvage the situation. We need what [Michael Feathers](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052) calls a "seam," a way to change the behavior of our `PresenterFragmentImpl` without having to edit the source of the `PresenterFragmentImpl` itself. When the `PresenterFragmentImpl` is run inside a test, we want the `PresenterFragmentImpl` to notify an espresso test when it's done loading it's data. Otherwise, we want the `PresenterFragmentImpl` to load data normally. To get this seam, we extract the Loader callback code into its own class and use an instance of this class as the `LoaderCallbacks` argument to the call to `initLoader`:

{{< highlight java "style=default, hl_lines=1 10 11 19 20 21 22" >}}
private LoaderManager.LoaderCallbacks<Cursor> mLoaderCallbacks;

@Override
public void onActivityCreated(Bundle savedInstanceState) {
    super.onActivityCreated(savedInstanceState);
    // Load data queries if any.
    if (mInitialQueriesToLoad != null && mInitialQueriesToLoad.length > 0) {
        LoaderManager manager = getLoaderManager();
        for (int i = 0; i < mInitialQueriesToLoad.length; i++) {
            manager.initLoader(mInitialQueriesToLoad[i].getId(),
              null, mLoaderCallbacks);
        }
    } else {
        // No data query to load, update the view.
        mUpdatableView.displayData(mModel, null);
    }
}

public static class CursorLoaderCallbacks
    implements LoaderManager.LoaderCallbacks<Cursor> {
  // We've just moved the callback code that was in the Fragment into this class.
}
{{< / highlight >}}

Next, we provide an alternative implementation of `LoaderManager.LoaderCallbacks` that we'll use for our espresso tests. This implementation uses the decorator pattern, just like last time:

{{< highlight java "style=default, hl_lines=7 14 21 26" >}}
private static class EspressoNotifyingLoaderCallbacks implements LoaderManager.LoaderCallbacks<Cursor> {

    private final LoaderIdlingResource mLoaderIdlingResource;
    private final LoaderManager.LoaderCallbacks<Cursor> loaderCallbacks;

    public EspressoNotifyingLoaderCallbacks(LoaderIdlingResource mLoaderIdlingResource, LoaderManager.LoaderCallbacks<Cursor> loaderCallbacks) {
        this.mLoaderIdlingResource = mLoaderIdlingResource;
        this.loaderCallbacks = loaderCallbacks;
    }

    @Override
    public Loader<Cursor> onCreateLoader(int id, Bundle args) {
        final Loader<Cursor> cursorLoader = loaderCallbacks.onCreateLoader(id, args);
        mLoaderIdlingResource.onLoaderStarted(cursorLoader);
        return cursorLoader;
    }

    @Override
    public void onLoadFinished(Loader<Cursor> loader, Cursor data) {
        loaderCallbacks.onLoadFinished(loader, data);
        mLoaderIdlingResource.onLoaderFinished(loader);
    }

    @Override
    public void onLoaderReset(Loader<Cursor> loader) {
        mLoaderIdlingResource.onLoaderFinished(loader);
    }
}
{{< / highlight >}}

Now, here's where things get tricky. We need to figure out a way to inject the right implementation of `LoaderCallbacks` into our `PresenterFragmentImpl`. When we're testing, we want an instance of `EspressoNotifyingLoaderCallbacks`. When we running a normal application, we want a `CursorLoaderCallbacks`.

Here's the problem: the `EspressoNotifyingLoaderCallbacks` has a `LoaderIdlingResource`. `LoaderIdlingResource` depends on an `Activity`'s `LoaderManager`, which means that we can't create the `EspressoNotifyingLoaderCallbacks` until *after* the activity has been created.

We can't afford to wait this long! We need the `EspressoNotifyingLoaderCallbacks` to be injected into the `Activity` before that `Activity` adds the `PresenterFragmentImpl`, thereby triggering it's lifecycle methods that create a `Loader`.

I can think of a few ways around this problem, but none of them seem particularly pretty. If we didn't have any logic in our `Activity` and `PresenterFragmentImpl` in the first place and if we placed that logic in a POJO that could make use of [constructor dependency injection](http://misko.hevery.com/2009/02/19/constructor-injection-vs-setter-injection/), this would be much easier. We could just pass the `EspressoNotifyingLoaderCallbacks` as a dependency to some POJO's constructor. The `Activity`, moreover, could just forward its lifecycle calls to that POJO, so that it would act appropriately.

So, the reason why functional testing with Android `Activity`'s is so hard is the same reason why unit testing `Activity`'s is hard: we can't do proper dependency injection.

![building](/images/architecture.jpg)

## Activities weren't Designed for App Logic

Diane Hackborn wrote an interesting post on Google Plus recently, and I think several of her comments suggest that `Activity`'s were never really designed to be the home of our app-logic in the first place. Here's one such comment:

>We often see questions from developers that are asking from the Android platform engineers about the kinds of design patterns and architectures they use in their apps.  But the answer, maybe surprisingly, is we often don't have a strong opinion or really an opinion at all.

>This may be surprising, because Android could feel like it has strong opinions on how apps should be written.  With its Java language APIs and fairly high-level concepts, it can look like a typical application framework that is there to say how applications should be doing their work.  But for the most part, it is not.

>It is probably better to call the core Android APIs a "system framework."  For the most part, the platform APIs we provide are there to define how an application interacts with the operating system; but for anything going on purely within the app, these APIs are often just not relevant.

Here's another telling comment:

>In Android...we explicitly decided we were not going to have a main() function, because we needed to give the platform more control over how an app runs...To accomplish this, we decomposed the typical main entry point of an app into a few different types of interactions the system can have with it.  And these are the Activity, BroadcastReceiver, Service, and ContentProvider APIs that Android developers quickly become familiar with.

Together I take these two comments to mean something like this: `Activity`'s are entry points to your application. That's all we know. When we designed it we had no intentional at all as to whether you should put your app-logic within it. We don't even have an opinion on whether this is a good idea.

After seeing that putting our logic in `Activity`s makes unit and functional testing difficult, and after getting some insight into the intended design of `Activity`s, I think we wouldn't be crazy in thinking that putting app-logic in our `Activity` makes about as much sense as putting app-logic in a main function of a java program.

Of course, I'm open to being wrong about any of this. I'm offering this argument mainly as a way of getting a conversation going in the community about best practices in Android development. I mostly just don't want to open up the Google IO app for 2017 and see test code mixed in with application code. As long as we can agree on a way of avoiding that, I'll be happy, even if I turn out to be wrong about this.

