import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { spawn } from 'child_process';
import * as process from 'process';

// Get inputs from environment variables (GitHub Actions passes inputs as INPUT_<INPUT_NAME>)
function getInput(name: string): string | undefined {
  const envVar = `INPUT_${name.toUpperCase().replace(/-/g, '_')}`;
  return process.env[envVar] || undefined;
}

// Required parameters
const appname = getInput('appname');
const createprofile = getInput('createprofile');
const filepath = getInput('filepath');
const version = getInput('version');
const vid = getInput('vid');
const vkey = getInput('vkey');

// Optional parameters
const createsandbox = getInput('createsandbox');
const sandboxname = getInput('sandboxname');
const scantimeout = getInput('scantimeout');
const exclude = getInput('exclude');
const include = getInput('include');
const criticality = getInput('criticality');
const pattern = getInput('pattern');
const replacement = getInput('replacement');
const sandboxid = getInput('sandboxid');
const scanallnonfataltoplevelmodules = getInput('scanallnonfataltoplevelmodules');
const selected = getInput('selected');
const selectedpreviously = getInput('selectedpreviously');
const teams = getInput('teams');
const toplevel = getInput('toplevel');
const deleteincompletescan = getInput('deleteincompletescan');
const scanpollinginterval = getInput('scanpollinginterval');
const javawrapperversion = getInput('javawrapperversion');
const debug = getInput('debug');
const includenewmodules = getInput('includenewmodules');
const maxretrycount = getInput('maxretrycount');
const policy = getInput('policy');

// Print required information
console.log('Required Information');
console.log('====================');
console.log(`appname: ${appname}`);
console.log(`createprofile: ${createprofile}`);
console.log(`filepath: ${filepath}`);
console.log(`version: ${version}`);
if (vid) {
  console.log('vid: ***');
} else {
  console.log('vid:');
}
if (vkey) {
  console.log('vkey: ***');
} else {
  console.log('vkey:');
}
console.log('');
console.log('Optional Information');
console.log('====================');
console.log(`createsandbox: ${createsandbox || ''}`);
console.log(`sandboxname: ${sandboxname || ''}`);
console.log(`scantimeout: ${scantimeout || ''}`);
console.log(`exclude: ${exclude || ''}`);
console.log(`include: ${include || ''}`);
console.log(`criticality: ${criticality || ''}`);
console.log(`pattern: ${pattern || ''}`);
console.log(`replacement: ${replacement || ''}`);
console.log(`sandboxid: ${sandboxid || ''}`);
console.log(`scanallnonfataltoplevelmodules: ${scanallnonfataltoplevelmodules || ''}`);
console.log(`selected: ${selected || ''}`);
console.log(`selectedpreviously: ${selectedpreviously || ''}`);
console.log(`teams: ${teams || ''}`);
console.log(`toplevel: ${toplevel || ''}`);
console.log(`deleteincompletescan: ${deleteincompletescan || ''}`);
console.log(`scanpollinginterval: ${scanpollinginterval || ''}`);
console.log(`javawrapperversion: ${javawrapperversion || ''}`);
console.log(`debug: ${debug || ''}`);
console.log(`includenewmodules: ${includenewmodules || ''}`);
console.log(`maxretrycount: ${maxretrycount || ''}`);
console.log(`policy: ${policy || ''}`);

// Check if required parameters are set
if (!appname || !createprofile || !filepath || !version || !vid || !vkey) {
  console.error('Missing required parameter. Please check that all required parameters are set');
  process.exit(1);
}

// Validation functions
function validateParameters(): void {
  // Check sandboxname and sandboxid conflict
  if (sandboxname && sandboxid) {
    console.error('ERROR: sandboxname cannot go together with sandboxid');
    process.exit(1);
  }

  // Check exclude conflicts
  if (exclude && (selectedpreviously || toplevel || selected)) {
    console.error('ERROR: exclude cannot go together with selectedpreviously, toplevel, selected');
    process.exit(1);
  }

  // Check include conflicts
  if (include && (selectedpreviously || toplevel || selected)) {
    console.error('ERROR: include cannot go together with selectedpreviously, toplevel, selected');
    process.exit(1);
  }

  // Check pattern and replacement
  if (pattern && !replacement) {
    console.error('ERROR: pattern always need the replacement parameter as well');
    process.exit(1);
  }

  if (replacement && !pattern) {
    console.error('ERROR: replacement always need the pattern parameter as well');
    process.exit(1);
  }

  // Check selected conflicts
  if (selected && (selectedpreviously || toplevel || scanallnonfataltoplevelmodules || exclude || include)) {
    console.error('ERROR: selected cannot go together with selectedpreviously, toplevel, scanallnonfataltoplevelmodules, exclude, include');
    process.exit(1);
  }

  // Check selectedpreviously conflicts
  if (selectedpreviously && (selected || toplevel || scanallnonfataltoplevelmodules || exclude || include)) {
    console.error('ERROR: selectedpreviously cannot go together with selected, toplevel, scanallnonfataltoplevelmodules, exclude, include');
    process.exit(1);
  }

  // Check toplevel conflicts
  if (toplevel && (selected || selectedpreviously || scanallnonfataltoplevelmodules || exclude || include)) {
    console.error('ERROR: toplevel cannot go together with selected, selectedpreviously, scanallnonfataltoplevelmodules, exclude, include');
    process.exit(1);
  }
}

// Build Java command arguments
function buildJavaArgs(): string[] {
  const args: string[] = [
    '-jar', 'VeracodeJavaAPI.jar',
    '-filepath', filepath!,
    '-version', version!,
    '-action', 'uploadandscan',
    '-appname', appname!,
    '-vid', vid!,
    '-vkey', vkey!
  ];

  // Add optional parameters
  if (createsandbox === 'true' || createsandbox === 'false') {
    args.push('-createsandbox', createsandbox);
  }

  if (sandboxname) {
    args.push('-sandboxname', sandboxname);
  }

  if (scantimeout) {
    args.push('-scantimeout', scantimeout);
  }

  if (exclude) {
    args.push('-exclude', exclude);
  }

  if (include) {
    args.push('-include', include);
  }

  // Add autoscan if neither include nor exclude are set
  if (!include && !exclude) {
    args.push('-autoscan', 'true');
  }

  if (criticality) {
    args.push('-criticality', criticality);
  }

  if (pattern) {
    args.push('-pattern', pattern);
  }

  if (replacement) {
    args.push('-replacement', replacement);
  }

  if (sandboxid) {
    args.push('-sandboxid', sandboxid);
  }

  if (scanallnonfataltoplevelmodules) {
    args.push('-scanallnonfataltoplevelmodules', scanallnonfataltoplevelmodules);
  }

  if (selected) {
    args.push('-selected', selected);
  }

  if (selectedpreviously) {
    args.push('-selectedpreviously', selectedpreviously);
  }

  if (teams) {
    args.push('-teams', teams);
  }

  if (toplevel) {
    args.push('-toplevel', toplevel);
  }

  if (deleteincompletescan) {
    args.push('-deleteincompletescan', deleteincompletescan);
  }

  if (scanpollinginterval) {
    args.push('-scanpollinginterval', scanpollinginterval);
  }

  args.push('-createprofile', createprofile!);

  if (debug) {
    args.push('-debug', debug);
  }

  if (includenewmodules) {
    args.push('-includenewmodules', includenewmodules);
  }

  if (maxretrycount) {
    args.push('-maxretrycount', maxretrycount);
  }

  if (policy) {
    args.push('-policy', policy);
  }

  return args;
}

// Download file from URL
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        if (response.headers.location) {
          return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        }
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Get latest wrapper version from Maven
async function getLatestWrapperVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get('https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/maven-metadata.xml', (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const match = data.match(/<latest>(.*?)<\/latest>/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          reject(new Error('Could not find latest version in Maven metadata'));
        }
      });
    }).on('error', reject);
  });
}

// Main execution
async function main(): Promise<void> {
  try {
    // Validate parameters
    validateParameters();

    // Get Java wrapper version
    let wrapperVersion = javawrapperversion;
    if (!wrapperVersion) {
      wrapperVersion = await getLatestWrapperVersion();
    }
    console.log(`javawrapperversion: ${wrapperVersion}`);

    // Download Veracode Java API wrapper
    const jarUrl = `https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/${wrapperVersion}/vosp-api-wrappers-java-${wrapperVersion}.jar`;
    const jarPath = path.join(process.cwd(), 'VeracodeJavaAPI.jar');
    
    console.log(`Downloading Veracode Java API wrapper from ${jarUrl}...`);
    await downloadFile(jarUrl, jarPath);
    console.log('Download complete.');

    // Build Java command
    const javaArgs = buildJavaArgs();
    console.log('Executing Java command:');
    console.log(`java ${javaArgs.join(' ')}`);

    // Execute Java command using spawn (secure - no shell interpretation)
    const javaProcess = spawn('java', javaArgs, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Wait for process to complete
    javaProcess.on('close', (code) => {
      if (code !== 0) {
        process.exit(code || 1);
      } else {
        process.exit(0);
      }
    });

    javaProcess.on('error', (err) => {
      console.error(`Failed to start Java process: ${err.message}`);
      process.exit(1);
    });

  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run main function
main();

