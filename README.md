#  ♡

## Estructura del proyecto

```
cari-list/
├── index.html       ← Estructura
├── styles.css       ← Estilos (paleta rosa, flores, animaciones)
├── app.js           ← Lógica (estado, búsquedas, modales)
├── vercel.json      ← Configuración de Vercel
├── .gitignore
└── README.md
```

Todos los datos se guardan en el `localStorage` del navegador de quien la usa (no hay backend, no hay base de datos en la nube).

## Categorías

- 🎬 **Películas** — búsqueda con TMDB
- 🎵 **Música** — búsqueda con iTunes Search (sin clave)
- 📖 **Libros** — búsqueda con Google Books (sin clave)
- 🎁 **Wishlist** — manual, con precio, enlace y foto (URL o subida)

## Deploy en Vercel

1. Sube esta carpeta a tu repo de GitHub (`Gonzsar/cari-lists`)
2. Entra a [vercel.com](https://vercel.com) → **Add New Project** → Importa el repo
3. Vercel detecta que es estático automáticamente → **Deploy**
4. Listo, tendrás una URL como `https://cari-lists.vercel.app`

### Comandos git desde esta carpeta

```bash
git init
git add .
git commit -m "Primer commit del rincón rosado"
git branch -M main
git remote add origin https://github.com/Gonzsar/cari-lists.git
git push -u origin main
```

## Configurar TMDB (para películas)

Solo se puede hacer **después** de tener tu dominio de Vercel (TMDB pide una URL al registrarte).

1. Crea cuenta en [themoviedb.org](https://www.themoviedb.org/signup)
2. Ve a *Settings → API → Request an API Key → Developer*
3. Como URL pon la de Vercel (`https://cari-lists.vercel.app`)
4. Copia tu **API Key (v3 auth)**
5. Abre tu web ya deployada → ⚙️ ajustes (arriba derecha) → pega la clave

La clave queda guardada en el navegador. Música y libros funcionan sin configurar nada.

## Personalizaciones rápidas

### Cambiar colores
Edita las variables al inicio de `styles.css`:
```css
--pink-400:#f291ad;   /* rosa principal */
--rose:#c84068;       /* rosa más oscuro para acentos */
--gold:#d9a86c;       /* dorado suave */
```

### Cambiar textos
- Saludos y frases: array `quotes` y función `setGreeting()` en `app.js`
- Etiquetas de cada categoría: objeto `CAT_CONFIG` en `app.js`
- Mensaje de bienvenida: en `index.html` busca `<div class="setup-card">`

### Agregar My Melody u otros personajes de Sanrio
1. Pon las imágenes PNG en una carpeta `img/` dentro del proyecto
2. En `index.html`, reemplaza algún `<svg class="corner-flower ...">` por:
   ```html
   <img class="corner-flower tl" src="img/mymelody.png" alt=""/>
   ```
3. O agrega decoraciones nuevas en `styles.css` con la clase `.sanrio-deco` (ya hay un placeholder comentado)

## Funciones útiles

- **Exportar datos**: Ajustes → Exportar → descarga un JSON con todo
- **Importar datos**: Ajustes → Importar → restaura desde un JSON
- **Subir foto en wishlist**: click en + → botón "📷 Subir foto" (se redimensiona automáticamente a max 800px para no llenar el storage)

## Notas técnicas

- Las búsquedas externas (iTunes, Google Books, TMDB) pueden fallar si abres el HTML directamente (`file://`) por CORS. Al deployar a Vercel funcionan perfecto.
- El localStorage del navegador tiene ~5–10MB. Si se llena por muchas fotos subidas, exporta y limpia.
- La web es totalmente offline-friendly excepto por las búsquedas online y las fuentes de Google.

---

Hecho con ♥
