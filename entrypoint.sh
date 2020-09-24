#!/bin/bash -l

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
echo "sandboxname: $sandboxname"
echo "createprofile: $createprofile"
echo "filepath: $filepath"
echo "version: $version"

#below pulls latest wrapper version. alternative is to pin a version like so:
#javawrapperversion=20.8.7.1

javawrapperversion=$(curl https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/maven-metadata.xml | grep latest |  cut -d '>' -f 2 | cut -d '<' -f 1)

echo "javawrapperversion: $javawrapperversion"

# Building jar execution command

veracodejavaapicmd='java -jar VeracodeJavaAPI.jar -action UploadAndScan -autoscan true'

# if $var exists then add flag & value
[ ! -z "$appname" ] && veracodejavaapicmd+=' -appname "$appname"' || echo "Empty"
[ ! -z "$createprofile" ] && veracodejavaapicmd+=' -createprofile "$createprofile"' || echo "Empty"
[ ! -z "$filepath" ] && veracodejavaapicmd+=' -filepath "$filepath"' || echo "Empty"
[ ! -z "$version" ] && veracodejavaapicmd+=' -version "$version"' || echo "Empty"
[ ! -z "$vid" ] && veracodejavaapicmd+=' -vid "$vid"' || echo "Empty"
[ ! -z "$vkey" ] && veracodejavaapicmd+=' -vkey "$vkey"' || echo "Empty"
[ ! -z "$appname" ] && veracodejavaapicmd+=' -sandboxname "$sandboxname"' || echo "Empty"

curl -sS -o VeracodeJavaAPI.jar "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/$javawrapperversion/vosp-api-wrappers-java-$javawrapperversion.jar"

eval $veracodejavaapicmd

if $srcclr
then
     apt-get update -y
     apt-get install -y python3 python3-pip
     update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1
     pip install --upgrade pip
     curl -sSL https://download.sourceclear.com/ci.sh | sh -s scan
fi