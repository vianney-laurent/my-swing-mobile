// POLYFILLS ULTRA-MINIMAUX - SEULEMENT L'ESSENTIEL
import 'react-native-url-polyfill/auto';

// Buffer (essentiel pour Supabase) - use any to avoid TypeScript conflicts
import { Buffer } from '@craftzdog/react-native-buffer';
(global as any).Buffer = Buffer;

// Process (essentiel pour env vars)
if (typeof (global as any).process === 'undefined') {
  (global as any).process = require('process');
}

// TextEncoder/TextDecoder (essentiel pour l'encodage) - use any to avoid TypeScript conflicts
if (typeof (global as any).TextEncoder === 'undefined') {
  (global as any).TextEncoder = class {
    encode(input: string) {
      const bytes = [];
      for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        if (code < 0x80) {
          bytes.push(code);
        } else if (code < 0x800) {
          bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else {
          bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
      }
      return new Uint8Array(bytes);
    }
  };
  
  (global as any).TextDecoder = class {
    decode(input: Uint8Array) {
      let result = '';
      for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input[i]);
      }
      return result;
    }
  };
}

// Crypto minimal (pour Supabase auth) - use any to avoid TypeScript conflicts
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {
    getRandomValues: (array: any) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) as any; // Cast to any to avoid UUID type conflicts
    }
  };
}

console.log('✅ Polyfills minimaux chargés');