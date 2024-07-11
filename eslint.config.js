import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import commentsPlugin from 'eslint-plugin-eslint-comments';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat();

export default [
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'eslint-comments': commentsPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      // Regole per gli spazi
      'no-trailing-spaces': 'error', // Nessuno spazio alla fine delle righe
      'indent': ['error', 2], // Indentazione di 2 spazi
      'space-before-function-paren': ['error', 'always'], // Spazio prima delle parentesi delle funzioni
      'keyword-spacing': ['error', { 'before': true, 'after': true }], // Spazi prima e dopo le parole chiave

      // Regole per i commenti
      'spaced-comment': ['error', 'always', { 'exceptions': ['-', '+'] }], // Commenti con uno spazio iniziale
      'no-inline-comments': 'error', // Nessun commento in linea
      'no-warning-comments': [
        'warn',
        { 'terms': ['todo', 'fixme'], 'location': 'start' },
      ], // Avvisi per i commenti TODO e FIXME

      // Regole per la formattazione
      'comma-dangle': ['error', 'always-multiline'], // Virgole finali sempre per le liste multilinea
      'semi': ['error', 'always'], // Punto e virgola obbligatorio
      'quotes': ['error', 'single'], // Uso di apici singoli per le stringhe
      'object-curly-spacing': ['error', 'always'], // Spazi dentro le parentesi graffe
      'array-bracket-spacing': ['error', 'never'], // Nessuno spazio dentro le parentesi quadre
      'block-spacing': ['error', 'always'], // Spazio all'interno dei blocchi
      'brace-style': ['error', '1tbs', { 'allowSingleLine': true }], // Stile delle parentesi

      // Altre regole specifiche
      'no-console': 'warn', // Avviso per l'uso di console.log
      'no-debugger': 'error', // Errore per l'uso di debugger
      'curly': 'error', // Uso obbligatorio delle parentesi per i blocchi
      'eqeqeq': ['error', 'always'], // Uso di === invece di ==
      'no-var': 'error', // Uso obbligatorio di let o const invece di var
      'prefer-const': 'error', // Preferire const se possibile

      // Regole di Prettier
      'prettier/prettier': 'error',
    },
  },
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:eslint-comments/recommended'),
  ...compat.extends('prettier'),
];
