+++
comments = true
date = "2016-06-06T15:36:27-04:00"
draft = true
image = "./images/react-android-redux.png"
share = true
slug = "react-and-redux-like-architectures-for-android"
tags = ["android"]
title = "React-and-Redux-like Architectures for Android"
+++

React and Redux are libraries that have taken the web development world by storm. Touted benefits of these libraries include code that's "easier to reason about," [time traveling debugging, and hot reloading](https://www.youtube.com/watch?v=xsSnOQynTHs). This article is about the ways in which the architectural principles underlying react and redux may improve our ability to write "clean" Android code.

In the first section, I briefly go over what I believe is the key principle that drives the benefits of libraries like react and redux. Spoiler: its functional programming applied to views of applications.

In the following section, I briefly reiterate the widely recognized benefits we gain by applying functional programming to our application's views and I also note an additional benefit: our UI-related tests can be written without mocks and are therefore less brittle.

In the third section, I voice some Android-specific difficulties that may arise when we try to apply react and redux to our Android apps.

In the final section, I suggest how we might use react-and-redux-like architectures in our apps by leveraging the databinding library and RxJava.

![lambda symbol](/images/lambda.png")

# The Principles

## React

As I said at the outset, I think that "functional programming" is the key principle underlying the effectiveness of react and redux. Functional programming is (roughly) programming without mutable state.<sup>1</sup> React and redux are (roughly) ways of doing UI programming without mutable state. Instead, the content rendered on the screen are the return values of "pure functions," functions that do not use or mutate any state that exists outside of those function.

React, as I see it, is about making what gets rendered to our screen a pure function of some view state object. Let's say we have state object that looks like this:

{{< highlight java "style=default,linenos=inline" >}}
public class MainActivity extends Activity {

  //...

  @Override
  public void onCreate() {
    ViewState viewState = new ViewState("Introduce React",
        "Cause not everyone knows about it");
  }

  public static class ViewState {
    private final String todoTitle;
    private final String todoDescription;

    public ViewState(String todoTitle, String todoDescription) {
      this.todoTitle = todoTitle;
      this.todoDescription = todoDescription;
    }
  }
}
{{< / highlight >}}


Now, suppose we have a function that takes this state object and renders our view with the data from this object:

{{< highlight java "style=default,linenos=inline, hl_lines=9" >}}
public class MainActivity extends Activity {

  //...

  @Override
  public void onCreate() {
    ViewState viewState = new ViewState("Introduce React",
        "Cause not everyone knows about it");
    render(viewState, this);
  }

  private void render(ViewState viewState, Activity activity) {
    View todoTitleTextView = new TextView(activity);
    todoTitleTextView.setText(viewState.todoTitle);

    View todoDescriptionTextView = new TextView(activity);
    todoDescriptionTextView.setText(viewState.todoDescription);

    View todoDetailLinearLayout = new LinearLayout(activity);
    todoDetailLinearLayout.setOrientation(VERTICAL);
    todoDetailLinearLayout.addView(todoTitleTextView);
    todoDetailLinearLayout.addView(todoDescriptionTextView);
    activity.setContentView(todoDetailLinearLayout);
  }

  public static class ViewState {
    //...
  }
}
{{< / highlight >}}

Believe or not, the above code shows the key principle underlying react's awesomeness: what gets rendered to the screen is a pure function of some state object. To be sure, React is also awesome because it provides a declarative way (viz., JSX) to write functions like `render`, but that wouldn't matter if `render` wasn't a pure function.

In some ways, the react library is similar to what the folks working on the Android data binding support library are hoping to achieve. If we use a subset of the features offered by the data binding library, we can achieve a purely functional and declarative description of what should render on our screen, and thus, we can approximate the most important functionality of React.

At this point, you're probably not impressed. It might only seem like I've shown you a more longwinded way of binding data to a view. However, you can start to see the benefit of a purely functional description of what should be rendered on a screen by imagining some of the benefits of the android data binding library without some the pitfalls that Andrei Catinean has worried about [here](https://catinean.com/2015/05/31/how-you-can-go-wrong-with-the-new-data-binding-api/) and Jake Wharton has worried about [here](https://twitter.com/JakeWharton/status/623594512619847681).

## Redux

Redux is about making that state object a pure function of the previous state and any action we perform.

# The Benefits

# Some Concerns

# An Implementation

# Next Steps

# Notes

1. For an excellent introduction to function programming, see [An Introduction to Functional Programming](https://codewords.recurse.com/issues/one/an-introduction-to-functional-programming)