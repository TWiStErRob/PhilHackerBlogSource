+++
slug = "if-android-tests-could-talk"
tags = [
  "android",
  "testing",
]
date = "2017-01-01T14:31:50-05:00"
draft = true
title = "If Android Tests Could Talk..."
menu = ""
share = true
comments = true
author = ""
+++

...here are some things I think they'd say:

### We usually tighly-couple to particular activities and this can cause issues

### App Component launching (along with intent construction complexity) is its own responsibility

### Adapters often violate the PSR

### GOF Singletons violate the PSR. Dagger is better.

### Android Singletons complicate clients (Preference manager is a good example. We force clients to provide a context when they wouldn't otherwise need to. We notice this as we're writing the test)

### Activities and Fragments already have enough responsibilities. They don't need more.

### "You sure you need to give me mocks that return mocks? Have you considered fixing your law of demeter violations instead?"

If you're not familiar with the law of demeter, you can look up a formal definition of the law of demeter [here](https://en.wikipedia.org/wiki/Law_of_Demeter) later. For our purposes, it's enough to say that if you aren't working with a fluent API and you have a statement or expression with multiple periods, then you're violating the law of demeter. Here are some examples, both of which are taken from the Google I/O app:

{{< highlight java "style=default" >}}

// This violates the law of demeter
if (dog.getCollar().getOwnerAddress()) {

}


// BUT multiple periods here is fine. A FirebaseDataReconciler builder has a fluent API
firebaseDataReconciler.buildRemoteDataObject()
    .buildLocalDataObject()
    .merge()
    .updateRemote()
    .updateLocal();
{{< / highlight >}}

### "If you're giving me a lot of assertions, we might be testing a class that does too much."

### "Find there's a lot of ceremony to get me setup? Our target class probably does too much."

### "Just discover a new object that simplifies your code as a result of writing me? You're welcome"
