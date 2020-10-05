# Veracode Upload And Scan Action

This action runs the Veracode Java Wrapper's 'upload and scan' action.

## Inputs

### `appname` 
**Required:** The application name.

**Default:** '${{ github.repository }}'

### `createprofile`
**Required:**  True to create a new application profile.

**Default:** true

### `filepath`
**Required:** Filepath or folderpath of the file or directory to upload. (If the last character is a backslash it needs to be escaped: \\\\).

### `version`
**Required:** The name or version number of the new build.

**Default:** 'Scan from Github job: ${{ github.run_id }}'

### `vid`
**Required:** Veracode API ID.

### `vkey`
**Required:** Veracode API key.

## Optional Inputs

### `createsandbox`
***Optional*** Set 'true' if the sandbox should be created on the Veracode platform

### `sandboxname`
***Optional*** The sandboxname inside the application profile name

### `scantimeout`
***Optional*** Number of minutes how long the action is waiting for the scan to complete. Use this to introduce break build functionality

### `exclude`
***Optional*** Exclude modules from modules selection / scanning

### `include`
***Optional*** Include modules in modules selection / scanning

### `criticality`
***Optional*** Set the business criticality, autoamtically choosing the corresponding policy to rate findings


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
- uses: actions/veracode-uploadandscan-action@master # Run the uploadandscan action. Inputs are described above.
  with:
    filepath: 'folder_to_upload/'
    vid: '${{ secrets.VERACODE_ID }}'
    vkey: '${{ secrets.VERACODE_KEY }}'
    createsandbox: 'true'
    sandboxname: 'SANDBOXNAME'
    scantimeout: 15
    exclude: '*.spec.js'
    include: '*.war'
    criticality: 'Very High'
```
