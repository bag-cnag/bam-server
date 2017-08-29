#!/bin/bash

samtoolsPath="/var/_shared/samtools_app/samtools/samtools"
bamsFolderPath="./bam_files_folder_1"

#List files


# define file array
files=($bamsFolderPath/*.bam)

# find total number of files in an array
echo "Total files in array : ${#files[*]}"
total=${#files[*]}
# Print 1st file name
echo "First filename: ${files[0]}"
echo "Second filename: ${files[1]}"
echo "Third filename: ${files[1]}"
# total - 1 = last item (subscript) in an array 
echo "Last filename: ${files[$(( $total-1 ))]}"
 
echo
echo "****************"
echo "*** For Loop ***"
echo "****************"
# Use for loop iterate through an array
# $f stores current value 
for f in "${files[@]}"
do
	echo -n "$f "
	printf "\n"
	
done

