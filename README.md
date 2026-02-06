# Agent Skills Collection

A collection of reusable operational skills and runbooks for common infrastructure and deployment tasks.

## Purpose

This repository contains step-by-step guides and skills that can be executed by AI agents or human operators to perform common infrastructure setup and maintenance tasks in a consistent, repeatable manner.

## Available Skills

### Server Setup & Configuration

#### [Hetzner Server Initial Setup with Docker](./setup-hetzner-docker-server.md)
Initialize a fresh Hetzner Ubuntu server with a non-root user configured for Docker application deployment.

**What it does:**
- Creates a non-root user (ubuntu) with home directory
- Sets up `/data` directory with proper permissions
- Configures passwordless sudo access
- Adds user to docker group for container management
- Copies SSH keys from root to the new user
- Disables SSH password authentication for security
- Verifies all configurations are working

**Use cases:**
- Setting up new Hetzner servers for Docker applications
- Preparing servers for automated deployments
- Securing server access with SSH key-based authentication

## Usage

Each skill document contains:
1. **Prerequisites** - What you need before starting
2. **Step-by-step commands** - Ready-to-execute bash commands
3. **Verification steps** - How to confirm everything works
4. **Customization variables** - Values you need to replace (marked with `<>`)
5. **Security notes** - Important security considerations
6. **Troubleshooting** - Common issues and solutions

## Contributing

To add a new skill:
1. Create a new markdown file with a descriptive name (e.g., `setup-kubernetes-cluster.md`)
2. Follow the existing skill structure and format
3. Include all necessary commands, verification steps, and documentation
4. Update this README with a reference to your new skill

## License

See [LICENSE](./LICENSE) file for details.
