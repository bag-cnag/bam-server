# BAM-flow
Provides a basic BAM file HTTP server.

## How to 'install'
```
npm install
```
or

```
npm install --no-bin-links
```



## How to 'configure' server
The service could be configured using data located at `src/config.json`

There are different contexts to configure:

* flow
* bam
* samtools


## How to 'start' server
```
npm start
```
or

```
node src/clusterControl.js
```


## How to make 'tests'.
There are different contexts to test:

* samtools:

  Based on shell scripts to check samtools behavior


* service:

  Based on 'postman' requests
