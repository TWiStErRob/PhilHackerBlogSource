+++
comments = true
date = "2016-06-16T16:58:30-04:00"
draft = false
image = "images/life-ring.jpg"
share = true
slug = "post-title"
tags = ["android", "testing", "refactoring"]
title = "How to Safely move Logic out of Activities"
+++

In [my last post](http://www.philosophicalhacker.com/post/why-we-should-stop-putting-logic-in-activities/), I argued that we should stop putting our app logic in `Activity`s and `Fragment`s because it makes both unit testing *and* functional testing our apps more difficult. In this post, I'll try to suggest a method of safely removing app logic from our `Activity`s and `Fragment`s, drawing on a central idea discussed in Michael Feathers' *Working Effectively with Legacy Code*: characterization tests.

In the first section, I briefly introduce the idea of characterization tests. In the second section, I walk through some of the complications that arise when you're trying to write characterization tests for `Activity`/`Fragment`s. Source code examples are excerpts from [my fork of the Google IO app](https://github.com/kmdupr33/iosched/tree/refactor/characterization_tests).

### Brief Intro Characterization Tests

>Changes in a system can be made in two primary ways. I like to call them Edit and Pray and Cover and Modify...When you use Edit and Pray, you carefully plan the changes you are going to make, you make sure that you understand the code you are going to modify, and then you start to make the changes. When you’re done, you run the system to see if the change was enabled, and then you poke around further to make sure that you didn’t break anything...Cover and Modify is a different way of making changes. The idea behind it is that it is possible to work with a safety net when we change software.

>Michael Feathers, *Working Effectively with Legacy Code*, pg. 32

Characterization tests are tests that form the "safety net" that Feathers refers to in the above quotation. The purpose of characterization tests is, as the name implies, to *characterize* the *current behavior* of the system. These tests help us ensure that when we refactor our code, we are preserving the current behavior of the system. For every change we make, the result of running our characterization tests will tell us whether we've accidentally changed the behavior of our app.

Usually, writing a characterization tests is a pretty simple process. According to Feathers:

>1. Write tests for the area where you will make your changes. Write as many cases as you feel you need to understand the behavior of the code.
>2. After doing this, take a look at the specific things you are going to change, and attempt to write tests for those.
>3. If you are attempting to extract or move some functionality, write tests that verify the existence and connection of those behaviors on a case-by-case basis. Verify that you are exercising the code that you are going to move and that it is connected properly. Exercise conversions.

> Pg. 218

![safety net](/images/net.jpg)

>Image Credit: Cea on [Flickr Creative Commons](https://www.flickr.com/photos/centralasian/3896333282/in/photolist-6WiJ93-i2ZU8-AL26v-NqLkJ-57Gmup-4QiXwQ-67j8Sw-fuf5d1-5DJrYY-9YjbZP-7UJ75S-piX5fr-jzCox-8s9BdN-uST4Hi-tw8VdM-5yxEvF-2QSfpF-onBRex-6Aj5cU-3Jyy7k-8YYKtq-8TRZ33-as2Fdq-rhXdJ8-oTXJh5-aNqeHH-hcEk7d-7ACDg-6EcoYB-mmgBPF-mz68zf-sFGHZq-6EhPsd-dor5Cp-6EcFhV-coe1tY-EDaP5-9Yn6dW-2zCxU-8YiQA1-7dQsZA-8Fq6BQ-n1F765-7dQssm-6wskCt-C44Dg-6EepXT-6EesLa-C4543)

### Characterization Tests for Activities and Fragments

Unfortunately, writing characterization tests for `Activity`/`Fragment`s is not as simple as writing characterization tests in the general case. In fact, writing characterization tests for any object instantiated by the Android OS is not easy (think `Activity`, `Fragment`, `Service`, `BroadcastReceiver`, etc.). In this section, I explore two things that make writing characterization tests for `Activity`s and `Fragment`s challenging. I also suggest ways to work around these challenges.

#### Law of Demeter Violations

`Activity`s and `Fragment`s have dependencies. Some of those dependencies are only accessible if we violate the law of demeter. For example, the `PresenterFragmentImpl` needs to get a hold of a `ContentResolver`:

{{< highlight java "style=default, hl_lines=11" >}}
@Override
public void onAttach(Activity activity) {
    super.onAttach(activity);

    // Register content observers with the content resolver.
    if (mContentObservers != null) {
        Iterator<Map.Entry<Uri, ThrottledContentObserver>> observers =
                mContentObservers.entrySet().iterator();
        while (observers.hasNext()) {
            Map.Entry<Uri, ThrottledContentObserver> entry = observers.next();
            activity.getContentResolver().registerContentObserver(
                    entry.getKey(), true, entry.getValue());
        }
    }
}
{{< / highlight >}}

Characterizing the behavior of this method is challenging because law of demeter violations force us to make our mocks return mocks so that we can verify the interactions with the `Fragment`'s dependencies:

{{< highlight java "style=default, hl_lines=7 8 9 31 32" >}}
private void characterizeOnAttach(Actor actor, Asserter asserter) {
    // Arrange
    mPresenterFragSpy.configure(mFragmentManager, 0, mModel,
      new QueryEnum[]{}, new UserActionEnum[]{});


    final Activity activity = mock(Activity.class);
    final ContentResolver contentResolver = mock(ContentResolver.class);
    when(activity.getContentResolver()).thenReturn(contentResolver);

    // Act
    actor.act(activity);

    // Assert
    asserter.doAssert(contentResolver);
}

@Test
public void characterizeOnAttachIfRegisteredContentObservers() throws Exception {
    //...
    characterizeOnAttach(new Actor() {
        @Override
        public void act(Activity activity) {
            mPresenterFragSpy.registerContentObserverOnUri(Uri.EMPTY, queriesToRun);
            mPresenterFragSpy.onAttach(activity);
        }
    }, new Asserter() {
        @Override
        public void doAssert(ContentResolver contentResolver) {
            // ...
            verify(contentResolver).registerContentObserver(eq(Uri.EMPTY),
              eq(true), notNull(ThrottledContentObserver.class));
        }
    });
}
{{< / highlight >}}

Typically, we don't want to write tests with mocks returning mocks since this suggests that our design may smell. In this case, we are merely trying to characterize the already existing behavior of our `Activity` or `Fragment`. Once we refactor, we should have a design that doesn't require this, but in the mean-time, we need this characterization test to make sure that we are preserving app behavior during our refactor.

#### (Nearly) Impossible DI

`Fragment`s and `Activity`s get their dependencies via an accessor method. `getLoaderManager`, `getContentResolver`, or `getFragmentManager` are a few examples of such accessor methods. Here's a method that uses one of these accessors:

{{< highlight java "style=default, linenos=inline, hl_lines=10 12" >}}
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
        // No data query to load, update the view.
        mUpdatableView.displayData(mModel, null);
    }
}
{{< / highlight >}}

If we're characterizing a method like this one, we need to verify that the `Fragment` calls the correct methods on the dependencies returned by these accessor methods. Verifying the interaction of an object with its dependencies means that we need to be able to swap out those dependencies with mocks.

One way of doing this would be to have a special subclass of the `Activity` or `Fragment` you'd like to test. This sub-class could override the accessors to return mocks. Our characterization tests could then instantiate these special subclasses and use the mocks returned by the accessors to verify the interactions.

This isn't a great solution. For reasons that I hope are clear, using this solution would force us to repeatedly subclass every `Activity` or `Fragment` in our app to return mock accessors.

A better solution is to use mockito spies. Like mocks returning mocks, we typically don't use spies in our tests because it suggests a smelly design. However, in this case, spies help us write characterization tests without having make a non-trivial changes to the code we are trying to characterize or without having to repeatedly subclass all of our `Activity`s and `Fragment`s to return mocks. Here's an example of how spies help us do this:

{{< highlight java "style=default, hl_lines=7 8 13" >}}
@Test
public void characterizeOnActivityCreatedIfInitialQueriesToLoad() throws Exception {

    final ExploreModel.ExploreQueryEnum sessions = ExploreModel.ExploreQueryEnum.SESSIONS;
    mPresenterFragSpy.configure(mFragmentManager, 0, mModel, new QueryEnum[]{sessions}, new UserActionEnum[]{});

    final LoaderManager loaderManager = mock(LoaderManager.class);
    when(mPresenterFragSpy.getLoaderManager()).thenReturn(loaderManager);

    mPresenterFragSpy.onActivityCreated(mock(Bundle.class));

    assertNotNull(mPresenterFragSpy.getLoaderIdlingResource());
    verify(loaderManager).initLoader(eq(sessions.getId()), isNull(Bundle.class), notNull(LoaderManager.LoaderCallbacks.class));
}
{{< / highlight >}}

Using a spy, we're able to stub out the `getLoaderManager` method to return a mock `LoaderManager`. We can then verify that `onActivityCreated` calls the right methods on the `LoaderManager`.

### Conclusion

Safely moving logic out of large `Activity`s and `Fragment`s can be a lot of work, but its less work than manually verifying that we haven't broken anything every time we make a change to the `Activity` or `Fragment` we are refactoring.

Even if we recognize that writing these characterization tests is better than manual verification, writing them can be pretty soul-sucking. Keep in mind that we don't need to move all of the logic out at once, so we don't need to write all characterization tests at once.

Instead, we can identify various responsibilities that are carried out by our `Activity`s and `Fragment`s and plan to extract classes to handle those responsibilities. Once we have a clear picture of the class we want to extract from the `Activity` or `Fragment`, we can write characterization tests that will serve as a safety net for that single extraction, rather than attempting to write characterization tests for all the non-trivial methods in the `Activity`/`Fragment` we are refactoring.