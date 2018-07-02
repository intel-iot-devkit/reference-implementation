# Set export proxy's if any. The environment this code was generated has proxy's to be called out for uploading the snaps.

#export HTTP_PROXY=http://proxy-iind.intel.com:911
#export HTTPS_PROXY=http://proxy-iind.intel.com:911

#A nodejs script is run everytime which has the credential details & container storage names.
node upload.js $1