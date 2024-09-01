import { execSync } from 'child_process'
import fsExtra from 'fs-extra' // Import fs-extra as default import
import { dirname, join } from 'path'
import chalk from 'chalk'
import figlet from 'figlet'
import { fileURLToPath } from 'url'

// Create a function for flashy logging
const logFlashy = (message: string) => {
  console.log(chalk.magentaBright.bold(message))
}

const logSuccess = (message: string) => {
  console.log(chalk.green.bold(message))
}

const logHeader = () => {
  console.log(
    chalk.redBright.bold(figlet.textSync('BrightSide Developer', { font: '5 Line Oblique', horizontalLayout: 'controlled smushing' }))
  )
  console.log(chalk.yellow.bold('Extreme Extensioner 3000'))
  console.log(chalk.white('---------------------------------------------'))
}

// Print the header
logHeader()

const __dirname = dirname(fileURLToPath(import.meta.url))

// Define the paths
const popupFolder = join(__dirname, 'popup')
const contentFolder = join(__dirname, 'content')
const distPopupFolder = join(popupFolder, 'dist')
const distContentFolder = join(contentFolder, 'dist')
const extensionFolder = join(__dirname, 'extension')
const manifestFilePath = join(__dirname, 'manifest.json')
const iconFilePath = join(__dirname, 'icon.png')
const backgroundFilePath = join(__dirname, 'background.js')

// Step 1: Clear all files in the 'extension' folder
logFlashy('Clearing all files in the extension folder...')
fsExtra.emptyDirSync(extensionFolder)

// Step 2: Copy 'manifest.json' from the root to 'extension/manifest.json'
logFlashy('Copying manifest.json to the extension folder...')
fsExtra.copySync(manifestFilePath, join(extensionFolder, 'manifest.json'), { overwrite: true })

logFlashy('Copying icon.png to the extension folder...')
fsExtra.copySync(iconFilePath, join(extensionFolder, 'icon.png'), { overwrite: true })

// Step 3: Run 'npm run build' in the 'popup' folder
logFlashy('Running npm run build in the popup folder...')
execSync('npm run build', { cwd: popupFolder, stdio: 'inherit' })

// Step 4: Copy files from 'popup/dist' to the 'extension' folder
logFlashy('Copying files from popup/dist to the extension folder...')
fsExtra.copySync(distPopupFolder, extensionFolder, { overwrite: true })

// Step 5: Run 'npm run build' in the 'content' folder
logFlashy('Running npm run build in the content folder...')
execSync('npm run build', { cwd: contentFolder, stdio: 'inherit' })

// Step 6: Copy the built 'content.js' to the 'extension' folder
const contentJsPath = join(distContentFolder, 'content.js')
const targetContentJsPath = join(extensionFolder, 'content.js')
logFlashy('Copying content.js to the extension folder...')
fsExtra.copySync(contentJsPath, targetContentJsPath, { overwrite: true })

// Final Success Message
logSuccess('WOOOHOOOO! Just load the extension folder into chrome://extensions! 🎉🚀')
console.log(chalk.blueBright.bold(figlet.textSync('Too  Ez', { font: '3D-ASCII', horizontalLayout: 'controlled smushing' })))
