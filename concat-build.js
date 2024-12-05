import * as fs from 'fs';

const builtFiles = ['polyfills.js', 'main.js'];
const builtDirPath = 'dist/auth/browser';
const destinationFilePath = 'dist/auth/generic-auth.js';

const concatBuiltFiles = () => {
  try {
    fs.readdirSync(builtDirPath).forEach((file) => {
      const fileRelativePath = builtDirPath + '/' + file;

      if (fs.lstatSync(fileRelativePath).isFile() && builtFiles.includes(file)) {
        fs.appendFileSync(destinationFilePath, fs.readFileSync(fileRelativePath).toString());
      }
    });
  } catch (error) {
    console.error('Error occured:', error.message);
    return;
  }

  console.log('Success - concatenated file destination: ' + destinationFilePath);
};

concatBuiltFiles();
