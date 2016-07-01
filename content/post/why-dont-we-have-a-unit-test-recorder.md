+++
comments = true
date = "2016-07-01T11:49:34-04:00"
draft = false
share = true
slug = "why-dont-we-have-a-unit-test-recorder"
tags = ["regression testing"]
title = "Why don't we have a unit test recorder?"
+++

Last week, I introduced Vice, a *proof of concept* regression test generation library. Vice generates regression tests simply by exercising the code we want to test.

This is neat, but there's already [something else out there that does something like this](https://github.com/dmcg/okey-doke), and ultimately, Vice as it stands doesn't answer a fundamental question I have about regression tests: if we can record functional UI tests using [the espresso test recorder](http://android-developers.blogspot.com/2016/05/android-studio-22-preview-new-ui.html) or [apple's test recorder](https://developer.apple.com/library/mac/documentation/ToolsLanguages/Conceptual/Xcode_Overview/RecordingUITests.html), why don't we have a *unit test recorder*?<sup>1</sup>

This past week, I've been exploring potential ways creating a unit test recorder with special attention to implementing this functionality for Android development. In this post, I present an overall strategy for doing this and I present what I've learned so far vis-a-vis practically implementing this strategy for Android development.

### The Strategy

Call the classes for which we want to generate tests "target classes."

As I said [before](http://www.philosophicalhacker.com/post/vice-a-regression-test-generation-library/), Vice already works by rewriting target classes so that instances of those classes record their method invocations. More specifically, these instances record both the arguments and return value of their method invocations. Let's call these rewritten classes "Recorders."

Once this information is recorded, we can use it to generate regression tests that ensure that the behavior of our code remains unchanged. Those tests simply assert that target classes either a) return proper values or b) interact appropriately with their collaborators when their methods are invoked.

Making Vice into a test recording library is as simple as rewriting the *providers* of instances of the target classes so that these methods return a recorder.

When I say "provider" here, I just mean any method that is responsible for providing an object *that is used by our application*. Providers may be constructors, ordinary factory methods, or special methods in some DI-framework module class (e.g., `@Provides` annotated methods in [Dagger](http://google.github.io/dagger/)).

If *all* the instances in an application are recorders, then generating unit tests should be fairly trivial. As I see it, the central problem of creating a a unit test recorder is figuring out how to rewrite providers so that they return recorders instead of ordinary instances.

### Learnings

#### Bytebuddy alone won't work

Doing this on Android was trickier than I first imagined. I thought that I could just use Bytebuddy to rewrite providers to return recorders like this:

{{< highlight java "style=default">}}
@Override
public List<RecordingObject> rewrite(Method providers, boolean isAndroid) {
    //...
    final Map<Class<?>, List<Provider>> classesGroup
            = streamSupplier.get()
                .collect(groupingBy((Function<Provider, Class<?>>) Provider::getDeclaringClass));
    classesGroup.forEach((aClass, classProviders) -> {
        // Working with the classProviders using the Stream API gives us a cleaner way of building up our dynamic subclass.
        final DynamicType.Builder<?> recordingSubclass = classProviders.stream()
                .reduce(byteBuddy.subclass(aClass), new BiFunction<DynamicType.Builder<?>, Provider, DynamicType.Builder<?>>() {
                    @Override
                    public DynamicType.Builder<?> apply(DynamicType.Builder<?> builder, Provider provider) {
                        return provider.rewrite(builder, any());
                    }
                }, (builder, builder2) -> builder2);

        recordingSubclass.make()
                .load(aClass.getClassLoader(),
                      isAndroid ? AndroidClassLoadingStrategy.Default.WRAPPER : ClassReloadingStrategy.fromInstalledAgent());
    });
    return recorders;
}
{{< / highlight >}}

The hope here was that we could simply pass in an array of method or constructor references and use Bytebuddy to rewrite those providers to return recorders. Unfortunately, I didn't read notice this line in the Bytebuddy docs:

>...with the ART runtime which succeeds the Dalvik virtual machine, Android applications are compiled into native machine code before being installed on an Android device. As a result, Byte Buddy cannot longer [sic.] redefine or rebase classes as long as an applications is not explicitly deployed together with its Java sources as there is otherwise no intermediate code representation to interpret.

Since we can't redefine classes using Bytebuddy alone, this approach turns out to be a dead end.

#### Some alternative implementation approaches

Dexmaker is a library that allows us to write dex files at runtime. I believe that dexmaker is used so that we can use mockito with Android, but I'm not sure. If dexmaker is in fact used for this purpose, it could be a useful tool for creating a unit test recorder on Android.

Another possibility is to leverage [the Transform api](http://tools.android.com/tech-docs/new-build-system/transform-api) that's a part of the Android gradle plugin. This api allows us to manipulate java bytecode before that code is converted to dex bytecode. At first glance, this approach appears to be preferable to the former one for the following reasons:

1. We can probably use Bytebuddy here since other users of the Transform api seem to have had some success using similar libraries (viz., javassist and webasm). See, for example, [smuggler](https://github.com/nsk-mironov/smuggler/blob/master/smuggler-compiler/build.gradle) and [the realm transformer](https://github.com/realm/realm-java/blob/467bd4b0cb61cf3479f9fa550005b9fd492bc112/realm-transformer/build.gradle).

1. We're rewriting our providers at build time rather than runtime, which will presumably make for a smoother app running experience.

1. Because we rewriting our providers at build time, we may be able to take advantage of incremental builds.

1. Rewriting the providers at runtime isn't really *required* for the functionality that we want. By using the transform api, we plugging in to an extension point that's well supported by Android.

I'll be trying out these alternative approaches in the coming week. Hopefully, next time I'll have a working unit test recorder!

### Notes

1. In case its not obvious, this seems like an important question because unit-level tests can run much more quickly than functional UI tests, so they can actually serve as, to use Michael Feathers' metaphor, a "software vice" when we're refactoring or adding features. Having to wait 5+ minutes to know if you're changes have broken anything is way too long for functional UI tests to be useful feedback while programming.