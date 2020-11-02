#!/bin/bash -l

set -e

appname=$1
createprofile=$2
filepath=$3
version=$4
vid=$5
vkey=$6
sandboxname=$7
srcclr=$8
srcclrurl=$9

export SRCCLR_API_TOKEN=$10

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
veracodejavaapicmd='/usr/local/openjdk-8/bin/java -jar VeracodeJavaAPI.jar -action UploadAndScan -autoscan true'

# if $var is set: add flag & value
[ ! -z "$appname" ] && veracodejavaapicmd+=' -appname "$appname"'
[ ! -z "$createprofile" ] && veracodejavaapicmd+=' -createprofile "$createprofile"'
[ ! -z "$filepath" ] && veracodejavaapicmd+=' -filepath "$filepath"'
[ ! -z "$version" ] && veracodejavaapicmd+=' -version "$version"'
[ ! -z "$vid" ] && veracodejavaapicmd+=' -vid "$vid"'
[ ! -z "$vkey" ] && veracodejavaapicmd+=' -vkey "$vkey"'
[ ! -z "$sandboxname" ] && veracodejavaapicmd+=' -sandboxname "$sandboxname"'

curl -sS -o VeracodeJavaAPI.jar "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/$javawrapperversion/vosp-api-wrappers-java-$javawrapperversion.jar"

# Execute the command
eval $veracodejavaapicmd

if $srcclr
then
     apt-get update -y
     apt-get install -y python3 python3-pip
     update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1
     pip install --upgrade pip
     echo ${srcclrurl}
     eval 'curl -sSL ${srcclrurl} | sh -s scan'
fi