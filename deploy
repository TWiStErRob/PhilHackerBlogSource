#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

rm -rf ../PhilHackerBlog/*

# Build the project.
hugo -d ../PhilHackerBlog

cd ../PhilHackerBlog
git add --all
git commit -m "Updated site `date`"
git push origin master
