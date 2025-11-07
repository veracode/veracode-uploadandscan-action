# Root Cause Analysis: Action Rewrite to TypeScript/JavaScript

## Executive Summary

On Tuesday of this week, the Veracode Upload and Scan GitHub Action experienced a critical failure due to the deprecation of the OpenJDK Docker image on DockerHub. This incident, combined with additional operational challenges, led to the decision to completely rewrite the action from a Docker-based shell script implementation to a pure TypeScript/JavaScript implementation.

## Timeline of Events

### Tuesday - Initial Failure
- **Issue**: The OpenJDK Docker image used by the action was deprecated on DockerHub
- **Impact**: The action failed completely as the Docker image could no longer be pulled
- **Root Cause**: The action's Docker-based architecture required a specific base image that was no longer available

### Tuesday - Immediate Mitigation Attempt
- **Action Taken**: Updated the Dockerfile to use `eclipse-temurin:latest` image, which is actively maintained
- **New Issue Discovered**: The eclipse-temurin image does not include `curl` by default, which is required by the shell script
- **Additional Complexity**: 
  - Required adding `apt-get update` and `apt-get install curl` to the Dockerfile
  - This introduced a dependency on Ubuntu package repositories
  - Required whitelisting of Ubuntu domains in enterprise environments with network restrictions

### Tuesday - Additional Challenges
- **DockerHub Pull Limitations**: Customers began experiencing DockerHub pull rate limitations
- **Unknown Cause**: The process for pulling Docker images from DockerHub had not changed, making the root cause of these limitations unclear
- **Impact**: Even with a working Dockerfile, some customers could not pull the image due to rate limiting

## Root Causes

### Primary Root Cause: Docker Image Dependency
The action was architected as a shell script running inside a Docker container. This design created a critical dependency on:
1. **External Docker image availability** - The action failed when the base image was deprecated
2. **Image maintenance** - Required constant monitoring and updates when base images change
3. **Image size and complexity** - Each image update required rebuilding and redistributing the entire container

### Secondary Root Causes

#### 1. Shell Script Architecture
- The action was implemented as a shell script (`entrypoint.sh`)
- This required a full Linux environment with specific tools (curl, Java)
- Any changes to base images could break the action
- Limited portability across different runner types

#### 2. Missing Dependencies in Base Images
- The eclipse-temurin image lacked essential tools (curl)
- Required additional package installation steps
- Introduced network dependencies (Ubuntu package repositories)
- Created enterprise whitelisting requirements

#### 3. DockerHub Operational Issues
- Unexpected pull rate limitations affecting customers
- No clear explanation for the limitations
- Created additional barriers to action execution

## Impact Assessment

### Immediate Impact
- **Service Disruption**: Action completely non-functional for all users
- **Customer Impact**: All workflows using this action failed
- **Support Burden**: Increased support requests and troubleshooting

### Long-term Risks
- **Maintenance Overhead**: Constant need to monitor and update Docker images
- **Dependency Management**: Vulnerable to external service changes (DockerHub, base images)
- **Enterprise Adoption**: Network whitelisting requirements create barriers
- **Runner Compatibility**: Docker requirement limits runner options (e.g., macOS runners)

## Solution: Complete Rewrite

### Decision Rationale
The series of events on Tuesday highlighted fundamental architectural weaknesses in the Docker-based approach:

1. **Fragility**: Single point of failure (Docker image availability)
2. **Complexity**: Multiple layers of dependencies (Docker, base image, tools, shell script)
3. **Maintenance Burden**: Constant need to update and rebuild Docker images
4. **Operational Risk**: External dependencies (DockerHub) outside our control
5. **Customer Experience**: Docker pull limitations and network requirements

### New Architecture
The action has been rewritten to:
- **Pure TypeScript/JavaScript**: No Docker dependency
- **Node.js Runtime**: Uses GitHub Actions' built-in Node.js 20 runtime
- **Direct Java Execution**: Downloads and executes Veracode Java API wrapper directly
- **Secure Process Execution**: Uses Node.js `spawn` for secure command execution
- **Simplified Dependencies**: Only requires Node.js and Java on the runner

### Benefits
1. **Eliminates Docker Dependency**: No Docker image to maintain or pull
2. **Broader Compatibility**: Works on all runners with Node.js and Java (including macOS)
3. **Reduced Maintenance**: No Docker image updates required
4. **Better Reliability**: Fewer external dependencies and failure points
5. **Improved Security**: Direct process execution without containerization overhead
6. **Same Functionality**: All existing parameters and behavior preserved

## Implementation Details

### Rewrite Summary

The action has been completely rewritten from a Docker-based shell script implementation to a pure TypeScript/JavaScript implementation. This removes the Docker dependency and enables the action to run on all systems that support Node.js and Java.

### Changes

- **Removed Docker dependency**: The action no longer requires Docker, eliminating compatibility issues on runners without Docker (e.g., macOS runners)
- **TypeScript implementation**: Rewrote the shell script logic in TypeScript for better maintainability and type safety
- **Same functionality**: All existing functionality is preserved - downloads the Veracode Java API wrapper, builds the command with all parameters, and executes it securely
- **Secure execution**: Uses Node.js `spawn` for secure command execution without shell interpretation

### Benefits

- **Broader compatibility**: Can now run on all GitHub-hosted runners (including macOS) and self-hosted runners with Node.js and Java installed
- **No Docker required**: Eliminates the need for Docker installation and configuration
- **Faster execution**: No Docker image build/pull overhead
- **Better maintainability**: TypeScript provides better error checking and code organization

### Backward Compatibility

✅ **All parameters remain unchanged** - The action accepts the same inputs as before:
- Required parameters: `appname`, `createprofile`, `filepath`, `version`, `vid`, `vkey`
- All optional parameters work exactly as before
- No changes needed to existing workflows using this action

### Technical Details

- Uses `node20` runtime instead of Docker
- Downloads Veracode Java API wrapper from Maven Central (same as before)
- Executes Java commands using `spawn` for secure process execution
- All validation logic and parameter conflict checks preserved

### Migration

⚠️ **Runner Requirements**: The action now requires a runner with:
- Node.js 20+ (automatically available on GitHub-hosted runners)
- Java (required to execute the Veracode Java API wrapper)

**For GitHub-hosted runners**: No changes needed - all GitHub-hosted runners (ubuntu-latest, windows-latest, macos-latest) support Node.js and Java.

**For self-hosted runners**: Ensure your runner has Node.js 20+ and Java installed. If your current runner doesn't have these, you'll need to either:
- Install Node.js and Java on your existing runner, or
- Switch to a runner that supports Node.js and Java

**Workflow changes**: No changes needed to your workflow YAML files - all parameters and usage remain identical.

---

**Note**: The Dockerfile and entrypoint.sh files have been removed as they are no longer needed.

## Lessons Learned

1. **Architectural Resilience**: Dependencies on external services (DockerHub, base images) create single points of failure
2. **Simplicity Over Complexity**: Fewer layers of abstraction reduce maintenance burden
3. **Customer Impact**: Operational issues (DockerHub limitations) can have cascading effects
4. **Proactive Monitoring**: Need better visibility into dependency health and deprecation notices
5. **Technology Choice**: Modern GitHub Actions support Node.js natively, reducing the need for containerization

## Conclusion

The deprecation of the OpenJDK Docker image, combined with operational challenges around DockerHub and image maintenance, revealed fundamental weaknesses in the Docker-based architecture. The complete rewrite to TypeScript/JavaScript eliminates these dependencies while maintaining full backward compatibility with existing workflows. This change significantly improves the action's reliability, maintainability, and customer experience.

