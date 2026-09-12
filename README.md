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
- 📺 **Series** — búsqueda con TMDB (usa la misma clave)
- 🎵 **Música** — búsqueda con iTunes Search (sin clave)
- 📖 **Libros** — búsqueda con Open Library (sin clave)
- 🎁 **Wishlist** — manual, con precio, enlace y foto (URL o subida)
- 🎤 **Letras** — buscador de letras sincronizadas (página aparte, `letras-buscador.html`)

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

## 👯‍♀️ Amigos (sistema en la nube)

Cada persona tiene un código tipo `cari#4821`. Se agregan como amigos y pueden
ver el perfil del otro **siempre actualizado**.

### Configurarlo (una sola vez)

1. Crear cuenta gratis en [supabase.com](https://supabase.com) → New project (sin tarjeta)
2. En el proyecto: **SQL Editor → New query** → pegar todo `supabase-setup.sql` → **Run**
3. En **Settings → API** copiar:
   - **Project URL**
   - **anon public** key
4. En la web: ⚙️ Ajustes → pegar ambas → Guardar
5. Perfil → **👯‍♀️ Amigos** → *Crear mi código*
6. Pasarle el código a la otra persona (y ella hace lo mismo)

### Qué se comparte

- ✅ Películas, series, música, libros, wishlist, outfits, lugares, date ideas
- ✅ Nombre, bio, foto y banner del perfil
- 🔒 **El diario NUNCA se comparte** — queda solo en su navegador

Los datos se suben solos unos segundos después de cada cambio.

## 🎃🎄 Contadores de Halloween y Navidad

Dos tarjetitas ambientadas (arriba a la derecha en pantallas anchas, o entre el
perfil y las categorías en pantallas más chicas) que cuentan los días, horas,
minutos y segundos que faltan.

- Se pasan solas al año siguiente cuando la fecha ya pasó
- El día de la festividad muestran **"¡Es hoy!"**
- Cada tarjeta tiene **3 ranuras redondas** para poner fotitos (Papá Noel,
  renos, lo que sea): click en la ranura → subir foto o pegar una URL
- Las fotos se guardan en los ajustes, así que también se sincronizan con
  la nube si tenés Supabase configurado

### Adornos con sonido

Los adornos de cada tarjeta se pueden tocar y suenan (además tiran unas
partículas). Todo está **sintetizado con Web Audio**: no hay ni un archivo
de audio en el repo.

| Halloween | | Navidad | |
|---|---|---|---|
| 🌕 Luna | aullido de lobo | 🎄 Arbolito | cascabeles de trineo |
| 🎃 Calabaza | risa de bruja | 🍬 Bastón | *Jingle Bells* en campanitas |
| 🐦‍⬛ Cuervo | graznidos | 🎁 Regalo | destello mágico |
| 🕷️ Araña | crujido y pasitos | ✨ Luces | tintineo suave |

El audio solo arranca cuando ella toca algo (nunca suena solo). Las funciones
están en `app.js`, bajo *"SONIDOS DE LAS FESTIVIDADES"*.

## 🎤 Buscador de letras

Página aparte (`letras-buscador.html`) al estilo Apple Music: buscás una canción
y la letra aparece **sincronizada, siguiendo la voz**.

- Se entra con el botón **♪ Letras** (abajo a la izquierda, con animación de cortina)
- Las letras vienen de [LRCLIB](https://lrclib.net) — gratis, sin clave
- El audio puede venir de YouTube, un archivo tuyo, o el "reloj"
  (le das play a la vez que en tu app de música)
- Las canciones se pueden guardar para tenerlas a mano
