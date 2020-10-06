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


#required wrapper command
echo "#!/bin/sh -l" > runJava.sh
echo ""
echo "java -jar VeracodeJavaAPI.jar \\
        -filepath $filepath \\
        -version \"$version\" \\
        -action \"uploadandscan\" \\
        -appname \"$appname\" \\
        -vid \"$vid\" \\
        -vkey \"$vkey\" \\" >> runJava.sh

#create additioanl commands on optional input

if [ "$createsandbox" == true ]
then
    echo "        -createsandbox=\"true\" \\" >> runJava.sh
elif [ "$createsandbox" == false ]
then
    echo "        -createsandbox=\"false\" \\" >> runJava.sh
fi

if [ "$sandboxname" ]
then
   echo "        -sandboxname \"$sandboxname\" \\" >> runJava.sh
fi

if [ "$scantimeout" ]
then
   echo "        -scantimeout \"$scantimeout\" \\" >> runJava.sh
fi

if [ "$exclude" ]
then
    echo "        -exclude \"$exclude\" \\" >> runJava.sh
fi

if [ "$include" ]
then
    echo "        -include \"$include\" \\" >> runJava.sh
fi

if [ -z "$include" ] && [ -z "$exclude" ]
then
    echo "        -autoscan \"true\" \\" >> runJava.sh
fi

if [ "$criticality" ]
then
    echo "        -criticality=\"$criticality\" \\" >> runJava.sh
fi

echo "        -createprofile \"$createprofile\"" >> runJava.sh



#below pulls latest wrapper version. alternative is to pin a version like so:
#javawrapperversion=20.8.7.1



javawrapperversion=$(curl https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/maven-metadata.xml | grep latest |  cut -d '>' -f 2 | cut -d '<' -f 1)

#echo "javawrapperversion: $javawrapperversion"

curl -sS -o VeracodeJavaAPI.jar "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/$javawrapperversion/vosp-api-wrappers-java-$javawrapperversion.jar"
chmod 777 runJava.sh
more runJava.sh
./runJava.sh
