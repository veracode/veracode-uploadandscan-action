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

### `deleteIncompleteScan`

**Optional** BOOLEAN - Set to true to automatically delete the current scan if there are any errors when uploading files or starting the scan. If the include or exclude parameters are set, this parameter deletes the scan if there are errors when starting the scan after module selection. Defaults to false.

With the scan deleted automatically, you can create subsequent scans without having to manually delete an incomplete scan.

## Example usage

The following example will upload all files contained within the folder_to_upload to Veracode and start a static scan.

The veracode credentials are read from github secrets. NEVER STORE YOUR SECRETS IN THE REPOSITORY.

```yaml
- uses: actions/setup-java@v1 # Make java accessible on path so the uploadandscan action can run.
  with: 
    java-version: '8'
- uses: actions/upload-artifact@v2 # Copy files from repository to docker container so the next uploadandscan action can access them.
  with:
    path: folder_to_upload/*.jar # Wildcards can be used to filter the files copied into the container. See: https://github.com/actions/upload-artifact
- uses: veracode/veracode-uploadandscan-action@master # Run the uploadandscan action. Inputs are described above.
  with:
    filepath: 'folder_to_upload/'
    vid: '${{ secrets.VERACODE_API_ID }}'
    vkey: '${{ secrets.VERACODE_API_KEY }}'
    createsandbox: 'true'
    sandboxname: 'SANDBOXNAME'
    scantimeout: 15
    exclude: '*.js'
    include: '*.war'
    criticality: 'VeryHigh'
```
