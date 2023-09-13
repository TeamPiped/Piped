#!/bin/sh

base='https://fonts\.(gstatic\.com|kavin\.rocks)'
fonts=$(cat dist/assets/* | grep -Po "$base[^)]*" | sort | uniq)
for font in $fonts; do
	file="dist/fonts$(echo "$font" | sed -E "s#$base##")"
	mkdir -p "$(dirname "$file")"
	curl -L "$font" -o "$file"
done
sed -Ei "s#$base#/fonts#g" dist/assets/*
