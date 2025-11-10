"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const child_process_1 = require("child_process");
const process = __importStar(require("process"));
const core = __importStar(require("@actions/core"));
const glob_1 = require("glob");
// Get inputs from environment variables (GitHub Actions passes inputs as INPUT_<INPUT_NAME>)
function getInput(name) {
    const envVar = `INPUT_${name.toUpperCase().replace(/-/g, '_')}`;
    return process.env[envVar] || undefined;
}
// Required parameters
const appname = core.getInput('appname');
const createprofile = core.getInput('createprofile');
const filepath = core.getInput('filepath');
const version = core.getInput('version');
const vid = core.getInput('vid');
const vkey = core.getInput('vkey');
// Optional parameters
const createsandbox = core.getInput('createsandbox');
const sandboxname = core.getInput('sandboxname');
const scantimeout = core.getInput('scantimeout');
const exclude = core.getInput('exclude');
const include = core.getInput('include');
const criticality = core.getInput('criticality');
const pattern = core.getInput('pattern');
const replacement = core.getInput('replacement');
const sandboxid = core.getInput('sandboxid');
const scanallnonfataltoplevelmodules = core.getInput('scanallnonfataltoplevelmodules');
const selected = core.getInput('selected');
const selectedpreviously = core.getInput('selectedpreviously');
const teams = core.getInput('teams');
const toplevel = core.getInput('toplevel');
const deleteincompletescan = core.getInput('deleteincompletescan');
const scanpollinginterval = core.getInput('scanpollinginterval');
const javawrapperversion = core.getInput('javawrapperversion');
const debug = core.getInput('debug');
const includenewmodules = core.getInput('includenewmodules');
const maxretrycount = core.getInput('maxretrycount');
const policy = core.getInput('policy');
// Print required information
console.log('Required Information');
console.log('====================');
console.log(`appname: ${appname}`);
console.log(`createprofile: ${createprofile}`);
console.log(`filepath: ${filepath}`);
console.log(`version: ${version}`);
if (vid) {
    console.log('vid: ***');
}
else {
    console.log('vid:');
}
if (vkey) {
    console.log('vkey: ***');
}
else {
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
// Expand wildcards in filepath (matching shell behavior)
async function expandFilepath(filepath) {
    // Check if filepath contains wildcards
    if (filepath.includes('*') || filepath.includes('?')) {
        try {
            const matches = await (0, glob_1.glob)(filepath, {
                cwd: process.cwd(),
                absolute: false,
                nodir: true // Only match files, not directories
            });
            if (matches.length === 0) {
                console.error(`ERROR: No files found matching pattern: ${filepath}`);
                process.exit(1);
            }
            if (matches.length === 1) {
                // Single match - use it directly
                return matches[0];
            }
            // Multiple matches - check if they're all in the same directory
            const dirs = new Set(matches.map((m) => path.dirname(m)));
            if (dirs.size === 1) {
                // All files in the same directory - use the directory
                const dir = Array.from(dirs)[0];
                console.log(`Multiple files matched (${matches.length}), using directory: ${dir}`);
                return dir;
            }
            // Files in different directories - use the first match
            console.log(`Multiple files matched (${matches.length}) in different directories, using first match: ${matches[0]}`);
            return matches[0];
        }
        catch (error) {
            console.error(`ERROR: Failed to expand filepath pattern: ${filepath}`);
            console.error(error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    }
    // No wildcards - return as-is
    return filepath;
}
// Validation functions
function validateParameters() {
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
function buildJavaArgs(expandedFilepath) {
    const args = [
        '-jar', 'VeracodeJavaAPI.jar',
        '-filepath', expandedFilepath,
        '-version', version,
        '-action', 'uploadandscan',
        '-appname', appname,
        '-vid', vid,
        '-vkey', vkey
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
    args.push('-createprofile', createprofile);
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
function downloadFile(url, dest) {
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
async function getLatestWrapperVersion() {
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
                }
                else {
                    reject(new Error('Could not find latest version in Maven metadata'));
                }
            });
        }).on('error', reject);
    });
}
// Main execution
async function main() {
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
        // Expand filepath wildcards (matching shell behavior)
        const expandedFilepath = await expandFilepath(filepath);
        if (expandedFilepath !== filepath) {
            console.log(`Expanded filepath from "${filepath}" to "${expandedFilepath}"`);
        }
        // Build Java command
        const javaArgs = buildJavaArgs(expandedFilepath);
        console.log('Executing Java command:');
        console.log(`java ${javaArgs.join(' ')}`);
        // Execute Java command using spawn (secure - no shell interpretation)
        const javaProcess = (0, child_process_1.spawn)('java', javaArgs, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        // Wait for process to complete
        javaProcess.on('close', (code) => {
            if (code !== 0) {
                process.exit(code || 1);
            }
            else {
                process.exit(0);
            }
        });
        javaProcess.on('error', (err) => {
            console.error(`Failed to start Java process: ${err.message}`);
            process.exit(1);
        });
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
// Run main function
main();
