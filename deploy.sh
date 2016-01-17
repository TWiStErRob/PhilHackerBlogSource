#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

rm -rf ../PhilHackerBlog

# Build the project.
hugo -d ../PhilHackerBlog

cd ../PhilHackerBlog
git init
git add --all
git commit -m "Updated site `date`"
git remote add origin https://github.com/kmdupr33/kmdupr33.github.io.git
git push -f origin master
