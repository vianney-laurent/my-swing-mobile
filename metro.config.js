const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// CONFIGURATION ULTRA-RADICALE - BLOCAGE TOTAL DES MODULES PROBLÉMATIQUES
config.resolver.alias = {
  ...config.resolver.alias,
  
  // Polyfills essentiels
  crypto: 'react-native-quick-crypto',
  stream: 'readable-stream',
  buffer: '@craftzdog/react-native-buffer',
  
  // BLOQUER COMPLÈTEMENT tous les modules WebSocket et Node.js
  'ws': false,
  'websocket': false,
  '@supabase/realtime-js': false,
  
  // Modules Node.js - TOUS BLOQUÉS
  'http': false,
  'https': false,
  'net': false,
  'tls': false,
  'fs': false,
  'path': false,
  'os': false,
  'util': false,
  'events': false,
  'url': false,
  'querystring': false,
  'zlib': false,
  'child_process': false,
  'cluster': false,
  'dgram': false,
  'dns': false,
  'domain': false,
  'module': false,
  'perf_hooks': false,
  'punycode': false,
  'readline': false,
  'repl': false,
  'string_decoder': false,
  'timers': false,
  'tty': false,
  'v8': false,
  'vm': false,
  'worker_threads': false,
};

// Résolution stricte
config.resolver.platforms = ['native', 'ios', 'android'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = false;

// Transformer pour ignorer les imports problématiques
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;