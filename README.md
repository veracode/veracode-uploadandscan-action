# Veracode Community Upload And Scan Action

This action runs the Veracode Java Wrapper's 'upload and scan' action.

## Inputs

### `appname`

**Required** appname

### `createprofile`

**Required** createprofile

### `filepath`

**Required** filepath

### `version`

**Required** version

### `vid`

**Required** vid

### `vkey`

**Required** vkey

## Example usage

```yaml
uses: actions/hello-world-docker-action@master
  with:
    appname: 'my App name'
    createprofile: 'true'
    filepath: '**.jar'
    version: 'My scan name 1'
    vid: 'my vid '
    vkey: 'My vkey invalid'
```
