#!/bin/sh -l

appname=$1
createprofile=$2
filepath=$3
version=$4
vid=$5
vkey=$6
sandboxname=$7
srcclr=$8

export SRCCLR_API_TOKEN=$9

echo "appname: $appname"
echo "createprofile: $createprofile"
echo "filepath: $filepath"
echo "version: $version"

#below pulls latest wrapper version. alternative is to pin a version like so:
#javawrapperversion=20.8.7.1

javawrapperversion=$(curl https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/maven-metadata.xml | grep latest |  cut -d '>' -f 2 | cut -d '<' -f 1)

echo "javawrapperversion: $javawrapperversion"

curl -sS -o VeracodeJavaAPI.jar "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/$javawrapperversion/vosp-api-wrappers-java-$javawrapperversion.jar"
java -jar VeracodeJavaAPI.jar \
     -action UploadAndScan \
     -appname "$appname" \
     -createprofile "$createprofile" \
     -filepath "$filepath" \
     -version "$version" \
     -vid "$vid" \
     -vkey "$vkey" \
     -sandboxname "$sandboxname" \
     -autoscan true

if $srcclr
then
     curl -sSL https://download.sourceclear.com/ci.sh | sh -s scan
fi