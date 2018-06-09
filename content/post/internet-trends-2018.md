+++
draft = false
date = "2018-06-09T13:35:58-04:00"
slug = "internet-trends-2018"
image = "/images/smartphonespeaker.png"
comments = true
share = true
menu= ""
author = ""
title = "Mobile Down, Smart Speakers Up: 2 Notable Trends from this Year's Internet Trends Report"
+++

I'm a big fan of KCPB's internet trends report, and I've been following their reports for the last few years. This year, I've decided to clip and comment on what I think are some notable trends they've captured for 2018. Here are 2 trends that really stood out to me from this year's report, along with some commentary.

## 1. The End of Mobile's Golden Era

{{< slideshare embed_code="fFLWra0S1mrGLB" start_slide="6">}}

Mobile's growth has been slowing for years and others have already noted the effects of this. Dev shops have closed and mobile app companies have been ["sherlocked"](https://www.cocoanetics.com/2011/06/on-getting-sherlocked/) by Google and Apple. 

Last year, Google's Sundar Pichai explicitly stated that [they're moving from a mobile-first to an AI-first company](https://venturebeat.com/2017/05/18/ai-weekly-google-shifts-from-mobile-first-to-ai-first-world/), and after [this past year's killer AI demo](https://www.youtube.com/watch?v=bd1mEm2Fy08), we can see that he wasn't kidding around. One way of reading [Apple's poaching of Google's top AI exec](https://www.forbes.com/sites/johnkoetsier/2018/04/04/apple-poaching-googles-ai-chief-says-apple-is-all-in-on-ai-but-who-he-reports-to-is-more-critical/1) is that Apple wants to make a similar shift.

To be clear, when I say "the golden age of mobile is over," I'm not saying anything sensational like "mobile will die and AI will take its place." All I'm saying is that no growth in smartphone shipments will make a difference in how companies think about their mobile apps. Its no longer the case that companies can grow their user base and revenue _merely_ by riding the wave of smart phone adoption.

I believe that companies living in "golden ages" tend to have quite a bit of inefficiency. Why be efficient if the underlying growth of your market virtually guarantees that you'll be printing money as long you stay in the game?

I've certainly seen some inefficiency in the mobile app world.[^1] For example:

* Developers (like me) use specialized tools that make it impossible for us to collaborate effectively with our web app developer counter-parts. (This drives our wages up.)[^2] 
* Most mobile app companies build the same app twice (once for Android and once for iOS). 
* Automated testing tooling and practices for mobile applications is years behind the tooling for web applications side, which leads to higher QA costs.

Ultimately, I think the end of this golden age will lead to the rooting out of some of the inefficiencies of mobile application development. I'm seeing this already with 

* cross-platform mobile frameworks like Facebook's React Native, Google's Flutter, and Microsoft's Xamarin
* all major browser's pushing for Progressive Web Applications, web apps with mobile-app-like features
* Google's increased focus on building tools for folks to test their mobile apps

I don't care to speculate here how exactly these technologies will play out over the next few years, but based on the above graph and the general vibe of mobile app dev, I'd put money on the future of mobile dev being leaner than it is now, which means it'll probably

* be cross-platform (with a bias towards a solution that allows companies to leverage already existing skills for mobile app dev)
* move closer to lean practices like automated testing that already have broader adoption in the web app world

## 2. Smart Speakers as "the next big thing"

{{< slideshare embed_code="fFLWra0S1mrGLB" start_slide="26">}}

There's a lot of new tech that's come out of the past couple of years. Smart speakers, AI, VR/AR, Blockchain, etc. Its difficult to keep up with all of it, so I've started trying to limit the tech I pay attention to. 

Before seeing this graph, I definitely had smart speakers on the back-burner. Smart speakers always struck me as pretty gimmicky. 

Apparently, however, they're getting some pretty serious adoption. In fact, out of all the new tech I listed above, this is the most impressive adoption I've seen and it may make smart speakers more worthy of my attention than the other new tech folks are talking about these days.

Here's what knocks the other tech out of the #1 spot: each of these new technologies either suffer from either sputtering adoption or high barriers to entry. Smart speakers, as far as I can tell, have neither of these issues.

### Crypto

Cryptocurrency also has some impressive adoption as shown by this slide from the internet trends report:

{{< slideshare embed_code="fFLWra0S1mrGLB" start_slide="20">}}

In spite of this adoption, I'm pretty bearish on crypto. I see a lot of miners --- who are trying to get more cryptocurrency by investing in hardware, speculators --- who are trying to get cash by getting in on the upswings in cryptocurrency volatility, and scammers --- who are trying to leverage the hype to cash out.

This is not to say that there aren't folks who are doing interesting and important thing with crypto. I'm sure there are, but it certainly feels like a large portion of the exponential adoption is driven by miners, speculators, and scammers. To put the point another way: not all exponential curves are created equal.

### AI

There's an interesting slide in the report on AI that points out that there's a virtuous circle between data acquisition and AI. They call it the "data flywheel:"

{{< slideshare embed_code="fFLWra0S1mrGLB" start_slide="197">}}

Notice that the title of the slide says that "Data Volume" is key to leveraging AI for tool/product improvement. For this reason, I think AI will primarily be leveraged by companies that already have a lot of data or a means of aquiring that data. In other words, AI is for the mostly for the big boys. I don't see there being much opportunity or interesting developments coming from individual developers and/or companies that don't already have a bunch a data. 

### VR/AR

I own an Oculus and based on my experience, I'm pretty confident that VR/AR is still a ways away from mass adoption. Don't get me wrong: the experience of the Oculus is incredible, but its difficult to lug out and setup. Moreover, last I checked there's not an easy way to create VR _applications_ aside from games, which are capital intensive and a crap shoot.

There's definitely some interesting activity here with [the emerging tether-less headsets](https://www.cnet.com/news/wireless-vr-vive-adapter-ces-2018-tetherless-oculus/) that are coming out, but I don't think we'll see mass adoption of VR until its as easy to carry around as our smart phones. Moreover, its hard to see what the applications of VR could be aside from gaming if the headset is not practical to carry around with us.

As far as AR developments and adoption goes, Apple had [an impressive AR demo for their WWDC keynote last week](https://www.youtube.com/watch?v=WNVJ2pWVNXE), which definitely signals their commitment to developing AR. Still, I think AR suffers from similar problems that VR does: its not clear what the non-gaming application is[^3] and developing content for AR is relatively capital intensive.

---
## Notes

[^1]: A former SRE at Google once said to me that his general impression of mobile development based on what he's heard others say at Google is that it's a mess.

[^2]: Alex Rudloff --- serial entrepreneur, former Chief Digital Strategiest at TED, and my mentor was I was in Starter Studio --- drew a pretty apt analogy in one of our conversations: he said that I, as a mobile app dev, am just like the dudes who first learned html when the internet was getting started. They made 6 figures. Now they make much less.

[^3]: I keep seeing/hearing people talk about instructional applications for AR. I doubt we're where we need to be with respect to computer vision for these applications to really be useful at this point, and it seems like advances in computer vision these days are coming from ML/AI, which as I've already said, requires prohibitively large amounts of data.