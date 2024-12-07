import {minify} from 'terser';
import fs from 'fs';

const genericAuthBundle = 'dist/generic-auth/fesm2022/generic-auth.mjs';

const dataToMinify = fs.readFileSync(genericAuthBundle, 'utf-8');
const minifiedData = await minify(dataToMinify);
fs.writeFileSync(genericAuthBundle, minifiedData.code, 'utf-8');
console.log(`File ${genericAuthBundle} has been minified`);
