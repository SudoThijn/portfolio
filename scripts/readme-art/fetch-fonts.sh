#!/bin/sh
# Downloads the fonts the artwork is drawn with into ./fonts, next to this script.
set -eu
cd "$(dirname "$0")"
mkdir -p fonts
base=https://github.com/google/fonts/raw/main/ofl

get() {
  curl -fL --silent --show-error -o "fonts/$2" "$base/$1"
  echo "fonts/$2"
}

get 'tektur/Tektur%5Bwdth%2Cwght%5D.ttf' Tektur.ttf
get 'jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf' JetBrainsMono.ttf
get chakrapetch/ChakraPetch-Regular.ttf ChakraPetch-Regular.ttf
get chakrapetch/ChakraPetch-SemiBold.ttf ChakraPetch-SemiBold.ttf
get chakrapetch/ChakraPetch-Bold.ttf ChakraPetch-Bold.ttf
get zenkakugothicnew/ZenKakuGothicNew-Bold.ttf ZenKakuGothicNew-Bold.ttf
