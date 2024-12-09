import fs from 'fs';
import dotenv from 'dotenv';
import facebook from './src/app/_oauth-configs/facebook';
import google from './src/app/_oauth-configs/google';

dotenv.configDotenv({path: '.env'});

const oauthNameToConfigMap = new Map<string, any>([
  ['facebook', facebook],
  ['google', google],
]);

try {
  for (const [oauthKey, oauthValue] of oauthNameToConfigMap) {
    Object.keys(oauthValue).forEach((key) => {
      (oauthValue as any)[key] = process.env[`${oauthKey}`.toUpperCase() + '_' + key.toUpperCase()];
    });
    const stringifiedObject = Object.keys(oauthValue).map((key) => `\t${key}: ${oauthValue[key]},`);

    fs.writeFileSync(
      `./src/app/_oauth-configs/${oauthKey}.ts`,
      `export default {\n${stringifiedObject.join('\n')}\n};`
    );
  }
} catch (error) {
  console.error('Cannot fill oauth config');
}
