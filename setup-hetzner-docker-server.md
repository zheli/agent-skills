# Hetzner Server Initial Setup with Docker

## Purpose
Initialize a fresh Hetzner Ubuntu server with a non-root user configured for Docker application deployment. This skill sets up secure SSH access, Docker permissions, and a dedicated data directory.

## Prerequisites
- Fresh Hetzner server running Ubuntu (tested on 24.04 LTS)
- Root SSH access to the server
- Docker already installed on the server
- SSH public key(s) added to root's authorized_keys

## Skill Invocation
Use this skill when you need to:
- Set up a new Hetzner server for hosting Docker applications
- Create a non-root user with Docker and sudo access
- Secure SSH access by disabling password authentication
- Prepare a server for automated deployments

## Steps

### 1. Create Non-Root User
```bash
# Create user with home directory and bash shell
ssh root@<SERVER_IP> 'useradd -m -s /bin/bash ubuntu'

# Set temporary password (user should change on first use)
ssh root@<SERVER_IP> 'echo "ubuntu:<TEMP_PASSWORD>" | chpasswd'

# Verify user creation
ssh root@<SERVER_IP> 'id ubuntu'
```

### 2. Create Data Directory
```bash
# Create /data directory with proper ownership and permissions
ssh root@<SERVER_IP> 'mkdir -p /data && chown ubuntu:ubuntu /data && chmod 755 /data'

# Verify directory setup
ssh root@<SERVER_IP> 'ls -ld /data'
```

### 3. Configure Passwordless Sudo
```bash
# Create sudoers drop-in file for ubuntu user
ssh root@<SERVER_IP> 'echo "ubuntu ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ubuntu'

# Set correct permissions on sudoers file
ssh root@<SERVER_IP> 'chmod 440 /etc/sudoers.d/ubuntu'

# Verify sudoers configuration
ssh root@<SERVER_IP> 'cat /etc/sudoers.d/ubuntu'
```

### 4. Add User to Docker Group
```bash
# Add ubuntu user to docker group
ssh root@<SERVER_IP> 'usermod -aG docker ubuntu'

# Verify group membership
ssh root@<SERVER_IP> 'id ubuntu'
# Should show: groups=1000(ubuntu),988(docker) or similar
```

### 5. Setup SSH Key Access
```bash
# Create .ssh directory for ubuntu user
ssh root@<SERVER_IP> 'mkdir -p /home/ubuntu/.ssh'

# Copy root's authorized_keys to ubuntu user
ssh root@<SERVER_IP> 'cp /root/.ssh/authorized_keys /home/ubuntu/.ssh/authorized_keys'

# Set correct ownership and permissions
ssh root@<SERVER_IP> 'chown -R ubuntu:ubuntu /home/ubuntu/.ssh && chmod 700 /home/ubuntu/.ssh && chmod 600 /home/ubuntu/.ssh/authorized_keys'

# Verify SSH setup
ssh root@<SERVER_IP> 'ls -la /home/ubuntu/.ssh/'
```

### 6. Disable SSH Password Authentication
```bash
# Create SSH config drop-in file to disable password auth
ssh root@<SERVER_IP> 'echo "PasswordAuthentication no" > /etc/ssh/sshd_config.d/50-disable-password-auth.conf'

# Verify configuration
ssh root@<SERVER_IP> 'cat /etc/ssh/sshd_config.d/50-disable-password-auth.conf'
```

### 7. Restart SSH Service
```bash
# Restart SSH service (on Ubuntu 24.04, service name is 'ssh', not 'sshd')
ssh root@<SERVER_IP> 'systemctl restart ssh'

# Verify SSH service status
ssh root@<SERVER_IP> 'systemctl status ssh | head -n 10'
```

### 8. Verification
```bash
# Test all configurations in one command
ssh ubuntu@<SERVER_IP> '
  whoami &&
  echo "---SSH login successful---" &&
  sudo -n whoami &&
  echo "---Sudo without password successful---" &&
  docker ps 2>&1 | head -n 5 &&
  echo "---Docker command successful---" &&
  ls -ld /data &&
  echo "---/data access successful---" &&
  touch /data/test-file && rm /data/test-file &&
  echo "---/data write test successful---"
'
```

## Expected Results
After running all steps, you should have:
- ✓ Non-root user `ubuntu` with UID 1000
- ✓ `/data` directory owned by ubuntu:ubuntu
- ✓ Ubuntu user can run sudo commands without password
- ✓ Ubuntu user can run docker commands without sudo
- ✓ SSH key-based authentication working for ubuntu user
- ✓ SSH password authentication disabled
- ✓ All configurations verified and working

## Security Notes
- **Temporary Password**: Set a secure temporary password. User should change it on first use (though SSH keys are preferred)
- **SSH Keys**: Ensure you have SSH key access working before disabling password authentication
- **Passwordless Sudo**: Appropriate for automation/admin users but understand the security implications
- **Docker Group**: Docker group membership grants root-equivalent access to the system
- **Root Access**: Keep root SSH access via keys as backup

## Customization Variables
When using this skill, customize these values:
- `<SERVER_IP>`: The IP address of your Hetzner server
- `<TEMP_PASSWORD>`: A secure temporary password for the ubuntu user (e.g., `ubuntu123!`)
- `ubuntu`: Replace with different username if needed
- `/data`: Replace with different data directory path if needed
- `755`: Adjust directory permissions as needed (775 for group-writable, 700 for user-only)

## Troubleshooting
- **SSH service name**: On Ubuntu 24.04+, the service is named `ssh` not `sshd`
- **Docker group GID**: May vary by system (e.g., 988, 999, etc.)
- **Existing users**: If ubuntu user exists, use `usermod` instead of `useradd`
- **SSH lockout**: Always test SSH key login before disabling password auth
- **Sudoers syntax**: Test with `visudo -c` to check syntax before applying

## References
- Hetzner Cloud Documentation: https://docs.hetzner.com/cloud/
- Ubuntu Server Guide: https://ubuntu.com/server/docs
- Docker Post-Installation Steps: https://docs.docker.com/engine/install/linux-postinstall/
