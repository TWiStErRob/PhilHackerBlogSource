+++
image = "images/sweets.jpg"
slug = "how-to-abuse-kotlin-extension-functions"
draft = false
author = ""
comments = true
menu = ""
share = true
tags = ["android","kotlin", "architecture"]
date = "2017-05-26T18:48:58-04:00"
title = "How to Abuse Kotlin Extension Functions"
+++

I've got a "sweet tooth," which, in my case, is just a euphemism for me saying that I'm *addicted* to sugar. I'm young now, but I know that this addiction won't end well once my metabolism slows down, so I try go to the gym. 

Unfortunately, when I leave the gym, I often think to myself, "I just worked out, so I can snag that Oreo McFlurry I've been craving all day." When I do this, I abuse exercise: I take a good thing --- exercise --- and I use it to justify engaging in a bad habit --- consuming empty calories. Hold that thought.

I started using Kotlin this week. Overall, Kotlin is absolutely delightful, but heaping unqualified additional praise on an already hyped language doesn't make good toilet reading, so let's mix things up a bit.

I want to talk about a Kotlin language feature that I'm not thrilled about. I'm less than ecstatic about this feature because I think that its likely to be abused. Just as I can take something good like exercise and use it to justify a bad habit, we can take good Kotlin language features and use them to continue and exacerbate our bad Java coding habits into our Kotlin code.

More specifically, I'm worried about extension functions. I'm worried that extensions will make it easier for us to avoid creating clean abstractions in our code. Let's look at this in detail so that we can avoid abusing extension functions. 

First, we'll look at the original intent of extension functions. Then, we'll examine an example in [the Google I/O codebase](https://github.com/google/iosched) where I think extension functions are getting abused, and we'll talk specifically about why I think we have a bona-fide example of abuse on our hands. Finally, I'll talk about a better way of structuring the abusive code.

### Why Extensions are Good Thing (sometimes)

Before we look at how extensions can be abused, let's look at what they're good for. [The "motivation" section of the docs on this feature](https://kotlinlang.org/docs/reference/extensions.html#motivation) is helpful here:

>In Java, we are used to classes named "*Utils": FileUtils, StringUtils and so on. The famous java.util.Collections belongs to the same breed. And the unpleasant part about these Utils-classes is that...class names are always getting in the way.

The example they have for this is brilliant:

{{< highlight java "style=default" >}}
Collections.swap(list, 
                Collections.binarySearch(list, Collections.max(otherList)), 
                Collections.max(list))
{{< / highlight >}}

Because of the code completion and improved readability, the kotlin folks rightly point out that we'd rather write:

{{< highlight java "style=default" >}}
list.swap(list.binarySearch(otherList.max()), list.max())
{{< / highlight >}}

However, we can't implement all possible list methods inside of the list class, so, in order to achieve this, we need to a way to write list methods outside of the list class. And that, boys and girls, is where extension functions come from.

### An Example Extension Function Abuse

In some cases, this seems like a great addition to the language. Where could we go wrong here? To answer this question, let's look at some Google I/O code that could be refactored to use extension functions, but probably shouldn't be.

The Google I/O code base contains a `SettingsUtils` class. Its 484 lines long and has 33 methods. Yuck. Call sites of the methods on this class, moreover, don't look great:

{{< highlight java "style=default" >}}
// Ensure we don't run this fragment again
LOGD(TAG, "Marking attending flag.");
SettingsUtils.setAttendeeAtVenue(mActivity, true);
SettingsUtils.markAnsweredLocalOrRemote(mActivity, true);
{{< / highlight >}}

Now, using an extension method on a `Context` might make some of this code look a little better:

{{< highlight kotlin "style=default" >}}
// PrefExtensions.kt
fun Context.setAttendeeAtVenue(newValue: Boolean) {
    val defaultSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)
    defaultSharedPreferences.edit().putBoolean(BuildConfig.PREF_ATTENDEE_AT_VENUE, newValue).apply()
}

fun Context.markAnsweredLocalOrRemote(newValue: Boolean) {
    val sp = PreferenceManager.getDefaultSharedPreferences(this)
    sp.edit().putBoolean(PREF_ANSWERED_LOCAL_OR_REMOTE, newValue).apply()
}

// AttendingFragment.kt
override fun onClick(v: View) {
    // Ensure we don't run this fragment again
    LOGD(TAG, "Marking attending flag.")
    mActivity.setAttendeeAtVenue(true)
    mActivity.markAnsweredLocalOrRemote(true)
}
{{< / highlight >}}

Even if you're not crazy enough to add extension functions to [a god object]({{<relref "towards-godless-android-development-how-and-why-i-kill-god-objects.md">}}), you might be tempted to kotlinify this code by writing an extension function for `SharedPreferences`. I still that that would be a mistake.

### Why Abuse?

Extension functions, as their name implies, are good for *extending* existing abstractions. They're abused when we use them to palliate the use of a bad or entirely absent abstractions.

To see why this particular example is an abuse of extension functions, let's back up a second and think back to the `SettingsUtil` class. `Util*` classes, in many cases, are substitutes for missing or poorly formed abstractions. That's true in this case. 

Is the attendee's physical location in relation to the Google I/O conference a Setting? Not really. 

Its implemented as a `SharedPreference`, so it gets lumped in with all the other SharedPreference-related methods in `SettingsUtils`, but these two methods are really part of something that's different from a `SharedPreference`. `SharedPreference` is just an implementation detail. `SharedPreferences` can be a bit annoying to get a hold of, so to make matters worse, this bag of methods lives in an utility class.

This has two consequences: First, `SettingsUtil` and `AttendingFragment` are harder to understand because they have low cohesion. Second, `SettingsUtil` and `AttendingFragment` are overly coupled, which will make testing and maintenance more difficult.

Let's look at cohesion-related consequences first. `SettingsUtil` is a class that's hard to grok because its just an random bag of 34 conceptually unrelated methods that all happen to rely on `SharedPreferences` as an implementation detail. Because the purpose of `SettingsUtil` is hard to understand, the purpose of `AttendingFragment`, a class that relies on it is also obscured, albeit to a lesser degree. 

Here's the kicker: moving to extension functions doesn't do anything to solve this problem.

Next, the coupling-related consequences. *Extensions are resolved statically.* This means that code that depends on extension methods are *tightly coupled* to a single implementation of an extension method. 

Java's static methods result in the same exact degree of coupling, and that's the point here: moving to extension functions doesn't really solve the deeper problem here. You're code looks a little nicer, but its still tightly coupled.

So, on both counts, using extension functions in this case merely helps us put lipstick on a pig. As I said at the outset of this section, extension functions are better used when we want to extend an already existing abstraction.

### A better way

To solidify the idea that using a function extension in this case would be an abuse, let's look at a better way of handling the above code. As far as I can tell, the missing abstraction here is an `Attendee`:

{{< highlight kotlin "style=default" >}}
interface Attendee {
    enum class Attending {
        IN_PERSON,
        REMOTE,
        UNKNOWN
    }

    fun setAtVenue(newValue: Boolean)
    fun attending(): Attending
}
{{< / highlight >}}

It turns out that there are other `SettingsUtil` methods that make sense to move to this interface. Conference attendees accept a code of conduct that is presented in the `ConductFragment`.

{{< highlight kotlin "style=default" >}}
interface Attendee {
    //...

    fun acceptCodeOfConduct(newValue: Boolean)
    fun hasAcceptedCodeOfConduct(): Boolean
}
{{< / highlight >}}

Now that we've filled out the methods on this interface, we can see that the call sites of `Attendee` methods are simpler and more easily understood than their `SettingsUtils` counter-parts:

{{< highlight kotlin "style=default" >}}
// AttendingFragment.kt
override fun onClick(v: View) {
    // Ensure we don't run this fragment again
    LOGD(TAG, "Marking attending flag.")
    attendee.setAtVenue(true)    
    // Notice we dont need to call SettingsUtils.markAnsweredLocalOrRemote.
}
{{< / highlight >}}

### Conclusion

With these changes, the `SettingsUtils` class loses 5 methods, thereby getting a little more digestible. The `SharedPrefsAttendee` implementation, as you can imagine, is short (24 kotlin lines) and easily grokked. Classes that use the `Attendee` abstraction are a little clearer and a little simpler. They also aren't tightly coupled with a specific implementation, which makes them easier to test and maintain.

So, don't abuse Kotlin's extension functions. They're neat, but sometimes plain old OO techniques are a better choice. Identifying a missing or bad abstraction is often a better way to approach `*Util` classes.