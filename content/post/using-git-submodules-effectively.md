+++
image = ""
comments = true
share = true
menu = ""
date = "2016-10-23T17:27:45-04:00"
title = "Using Git Submodules Effectively"
tags = [
  "git"
]
draft = false
slug = "using-git-submodules-effectively"
author = ""
+++

I used to think git submodules were categorically evil. This was naive, as most choices in software development are about tradeoffs. A part of the reason I had this simplistic view was because of [an article](https://codingkilledthecat.wordpress.com/2012/04/28/why-your-company-shouldnt-use-git-submodules/) called "Why your Company Shouldn't use Git Submodules." I took a second look at this article recently and I read the docs on git submodules. What follows are some more nuanced thoughts on how and when git submodules can be used effectively.

### What are Submodules even for?

The docs actually provide a very helpful example to answer this question:

>Suppose you’re developing a web site and creating Atom feeds. Instead of writing your own Atom-generating code, you decide to use a library. You’re likely to have to either include this code from a shared library like a CPAN install or Ruby gem, or copy the source code into your own project tree. The issue with including the library is that it’s difficult to customize the library in any way and often more difficult to deploy it, because you need to make sure every client has that library available. The issue with vendoring the code into your own project is that any custom changes you make are difficult to merge when upstream changes become available.

Interestingly, this is very different from what we might call the "naive perceived purpose" of git submodules, which is well captured by the opening paragraph of the aforementioned article arguing against git submodules:

>It is not uncommon at all when working on any kind of larger-scale project with Git to find yourself wanting to share code between multiple different repositories – whether it be some core system among multiple different products built on top of that system, or perhaps a shared utility library between projects.

>At first glance, Git submodules seem to be the perfect answer for this

I used to think submodules were designed for the purpose of sharing code. As the above example from the docs suggest, that's not entirely true. Its more accurate to say that git submodules are useful when you want to share code *that you also need change along with the consumer of that code.* If you're not trying to change the shared code along with the consumer of that code, there are better options for sharing your code. The docs even seem to admit this:

>It’s quite likely that if you’re using submodules, you’re doing so because you really want to work on the code in the submodule at the same time as you’re working on the code in the main project (or across several submodules). Otherwise you would probably instead be using a simpler dependency management system (such as Maven or Rubygems).

So, if you're using git submodules merely as a way of sharing code, that's probably misguided, as it's a use case that git submodules weren't designed to handle. There's additional complexity that comes along with using git submodules, and this complexity isn't worth it if there are simpler ways of sharing code. This additional complexity *may* be worth it if you're trying to work on shared code and project code simultaneously and if there are methods of managing this complexity in a way that a) keeps us moving quickly and b) helps us avoids costly mistakes. The next section is about some of the complexities of git submodules and the techniques the git folks recommend for managing these complexities.

### Managing git submodule complexity

#### Working around init and update

The first thing that's annoying about git submodules, in my opinion, is that when you check out a project, you can't get it to build without initializing and updating your submodules. This isn't a problem if you know that you've got submodules, but its a little annoying and surprising to see a build error when you don't realize that the project has submodules.

A remedy here is to use the `--recursive` flag on the `git clone` command. This is probably something that I should just always do from now on. I'll make a bash function to support this. I've already `git status` and `git push` aliased to `gs` and `gp` respectively, so `gc` is a good name for this function:

{{< highlight bash "style=default" >}}
function gc {
   git clone --recursive $1
}
{{< / highlight >}}

#### Pushing changes

Pushing changes with submodules can be a bit of a pain if you manually go into a subdirectory and push from there. Fortunately, there are commands for this and we can even create git aliases to make using these commands easy. Here's the command:

{{< highlight bash "style=default" >}}
git push --recurse-submodules=on-demand
{{< / highlight >}}

As the option suggests, this command recursively pushes the submodules along with the changes in the parent project. I could create an alias for this command with the following command:

{{< highlight bash "style=default" >}}
git config alias.spush 'push --recurse-submodules=on-demand'
{{< / highlight >}}


But like I said, I've already got `gp` aliased as `git push`, so I can just update that alias:

{{< highlight bash "style=default" >}}
alias gp='git push --recurse-submodules=on-demand'
{{< / highlight >}}

#### Getting updates

The last thing that's a little annoying about git submodules is updating them when there are changes upstream. Turns out that there's a command that eases this process too:

{{< highlight bash "style=default" >}}
git submodule update --remote --merge
{{< / highlight >}}

Gonna alias that one too:

{{< highlight bash "style=default" >}}
alias gu='git submodule update --remote --merge'
{{< / highlight >}}

The `--merge` flag, of course, is actually supposed to *safely* merge in the upstream changes. This is a bit misleading because, as article against git modules points out, if you aren't careful, you can blow away your changes in a git submodule by running this command. To avoid this, you actually need to make sure the git submodule has a branch checked out.

One way of doing this easily is to use the git submodule `foreach` subcommand:

{{< highlight bash "style=default" >}}
git submodule foreach 'git checkout -b featureA'
{{< / highlight >}}

If we create a bash function that we use for checking out new branches, we can, with a single command, checkout a new branch in the parent repo in in the submodules:

{{< highlight bash "style=default" >}}
function gcb {
  git checkout -b $1
  git submodule foreach 'git checkout -b'$1
}
{{< / highlight >}}

If we're using gitflow, we won't be making any changes outside of a feature branch anyway, so if we're using a function like the above one, we shouldn't ever run into a situation where we've blown away changes we've made in our submodule.

### Conclusion

Sometimes all of this feels a bit wonky to me. I think it feels this way because git modules are still fundamentally weird. In an ideal world, we'd develop our shared code in separate repositories and we'd test that shared code with automated tests instead of testing it by running the project that consumes that shared library.

However, sometimes we need to take out a tech loan. Sometimes we need to live with a wonky submodule setup for a bit. Fortunately, git provides us the tools needed to handle the additional complexity that comes along with using git submodules, and if we want to be able to work on a project and its shared code simultaneously, git submodules are appropriate. If we're just trying to share code, we should use simpler dependency management solutions.
