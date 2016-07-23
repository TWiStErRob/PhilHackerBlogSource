+++
comments = true
date = "2016-07-23T15:43:29-04:00"
draft = false
image = ""
menu = ""
share = true
slug = "rxloader-boilerplate-free-data-loading-with-loaders-and-rxjava"
tags = ["android", "rxjava"]
title = "RxLoader: Lightweight, Boilerplate-Free Data loading with Loaders and RxJava"
+++

>Loaders are awesome...they're essentially the best practice implementation of asynchronous data loading in your Activities.
>
>-Reto Meier, Developing Android Apps Udacity Course
<!--more-->
The following code should make you nervous:

{{< highlight java "style=default" >}}
public class BoilerplateFree extends AppCompatActivity {

    //...    

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_boilerplate_free);
        mLoginObservable.subscribe(new Action1<AuthManager.AuthResponse>() {
            @Override
            public void call(AuthManager.AuthResponse authResponse) {
                Log.d(TAG, "call: Successfully logged in");                
            }
        });
    }
}
{{< / highlight >}}

When you see this code you should be asking, "What will happen upon a configuration change? Will the `Activity` leak? Do we need to re-query the network just because of a configuration change?" (Hopefully, when you see this code, you're also wondering, [like I do](http://www.philosophicalhacker.com/post/why-we-should-stop-putting-logic-in-activities/), "Why are we putting logic in our `Activitys`?")

Nervous questions aside, wouldn't it be better if we *could* write data loading code like this? Wouldn't it be nice if we load data into our apps using `Observable`s without worrying about leaking activities and/or wasting the user's data by re-querying the network every time there was a configuration change? Wouldn't it be nice, moreover, if we could do this without writing any boilerplate code? 

I think so, and in this post, I'll introduce a *tiny* library that'll help us write code like this. The gist of the approach is to use Loaders *with* RxJava. Before we get into this approach, however, lets look at some other ways that people handle asynchronous data loading in their apps so that we can see what this approach offers that other ones don't.

### Prior Art

#### Loaders

Loaders give us what we want vis-a-vis memory-leak-free querying whose results persist across orientation changes, but many people find the API clunky and/or confusing. Apparently, Jake Wharton is one of these people:

{{< tweet 325630461852413952 >}}

#### Retained Fragment

Using a retained fragment is another approach for persisting the results of a network request across orientation changes and avoiding memory leaks. Unfortunately, this approach requires a fair amount of boiler-plate code. The barebones implementation as discussed in [the docs](https://developer.android.com/guide/topics/resources/runtime-changes.html) will make this clear enough. Even if we could get rid of most of this boilerplate, we still don't have an api for working with our asynchronous data that's as nice as RxJava's `Observable`. 

#### Cache-Replay

Cache-Replay is an approach suggested in Dan Lew's ["Grokking RxJava Pt 4"](http://blog.danlew.net/2014/10/08/grokking-rxjava-part-4/). The idea here is do the following:

1. store our `Obersvable` outside the Activity life-cycle (e.g., a retained fragment or singleton)
1. un-subscribe from this `Observable` when our Activity is being destroyed
1. use the `cache` and `replay` operators to ensure that when we re-subscribe to this `Observable`, we're getting the same data

This approach may be the best we've seen so far. We get all the benefits of `Loader`s and `Observable`s, but unfortunately, we still have some boilerplate: we have to find a place outside the activity life-cycle for our `Observable` and we have to remember to un-subscribe from that `Obsevable`.

#### RxLifecycle

RxLifecycle can alleviate some of the weaknesses of the previous approach by giving us a way to automatically complete observable "sequences based on Activity or Fragment life-cycle events."<sup>1</sup> There's not much boilerplate we have to write to take advantage of this, which is an impressive feat of the library:

{{< highlight java "style=default" >}}
public class MyActivity extends RxActivity {
    @Override
    public void onResume() {
        super.onResume();
        myObservable
            .compose(bindToLifecycle())
            .subscribe();
    }
}
{{< / highlight >}} 

Unfortunately, if we don't want to subclass a particular kind of Activity to take advantage of this we'll need to write more boilerplate to generate an observable sequence of life-cycle events. Either way, RxLifecycle, combined with the previously outlined cache-replay approach, gives us a pretty nice way of loading data in our Android apps.

#### RxGroups

As far as I know, RxGroups is the most recent entry in the long line of solutions to data loading in Android apps. RxGroups alone gives us memory-leak-free querying whose results are cached across orientation changes, and according to [the docs](https://github.com/airbnb/RxGroups), the code we need to write to get this is pretty small. Since RxGroups seems to give us all of the benefits of `Loader`s and `Observable`s with the smallest amount of boilerplate, I think it may be the best solution out there, aside from the solution I'm about to propose.

#### Other "RxLoader" Libraries

There are a at least two other libraries that leverage RxJava for data loading. Neither of these libraries, however, use Android Loaders, so they wind up reinventing much of the functionality of `Loader`s and users of these libraries are still stuck with a few lines of boilerplate.

### A Better Way?

I think if we use `Loader`s *with* `Observable`s, we can come up with a solution that's better than the above solutions. Here's the basic idea: we wrap the call to `LoaderManager.initLoader` in an `Observable`:

{{< highlight java "style=default" >}}
Observable.create(new Observable.OnSubscribe<T>() {
    @Override
    public void call(final Subscriber<? super T> subscriber) {
        loaderManager.initLoader(loaderId, null, 
                new LoaderManager.LoaderCallbacks<T>() {
                    @Override
                    public Loader<U> onCreateLoader(int id, Bundle args) {
                        // return some loader
                    }

                    @Override
                    public void onLoadFinished(Loader<T> loader, T data) {
                        subscriber.onNext(data);
                    }

                    @Override
                    public void onLoaderReset(Loader<T> loader) {}
            });
    }        
});
{{< / highlight >}}

To be sure, this isn't the cleanest way of doing this, but I think its a useful way of initially presenting the idea. Let's think for a second about what this simple little trick gives us.

First, we don't have to worry about un-subscribing from this `Observable` to avoid memory leaks because the `Observable` *won't survive the configuration change.* Moreover, although the Observable gets garbage collected upon an orientation change, the data it emits will persist across orientation changes because that data is loaded with a `Loader.`

These two properties let us write boilerplate-free data loading code like the code with which we began this article:

{{< highlight java "style=default" >}}
public class BoilerplateFree extends AppCompatActivity {

    //...    

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_boilerplate_free);
        mLoginObservable.subscribe(new Action1<AuthManager.AuthResponse>() {
            @Override
            public void call(AuthManager.AuthResponse authResponse) {
                Log.d(TAG, "call: Successfully logged in");                
            }
        });
    }
}
{{< / highlight >}} 

But where does the `mLoginObservable` that's wrapped the `LoaderManager.init` call come from? That's where RxLoader comes into play. RxLoader is a *very* lightweight library (less than 150 LOC). It's simply an RxJava `Transformer` that lets you take an Observable and compose it into something with loader-like behaviour, something that in fact uses a `Loader` to get this behaviour for free. With RxLoader, your data loading code is as simple as this:

{{< highlight java "style=default, hl_lines=9" >}}
public class BoilerplateFree extends AppCompatActivity {

    //...    

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_boilerplate_free);
        mLoginObservable.compose(RxLoader.from(this))
            .subscribe(new Action1<AuthManager.AuthResponse>() {
            @Override
            public void call(AuthManager.AuthResponse authResponse) {
                Log.d(TAG, "call: Successfully logged in");                
            }
        });
    }
}
{{< / highlight >}}

One line of code gets you an `Observable` with memory-leak-proof data loading whose results are cached across orientation changes.

[Here's](https://github.com/kmdupr33/RxLoader) the project on github. I'll be improving it and getting it on to maven central soon. 

### Notes

1. Quote is from [the RxLifecycle docs](https://github.com/trello/RxLifecycle). 