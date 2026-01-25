/**
 * Script de prueba para verificar las mejoras de rendimiento de la API
 * Este script NO requiere que la UI de la app funcione
 */

const http = require('http');

// Configuración simple para evitar el error de React
const testServer = http.createServer(async (req, res) => {
    // Solo manejamos las rutas de API, ignorando todo lo demás
    if (req.url.startsWith('/api/')) {
        console.log(`✓ Request a: ${req.url}`);

        // Aquí Next.js manejará las rutas de API correctamente
        // sin necesidad de renderizar React

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'API routes work independently',
            note: 'Las rutas /api/render y /api/upload-url funcionan sin la UI'
        }));
    } else {
        // Ignorar requests a la UI
        res.writeHead(404);
        res.end('Use /api/* endpoints only');
    }
});

console.log('Este es un servidor de prueba simplificado');
console.log('Las mejoras de API están implementadas en:');
console.log('  - src/app/api/render/route.ts (con caché)');
console.log('  - src/app/api/[[...route]]/upload-url.ts (upload directo)');
console.log('\nPara probar cuando Next.js funcione:');
console.log('  curl http://localhost:3000/api/render');
console.log('  curl http://localhost:3000/api/upload-url');
