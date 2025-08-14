#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building FitFlow app for Cloudflare deployment...\n');

// Build the client app
console.log('📦 Building React client...');
execSync('npm run build:client', { stdio: 'inherit' });

// Create deployment structure
const deployDir = './cloudflare-deploy';
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Copy client build to deploy directory
console.log('📋 Copying client build files...');
const clientBuildDir = './dist';
const pagesDir = path.join(deployDir, 'pages');
if (fs.existsSync(clientBuildDir)) {
  fs.cpSync(clientBuildDir, pagesDir, { recursive: true });
}

// Create worker directory and copy server files
console.log('🔧 Preparing Cloudflare Worker files...');
const workerDir = path.join(deployDir, 'worker');
fs.mkdirSync(workerDir, { recursive: true });

// Create worker configuration
const workerConfig = {
  name: "fitflow-api",
  main: "worker.js",
  compatibility_date: "2024-01-01",
  vars: {
    NODE_ENV: "production"
  }
};

fs.writeFileSync(
  path.join(workerDir, 'wrangler.toml'),
  `name = "${workerConfig.name}"
main = "${workerConfig.main}"
compatibility_date = "${workerConfig.compatibility_date}"

[vars]
NODE_ENV = "${workerConfig.vars.NODE_ENV}"

[[env.production.vars]]
# Add your environment variables here
`
);

// Create a simplified worker.js for Cloudflare Workers
const workerJs = `
// FitFlow API Worker for Cloudflare
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (url.pathname.startsWith('/api/')) {
      // Add your API logic here
      return new Response(
        JSON.stringify({ message: 'FitFlow API', path: url.pathname }), 
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Default response
    return new Response('FitFlow Worker', { headers: corsHeaders });
  },
};
`;

fs.writeFileSync(path.join(workerDir, 'worker.js'), workerJs);

console.log('✅ Build complete! Deployment files created in ./cloudflare-deploy/');
console.log('\n📁 Deployment structure:');
console.log('  📂 cloudflare-deploy/');
console.log('    📂 pages/     (Deploy this to Cloudflare Pages)');
console.log('    📂 worker/    (Deploy this as Cloudflare Worker)');
console.log('\n🌐 Next steps:');
console.log('1. Deploy pages/ directory to Cloudflare Pages');
console.log('2. Deploy worker/ directory as Cloudflare Worker');
console.log('3. Update your frontend to point to the Worker API endpoint');