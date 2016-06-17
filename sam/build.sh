#!/bin/bash
VERSION=1.3.1
FILE=samtools-$VERSION.tar.bz2
FILE_CHECKSUM=6c3d74355e9cf2d9b2e1460273285d154107659efa36a155704b1e4358b7d67e
FOLDER=samtools-$VERSION
PREFIX_FOLDER=$(pwd)/sam/samtools


function build() {
  tar xvfj $FILE
  cd $FOLDER
  ./configure --without-curses --prefix=$PREFIX_FOLDER
  make
  make install
  cd ..
}

rm -rf sam/samtools
CHECKSUM=$(sha256sum sam/$FILE | cut -d " " -f1)
if [ "$FILE_CHECKSUM" -ne "$CHECKSUM" ]; then
    rm -rf $FILE
    wget https://github.com/samtools/samtools/releases/download/$VERSION/$FILE
fi

cd sam
build
rm -rf
