# Configure Hetzner Cloud Floating IP

A Claude skill for persistently configuring Hetzner Cloud Floating IPs on Ubuntu servers using Netplan.

## Overview

This skill automates the configuration of Hetzner Cloud Floating IPs to ensure they persist across server reboots. It:
- Verifies the server uses Netplan for network configuration
- Creates proper Netplan configuration files for the floating IP
- Sets required file permissions (600 for netplan)
- Applies the configuration without disrupting existing network settings
- Validates that the floating IP is active and externally accessible
- Ensures the configuration survives system reboots

## Use Cases

- Assigning floating IPs permanently to Ubuntu servers in Hetzner Cloud
- Setting up high-availability configurations with failover IPs
- Configuring load balancing setups with floating IPs
- Migrating services between servers while maintaining the same IP address
- Preparing servers for zero-downtime deployments

## Prerequisites

Before using this skill, ensure you have:
- An Ubuntu server (24.04 LTS or newer) running in Hetzner Cloud
- SSH access to the server (root or user with sudo privileges)
- A Hetzner Cloud Floating IP already created in your project
- The floating IP not currently assigned to another server

## Usage

1. Invoke the skill: `@configure-hetzner-floating-ip`
2. Provide the required information:
   - Server IP address (primary IP for SSH access)
   - Floating IP address to configure
   - SSH username (root or ubuntu)
3. The skill will execute all configuration steps automatically
4. Review the verification output to confirm the floating IP is active

## What Gets Configured

| Component | Configuration |
|-----------|--------------|
| Netplan File | `/etc/netplan/60-floating-ip.yaml` created with floating IP configuration |
| File Permissions | 600 permissions set (required by netplan) |
| Network Interface | Floating IP added to eth0 (or specified interface) with /32 netmask |
| IP Assignment | Floating IP configured as additional address (doesn't replace primary IP) |
| Persistence | Configuration survives server reboots |
| Routing | Automatic routing configured by systemd-networkd |

## Security Considerations

⚠️ **Important Security Notes:**
- **Root Access**: Requires sudo/root access to modify network configuration files
- **Network Interruption**: Applying netplan may cause brief network connectivity interruption
- **Firewall Rules**: Ensure firewall permits traffic to the floating IP address
- **IP Conflicts**: Verify the floating IP is not assigned to another server in Hetzner Cloud Console
- **Configuration Backup**: Always backup existing netplan configs before modifications

## Expected Results

After successful execution:
- ✅ Floating IP appears on the network interface (`ip addr show eth0`)
- ✅ Floating IP is externally reachable (responds to ping)
- ✅ Configuration file `/etc/netplan/60-floating-ip.yaml` exists with correct permissions
- ✅ Netplan configuration applies without errors
- ✅ Primary IP address remains functional
- ✅ Floating IP persists after server reboot

## Troubleshooting

### Common Issues

**Netplan Apply Fails**
- Check YAML syntax and indentation in the configuration file
- Verify file permissions are exactly 600
- Use `sudo netplan --debug apply` for detailed error output

**Floating IP Not Visible**
- Confirm interface name is correct (use `ip link show` to verify)
- Check if netplan configuration was applied: `sudo netplan get`
- Restart systemd-networkd: `sudo systemctl restart systemd-networkd`

**External Connectivity Issues**
- Verify floating IP is assigned to this server in Hetzner Cloud Console
- Check firewall rules with `sudo ufw status` or `sudo iptables -L`
- Confirm routing table with `ip route show`

**Configuration Lost After Reboot**
- Verify `/etc/netplan/60-floating-ip.yaml` still exists
- Check if another netplan config is overriding the settings
- Ensure systemd-networkd service is enabled and running

**Permission Denied Errors**
- Confirm you're using sudo for all modification commands
- Verify user has proper sudo privileges
- Check ownership of `/etc/netplan/` directory

## Technical Details

- **Target OS**: Ubuntu 24.04 LTS (compatible with 22.04 and other netplan-based systems)
- **Network Manager**: Netplan with systemd-networkd renderer
- **Required Access**: Root or sudo privileges
- **Execution Time**: ~1-2 minutes
- **Network Interface**: eth0 (default for Hetzner Cloud servers)
- **IP Configuration**: /32 netmask for floating IP
- **Configuration Priority**: 60 (allows override by higher priority configs)

## License

See [LICENSE](./LICENSE) file for details.
