/// <reference types="bun-types" />

import { vercelRegionMap } from '../lib/vercel';
import * as fs from 'fs/promises';
import * as path from 'path';
import { $ } from 'bun';

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  // First run vercel build
  console.log('Running vercel build...');
  await $`npx vercel build --prod`;

  // Get all Vercel region codes
  const vercelRegions = Object.values(vercelRegionMap);
  console.log('Processing regions:', vercelRegions);
  
  // First, copy all function folders to break symlinks
  console.log('\n=== BREAKING SYMLINKS ===');
  for (const region of vercelRegions) {
    console.log(`\nProcessing region: ${region}`);
    
    const funcPaths = [
      path.join(process.cwd(), '.vercel/output/functions/api', `${region}.func`),
      path.join(process.cwd(), '.vercel/output/functions/api', `${region}.rsc.func`)
    ];
    
    for (const funcPath of funcPaths) {
      console.log(`Copying folder: ${funcPath}`);
      const tempPath = `${funcPath}.temp`;
      
      // Copy to temp location
      await copyDir(funcPath, tempPath);
      
      // Remove original
      await fs.rm(funcPath, { recursive: true, force: true });
      
      // Move temp to original location
      await fs.rename(tempPath, funcPath);
      console.log(`Successfully copied folder`);
    }
  }

  // Now update the config files
  console.log('\n=== UPDATING CONFIG FILES ===');
  for (const region of vercelRegions) {
    console.log(`\nProcessing region: ${region}`);

    const configPaths = [
      path.join(process.cwd(), '.vercel/output/functions/api', `${region}.func`, '.vc-config.json'),
      path.join(process.cwd(), '.vercel/output/functions/api', `${region}.rsc.func`, '.vc-config.json')
    ];
    
    for (const configPath of configPaths) {
      console.log(`\nEditing file: ${configPath}`);
      
      // Read and update the config
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      console.log(`Current regions before edit: ${config.regions?.join(', ') || 'none'}`);
      
      config.regions = [region];
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(`Set regions to: ${region}`);
    }
  }

  // Verify all config files
  console.log('\n=== VERIFYING ALL CONFIG FILES ===');
  for (const region of vercelRegions) {
    console.log(`\nVerifying region: ${region}`);

    const configPaths = [
      path.join(process.cwd(), '.vercel/output/functions/api', `${region}.func`, '.vc-config.json'),
      path.join(process.cwd(), '.vercel/output/functions/api', `${region}.rsc.func`, '.vc-config.json')
    ];
    
    for (const configPath of configPaths) {
      console.log(`\nReading file: ${configPath}`);
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      console.log(`Current regions in file: ${config.regions?.join(', ') || 'none'}`);
      
      if (config.regions?.[0] !== region) {
        console.error(`❌ MISMATCH! Expected ${region} but got ${config.regions?.[0]}`);
      } else {
        console.log(`✅ Correct region: ${region}`);
      }
    }
  }

  // Run vercel deploy
  console.log('\nRunning vercel deploy...');
  if(process.env.VERCEL_TOKEN) {
    // CI/CD
    const token = process.env.VERCEL_TOKEN;
    const orgId = process.env.VERCEL_ORG_ID;
    const projectId = process.env.VERCEL_PROJECT_ID;
    await $`npx vercel deploy --prebuilt --prod --token=${token} --org-id=${orgId} --project-id=${projectId}`;
  } else {
    // Locally using vercel login
    await $`npx vercel deploy --prebuilt --prod`;
  }

  console.log('Region configuration completed successfully!');
}

// Run the script
main(); 