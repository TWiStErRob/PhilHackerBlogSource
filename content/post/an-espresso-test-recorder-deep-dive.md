+++
comments = true
date = "2016-07-07T23:28:29-04:00"
draft = false
share = true
author = ""
image = "images/diving-suit.jpg"
slug = "an-espresso-test-recorder-deep-dive"
tags = ["android", "espresso"]
title = "An Espresso Test Recorder Deep Dive"
+++

I've been working on [a unit test recorder](http://www.philosophicalhacker.com/post/why-dont-we-have-a-unit-test-recorder/) for Android. After struggling to find a way to implement the unit test recorder,<sup>1</sup> I decided to take a look at how Google implements the espresso test recorder. This post presents what I found when I dug into the source code of the espresso test recorder.

### Collecting User Interaction Info

Before I took a look at the source for the espresso recorder, I half expected to find some fancy bytecode manipulation of the sort we see for the [proguard or jacoco transformers](https://android.googlesource.com/platform/tools/base/+/gradle_2.0.0/build-system/gradle-core/src/main/groovy/com/android/build/gradle/internal/transforms). I was surprised to find that the espresso recorder actually relies heavily on breakpoints and the java debugger. To see this, let's start at the code that gets executed when you press the "record espresso test button:"

{{< highlight java "style=default" >}}
public class TestRecorderAction extends AnAction {
  @Override
  public void actionPerformed(AnActionEvent event) {
    //...    

    try {
      environment.getRunner().execute(environment, new ProgramRunner.Callback() {
        @Override
        public void processStarted(RunContentDescriptor descriptor) {
          ApplicationManager.getApplication()
            .executeOnPooledThread(new SessionInitializer(myFacet,
                                                          environment,
                                                          launchOptionState));
        }
      });
    } catch (ExecutionException e) {
      throw new RuntimeException("Could not start debugging of the app: ", e);
    }
  }
}
{{< / highlight >}}

The `environment` variable here is just an `ExecutionEnvironment,` an object that uses an android studio run configuration to run the app. So, the code here is (roughly) using a run configuration to start the app and creating a `SessionInitializer` once the app process starts. Let's look at what the `SessionInitializer` does:

{{< highlight java "style=default" >}}
public class SessionInitializer implements Runnable {
  public SessionInitializer(AndroidFacet facet, ExecutionEnvironment environment, LaunchOptionState launchOptionState) {
    //...
    myBreakpointDescriptors.add(new BreakpointDescriptor(VIEW_CLICK,
                                                          SdkConstants.CLASS_VIEW,
                                                          "performClick",
                                                          false));
    myBreakpointDescriptors.add(new BreakpointDescriptor(MENU_ITEM_CLICK,
                                                        "android.widget.AbsListView",
                                                        "performItemClick",
                                                        false));
    myBreakpointDescriptors.add(new BreakpointDescriptor(TEXT_CHANGE,
                                                        "android.widget.TextView$ChangeWatcher",
                                                        "beforeTextChanged",
                                                        true));
    myBreakpointDescriptors.add(new BreakpointDescriptor(TEXT_CHANGE,
                                                        "android.widget.TextView$ChangeWatcher",
                                                        "onTextChanged",
                                                        false));

    myBreakpointDescriptors.add(new BreakpointDescriptor(PRESS_BACK,
                                                        "android.view.inputmethod.InputMethodManager",
                                                        "invokeFinishedInputEventCallback",
                                                        false));

    myBreakpointDescriptors.add(new BreakpointDescriptor(PRESS_EDITOR_ACTION,
                                                        "android.widget.TextView",
                                                        "onEditorAction",
                                                        false));
  }
}
{{< / highlight >}}

Here they are just creating BreakpointDescriptor that will be used to create *method breakpoints* so that they can capture information about the parameters that are passed in to these methods. Here's where the method breakpints are created:

{{< highlight java "style=default" >}}
private Set<BreakpointCommand> scheduleBreakpointCommands() {
  Set<BreakpointCommand> breakpointCommands = Sets.newHashSet();
  DebugProcessImpl debugProcess = myDebuggerSession.getProcess();
  for (BreakpointDescriptor breakpointDescriptor : myBreakpointDescriptors) {
    BreakpointCommand breakpointCommand = new BreakpointCommand(debugProcess,
                                                                breakpointDescriptor);
    breakpointCommands.add(breakpointCommand);
    debugProcess.getManagerThread().schedule(breakpointCommand);
  }
  return breakpointCommands;
}
{{< / highlight >}}

These `BreakpointCommand`s are apparently nothing special. They are subclasses of `DebuggerCommandImpl`, a class that's a part of the IntelliJ source code. These breakpoint commands simply notify a `TestRecorderEventListener` with a `TestRecorderEvent` whenever a breakpoint is hit. The `TestRecorderEvent` contains the info needed to write out the espresso tests and this info is snagged from the (paused) Execution context when the debugger stops at a breakpoint. Here's a hint of how some of that works:

{{< highlight java "style=default" >}}
@Nullable
private TestRecorderEvent prepareEvent(EvaluationContextImpl evalContext, NodeManagerImpl nodeManager) {
  TestRecorderEvent event = new TestRecorderEvent(myBreakpointDescriptor.eventType, System.currentTimeMillis());

  if (event.isPressEvent()) {
    return populatePressEvent(event, evalContext, nodeManager);
  }

  String receiverReference = getReceiverReference(evalContext, nodeManager);

  populateElementDescriptors(event, evalContext, nodeManager, receiverReference, 1);

  if (event.getElementDescriptorsCount() > 0) {
    event.setReplacementText(event.getElementDescriptor(0).getText());
  }

  return event;
}
{{< / highlight >}}

Here's a nice lower-level method that gets close to the IntelliJ api for accessing the data from the paused execution context:

{{< highlight java "style=default" >}}
private Value evaluateExpression(String expression, EvaluationContextImpl evalContext, NodeManagerImpl nodeManager) {
  TextWithImports text = TextWithImportsImpl.fromXExpression(XExpressionImpl.fromText(expression));
  WatchItemDescriptor descriptor = nodeManager.getWatchItemDescriptor(null, text, null);
  descriptor.setContext(evalContext);
  return descriptor.getEvaluateException() != null ? null : descriptor.getValue();
}
{{< / highlight >}}

### Writing out the Source Files

Now, that we have some idea of how the information for writing the source files is collected, let's look at how Google uses that info to actually write out the espresso test files. Let's start at the code that gets called when you click the "Complete Recording" button:

{{< highlight java "style=default" >}}
myCompleteRecordingButton.addActionListener(new ActionListener() {
  @Override
  public void actionPerformed(ActionEvent e) {
    //...

    // Get all events (UI events and assertions).
    ArrayList<Object> events = new ArrayList<Object>();
    for (int i = 0; i < myEventListModel.size(); i++) {
      events.add(myEventListModel.get(i));
    }

    TestClassNameInputDialog chooser = new TestClassNameInputDialog(myFacet,
                                                                    launchedActivityName);
    chooser.show();

    PsiClass testClass = chooser.getTestClass();

    if (testClass != null) {
      doOKAction();
      new TestCodeGenerator(myFacet, testClass,
                            events, launchedActivityName,
                            hasCustomEspressoDependency()).generate();
    }
  }
});
{{< / highlight >}}

Looks like most of the work of generating the test code lives in this `TestCodeGenerator` class, so let's look at that:

{{< highlight java "style=default" >}}
public class TestCodeGenerator {
  //...
  public void generate() {
    //...

    // Write code to the test class file.
    BufferedWriter writer = null;
    try {
      writer = new BufferedWriter(new FileWriter(testFilePath));
      VelocityEngine velocityEngine = new VelocityEngine();
      velocityEngine.init();
      velocityEngine.evaluate(createVelocityContext(testVirtualFile),
                              writer,
                              RecordingDialog.class.getName(),
                              readTemplateFileContent());
      writer.flush();
    } catch (Exception e) {
      throw new RuntimeException("Failed to generate test class file: ", e);
    } finally {
      if (writer != null) {
        try {
          writer.close();
        }
        catch (Exception e) {
          // ignore
        }
      }
    }

    //...
  }
}
{{< / highlight >}}

Its interesting to see here that they are using [Velocity](http://velocity.apache.org/), a java templating library from apache. I'd never heard of it before I stumbled upon the code here. I wonder why they didn't use [java poet](https://github.com/square/javapoet) instead, a library from square that's especially designed for writing java class files. In any case, the actual construction of the source code file to be written happens in `createVelocityContext` if you're curious. I'm not going to get into how that method works since that method is more about Velocity than it is about espresso test recording.

### Conclusion

Google's debugger/breakpoint based approach may actually work for the kind of unit test recorder I want to create. This approach would probably require me have the user select which classes they want to "clamp" down with Vice through a GUI of some sort, but that may be a nicer experience than using annotations or passing command line arguments anyway. I'll be exploring this approach in the coming weeks. Check back for updates.

### Notes

1. Using the Transform api from the Gradle plugin proved to be a dead end because I needed my Transform implementation to load classes that depend on the android SDK and depending on the Android SDK from a gradle build script is not well supported.
