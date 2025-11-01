#!/usr/bin/env node

/**
 * Script de diagnostic pour les URLs vidéo
 * Usage: node scripts/diagnose-video-url.js <video-url>
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

async function diagnoseVideoUrl(videoUrl) {
  console.log('🔍 Diagnostic de l\'URL vidéo');
  console.log('=' .repeat(50));
  console.log('URL:', videoUrl);
  console.log('');

  try {
    const url = new URL(videoUrl);
    
    console.log('📋 Analyse de l\'URL:');
    console.log('  - Protocol:', url.protocol);
    console.log('  - Host:', url.hostname);
    console.log('  - Path:', url.pathname);
    console.log('  - Query:', url.search);
    console.log('');

    // Test de connectivité
    console.log('🧪 Test de connectivité...');
    
    const client = url.protocol === 'https:' ? https : http;
    
    return new Promise((resolve, reject) => {
      const req = client.request(videoUrl, { method: 'HEAD' }, (res) => {
        console.log('📊 Réponse du serveur:');
        console.log('  - Status:', res.statusCode, res.statusMessage);
        console.log('  - Headers:');
        
        Object.entries(res.headers).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
        
        console.log('');
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ URL accessible');
          resolve(true);
        } else {
          console.log('❌ URL non accessible');
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.log('❌ Erreur de connexion:', error.message);
        console.log('');
        
        // Suggestions basées sur l'erreur
        if (error.code === 'ENOTFOUND') {
          console.log('💡 Suggestions:');
          console.log('  - Vérifiez votre connexion internet');
          console.log('  - Vérifiez que le domaine existe');
        } else if (error.code === 'ECONNREFUSED') {
          console.log('💡 Suggestions:');
          console.log('  - Le serveur refuse la connexion');
          console.log('  - Vérifiez que le service est en ligne');
        } else if (error.code === 'CERT_HAS_EXPIRED') {
          console.log('💡 Suggestions:');
          console.log('  - Le certificat SSL a expiré');
          console.log('  - Contactez l\'administrateur du serveur');
        }
        
        resolve(false);
      });
      
      req.setTimeout(10000, () => {
        console.log('❌ Timeout - Le serveur ne répond pas');
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
    
  } catch (error) {
    console.log('❌ Erreur lors de l\'analyse:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  const videoUrl = process.argv[2];
  
  if (!videoUrl) {
    console.log('Usage: node scripts/diagnose-video-url.js <video-url>');
    console.log('');
    console.log('Exemple:');
    console.log('  node scripts/diagnose-video-url.js "https://example.com/video.mp4"');
    process.exit(1);
  }
  
  await diagnoseVideoUrl(videoUrl);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { diagnoseVideoUrl };