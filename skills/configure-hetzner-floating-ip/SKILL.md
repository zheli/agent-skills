---
name: configure-hetzner-floating-ip
description: Configure a Hetzner Cloud Floating IP persistently on Ubuntu servers using Netplan. Ensures the floating IP survives reboots and is externally accessible.
allowed-tools: [Bash, Read, WebFetch]
---

# Configure Hetzner Cloud Floating IP

## Purpose
Configure a Hetzner Cloud Floating IP to be persistently assigned to an Ubuntu server. This skill creates the necessary Netplan configuration to ensure the floating IP remains active after system reboots.

## Prerequisites
- Ubuntu server running 24.04 LTS or newer with Netplan (default on modern Ubuntu)
- SSH access to the server (root or sudo user)
- A Hetzner Cloud Floating IP already created in your project
- Primary network interface is `eth0` (standard for Hetzner Cloud servers)

## When to Use This Skill
Use this skill when you need to:
- Assign a Hetzner Cloud Floating IP permanently to a server
- Configure high-availability setups with failover IPs
- Set up load balancing with floating IPs
- Ensure floating IPs persist across server reboots
- Migrate floating IPs between servers with persistent configuration

## Customization Variables
Before running commands, replace these placeholders:
- `<SERVER_IP>`: The primary IP address of your server (for SSH access)
- `<FLOATING_IP>`: The Hetzner Cloud Floating IP to configure (e.g., 5.75.216.246)
- `<USERNAME>`: SSH username (e.g., root, ubuntu)
- `eth0`: Replace with different interface name if needed (verify with `ip link show`)

## Steps

### 1. Verify Server Uses Netplan
```bash
# Check if netplan directory exists
ssh <USERNAME>@<SERVER_IP> 'ls -la /etc/netplan/'

# Check Ubuntu version (24.04+ uses netplan by default)
ssh <USERNAME>@<SERVER_IP> 'lsb_release -a'
```

Expected: You should see netplan configuration files (*.yaml) in `/etc/netplan/`

### 2. Create Floating IP Configuration File
```bash
# Create netplan configuration for floating IP
ssh <USERNAME>@<SERVER_IP> 'sudo tee /etc/netplan/60-floating-ip.yaml > /dev/null << EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
      - <FLOATING_IP>/32
EOF'

# Verify file was created correctly
ssh <USERNAME>@<SERVER_IP> 'sudo cat /etc/netplan/60-floating-ip.yaml'
```

### 3. Set Correct File Permissions
```bash
# Netplan requires configuration files to have 600 permissions
ssh <USERNAME>@<SERVER_IP> 'sudo chmod 600 /etc/netplan/60-floating-ip.yaml'

# Verify permissions
ssh <USERNAME>@<SERVER_IP> 'ls -l /etc/netplan/60-floating-ip.yaml'
```

Expected: `-rw------- 1 root root` (600 permissions)

### 4. Apply Netplan Configuration
```bash
# Apply the new configuration
ssh <USERNAME>@<SERVER_IP> 'sudo netplan apply'

# Verify no errors during apply
echo "If no errors above, configuration was applied successfully"
```

### 5. Verify Floating IP is Active
```bash
# Check that floating IP appears on eth0 interface
ssh <USERNAME>@<SERVER_IP> 'ip addr show eth0'

# Verify floating IP is listed (look for <FLOATING_IP>/32)
ssh <USERNAME>@<SERVER_IP> 'ip addr show eth0 | grep <FLOATING_IP>'
```

Expected: You should see `<FLOATING_IP>/32` in the output

### 6. Test External Connectivity
```bash
# Test that the floating IP responds to ping from external source
ping -c 3 <FLOATING_IP>

# Verify server can reach external services via floating IP
ssh <USERNAME>@<SERVER_IP> 'curl -s --interface <FLOATING_IP> https://ifconfig.me'
```

Expected: Ping should succeed, and curl should return the floating IP address

## Expected Results
After running all steps, you should have:
- ✓ Netplan configuration file `/etc/netplan/60-floating-ip.yaml` created
- ✓ File permissions set to 600 (required by netplan)
- ✓ Floating IP visible on eth0 interface via `ip addr show`
- ✓ Floating IP responds to external ping
- ✓ Configuration persists across server reboots
- ✓ No conflicts with primary IP address

## Security Notes
- **Root Access**: This skill requires sudo/root access to modify network configuration
- **Network Interruption**: Applying netplan configuration may cause brief network interruption
- **Firewall Rules**: Ensure firewall rules allow traffic to the floating IP
- **IP Conflicts**: Verify the floating IP is not assigned to another server in Hetzner Cloud
- **Backup Configuration**: Keep a backup of working netplan configs before modifications

## Troubleshooting

### Netplan Apply Fails
**Problem**: `sudo netplan apply` returns errors
**Solution**: 
- Check YAML syntax in `/etc/netplan/60-floating-ip.yaml` (indentation must be exact)
- Verify file permissions are 600
- Use `sudo netplan --debug apply` for detailed error messages

### Floating IP Not Appearing on Interface
**Problem**: `ip addr show eth0` doesn't show the floating IP
**Solution**:
- Verify the netplan configuration was applied: `sudo netplan get`
- Check if interface name is correct (might be ens3 instead of eth0)
- Restart networking: `sudo systemctl restart systemd-networkd`

### Floating IP Not Reachable Externally
**Problem**: Cannot ping or connect to floating IP from outside
**Solution**:
- Verify floating IP is assigned to this server in Hetzner Cloud Console
- Check firewall rules: `sudo ufw status` or `sudo iptables -L`
- Ensure the floating IP appears in `ip addr show`
- Verify routing: `ip route show`

### Configuration Doesn't Persist After Reboot
**Problem**: Floating IP disappears after server restart
**Solution**:
- Verify `/etc/netplan/60-floating-ip.yaml` still exists after reboot
- Check file wasn't overwritten by other netplan configs
- Ensure netplan service is enabled: `sudo systemctl status systemd-networkd`

### Permission Denied Errors
**Problem**: Cannot modify netplan configuration files
**Solution**:
- Ensure using sudo for all configuration commands
- Verify user has sudo privileges: `sudo -v`
- Check file ownership: `ls -l /etc/netplan/`

## References
- Hetzner Cloud Floating IP Documentation: https://docs.hetzner.com/cloud/floating-ips/persistent-configuration/
- Ubuntu Netplan Documentation: https://netplan.io/
- Systemd-networkd Documentation: https://www.freedesktop.org/software/systemd/man/systemd.network.html
- Hetzner Cloud Console: https://console.hetzner.cloud/
