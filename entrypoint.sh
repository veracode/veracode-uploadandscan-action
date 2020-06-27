#!/bin/sh -l

appname=$1
createprofile=$2
filepath=$3
version=$4
vid=$5
vkey=$6

echo "appname: $appname"
echo "createprofile: $createprofile"
echo "filepath: $filepath"
echo "version: $version"

curl https://tools.veracode.com/integrations/API-Wrappers/Java/bin/VeracodeJavaAPI.zip -o VeracodeJavaAPI.zip
unzip VeracodeJavaAPI.zip VeracodeJavaAPI.jar
java -jar VeracodeJavaAPI.jar \
     -action UploadAndScan \
     -appname "$appname" \
     -createprofile "$createprofile" \
     -filepath "$filepath" \
     -version "$version" \
     -vid "$vid" \
     -vkey "$vkey" \
     -autoscan true
