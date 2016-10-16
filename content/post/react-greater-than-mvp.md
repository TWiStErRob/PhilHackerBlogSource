+++
comments = true
date = "2016-06-09T15:22:47-04:00"
draft = false
author = ""
share = true
slug = "testing-strategies-with-a-react-redux-architecture"
tags = ["android", "testing"]
title = "Testing Strategies with a React/Redux Architecture"
+++

In [my last post](/post/react-and-redux-like-architectures-for-android/), I briefly introduced the principles behind React and Redux. I said that React is about making what gets rendered to the screen a function of some view-state object. I also said that Redux is about making updates to the screen a function of the current view-state object and an action describing a user's interaction with the view.

In this post, I explore a benefit of a React/Redux-like architecture vis-a-vis testing. More specifically, I suggest that a React/Redux-like architecture opens up a testing strategy that doesn't suffer from the disadvantages of the testing strategy we use with the MVP architecture.

## A Disadvantage of MVP

Android architectures that rely on MVP are forced to use behavior-based verification in their unit tests. Behavior-based verification is about ensuring that the unit being tested is interacting properly with it's collaborators. For example, consider this test from [Google's testing code lab](https://codelabs.developers.google.com/codelabs/android-testing/index.html?index=..%2F..%2Findex#5):

{{< highlight java "style=default" >}}
@Test
public void loadNotesFromRepositoryAndLoadIntoView() {
   // Given an initialized NotesPresenter with initialized notes
   // When loading of Notes is requested
   mNotesPresenter.loadNotes(true);

   // Callback is captured and invoked with stubbed notes
   verify(mNotesRepository).getNotes(mLoadNotesCallbackCaptor.capture());
   mLoadNotesCallbackCaptor.getValue().onNotesLoaded(NOTES);

   // Then progress indicator is hidden and notes are shown in UI
   verify(mNotesView).setProgressIndicator(false);
   verify(mNotesView).showNotes(NOTES);
}
{{< / highlight >}}

The test ensures that the `mNotesPresenter`'s `loadNotes` works properly by verifying that it's called `setProgressIndicator` and `showNotes` on that `mNotesPresenter`'s `View`.

Behavior-based based verification and mocks can be useful, but there are some costs with using this method of verification for our tests. Martin Fowler summarizes these costs well in his essay ["Mocks aren't Stubs"](http://martinfowler.com/articles/mocksArentStubs.html). In this essay he talks about the costs of "mockist tests," tests that uses mocks and behavior-based verification. Here are some relevant excerpts:

>When you write a mockist test, you are testing the outbound calls of the SUT [System Under Test] to ensure it talks properly to its suppliers. A classic test only cares about the final state - not how that state was derived. Mockist tests are thus more coupled to the implementation of a method. Changing the nature of calls to collaborators usually cause a mockist test to break...implementation changes are much more likely to break tests than with classic testing.

Here's another disadvantage he points out:

>Mockist testers do talk more about avoiding 'train wrecks' - method chains of style of getThis().getThat().getTheOther(). Avoiding method chains is also known as following the Law of Demeter. While method chains are a smell, the opposite problem of middle men objects bloated with forwarding methods is also a smell. (I've always felt I'd be more comfortable with the Law of Demeter if it were called the Suggestion of Demeter.)

If we're sympathetic with Fowler here and we think that middle men objects bloated with forwarding methods is just as much a smell as law of demeter violations, then we might regret the fact that effective use of mocks require that we follow the law of demeter "to the T."

Fowler also mentions some advantages of behavior-based verification. Ultimately, he doesn't seem to have a strong opinion on which strategy should be used. I'm not going to try to settle that question here either. It might turn out that the benefits of mockist tests outweigh the costs. For the remainder of the article, I just want to focus on how a React/Redux architecture opens up the possibility of state-based verification for our UI-related unit tests.

## State-based Verification with React/Redux

Let's return the filtered list example we introduced in [the last article](/post/react-and-redux-like-architectures-for-android/). Again, here's a video of the functionality we want to test:

{{< youtube qUYP1WNz50U >}}

Last time, I showed how we might implement this functionality according to the principles of React and Redux. Again those principles are that the content of a screen is a function of some view-state object and updates to the screen are a function of some view-state object and some action describing a user's interaction with the screen. Here's what our React/Redux-like code looked like:

{{< highlight java "style=default, hl_lines=1 8" >}}
private final Reducer reducer = new Reducer();
// The OnClickListener for the Switch widgets on the navigation filter.
private final View.OnClickListener mDrawerItemCheckBoxClickListener =
        new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        final TagMetadata.Tag tag = (TagMetadata.Tag) v.getTag();
        mTagFilterHolder = reducer.reduce(mTagFilterHolder, new Click(tag));
        reloadFragment();
    }
};

//...

static class Reducer {
  public TagFilterHolder reduce(TagFilterHolder tagFilterHolder, Click click) {
      // Create a new holder with all the values from the old holder
      TagFilterHolder newTagFilterHolder = new TagFilterHolder(tagFilterHolder);
      TagMetadata.Tag theTag = click.getTag();
      if (tagFilterHolder.contains(theTag.getId())) {
          newTagFilterHolder.remove(theTag.getId(), theTag.getCategory());
      } else {
          newTagFilterHolder.add(theTag.getId(), theTag.getCategory());
      }
      return newTagFilterHolder;
  }
}
{{< / highlight >}}

Recall that the `reloadFragment` call uses the `mTagFilterHolder` as a view-state object to determine what get's rendered to the screen. Testing this `reduce` method doesn't require the use of mocks:

{{< highlight java "style=default" >}}
@Test
public void shouldToggleFilter() {
    //Arrange
    ExploreSessionsActivity.Reducer reducer = new ExploreSessionsActivity.Reducer();
    TagFilterHolder tagFilterHolder = new TagFilterHolder();
    tagFilterHolder.add("AudienceGrowth", Config.Tags.CATEGORY_THEME);
    final TagMetadata.Tag tag = new TagMetadata.Tag("AudienceGrowth", "name", Config.Tags.CATEGORY_THEME, 1,
            "some stuff", 1);
    final ExploreSessionsActivity.Click clickAction = new ExploreSessionsActivity.Click(tag);

    //Act
    final TagFilterHolder holder = reducer.reduce(tagFilterHolder, clickAction);

    //Assert
    assertFalse(holder.contains("AudienceGrowth"));
}
{{< / highlight >}}

This shows that React/Redux-like architectures open up the possibility of using state-based verification in our UI unit test code. This opens up the possibility of unit tests that don't suffer from the disadvantages pointed out by Martin Fowler.

## Conclusion

The fact that React/Redux-like architectures open up the possibility of alternative testing strategies is an additional reason that we should consider these architectures for Android Development. I think that by utilizing RxJava with a subset of the features provided by the Android data-binding library, the approach I've sketched here can scale to an architecture that allows for time-travel debugging, hotswap, and a more flexible testing strategy, but that's something that I'll have to explore another time.
