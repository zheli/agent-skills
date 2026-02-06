# Hetzner Server Initial Setup with Docker

A Claude skill for initializing a fresh Hetzner Ubuntu server with a non-root user configured for Docker application deployment.

## Overview

This skill automates the setup of a secure, production-ready Hetzner server by:
- Creating a non-root user (ubuntu) with home directory
- Setting up `/data` directory with proper permissions
- Configuring passwordless sudo access
- Adding user to docker group for container management
- Copying SSH keys from root to the new user
- Disabling SSH password authentication for security
- Verifying all configurations are working

## Use Cases

- Setting up new Hetzner servers for Docker applications
- Preparing servers for automated deployments
- Securing server access with SSH key-based authentication
- Establishing baseline configuration for infrastructure automation

## Prerequisites

Before using this skill, ensure you have:
- A fresh Hetzner server running Ubuntu 24.04 LTS (or similar)
- Root SSH access to the server
- Docker already installed on the server
- Your SSH public key(s) added to root's authorized_keys

## Usage

1. Invoke the skill: `@setup-hetzner-docker-server`
2. Provide the required information:
   - Server IP address
   - Desired username (default: ubuntu)
   - Temporary password for the new user
3. The skill will execute all setup steps automatically
4. Review the verification output to confirm success

## What Gets Configured

| Component | Configuration |
|-----------|--------------|
| User | Non-root user with home directory and bash shell |
| Sudo Access | Passwordless sudo for administrative tasks |
| Docker Access | User added to docker group (no sudo required) |
| Data Directory | `/data` directory with proper ownership |
| SSH Access | Key-based authentication with password auth disabled |
| Security | Hardened SSH configuration |

## Security Considerations

⚠️ **Important Security Notes:**
- The Docker group grants root-equivalent system access
- Passwordless sudo is suitable for automation but increases risk if compromised
- Always test SSH key access before disabling password authentication
- Keep root SSH access via keys as a backup
- Change the temporary password immediately after first use

## Expected Results

After successful execution:
- ✅ New non-root user created and configured
- ✅ User can run Docker commands without sudo
- ✅ User can execute sudo commands without password
- ✅ SSH key authentication working
- ✅ Password authentication disabled
- ✅ Data directory accessible and writable
- ✅ All configurations verified

## Troubleshooting

### Common Issues

**SSH Service Not Restarting**
- Ubuntu 24.04+ uses `ssh` not `sshd` as the service name
- Solution: Use `systemctl restart ssh` instead of `systemctl restart sshd`

**Docker Group Not Found**
- Docker may not be installed or the group GID differs
- Solution: Verify Docker installation with `docker --version`

**SSH Lockout**
- Password authentication disabled before SSH keys working
- Solution: Use Hetzner console/VNC to re-enable password auth

**Permission Denied Errors**
- File permissions or ownership incorrect
- Solution: Review and reapply chmod/chown commands with correct paths

## Technical Details

- **Target OS**: Ubuntu 24.04 LTS (compatible with 22.04 and 20.04)
- **Required Access**: Root SSH access
- **Execution Time**: ~2-3 minutes
- **Default User**: ubuntu (UID 1000)
- **Default Data Directory**: /data (755 permissions)

## License

See [LICENSE](./LICENSE) file for details.
