import fs from 'fs';
import dotenv from 'dotenv';
import facebookConfig from './src/app/_oauth-configs/facebook';
import googleConfig from './src/app/_oauth-configs/google';
import githubConfig from './src/app/_oauth-configs/github';
import jwtConfig from './src/app/_oauth-configs/jwt';

dotenv.configDotenv({path: '.env'});

const oauthNameToConfigMap = new Map<string, any>([
  ['facebook', facebookConfig],
  ['google', googleConfig],
  ['github', githubConfig],
]);

const authNameToConfigMap = new Map<string, any>([['jwt', jwtConfig]]);

const writeAuthFiles = (authNameToConfigMap: Map<string, any>): void => {
  for (const [oauthKey, oauthValue] of authNameToConfigMap) {
    Object.keys(oauthValue).forEach((key) => {
      (oauthValue as any)[key] = process.env[`${oauthKey}`.toUpperCase() + '_' + key.toUpperCase()];
    });
    const stringifiedObject = Object.keys(oauthValue).map(
      (key) => `\t${key}: '${oauthValue[key]}',`
    );

    fs.writeFileSync(
      `./src/app/_oauth-configs/${oauthKey}.ts`,
      `export default {\n${stringifiedObject.join('\n')}\n};`
    );
  }
};

try {
  writeAuthFiles(oauthNameToConfigMap);
  writeAuthFiles(authNameToConfigMap);
} catch (error) {
  console.error('Cannot fill oauth config');
}
