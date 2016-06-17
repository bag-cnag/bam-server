#!/bin/bash
VERSION=1.3.1
FILE=samtools-$VERSION.tar.bz2
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
rm -rf sam/$FILE
cd sam/
wget https://github.com/samtools/samtools/releases/download/$VERSION/$FILE

build
