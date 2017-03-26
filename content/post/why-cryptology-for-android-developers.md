+++
comments = true
slug = "why-cryptography-for-android-developers"
date = "2017-03-25T23:59:53-04:00"
share = true
image = ""
draft = false
author = ""
tags = ["android", "security"]
menu = ""
title = "Why Cryptography?"
hasSymbols = false
+++

>We as engineers somewhere have a level somewhere where everything beneath that is a black box...

>Jake Wharton, Fragmented Episode 7, 1:12:00

For a while now, anything security or crypto related on Android has been a black box for me. For example, when I read [the docs](https://developer.android.com/training/articles/keystore.html) on Android's `KeyStore` class or hear about Android's Fingerprint authentication functionality [on Fragmented](http://fragmentedpodcast.com/episodes/74/), I often feel like I'm just barely understanding what's being said. Recently, that's started to change, as I've started taking [a Crypto course on Coursera](https://www.coursera.org/learn/crypto/). 

This post is the first of several attempts to solidify the concepts I learn in that course by telling you about them and about how those concepts relate to Android development.<sup>1</sup> Hopefully, by the end of all of this, we'll both understand things like the `KeyStore` and HTTPS connections on Android a little better. This first post, however, isn't going to be very Android heavy, as I merely want to try to introduce cryptography by motivating why we need a *science* of cryptography in the first place. Let's get to it.

### Why Cryptography?

So, why do we need cryptography? This isn't the same as asking we need encryption. That's obvious and uninteresting: sometimes we want to communicate with others without other people knowing what we're saying. I don't want people to know my credit card number when I buy something on Amazon, for example.

I'm asking why we need cryptography, *a disciplined study of codes*? Why do the `KeyStore` docs or HTTPS seem so mysterious and complicated? Why can't we just roll our own intuitive, simple mechanism for encrypting information so that it can only be read by our intended recipient?

Interestingly, people have been trying *and failing* to securely encrypt information for 1000s of years. Moreover, many of those attempts were not grounded in any kind of rigorous way of thinking about codes. In other words, they were simple, intuitive methods of encrypting information; they were attempts at encryption without cryptography. 

So that's why we need cryptography: our intuitive, simple methods of encryption provide no *guarantee* of security; security is hard.

### A Bad Cipher

Let's look at an example. Suppose we want to encrypt a message using a substitution cipher. A substitution cipher works by substituting letters in a message with other letters to generate an encrypted message. Here's a test of some code that does exactly that:

{{< highlight java "style=default" >}}
@Test
public void encryptsShortText() throws Exception {
    Map<Character, Character> key = new HashMap<Character, Character>(26);
    key.put('a', 'z'); key.put('j', 'q'); key.put('s', 'h');
    key.put('b', 'y'); key.put('k', 'p'); key.put('t', 'g');
    key.put('c', 'x'); key.put('l', 'o'); key.put('u', 'f');
    key.put('d', 'w'); key.put('m', 'n'); key.put('v', 'e');
    key.put('e', 'v'); key.put('n', 'm'); key.put('w', 'd');
    key.put('f', 'u'); key.put('o', 'l'); key.put('x', 'c');
    key.put('g', 't'); key.put('p', 'k'); key.put('y', 'b');
    key.put('h', 's'); key.put('q', 'j'); key.put('z', 'a');
    key.put('i', 'r'); key.put('r', 'i'); 
    Cipher cipher = new SubstitutionCipher(key);
    final String cipherText = cipher.encrypt("hello world");
    assertEquals("svool dliow", cipherText);
}
{{< / highlight >}}

The specific key we used for this substitution cipher just "reverses" the alphabet, but we could use any of the `26!` possible keys for the substitution cipher to encrypt messages. The fact that there are `26!` possible ways of encrypting a message using this cipher may make it seem like substitution ciphers are pretty effective. 

However, that's not true at all. In fact, someone can decrypt a message without even searching through the `26!` possible keys to find the correct one to decrypt a message. Interestingly, the problem is *not* that we need more than `26!` possible keys.

Rather, the problem is that an attacker could exploit the fact that the usage of letters or groups of letters in the english language have predictable frequency. "E", for example, occurs roughly 12.7% of the time in english. When the attacker analyzes a text and notices that a particular character is used roughly 12.7% of the time, he'll know that that character is actually an "E". The pair "th", to take another example, has a well known frequency. She can repeat this process for all letters until she discovers the key.

### Towards Cryptography

So, the intuitive way of thinking about codes is likely to lead to weeping and gnashing of teeth. What we need instead is a *precise* way of stating how secure our encryption mechanisms are and a way of *proving* that our mechanisms satisfy our desired level of security. Talking with precision and communicating proofs requires special language, so next time, we'll bring on the fancy vocabulary and symbols!

"Hold off on the symbols," some readers might think, "You haven't shown that we need rigorous study of codes yet. Why assume the attacker knows anything at all about the message? In real life, an attacker would have a harder time decrypting a message, since they wouldn't know anything about it ahead of time."

This is wrong-headed for two reasons. 

First, although an attacker may have a slightly more difficult time decrypting a text if they know absolutely nothing about it, they can actually work by trial and error until they arrive at a sensible decryption. With the above example, an attacker can say, "I don't know what language this message is in, but I'll run my algorithm on German, French, and English and see what crops up.

Second, in many situations, attackers will actually know a few things about the messages that are being sent back and forth. This is because computers must communicate according to well-known protocols.

### Conclusion

So we really do need a careful study of encryption. We need cryptography. What that means is that the means by which the messages are encrypted and decrypted must be known and studied by everyone to ensure that they are secure.

I'd like to conclude by noting that all of this means that cryptography actually allows us to something pretty remarkable: someone who intercepts an encrypted message and knows both how it was encrypted -- because the guts of ciphers must be studied and known to be secure -- and what parts of the decrypted message are -- because computers must communicate using common protocols -- still can't decrypt the rest of the message. 

That's really neat, and I hope it intrigues you in the same way that it does me: It's a fact that makes me excited to work on making crypto the kind of thing that I don't treat as a black box. 

### Notes

1. This means that you shouldn't take what I'm saying about security too seriously. I'm merely a student. Don't try to build a secure system based on what I'm saying and then get mad it me when you find out its not secure.