#!/bin/sh -l

echo "Debug appname $1"
echo "Debug createprofile $2"
echo "Debug filepath $3"
echo "Debug version $4"
echo "Debug vid $5"
echo "Debug vkey $6"

appname=$1
createprofile=$2
filepath=$3
version=$4
vid=$5
vkey=$6

curl https://tools.veracode.com/integrations/API-Wrappers/Java/bin/VeracodeJavaAPI.zip -o VeracodeJavaAPI.zip
unzip VeracodeJavaAPI.zip VeracodeJavaAPI.jar
java -jar VeracodeJavaAPI.jar \
     -action UploadAndScan \
     -appname ${appname} \
     -createprofile ${createprofile} \
     -filepath ${filepath} \
     -version ${version} \
     -vid ${vid} \
     -vkey ${vkey} \
     -autoscan true 

