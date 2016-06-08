+++
comments = true
date = "2016-06-08T17:30:09-04:00"
draft = false
image = "./images/react-android-redux.png"
share = true
slug = "react-and-redux-like-architectures-for-android"
tags = ["android"]
title = "How React-and-Redux-like Architectures for Android can make Testing Easier"
+++

>I think there's a lot of value in seeing what else is happening, even if you're not a master of one of those other languages. As long as you're being exposed to it, you're opening your mind up to different ways of approaching problems and solving problems and different techniques.

>Jake Wharton, Fragmented, [Episode 6](http://fragmentedpodcast.com/episodes/6/), 27:45-28:20

React and Redux are libraries that have taken the web development world by storm. Touted benefits of these libraries include code that's "easier to reason about," [time traveling debugging, and hot reloading](https://www.youtube.com/watch?v=xsSnOQynTHs). Recently, [Christiana Lee spoke](https://www.youtube.com/watch?v=UsuzhTlccRk) about how these benefits could be applied to Android development in general.

I'm interested in how the central principles underlying React and Redux may improve our ability to write unit tests for our Android code. In this article, I'll try to briefly bring out the important bits of React/Redux for our purposes. In the next article, I'll talk about why structuring our code in a React/Redux way can be beneficial for testing.

![lambda symbol](/images/lambda.png")

# The Principle behind React

React, as I see it, is about making what gets rendered to our screen a *function of some view-state object*. We do something like this every time we write a `RecyclerView` or `ListView`. The view-state object is usually some kind of collection (e.g., a `List` or `Array`). We pass that object to an `Adapter` which renders our view. Typically, what is rendered is just a function of the collection we pass to the adapter.

However, we can use view-state objects in contexts other than collection views. To see this, let's look at an example view from the Google IO app.

{{< youtube qUYP1WNz50U >}}

Notice that when we tap one of the filter items in the IO app, the list of sessions updates so that it incorporates that filter. Let's start with how this is currently implemented in the IO app:

{{< highlight java "style=default,hl_lines=6 7 9 10 11 12 13 14" >}}
// The OnClickListener for the Switch widgets on the navigation filter.
private final View.OnClickListener mDrawerItemCheckBoxClickListener =
        new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        boolean isChecked = ((CheckBox)v).isChecked();
        TagMetadata.Tag theTag = (TagMetadata.Tag)v.getTag();
        LOGD(TAG, "Checkbox with tag: " + theTag.getName() + " isChecked => " + isChecked);
        if (isChecked) {
            mTagFilterHolder.add(theTag.getId(), theTag.getCategory());
        } else {
            mTagFilterHolder.remove(theTag.getId(), theTag.getCategory());
        }
        reloadFragment();
    }
};
{{< / highlight >}}

Note here that `mTagFilterHolder` is a state object that's used to determine what should be shown in the list. We can see this more clearly if we look at `reloadFragment()`, which looks like this:

{{< highlight java "style=default,hl_lines=8 9 12 13" >}}
private void reloadFragment() {
    // Build the tag URI
    Uri uri = mCurrentUri;

    if (uri == null) {
        uri = ScheduleContract.Sessions.buildCategoryTagFilterUri(
                ScheduleContract.Sessions.CONTENT_URI,
                mTagFilterHolder.toStringArray(),
                mTagFilterHolder.getCategoryCount());
    } else { // build a uri with the specific filters
        uri = ScheduleContract.Sessions.buildCategoryTagFilterUri(uri,
                mTagFilterHolder.toStringArray(),
                mTagFilterHolder.getCategoryCount());
    }
    setActivityTitle();
    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
    intent.putExtra(ExploreSessionsFragment.EXTRA_SHOW_LIVESTREAMED_SESSIONS,
            mTagFilterHolder.isShowLiveStreamedSessions());

    LOGD(TAG, "Reloading fragment with categories " + mTagFilterHolder.getCategoryCount() +
            " uri: " + uri +
            " showLiveStreamedEvents: " + mTagFilterHolder.isShowLiveStreamedSessions());

    mFragment.reloadFromArguments(intentToFragmentArguments(intent));
}
{{< / highlight >}}

`mTagFilterHolder` is being used to construct the URI that a `ContentProvider` will use to filter the results that get passed to a `ListView`. So, this implementation of the list filter is already well on its way to an implementation the follows principle behind React. That's because what's rendered is already partially *a function of some view-state object*. In this case, the view-state object is the `mTagFilterHolder`.

# The Principle Behind Redux

Redux, as I see it, as is about making any updates to our view *a function of the view-state object and an object that describes a view-related action that just occurred*. In Redux, these functions are called "reducers," and they return a new view-state object that is used to render the view.

The `OnClickListener` we saw above is almost a reducer in Redux's sense of the word because it updates the view by updating the view-state object and telling the fragment to re-render itself. Let's take a second look at that `OnClickListener` to remind ourselves of this:

{{< highlight java "style=default,hl_lines=10 12 14" >}}
// The OnClickListener for the Switch widgets on the navigation filter.
private final View.OnClickListener mDrawerItemCheckBoxClickListener =
        new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        boolean isChecked = ((CheckBox)v).isChecked();
        TagMetadata.Tag theTag = (TagMetadata.Tag)v.getTag();
        LOGD(TAG, "Checkbox with tag: " + theTag.getName() + " isChecked => " + isChecked);
        if (isChecked) {
            mTagFilterHolder.add(theTag.getId(), theTag.getCategory());
        } else {
            mTagFilterHolder.remove(theTag.getId(), theTag.getCategory());
        }
        reloadFragment();
    }
};
{{< / highlight >}}

This `ClickListener` isn't quite a reducer. Remember: reducers are functions of a view-state object and an object that describes a view-related action that just occurred. This `ClickListener`, however, is in a good position to call a reducer function:

{{< highlight java "style=default" >}}
private final View.OnClickListener mDrawerItemCheckBoxClickListener =
        new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        mTagFilterHolder = reduce(mTagFilterHolder,
          new Click((TagMetadata.Tag)v.getTag()));
        reloadFragment();
    }
};

private TagFilterHolder reduce(TagFilterHolder tagFilterHolder, Click click) {
  // Create a new holder with all the values from the old holder
  TagFilterHolder newTagFilterHolder = new TagFilterHolder(tagFilterHolder);
  TagMetadata theTag = click.getTag();
  if (tagFilterHolder.contains(theTag)) {
    newTagFilterHolder.remove(theTag.getId(), theTag.getCategory());
  } else {
    newTagFilterHolder.add(theTag.getId(), theTag.getCategory());
  }  
  return newTagFilterHolder;
}
{{< / highlight >}}

The `reduce` method fits the Redux's definition of a reducer function. The `tagFilterHodler` parameter passed into `reduce` method is the current state and the `click` parameter is an object that describes a view-related action that just occurred. `reduce`, moreover, returns a new view-state that describes how the view should render.

# Conclusion

That's all for now, but you can anticipate how this might make unit testing logic within the click listener easier. The `reduce` function works only with POJOs and we know that it's working properly when it returns an object that has the correct *state*. This allows us to use [state-based verification](http://martinfowler.com/articles/mocksArentStubs.html) in our tests, and as we'll see next time, this can make our tests less brittle and more meaningful. I believe that writing our UI-related business logic in reducers *may* give us a better way of writing tests that writing that logic in `Presenters`. More on that next time.
