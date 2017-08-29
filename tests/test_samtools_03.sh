#!/bin/bash

samtoolsPath="/var/_shared/samtools_app/samtools/samtools"
filePath="./bam_files_folder_1/chr17.1-250.bam"
bamsFolderPath="./bam_files_folder_1"


if [ -n $1 ]
	then
		filePath=$1
fi

## See chromoshomes inside a bam
# $samtoolsPath view $filePath | awk '{print length($10)}' | head -1000 | sort -u
$samtoolsPath idxstats $filePath | awk '{print $1" "$3}'
$samtoolsPath view $filePath | awk '{print $3}' | uniq -c
