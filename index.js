const { spawn, exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

if (!fs.existsSync('coconut.jpg')) {
  process.exit(1);
}

console.log('Welcome to beanfrogs office suite');
console.log('Starting localhost server.');

const serverProc = spawn('node', ['server.js']);

let serverStarted = false;

serverProc.stdout.on('data', (data) => {
  console.log(`[Server]: ${data}`);
  const message = data.toString();
  if (message.includes('listening on port')) {
    serverStarted = true;
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Server is running. Do you want to open drive now? (y/n): ', (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        const baseHtml = 'drive.html';
        const commands = {
          darwin: `open "${baseHtml}"`,
          win32: `start "" "${baseHtml}"`,
          linux: `xdg-open "${baseHtml}"`
        };
        const platform = process.platform;
        if (commands[platform]) {
          exec(commands[platform], (error, stdout, stderr) => {
            if (error) {
              console.error(`Error opening drive: ${error}`);
            }
          });
        } else {
          console.error(`Platform '${platform}' is not supported.`);
        }
      } else {
        console.log('Drive not opened. You can access it later through /beansuite/drive.html.');
      }
    });
  }
});

serverProc.stderr.on('data', (data) => {
  console.error(`[Server]: ${data}`);
});

serverProc.on('close', (code) => {
  console.log(`server process exited with code ${code}`);
});
