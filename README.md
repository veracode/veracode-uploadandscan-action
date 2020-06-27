# Veracode Community Upload And Scan Action

This action runs the Veracode Java Wrapper's 'upload and scan' action.

## Inputs

### `appname` 
**Required:** The application name.

### `createprofile`
**Required:**  True to create a new application profile.

### `filepath`
**Required:** Filepath or folderpath of the file or directory to upload. (If the last character is a backslash it needs to be escaped: \\).

### `version`
**Required:** The name or version number of the new build.

### `vid`
**Required:** Veracode API ID.

### `vkey`
**Required:** Veracode API key.

## Example usage

The following example will upload all files contained within the folder_to_upload to Veracode and start a static scan.

If the application does not exist it will be created.

The scan name is defined by 'version'

The veracode credentials are read from github secrets. NEVER STORE YOUR SECRETS IN THE REPOSITORY.

```yaml
- uses: actions/setup-java@v1 # Make java accessible on path so the uploadandscan action can run.
  with: 
    java-version: '8'
- uses: actions/upload-artifact@v2 # Copy files from repository to docker container so the next uploadandscan action can access them.
  with:
    path: folder_to_upload/*.jar # Wildcards can be used to filter the files copied into the container. See: https://github.com/actions/upload-artifact
- uses: actions/veracode-community-uploadandscan-action@master # Run the uploadandscan action. Inputs are described above.
  with:
    appname: 'My App Name'
    createprofile: 'true'
    filepath: 'folder_to_upload/'
    version: 'My Scan Name 1'
    vid: ${{ secrets.VERACODE_ID }}
    vkey: ${{ secrets.VERACODE_KEY }}
```
