import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'dist/generic-auth/fesm2022/generic-auth.mjs', // Główne wejście biblioteki
  output: {
    file: 'dist/my-library/bundle/generic-auth.min.js', // Jeden wynikowy plik
    format: 'iife', // Inne możliwe formaty: umd, cjs
    name: 'GenericAuth', // Nazwa globalnego obiektu w przeglądarce
    plugins: [terser()], // Minifikacja
  },
  plugins: [resolve(), commonjs(), typescript()],
};
