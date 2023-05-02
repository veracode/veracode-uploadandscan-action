# Veracode Upload And Scan Action

This action runs the Veracode Java Wrapper's 'upload and scan' action.

## Inputs

### `appname`

**Required:** STRING - The application name.

**Default:** '${{ github.repository }}'

### `createprofile`

**Required:**  BOOLEAN - True to create a new application profile.

**Default:** true

### `filepath`

**Required:** STRING - Filepath or folderpath of the file or directory to upload. (If the last character is a backslash it needs to be escaped: \\\\).

### `version`

**Required:** STRING - The name or version number of the new build.

**Default:** 'Scan from Github job: ${{ github.run_id }}'

### `vid`

**Required:** Veracode API ID.

### `vkey`

**Required:** Veracode API key.

## Optional Inputs

### `createsandbox`

**Optional** BOOLEAN - Set 'true' if the sandbox should be created on the Veracode platform

### `sandboxname`

**Optional** STRING - The sandboxname inside the application profile name

### `scantimeout`

**Optional** INTEGER - Number of minutes how long the action is waiting for the scan to complete. Use this to introduce break build functionality

### `exclude`

**Optional** STRING - Exclude modules from modules selection / scanning. Case-sensitive, comma-separated list of module name patterns that represent the names of modules to not scan as top-level modules. The * wildcard matches 0 or more characters. The ? wildcard matches exactly one character.

### `include`

**Optional** STRING - Include modules in modules selection / scanning. Case-sensitive, comma-separated list of module name patterns that represent the names of modules to scan as top-level modules. The * wildcard matches 0 or more characters. The ? wildcard matches exactly one character.

### `includenewmodules`

**Optional** BOOLEAN - If scanallnonfataltoplevelmodules are true, set this parameter to true to automatically select all new top-level modules for inclusion in the scan. By default, the scan only includes previously selected modules.

### `criticality`

**Optional** STRING - Set the business criticality, autoamtically choosing the corresponding policy to rate findings. Options: VeryHigh, High, Medium, Low, VeryLow

### `pattern`

**Optional** STRING - Case-sensitive filename pattern that represents the names of uploaded files to save with a different name. The * wildcard matches 0 or more characters. The ? wildcard matches exactly one character. Each wildcard corresponds to a numbered group that you can reference in the replacement pattern.

### `replacement`

**Optional** STRING - Replacement pattern that references groups captured by the filename pattern. For example, if the filename pattern is --SNAPSHOT.war and the replacement pattern is $1-master-SNAPSHOT.war, an uploaded file named app-branch-SNAPSHOT.war is saved as app-master-SNAPSHOT.war.

### `sandboxid`

**Optional** INTEGER - ID of the sandbox in which to run the scan.

### `scanallnonfataltoplevelmodules`

**Optional** BOOLEAN - If this parameter is not set, the default is false. When set to true, if the application has more than one module, and at least one of the top-level modules does not have any fatal prescan errors, it starts the scan for those modules after prescan is complete.

### `selected`

**Optional** BOOLEAN - Set this parameter to true to scan the modules currently selected in the Veracode Platform.

### `selectedpreviously`

**Optional** BOOLEAN - Set to true to scan only the modules selected in the previous scan.

### `teams`

**Optional** STRING - Required if you are creating a new application in the Veracode Platform. Comma-separated list of team names associated with the specified application.

### `toplevel`

**Optional** BOOLEAN - When set to true, Veracode only scans the top-level modules in your files.
Veracode recommends that you use the toplevel parameter if you want to ensure the scan completes even though there are non-fatal errors, such as unsupported frameworks.

### `deleteincompletescan`

**In Java API Wrapper version >=22.5.10.0 this parameter has changed to an Integer. One of these values:**

* 0: do not delete an incomplete scan when running the uploadandscan action. The default. If set, you must delete an incomplete scan manually to proceed with the uploadandscan action.
* 1: delete a scan with a status of incomplete, no modules defined, failed, or canceled to proceed with the uploadandscan action. If errors occur when running this action, the Java wrapper automatically deletes the incomplete scan.
* 2: delete a scan of any status except Results Ready to proceed with the uploadandscan action. If errors occur when running this action, the Java wrapper automatically deletes the incomplete scan.

**Optional** With the scan deleted automatically, you can create subsequent scans without having to manually delete an incomplete scan.
  
### `scanpollinginterval`  
  
**Optional** INTEGER - Interval, in seconds, to poll for the status of a running scan. Value range is 30 to 120 (two minutes). Default is 120.  
  
  
### `javawrapperversion`

**Optional** STRING - Allows specifying the version of the Java API Wrapper used by the script to call the Veracode APIs. The default is to use the latest released version of the Veracode Java API Wrapper, as [published in Maven Central](https://search.maven.org/search?q=a:vosp-api-wrappers-java). An example of the version string format is `22.5.10.1`.

### `debug`

**Optional** BOOLEAN - Set to true to show detailed diagnostic information, which you can use for debugging, in the output.

## Examples

### General Usage

The following example will compile and build a Java web applicatin (.war file) from the main branch of the source code repository using Maven. The compiled .war file is then uploaded to Veracode and a static analysis scan is run.

The veracode credentials are read from github secrets. NEVER STORE YOUR SECRETS IN THE REPOSITORY.

```yaml
name: Veracode Static Analysis Demo
on: workflow_dispatch
    
jobs:
  static_analysis:
    name: Static Analysis
    runs-on: ubuntu-latest
    
    steps:
      - name: Check out main branch
        uses: actions/checkout@v2
        
      - name: Build with Maven # Compiling the .war binary from the checked out repo source code to upload to the scanner in the next step
        run: mvn -B package --file app/pom.xml
          
      - name: Veracode Upload And Scan
        uses: veracode/veracode-uploadandscan-action@0.2.6
        with:
          appname: 'VeraDemo'
          createprofile: false
          filepath: 'app/target/verademo.war'
          vid: '${{ secrets.API_ID }}'
          vkey: '${{ secrets.API_KEY }}'
#          createsandbox: 'true'
#          sandboxname: 'SANDBOXNAME'
#          scantimeout: 0
#          exclude: '*.js'
#          include: '*.war'
#          criticality: 'VeryHigh'
```

### Using This Action With a Mac Runner

Docker is not installed on Mac runners by default, and [installing it can be time consuming](https://github.com/actions/runner/issues/1456). As an alternative, we suggest breaking the build and upload for languages that require a Mac runner to build (like iOS) into separate jobs. An example workflow is below:

```yaml
jobs:
  build:
    name: Build
    runs-on: macos-12
    
    steps:
      - name: checkout
        uses: actions/checkout@v2
      
      # SNIP: steps to build an iOS application

      - uses: actions/upload-artifact@v3
        with:
          path: path/to/iOSApplication.zip
  scan:
      name: Scan
      runs-on: ubuntu-latest
      needs: build
      steps:
        - uses: actions/download-artifact@v3
          with:
            path: iOSApplication.zip
  
        - name: Upload & Scan
          uses: veracode/veracode-uploadandscan-action@0.2.6
          with:
            appname: 'MyTestApp'
            filepath: 'iOSApplication.zip'
            vid: 'FakeID'
            vkey: 'FakeKey'
```
