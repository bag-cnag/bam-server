#!/bin/bash

samtoolsPath="/var/_shared/samtools_app/samtools/samtools"
filePath="./bam_files_folder_1/chr17.1-250.bam"
bamsFolderPath="./bam_files_folder_1"


if [ -n $1 ]
	then
		filePath=$1
fi

# View headers

$samtoolsPath view -h -H $filePath
