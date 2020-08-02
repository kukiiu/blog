#!/usr/bin/env sh

# 终止一个错误
set -e

# 构建
npm run build

git add -A
git commit -m 'deploy'
git push -f git@github.com:kukiiu/blog.git master

# 进入生成的构建文件夹
cd blog/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:kukiiu/blog.git master:gh-pages

cd -