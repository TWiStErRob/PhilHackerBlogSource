+++
author = ""
menu = ""
share = true
date = "2017-10-22T09:09:04-04:00"
image = "/images/react-native-at-iot-startup/out-of-place.jpg"
tags = ["react native","iot"]
draft = true
title = "React Native at an IoT Startup"
comments = true
slug = "react-native-at-an-iot-startup"
+++

If you saw a toilet seat in a movie theater, you'd probably think to yourself, "Wait a minute. You don't use _that_ in _here_. 

Many of us have a similar reaction when we think of using react native at an IoT startup: 

>Wait a minute. React Native is fine for light-weight apps, but IoT companies need apps that make heavy use of the phone's hardware, so don't use it in this situation. **Just don't use that here.**

My goal in this written version of [my talk](https://www.meetup.com/preview/React-Orlando/events/243834909) is to convince you that using react native with hardware-intensive applications is not like using a toilet seat in a movie theater. Along the way, I'll go over why we (at [UniKey](https://www.unikey.com/)) adopted react native, how we used in our apps, the results we've achieved using it so far, and the trade-offs/challenges we've faced.

### Why

I originally approached React Native a little over a year ago with loads of skepticism. I had heard all the horror stories of companies getting burned by first-generation cross-platform mobile dev tools, so I had a hostile view of cross-platform tools in general. React Native was no exception.

Eventually, I noticed that an increasing number of impressive companies had adopted react native and this caught my eye:

![who is using react native](/images/react-native-at-iot-startup/who-is-using-react-native.png) 

My favorite app on this list is Skype. Microsoft owns Xamarin and they choose React Native for Skype. I think that speaks volumes.

With the increasingly impressive rooster of these companies in the back of my mind, I stumbled upon an opportunity to do some pro-bono work for a charity. They needed an iOS and Android app, and I decided that React Native would be a good choice for building their app. It was a simple food pantry app with a form, and React Native did the job very well:

![food pantry](/images/react-native-at-iot-startup/fed40.png)

Fast forward 1 year, and we're staring down the barrel of a pretty hairy deadline. UniKey partners with lock manufacturers to build smart lock products. We provide white-label apps, SDKs, and hardware reference designs so that partners can launch in months instead of years. What this means is that a core part of our value proposition is _speed_, so the conversation around this deadline looked a lot like this:

>The Market: Can you build this smart lock app in six weeks?

>UniKey: That's pretty aggressive, but we can probably do it.

>The Market: Great. Also, build an SDK, fix these bugs, and build this other smart lock app.

>UniKey: Well, hold on. That's going to be a problem.

>The Market: You offer the tools to help us launch in months instead of years right? Figure it out. K. Thx. Byeee.

One of React Native's core value propositions is to improve developer productivity by, among other things, sharing code between android and iOS. The productivity gain is something we _needed_, but some folks were still skeptical or React Native in general and even I wanted to see proof of the React Native app working with our UniKey SDK before we struck out on the this path. So, we:

![keep calm and hack](/images/react-native-at-iot-startup/keep-calm-and-hack.png)

I pitched my team on staying up all night to build a prototype React Native app with our SDK to prove that it was the way forward for hitting our deadline. They were down because they're awesome and we built the thing in a night. That went a long way towards helping folks feel comfortable with the path we were taking.

### How

So, that's why we adopted react native at UniKey. Let's talk about how we did it. Here's a very basic diagram of the architecture for the apps:

![React Native App Arch](/images/react-native-at-iot-startup/react-native-arch.png)

At the top, we've got our UI code written in javascript with React Native. In the middle, we've got a bridge layer that mediates communication between the javascript layer and our UniKey SDK, which is the bottom layer in the diagram. 

I want to quickly walk through some sample code of how this works in our white label apps. Let's start by looking at this video demonstrating our lock configuration feature:

<video width="640" height="480" controls>
  <source src="/videos/settings.mp4" type="video/mp4">
</video>

In this video, the app is connecting to a lock via bluetooth to configure its settings. Here's some RN javascript code that does this:

{{< highlight javascript "style=default" >}}
import NativeServiceBridge from "./services";
export default class ReaderDetails extends Component {
  _componentWillAppear() {
    getEmitter().addListener('readerSettingChange',
      settings => {
        if (settings.length > 0) {
          this.setState({ settings, progress: false });
        }
      });
    const { reader } = this.props;
    NativeServiceBridge.startConfigureReaderSettings(reader.id,
      error => {
        error && console.error(`can't configure settings`);
      });
  }
}
{{< / highlight >}}

The code is a little awkward, but its pretty simple. We have this `NativeServiceBridge` that mediates communication between the JS side and that native side and we're calling `startConfigureReaderSettings` on that bridge. We also register an event listener to receive events when we receive settings from the lock (of course, these events are emitted by the `NativeServiceBridge`. 

The js here is the same regardless of Android or iOS. We documented the contract between the js and native side with esdoc and basically said, "Android guys, make your interface look like this and iOS guys, do the same." If we did this over, we'd consider Walmart's [electrode](http://www.electrode.io/site/native.html), which generates this contract from a swagger file.

Let's drop down a level in our stack diagram and look at the code in the `NativeServiceBridge`. You are here:

![Native Service Bridge](/images/react-native-at-iot-startup/native-service-bridge.jpeg)

Here's some code:

{{< highlight kotlin "style=default" >}}
class NativeServiceBridge(reactContext: ReactApplicationContext) 
  : ReactContextBaseJavaModule(reactContext) {
@ReactMethod fun startConfigureReaderSettings(uuid: String, callback: Callback) {  
  UniKey.readerService()
    .configure(deviceSettingsObservable, UUID.fromString(uuid))    
    .subscribe({   
      val writableSettings = createWritableSettings(it)    
      eventEmitter.get().emit(READER_SETTINGS_CHANGE_EVENT, writableSettings)  
      }, 
      {  callback(it.toString())  }, 
      { callback(null)  }
    )
  }
}
{{< / highlight >}}

Highlights here are that we're extending from the React Native type `ReactContextBaseJavaModule`, that we've annotated our method with `@ReactMethod`, and that we're communicating with the js side through `Callback` and `EventEmitter`. We simply call the `UniKey.readerService.configure` method on our SDK and we pass the results back to the js side.

### Results

Overall, we were very pleased with how things turned out. We were able to hit our deadlines and our react native apps work well. 

One of the things that I think allowed react native to work so well for us is that the bread and butter of the experience of our apps doesn't actually need to communicate with the react native code at all. This image helps explain what I mean:

![UniKey to phone communication](/images/react-native-at-iot-startup/unikey-to-phone-communication.jpeg)

Our apps aim to allow you to access your home or office in a way that is more convenient than the key. With our apps, you don't even have to open the app in order to unlock the door. Because of this, our SDK does all the heavy-lifting with the hardware and doesn't even need to talk to the React native code in order to perform its most important function. In other words, there's no performance penalty in using react native for "passive entry" into a UniKey-powered smart lock.

What's really interesting about our work with React Native is that because we white-label apps and create SDKs, we can actually easily create fully-native and react-native apps and compare them _side-by-side_ to see the results. 

The side-by-side comparison is impressive. You might even have a hard time telling which app is native and which is react-native. You'll notice that one of the videos is the same as the one we saw earlier. I _may_ have lied about whether that video was from a fully-native white-label app or a react-native one, so just look at the videos and see if you can guess which one is which.

<video width="640" height="480" controls>
  <source src="/videos/settings.mp4" type="video/mp4">
</video>

<video width="640" height="480" controls>
  <source src="/videos/rn-settings.mp4" type="video/mp4">
</video>

### Trade-offs

#### Performance Penalty for Crossing the JS Bridge

If you guessed right, it might be because the second video was a little slower than the first one to display the settings, and this leads into the first trade-off when working with react native: you do pay for sending commands across the javascript bridge. As the above videos suggest, that penalty is not very large, but it is there. 

Again, for us, the trade-off mattered little since that extra ~.5 seconds is only needed for people who want to configure their lock. People who need to unlock their app can do so just as quickly as owners of the fully-native apps.

#### Awkward JS Bridge API

A related point is that because of the limitations on how your API between JS and native code works, you can wind up with some awkward APIs. We already saw this with the JS code snippet I mentioned earlier. Here's the snippet again:

{{< highlight javascript "style=default" >}}
import NativeServiceBridge from "./services";
export default class ReaderDetails extends Component {
  _componentWillAppear() {
    getEmitter().addListener('readerSettingChange',
      settings => {
        if (settings.length > 0) {
          this.setState({ settings, progress: false });
        }
      });
    const { reader } = this.props;
    NativeServiceBridge.startConfigureReaderSettings(reader.id,
      error => {
        error && console.error(`can't configure settings`);
      });
  }
}
{{< / highlight >}}

The weird thing about this code is that we are registering an event emitter *and* passing in a callback to `startConfigureReaderSettings`. 

The reason we need to do this is that we actually need two callbacks from that one method call. One callback when new settings arrive over bluetooth (which may be called multiple times) and another callback when the configure operation has completed. Callbacks can only be called once in react native, so we also have to use an event emitter, which feels awkward compared to native APIs.

#### Libraries can be hit or miss

For us, the best example of this trade-off related to the library we used for navigation. [The react native docs](https://facebook.github.io/react-native/docs/navigation.html#react-navigation) suggest react-navigation is the solution for navigation on react native. Turns out that way leads to weeping and gnashing of teeth. There's even [a github issue](https://github.com/react-community/react-navigation/issues/2031) hilariously titled, "This library just isn't good." Use [Wix's navigation library instead](https://github.com/wix/react-native-navigation).

#### Build Tools Less Flexible and Poorly Documented

We white-label apps, so build tools and build variants are important to us. That's a rougher game with react-native apps than native apps. With ordinary Android development, you can create build flavors like so:

{{< highlight groovy "style=default" >}}
productFlavors {
  partner1 {
    //...
  }
  partner2 {
    //...
  }
}
{{< / highlight >}}

The react native build tools can handle flavors to some extent, but if your flavors need different javascript entry points, then you'll probably just have to disable the react-native gradle plugin because it doesn't have a hook to change the js entry-point based on a product flavor.

On iOS, RN is better in this regard. You can change the js entry point based on a build variant (iOS scheme), but first you have to read a bash file and locate this comment and cryptic line:

{{< highlight bash "style=default" >}}
# Define entry file
ENTRY_FILE=${1:-index.ios.js}
{{< / highlight >}}

You can pass the entry point into this script from the build phases section in your Xcode build settings, but none of this is really documented.

### Conclusion

So, there you have it: the how, why, results, and trade-offs of our usage of React Native at UniKey. If you're working on an IoT product, I hope I've convinced you that using react native is more appropriate than using a toilet in a movie theater.