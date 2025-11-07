// postinstall.js
import  { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getPackageManager() {
  // Check npm_config_user_agent (most reliable)
  const userAgent = process.env.npm_config_user_agent;
  
  if (userAgent) {
    if (userAgent.startsWith('yarn')) return 'yarn';
    if (userAgent.startsWith('pnpm')) return 'pnpm';
    if (userAgent.startsWith('bun')) return 'bun';
    if (userAgent.startsWith('npm')) return 'npm';
  }

  // Fallback: Check lock files
  const rootDir = process.cwd();
  
  if (fs.existsSync(path.join(rootDir, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) return 'npm';
  
  // Default
  return 'npm';
}

function runBuild() {
  const packageManager = getPackageManager();
  console.log(`Detected package manager: ${packageManager}`);
  
  try {
    // Check if we're being installed as a dependency (not in the package's own directory)
    const isInstallingAsDependency = process.env.INIT_CWD !== process.cwd();
    
    if (isInstallingAsDependency) {
      console.log('Building package from git...');
      
      const buildCommand =  ['npm', 'bun'].includes(packageManager)
        ? `${packageManager} run build`
        : `${packageManager} build`;
      
      execSync(buildCommand, { 
        stdio: 'inherit',
        cwd: process.cwd() 
      });
      
      console.log('Build completed successfully!');
    } else {
      console.log('Skipping build (running in package directory)');
    }
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

runBuild();