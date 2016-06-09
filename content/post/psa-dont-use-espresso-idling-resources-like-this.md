+++
comments = true
date = "2016-06-07T06:54:20-04:00"
draft = false
share = true
image = "/images/coffee.jpeg"
slug = "psa-dont-use-esprsso-idling-resources-like-this"
tags = ["android", "testing"]
title = "PSA: Dont Use Espresso Idling Resources like Google does"
+++

>Roman Nurik: ...That's actually one of the harder things with writing good sample code. People are going to be copying and pasting the heck out of it so you can't take those shortcuts that you sometimes hopefully aren't taking.

>Chet Haase: I always take the shortcuts. That's one of the more interesting things that the developer relations group does in general...we will put together tests and sample code for the features that we work but we really don't have the time to dive in deeply and do it in a real context.

>Android Developers Backstage, [Episode 23](http://androidbackstage.blogspot.com/2015/04/episode-24-roman-holiday.html), 17:35-18:34

Google has to put together a series of "code labs" that are meant to provide a hands on learning experience for grokking Android-related topics. It's been a while since I've worked seriously on the Android platform, so I thought I'd take a look at the code lab on Android testing to see what has changed. (Cause I care [about testing](http://www.philosophicalhacker.com/2015/04/10/against-android-unit-tests).)

[The Android testing code lab](https://codelabs.developers.google.com/codelabs/android-testing/index.html?index=..%2F..%2Findex#0) walks you through the process of creating tests for a Todo application. One of the features of the todo application is that it shows a list of todos. This feature is implemented by a `NotesPresenter` class (presenter as in "[Model View Presenter](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)"). While I was looking at the testing code lab on testing, I stumbled upon something disturbing within the `NotesPresenter`:

{{< highlight java "style=default, hl_lines=7 12" >}}
@Override
public void loadNotes(boolean forceUpdate) {    
    //...

    // The network request might be handled in a different thread so make sure Espresso knows
    // that the app is busy until the response is handled.
    EspressoIdlingResource.increment(); // App is busy until further notice

    mNotesRepository.getNotes(new NotesRepository.LoadNotesCallback() {
        @Override
        public void onNotesLoaded(List<Note> notes) {
            EspressoIdlingResource.decrement(); // Set app as idle.
            mNotesView.setProgressIndicator(false);
            if (notes.isEmpty()) {
                mNotesView.showNotesEmptyPlaceholder();
            } else {
                mNotesView.showNotes(notes);
            }
        }
    });
}
{{< / highlight >}}

This article is about why this code is disturbing and what we can do to fix it. Spoiler: it violates the principle of single responsibility and we can fix it using the dependency injection and decorator patterns.

# Disturbing

The comments in the above code definitely help to point out why this is troubling, but if you're not familiar with `IdlingResource`, you may not immediately see why the problem with this code. `IdlingResource`s help you write robust functional UI tests with espresso. These tests are "robust" because you don't need to explicitly tell your tests to "sleep" for a *predetermined* amount of time while some asynchronous task completes. `IdlingResource`s is a way of telling espresso "don't do any more assertions because the app is doing something that might affect whether your assertions are satisfied."

For example, suppose we have an espresso test that verifies that the todo notes are displayed after they are loaded and that the progressIndicator in the view is hidden after those notes are loaded:

{{< highlight java "style=default" >}}
@Test
public void showNotes() throws Exception {
    onView(withId(R.id.progressIndicator)).check(matches(not(isDisplayed())));
    onView(withId(R.id.notes_list)).check(matches(isDisplayed()));
}
{{< / highlight >}}

We don't want this code to immediately assert that the progressIndicator is invisible and the notes list are visible because it takes some time for the notes to load from the network. So, the previous code snippet with an `IdlingResource` would tell this test that it needs to wait until the notes are loaded from the network before performing this verification.

Let's take a second look at the disturbing code:

{{< highlight java "style=default, hl_lines=7 12" >}}
@Override
public void loadNotes(boolean forceUpdate) {    
    //...

    // The network request might be handled in a different thread so make sure Espresso knows
    // that the app is busy until the response is handled.
    EspressoIdlingResource.increment(); // App is busy until further notice

    mNotesRepository.getNotes(new NotesRepository.LoadNotesCallback() {
        @Override
        public void onNotesLoaded(List<Note> notes) {
            EspressoIdlingResource.decrement(); // Set app as idle.
            mNotesView.setProgressIndicator(false);
            if (notes.isEmpty()) {
                mNotesView.showNotesEmptyPlaceholder();
            } else {
                mNotesView.showNotes(notes);
            }
        }
    });
}
{{< / highlight >}}

We can now quickly say what's disturbing about this: this presenter violates the principle of single responsibility. More than that: it violates the principle in a particularly egregious way: it mixes *application* responsibilities with *testing* responsibilities. This is silly. Don't do this. Violating the principle of single responsibility is a sure-fire way to create spaghetti code and spaghetti doesn't look as good in code as it does on a plate.

![spaghetti on a plate](/images/spaghetti.jpeg)

# Fixit

Instead of mixing responsibilities, register your `IdlingResource` in your tests-related code, where test-related responsibilities belong. One way to do this is the use dependency injection and decorators. The code lab project already has a limited dependency injection mechanism, so we can just use that. The project has a dependency injector that's specifically used for testing called `Injection.` All we need to do is decorate the `NotesRepository` that's injected by the `Injection` class, and we have what we need to avoid mixing responsibilities:

{{< highlight java "style=default" >}}
public static NotesRepository provideNotesRepository() {
    final NotesRepository inMemoryRepoInstance
      = NoteRepositories.getInMemoryRepoInstance(new FakeNotesServiceApiImpl());
    return new NotesRepository() {
        @Override
        public void getNotes(@NonNull final LoadNotesCallback callback) {
            EspressoIdlingResource.increment();
            inMemoryRepoInstance.getNotes(new LoadNotesCallback() {
                @Override
                public void onNotesLoaded(List<Note> notes) {
                    EspressoIdlingResource.decrement();
                    callback.onNotesLoaded(notes);
                }
            });
        }

        //...
    };
}
{{< / highlight >}}

The `NotesRepository` returned by this method gets injected into the `Presenter` here:

{{< highlight java "style=default, hl_lines=7 8" >}}
public class NotesFragment extends Fragment implements NotesContract.View {
    //...
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        /...
        mActionsListener
          = new NotesPresenter(Injection.provideNotesRepository(), this);
    }
}
{{< / highlight >}}

Voila. And now your espresso tests will wait until the notes have been loaded before asserting the view state and you've avoided mixing testing responsibilities with your business logic. Bon Appetite.