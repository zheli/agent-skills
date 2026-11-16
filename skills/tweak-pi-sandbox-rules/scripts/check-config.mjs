#!/usr/bin/env node
// Usage: node check-config.mjs <sandbox.json>
// Mirrors upstream's comment stripping; checks one file, not merged/runtime policy.
import { readFileSync } from "node:fs";

function stripJsonComments(input) {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && input[i + 1] === "/") {
      while (i < input.length && input[i] !== "\n") i++;
      if (i < input.length) out += "\n";
      continue;
    }
    if (ch === "/" && input[i + 1] === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) i++;
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

const path = process.argv[2];
if (!path) {
  console.error("usage: check-config.mjs <sandbox.json>");
  process.exit(2);
}

let config;
try {
  config = JSON.parse(stripJsonComments(readFileSync(path, "utf8")));
} catch (error) {
  console.error(`INVALID ${path}: ${error.message}`);
  process.exit(1);
}
if (typeof config !== "object" || config === null || Array.isArray(config)) {
  console.error(`INVALID ${path}: configuration must be a JSON object`);
  process.exit(1);
}

const arrays = {
  network: ["allowedDomains", "deniedDomains", "allowUnixSockets", "allowMachLookup"],
  filesystem: ["allowRead", "denyRead", "allowWrite", "denyWrite"],
};
const problems = [];
for (const section of ["network", "filesystem"]) {
  const value = config[section];
  if (value !== undefined && (value === null || typeof value !== "object" || Array.isArray(value))) {
    problems.push(`${section} must be an object`);
  }
}
const booleans = {
  root: ["enabled", "sandboxUserShell", "enableAccessRequestTool", "allowBrowserProcess", "allowProcessSignals"],
  network: ["disabled", "allowSSHAgentSocket", "allowAllUnixSockets", "allowLocalBinding", "allowUnauthenticatedSocksProxy", "sshProxy"],
  filesystem: ["denyMandatoryCwdFiles"],
};
for (const [section, keys] of Object.entries(booleans)) {
  for (const key of keys) {
    const value = section === "root" ? config[key] : config[section]?.[key];
    if (value !== undefined && typeof value !== "boolean") problems.push(`${section}.${key} must be boolean`);
  }
}
const timeout = config.permissionPromptTimeoutSeconds;
if (timeout !== undefined && (typeof timeout !== "number" || !Number.isFinite(timeout) || timeout < 0)) {
  problems.push("permissionPromptTimeoutSeconds must be a finite nonnegative number");
}
for (const [section, keys] of Object.entries(arrays)) {
  for (const key of keys) {
    const value = config[section]?.[key];
    if (value === undefined) continue;
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
      // pi-sandbox silently drops non-string arrays, so the rule would have no effect.
      problems.push(`${section}.${key} must be an array of strings`);
      continue;
    }
    console.log(`${section}.${key}: ${JSON.stringify(value)}`);
  }
}
if (config.network?.allowedDomains?.includes?.("*")) console.error('NOTE network.allowedDomains contains "*" (allows all domains)');

const scalars = Object.entries(config).filter(([k]) => k !== "network" && k !== "filesystem");
for (const [k, v] of scalars) console.log(`${k}: ${JSON.stringify(v)}`);
for (const [k, v] of Object.entries(config.network ?? {})) {
  if (!arrays.network.includes(k)) console.log(`network.${k}: ${JSON.stringify(v)}`);
}

if (problems.length) {
  for (const p of problems) console.error(`WARN ${p}`);
  process.exit(1);
}
console.log(`OK ${path} (syntax and common types only; not effective policy)`);
