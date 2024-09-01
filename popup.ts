import { spawn } from 'child_process'
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
  console.log(chalk.redBright.bold(figlet.textSync('BrightSide Developer', { font: 'Sub-Zero', horizontalLayout: 'controlled smushing' })))
  console.log(chalk.yellow.bold('Extreme Extensioner 3000'))
  console.log(chalk.white('---------------------------------------------'))
}

// Print the header
logHeader()

const __dirname = dirname(fileURLToPath(import.meta.url))

// Define the paths
const popupFolder = join(__dirname, 'popup')

// Start the dev server
logFlashy('Starting the developer server...')

const devServer = spawn('npm', ['run', 'dev'], { cwd: popupFolder, stdio: 'inherit', shell: true })

// Handle process events
devServer.on('close', (code) => {
  if (code === 0) {
    logSuccess('Dev server stopped gracefully.')
  } else {
    console.log(chalk.red(`Dev server exited with code ${code}.`))
  }
})

devServer.on('error', (err) => {
  console.log(chalk.red(`Failed to start dev server: ${err.message}`))
})
