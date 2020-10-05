#!/bin/sh -l

#required parameters
appname=$1
createprofile=$2
filepath=$3
version=$4
vid=$5
vkey=$6

#optional parameters
createsandbox=$7
sandboxname=$8
scantimeout=$9
exclude=${10}
include=${11}
criticality=${12}




echo "Required Information"
echo "===================="
echo "appname: $appname"
echo "createprofile: $createprofile"
echo "filepath: $filepath"
echo "version: $version"
echo ""
echo "Optional Information"
echo "===================="
echo "createsandbox: $createsandbox"
echo "sandboxname: $8"
echo "scantimeout: $9"
echo "exclude: ${10}"
echo "include: ${11}"
echo "criticality: ${12}"

#create additioanl commands on optional input
wrapper_optional=""

if [ "$createsandbox" == true ]
then
    wrapper_optional=$wrapper_optional"-createsandbox=true "
elif [ "$createsandbox" == false ]
then
    wrapper_optional=$wrapper_optional"-createsandbox=false "
fi

if [ "$sandboxname" ]
then
    wrapper_optional=$wrapper_optional"-sandboxname="$sandboxname" "
fi

if [ "$scantimeout" ]
then
    wrapper_optional=$wrapper_optional"-scantimeout=$scantimeout "
fi

if [ "$exclude" ]
then
    wrapper_optional=$wrapper_optional"-exclude="$exclude" "
fi

if [ "$include" ]
then
    wrapper_optional=$wrapper_optional"-include="$include" "
fi

if [ "$criticality" ]
then
    wrapper_optional=$wrapper_optional"-criticality="$criticality" "
fi

#required wrapper command
wrapper_required="-action UploadAndScan -appname "$appname" -createprofile $createprofile -filepath $filepath -version "$version" -vid $vid -vkey $vkey -autoscan true "


#Debug
echo "wrapper required: $wrapper_required"
echo ""
echo "wrapper optional: $wrapper_optional"
echo ""
echo "full wrapper command: $wrapper_required$wrapper_optional"


#below pulls latest wrapper version. alternative is to pin a version like so:
#javawrapperversion=20.8.7.1



javawrapperversion=$(curl https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/maven-metadata.xml | grep latest |  cut -d '>' -f 2 | cut -d '<' -f 1)

echo "javawrapperversion: $javawrapperversion"

curl -sS -o VeracodeJavaAPI.jar "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/$javawrapperversion/vosp-api-wrappers-java-$javawrapperversion.jar"
java -jar VeracodeJavaAPI.jar $wrapper_required $wrapper_optional
