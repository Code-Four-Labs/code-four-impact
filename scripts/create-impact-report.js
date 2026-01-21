#!/usr/bin/env node

/**
 * Create Impact Report Script
 * 
 * Generates a password-protected impact report and uploads it to GCS.
 * 
 * Usage:
 *   node scripts/create-impact-report.js --org <org-slug> --password <password>
 *   node scripts/create-impact-report.js --org spanish-fork-pd --password demo2026
 * 
 * This will:
 *   1. Generate a UUIDv7
 *   2. Hash the password with bcrypt
 *   3. Create the metadata.json
 *   4. Upload to gs://c4-impact/organizations/{org}/{uuid}/metadata.json
 *   5. Output the access URL
 */

const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const orgSlug = getArg('org') || 'unit-tests';
const password = getArg('password') || 'test123';
const orgName = getArg('name') || `${orgSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Police Department`;
const trialStart = getArg('start') || 'Jan 1';
const trialEnd = getArg('end') || 'Jan 31';

// Generate UUIDv7 (timestamp-based)
function generateUUIDv7() {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  const randomBytes = crypto.randomBytes(10);
  
  // Version 7 UUID format
  const uuid = [
    timestampHex.slice(0, 8),                           // time_high
    timestampHex.slice(8, 12),                          // time_mid
    '7' + randomBytes.slice(0, 2).toString('hex').slice(1), // ver + time_low
    (0x80 | (randomBytes[2] & 0x3f)).toString(16) + randomBytes.slice(3, 4).toString('hex'), // var + clock
    randomBytes.slice(4, 10).toString('hex')            // node
  ].join('-');
  
  return uuid;
}

// Generate sample data
function generateSampleData() {
  const officers = ['Johnson', 'Smith', 'Davis', 'Wilson', 'Martinez', 'Garcia', 'Thompson', 'Brown'];
  const leaderboard = officers.slice(0, 5).map((name, i) => ({
    name: `Officer ${name}`,
    reports: Math.floor(Math.random() * 30) + 20 - (i * 5),
    rank: i + 1
  })).sort((a, b) => b.reports - a.reports).map((entry, i) => ({ ...entry, rank: i + 1 }));

  const totalReports = leaderboard.reduce((sum, e) => sum + e.reports, 0) + Math.floor(Math.random() * 100);
  
  // Utah cities approximate coordinates
  const locations = [
    { lat: 40.7608, lon: -111.8910, count: Math.floor(Math.random() * 50) + 30 }, // Salt Lake City
    { lat: 40.2338, lon: -111.6585, count: Math.floor(Math.random() * 40) + 20 }, // Provo
    { lat: 41.2230, lon: -111.9738, count: Math.floor(Math.random() * 30) + 15 }, // Ogden
    { lat: 40.5649, lon: -111.9390, count: Math.floor(Math.random() * 25) + 10 }, // West Jordan
    { lat: 40.6461, lon: -111.4980, count: Math.floor(Math.random() * 20) + 8 },  // Park City
  ];

  return {
    reportsGenerated: totalReports,
    minutesProcessed: totalReports * 75 + Math.floor(Math.random() * 1000),
    activeUsers: Math.floor(Math.random() * 10) + 8,
    avgWordLength: Math.floor(Math.random() * 500) + 1500,
    avgIncidentLength: `${Math.floor(Math.random() * 10) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    leaderboard,
    reportLocations: locations
  };
}

async function main() {
  console.log('\n🚀 Creating Impact Report\n');
  console.log(`   Organization: ${orgSlug}`);
  console.log(`   Display Name: ${orgName}`);
  console.log(`   Password: ${password}`);
  
  // Generate UUID
  const uuid = generateUUIDv7();
  console.log(`   UUID: ${uuid}`);
  
  // Hash password
  console.log('\n📝 Generating bcrypt hash...');
  const passwordHash = bcrypt.hashSync(password, 10);
  console.log(`   Hash: ${passwordHash.substring(0, 30)}...`);
  
  // Generate sample data
  const sampleData = generateSampleData();
  
  // Create metadata
  const metadata = {
    uuid,
    org_slug: orgSlug,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
    expires_at: null,
    report: {
      orgName,
      trialPeriod: `${trialStart} - ${trialEnd}, 2026`,
      ...sampleData
    }
  };
  
  // Write to temp file
  const tmpPath = `/tmp/impact-${uuid}.json`;
  require('fs').writeFileSync(tmpPath, JSON.stringify(metadata, null, 2));
  console.log(`\n📄 Created metadata file: ${tmpPath}`);
  
  // Upload to GCS
  const gcsPath = `gs://c4-impact/organizations/${orgSlug}/${uuid}/metadata.json`;
  console.log(`\n☁️  Uploading to GCS...`);
  console.log(`   Path: ${gcsPath}`);
  
  try {
    execSync(`gcloud storage cp ${tmpPath} "${gcsPath}"`, { stdio: 'pipe' });
    console.log('   ✅ Upload successful!');
  } catch (error) {
    console.error('   ❌ Upload failed:', error.message);
    process.exit(1);
  }
  
  // Clean up
  require('fs').unlinkSync(tmpPath);
  
  // Output URLs
  console.log('\n' + '='.repeat(60));
  console.log('✨ Impact Report Created Successfully!');
  console.log('='.repeat(60));
  console.log(`\n📍 GCS Path:`);
  console.log(`   ${gcsPath}`);
  console.log(`\n🔗 Access URLs:`);
  console.log(`   Local:      http://localhost:3000/${orgSlug}/${uuid}`);
  console.log(`   Production: https://impact.codefour.us/${orgSlug}/${uuid}`);
  console.log(`\n🔑 Password: ${password}`);
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);
