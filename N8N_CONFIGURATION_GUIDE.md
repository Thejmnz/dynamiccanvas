# 🔧 Configuración de n8n para DynamicCanvas API

## ⚠️ Problemas Comunes y Soluciones

### Error: "The service was not able to process your request - Internal server error"

Este error ocurre por **falta de autenticación**. Debes agregar el header de autorización.

---

## ✅ Configuración Correcta en n8n

### Paso 1: Generar tu API Key

1. Inicia sesión en DynamicCanvas: http://localhost:3000
2. Ve a **Settings** o **API Integration**
3. Crea una nueva API Key
4. Copia la key (ejemplo: `dcv_1234567890abcdef`)

### Paso 2: Configurar el Nodo HTTP Request en n8n

#### **Configuración Básica**

```
Method: POST
URL: http://localhost:3000/api/render
  (o tu URL de túnel: https://tu-dominio.zrok.io/api/render)
```

#### **⚡ Autenticación (CRÍTICO)**

```
Authentication: Generic Credential Type
Credential Type: Header Auth

Header Name: Authorization
Header Value: Bearer dcv_TU_API_KEY_AQUI
```

**IMPORTANTE**: Asegúrate de incluir la palabra "Bearer" seguida de un espacio antes de tu API key.

#### **Body (Send Body debe estar activado)**

```json
{
  "templateId": "tu-template-id-aqui",
  "layers": {
    "layer-nombre-1": {
      "text": "Nuevo texto"
    },
    "layer-imagen-1": {
      "image_url": "https://example.com/imagen.jpg"
    }
  }
}
```

---

## 🌐 Acceso desde n8n Externo (zrok, ngrok, etc.)

Si n8n está en otro servidor y necesitas exponer localhost:3000:

### Opción 1: zrok (Recomendado)

```bash
# Instalar zrok
# https://zrok.io/

# Compartir puerto 3000
zrok share public localhost:3000
```

Esto te dará una URL como: `https://abc123.share.zrok.io`

Úsala en n8n: `https://abc123.share.zrok.io/api/render`

### Opción 2: ngrok

```bash
# Instalar ngrok
# https://ngrok.com/

# Exponer puerto 3000
ngrok http 3000
```

Úsala en n8n: `https://xyz.ngrok.io/api/render`

---

## 📝 Ejemplo Completo de Configuración n8n

### Configuración del Nodo HTTP Request

**Headers (pestaña Headers)**
| Name | Value |
|------|-------|
| Authorization | Bearer dcv_tu_api_key_123456 |
| Content-Type | application/json |

**Body (pestaña Body Parameters)**
```json
{
  "templateId": "{{$json.templateId}}",
  "layers": {
    "titulo": {
      "text": "{{$json.titulo}}"
    },
    "descripcion": {
      "text": "{{$json.descripcion}}",
      "color": "#FF5733"
    },
    "imagen-principal": {
      "image_url": "{{$json.imagenUrl}}"
    }
  }
}
```

---

## 🧪 Prueba desde cURL

Antes de configurar n8n, prueba que funcione con cURL:

```bash
# Reemplaza YOUR_API_KEY con tu API key real
curl -X POST http://localhost:3000/api/render \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "tu-template-id",
    "layers": {
      "texto1": {
        "text": "Hola Mundo"
      }
    }
  }'
```

**Respuesta Esperada:**
```json
{
  "status": "success",
  "imageUrl": "https://...",
  "logs": [...],
  "data": {
    "templateId": "...",
    "elementsCount": 4
  },
  "cacheStats": {
    "entries": 1,
    "sizeBytes": 12345,
    "sizeMB": "0.01"
  }
}
```

---

## 🚨 Troubleshooting

### Error: 401 Unauthorized
❌ **Problema**: API Key incorrecta o falta header Authorization  
✅ **Solución**: Verifica que el header sea exactamente: `Authorization: Bearer TU_API_KEY`

### Error: 404 Not Found
❌ **Problema**: URL incorrecta  
✅ **Solución**: 
- Verifica que la URL sea `/api/render` (no `/render`)
- Asegúrate de que el servidor esté corriendo en el puerto correcto

### Error: 500 Internal Server Error
❌ **Problemas posibles**:
1. templateId no existe o no pertenece a tu usuario
2. Imagen URL inaccesible o muy grande
3. Error en el formato del JSON

✅ **Solución**: 
- Revisa los logs en la respuesta JSON (campo `logs`)
- Verifica que el templateId exista en tu cuenta
- Prueba con una imagen más pequeña (<2MB)

### Error: timeout / no responde
❌ **Problema**: Imagen muy grande o servidor lento  
✅ **Solución**: 
- Usa el endpoint `/api/upload-url` para imágenes >1MB
- Aumenta el timeout en n8n a 60 segundos
- Verifica que el servidor esté corriendo

---

## 📊 Monitoreo de Rendimiento

Cada respuesta incluye estadísticas:

```json
"cacheStats": {
  "entries": 5,      // Imágenes en caché
  "sizeBytes": 2048000,
  "sizeMB": "1.95"   // Memoria usada
}
```

**Logs útiles:**
- `✓ Cache HIT` = Imagen reutilizada (rápido)
- `⬇ Downloading image` = Descargando nueva imagen
- `✓ Downloaded XKB in Yms` = Descarga completada

---

## 🎯 Mejores Prácticas

1. **Reutiliza imágenes**: El caché las optimiza automáticamente
2. **Usa URLs estables**: Cambia la URL solo si la imagen cambia
3. **Comprime imágenes**: Usa JPG/WebP en lugar de PNG cuando sea posible
4. **Monitorea el caché**: Si `sizeMB` > 80, considera reiniciar el servidor

---

## 📞 Necesitas Ayuda?

Si ves este error específico en n8n:
- ❌ "The service was not able to process your request"
- ❌ "Internal server error"

**Checklist:**
- [ ] ¿Agregaste el header `Authorization: Bearer ...`?
- [ ] ¿La API key es válida?
- [ ] ¿El servidor está corriendo (`npm run dev`)?
- [ ] ¿La URL es accesible desde n8n?
- [ ] ¿El body JSON es válido?

**Revisa los logs del servidor** en la terminal donde ejecutaste `npm run dev` para ver el error exacto.

---

**Última actualización**: 2026-01-20  
**Versión API**: 2.0.0 (con caché optimizado)
