// Automatic build hook for Cloudflare & CI deployment environments
const isCI = process.env.CI || process.env.CF_PAGES || process.env.CLOUDFLARE_BUILD;

if (isCI) {
  const { execSync } = require('child_process');
  console.log('\n[CI Build Hook] Detected CI deployment environment.');
  console.log('[CI Build Hook] Compiling Next.js application with OpenNext Cloudflare adapter...\n');
  try {
    execSync('npx opennextjs-cloudflare build', { stdio: 'inherit' });
    console.log('\n[CI Build Hook] OpenNext Cloudflare build finished successfully!\n');
  } catch (err) {
    console.error('\n[CI Build Hook] OpenNext build failed:', err);
    process.exit(1);
  }
}
