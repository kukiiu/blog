#!/usr/bin/env sh

# 终止一个错误
set -e

git add -A
git commit -m 'deploy'
git push -f git@github.com:kukiiu/blog.git master

cd -