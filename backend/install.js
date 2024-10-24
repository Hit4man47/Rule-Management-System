const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m"
};

// Function to log with colors
const log = {
  info: (msg) => console.log(colors.cyan + msg + colors.reset),
  success: (msg) => console.log(colors.green + msg + colors.reset),
  warning: (msg) => console.log(colors.yellow + msg + colors.reset),
  error: (msg) => console.log(colors.red + msg + colors.reset)
};

// Create necessary directories
const directories = [
  'config',
  'controllers',
  'models',
  'routes',
  'services',
  'middlewares',
  'tests',
  'logs'
];

function createDirectories() {
  log.info('Creating project directories...');
  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.success(`Created directory: ${dir}`);
    } else {
      log.warning(`Directory already exists: ${dir}`);
    }
  });
}

// Create .env file if it doesn't exist
function createEnvFile() {
  log.info('Setting up environment variables...');
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rule-engine
JWT_SECRET=your_jwt_secret_here
LOG_LEVEL=debug
    `.trim();
    
    fs.writeFileSync(envPath, envContent);
    log.success('Created .env file');
  } else {
    log.warning('.env file already exists');
  }
}

// Create .gitignore file
function createGitignore() {
  log.info('Setting up .gitignore...');
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `
node_modules/
.env
logs/
coverage/
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
    `.trim();
    
    fs.writeFileSync(gitignorePath, gitignoreContent);
    log.success('Created .gitignore file');
  } else {
    log.warning('.gitignore file already exists');
  }
}

// Main installation function
async function install() {
  try {
    log.info('Starting installation process...');

    // Check Node.js version
    const nodeVersion = process.version;
    if (nodeVersion.slice(1).split('.')[0] < 14) {
      throw new Error('Node.js version 14 or higher is required');
    }

    // Create project structure
    createDirectories();
    createEnvFile();
    createGitignore();

    // Install dependencies
    log.info('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    log.success('Dependencies installed successfully');

    // Install dev dependencies
    log.info('Installing dev dependencies...');
    execSync('npm install --save-dev nodemon jest supertest eslint prettier', { stdio: 'inherit' });
    log.success('Dev dependencies installed successfully');

    // Initialize Git repository if not already initialized
    if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
      log.info('Initializing Git repository...');
      execSync('git init', { stdio: 'inherit' });
      log.success('Git repository initialized');
    }

    // Setup completed
    log.success('\nInstallation completed successfully!');
    log.info('\nTo start the development server, run:');
    log.info('npm run dev');
    
    log.info('\nTo run tests:');
    log.info('npm test');
    
    log.info('\nMake sure to:');
    log.info('1. Update the .env file with your configuration');
    log.info('2. Start MongoDB service');
    log.info('3. Review the README.md file for more information');

  } catch (error) {
    log.error('\nInstallation failed!');
    log.error(error.message);
    process.exit(1);
  }
}

// Run installation
install();