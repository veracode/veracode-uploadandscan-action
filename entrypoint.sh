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

pattern=${13}
replacement=${14}
sandboxid=${15}
scanallnonfataltoplevelmodules=${16}
selected=${17}
selectedpreviously=${18}
teams=${19}
toplevel=${20}





echo "Required Information"
echo "===================="
echo "appname: $appname"
echo "createprofile: $createprofile"
echo "filepath: $filepath"
echo "version: $version"
if [ "$vid" ]
then
echo "vid: ***"
else
echo "vid:"
fi

if [ "$vkey" ]
then
echo "vkey: ***"
else
echo "vkey:"
fi
echo ""
echo "Optional Information"
echo "===================="
echo "createsandbox: $createsandbox"
echo "sandboxname: $8"
echo "scantimeout: $9"
echo "exclude: ${10}"
echo "include: ${11}"
echo "criticality: ${12}"
echo "pattern: ${13}"
echo "replacement: ${14}"
echo "sandboxid: ${15}"
echo "scanallnonfataltoplevelmodules: ${16}"
echo "selected: ${17}"
echo "selectedpreviously: ${18}"
echo "teams: ${19}"
echo "toplevel: ${20}"


#Input validation checks

if [ -z "$appname" ] || [ -z "$createprofile" ] || [ -z "$filepath" ] || [ -z "$version" ] || [ -z "$vid" ] || [ -z "$vkey" ]
then
        echo "Missing required parameter. Please check that all required parameters are set"
        exit 1
fi



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
    echo "        -criticality \"$criticality\" \\" >> runJava.sh
fi

if [ "$pattern" ]
then
    echo "        -pattern \"$pattern\" \\" >> runJava.sh
fi

if [ "$replacement" ]
then
    echo "        -replacement \"$replacement\" \\" >> runJava.sh
fi

if [ "$sandboxid" ]
then
        if [ "$sandboxname" ]
        then
                echo "ERROR: sandboxid cannot got together with sandboxname"
                exit 1
        else
                echo "        -sandboxid \"$sandboxid\" \\" >> runJava.sh
        fi
fi

if [ "$scanallnonfataltoplevelmodules" ]
then
    echo "        -scanallnonfataltoplevelmodules \"$scanallnonfataltoplevelmodules\" \\" >> runJava.sh
fi

if [ "$selected" ]
then
    echo "        -selected \"$selected\" \\" >> runJava.sh
fi

if [ "$selectedpreviously" ]
then
    echo "        -selectedpreviously \"$selectedpreviously\" \\" >> runJava.sh
fi

if [ "$teams" ]
then
    echo "        -teams \"$teams\" \\" >> runJava.sh
fi

if [ "$toplevel" ]
then
    echo "        -toplevel \"$toplevel\" \\" >> runJava.sh
fi




echo "        -createprofile \"$createprofile\"" >> runJava.sh



#below pulls latest wrapper version. alternative is to pin a version like so:
#javawrapperversion=20.8.7.1



javawrapperversion=$(curl https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/maven-metadata.xml | grep latest |  cut -d '>' -f 2 | cut -d '<' -f 1)

#echo "javawrapperversion: $javawrapperversion"

curl -sS -o VeracodeJavaAPI.jar "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/$javawrapperversion/vosp-api-wrappers-java-$javawrapperversion.jar"
chmod 777 runJava.sh
cat runJava.sh
./runJava.sh
