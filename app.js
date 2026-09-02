/* ==========================================================
   Mi Rincón Rosado · lógica de la app
   ========================================================== */

/* === Estado y persistencia === */
const STORAGE_KEY = 'cariList_v2';
const SETTINGS_KEY = 'cariList_settings_v2';

const defaultSettings = {
  name:'', tmdbKey:'', geminiKey:'', groqKey:'', openaiKey:'', aiProvider:'groq',
  avatar:'', banner:'', bio:'',
  theme:'melody',
  anniversaryDate:'2023-12-15',
  unlockedStickers:[],
  darkMode:false,
  musicVolume:0.4,
  musicPlaying:false,
  spotifyClientId:'',
  spotifyAccessToken:'',
  spotifyRefreshToken:'',
  spotifyTokenExpiry:0,
  spotifyPlaylistId:'liked',
  sbUrl:'', sbKey:'', myCode:'', ownerToken:'', lastSync:0
};
const emptyState = {
  movies:[], series:[], music:[], books:[], wishlist:[],
  outfits:[], places:[], dates:[], diary:[]
};

let settings = loadSettings();
let state = loadState();
let currentCat = 'movies';
let currentStatus = 'all';
let editingId = null;
let modalContext = { cat:'movies', cover:'', rating:0 };

function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Object.assign({}, emptyState, s || {});
  } catch(e){ return {...emptyState}; }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if(typeof cloudSyncSoon === 'function') cloudSyncSoon();
}
function loadSettings(){
  try{ return Object.assign({},defaultSettings,JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}); }
  catch(e){ return {...defaultSettings}; }
}
function saveSettings(){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if(typeof cloudSyncSoon === 'function') cloudSyncSoon();
}

/* === Labels por categoría === */
const CAT_CONFIG = {
  movies: {
    icon:'🎬',
    sectionTitle:'Tus Películas',
    sectionSubtitle:'Las que has visto, las que adoras, las que quieres descubrir',
    metaLabel:'Año / Director',
    statuses:['want','current','watched','loved'],
    statusLabels:{ want:'Quiero verla', current:'Viéndola ahora', watched:'Vista', loved:'Favorita' },
    pillLabels:{ want:'💭 Quiero verla', current:'🍿 Viéndola ahora', watched:'✨ Ya la vi', loved:'💖 Me encantó' }
  },
  series: {
    icon:'📺',
    sectionTitle:'Tus Series',
    sectionSubtitle:'Las que devoraste, adoras y tenés pendientes',
    metaLabel:'Año / Temporadas',
    statuses:['want','current','watched','loved'],
    statusLabels:{ want:'Quiero verla', current:'Viéndola ahora', watched:'Vista', loved:'Favorita' },
    pillLabels:{ want:'💭 Quiero verla', current:'📺 Viéndola ahora', watched:'✨ Ya la vi', loved:'💖 Me encantó' }
  },
  music: {
    icon:'🎵',
    sectionTitle:'Tu Música',
    sectionSubtitle:'Canciones y álbumes que tocan tu corazón',
    metaLabel:'Artista / Álbum',
    statuses:['want','watched','loved'],
    statusLabels:{ want:'Quiero escuchar', watched:'Escuchada', loved:'Favorita' },
    pillLabels:{ want:'💭 Quiero escuchar', watched:'✨ Ya la escuché', loved:'💖 Me encantó' }
  },
  books: {
    icon:'📖',
    sectionTitle:'Tus Libros',
    sectionSubtitle:'Páginas que te han marcado y aventuras por descubrir',
    metaLabel:'Autor / Año',
    statuses:['want','current','watched','loved'],
    statusLabels:{ want:'Quiero leer', current:'Leyéndolo ahora', watched:'Leído', loved:'Favorito' },
    pillLabels:{ want:'💭 Quiero leerlo', current:'📖 Leyéndolo ahora', watched:'✨ Ya lo leí', loved:'💖 Me encantó' }
  },
  wishlist: {
    icon:'🎁',
    sectionTitle:'Tu Wishlist',
    sectionSubtitle:'Todas las cositas lindas que sueñas con tener',
    metaLabel:'Categoría / Tienda',
    statuses:['want','watched','loved'],
    statusLabels:{ want:'Lo quiero', watched:'¡Lo tengo!', loved:'Top deseo' },
    pillLabels:{ want:'💭 Lo quiero', watched:'🎁 ¡Lo tengo!', loved:'💖 Top deseo' }
  },
  outfits: {
    icon:'👗',
    sectionTitle:'Tus Outfits',
    sectionSubtitle:'Looks que te enamoran · sube fotos o pega URLs de Pinterest',
    metaLabel:'Estilo / Ocasión',
    statuses:['want','watched','loved'],
    statusLabels:{ want:'Inspiración', watched:'Lo armé', loved:'Favorito' },
    pillLabels:{ want:'💭 Me inspira', watched:'👗 Lo armé', loved:'💖 Favorito' }
  },
  places: {
    icon:'🗺️',
    sectionTitle:'Tus Lugares',
    sectionSubtitle:'A dónde quieres ir, dónde fuiste, dónde sueñas',
    metaLabel:'Ciudad / País',
    statuses:['want','watched','loved'],
    statusLabels:{ want:'Quiero ir', watched:'Fui', loved:'Favorito' },
    pillLabels:{ want:'✈️ Quiero ir', watched:'🌍 Ya fui', loved:'💖 Favorito' }
  },
  dates: {
    icon:'💕',
    sectionTitle:'Date Ideas',
    sectionSubtitle:'Planes lindos para hacer en pareja',
    metaLabel:'Tipo / Lugar',
    statuses:['want','watched','loved'],
    statusLabels:{ want:'Idea', watched:'¡Hecho!', loved:'Favorito' },
    pillLabels:{ want:'💡 Idea', watched:'✓ ¡Hecho!', loved:'💖 Favorito' }
  }
};

/* === Petals === */
function spawnPetals(){
  const wrap = document.getElementById('petals');
  // Lee los colores del tema actual desde las variables CSS
  const css = getComputedStyle(document.documentElement);
  const colors = [
    css.getPropertyValue('--pink-300').trim() || '#f7b3c6',
    css.getPropertyValue('--pink-200').trim() || '#fbd0dd',
    css.getPropertyValue('--pink-400').trim() || '#f291ad',
    css.getPropertyValue('--gold-soft').trim() || '#fde4c9'
  ];
  for(let i=0;i<14;i++){
    const p = document.createElement('div');
    p.className='petal';
    p.style.left = Math.random()*100+'vw';
    const color = colors[Math.floor(Math.random()*colors.length)];
    const size = 14 + Math.random()*18;
    p.style.width = size+'px';
    p.style.height = size+'px';
    p.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C 16 6, 16 12, 12 16 C 8 12, 8 6, 12 2 Z" fill="${color}"/></svg>`;
    p.style.animationDuration = (10 + Math.random()*15)+'s';
    p.style.animationDelay = (Math.random()*15)+'s';
    wrap.appendChild(p);
  }
}

/* === Greetings === */
const quotes = [
  '"Hola de nuevo mi vida"',
  '"Como está yendo tu dia hoy moshito?"',
  '"Me dijiste ya algo bonito??"',
  '"Sigue poniendo cosas mi vida"',
  '"Donde está la bebe mas linda??"',
  '"Te amo mucho mi niña"'
];
function setGreeting(){
  const h = new Date().getHours();
  let g = 'Buenas noches';
  if(h<12) g='Buenos días';
  else if(h<19) g='Buenas tardes';
  document.getElementById('greetingTime').textContent = `${g}, hermosa`;
  document.getElementById('userName').textContent = settings.name ? `Rincón de ${settings.name}` : 'Mi Rincón Rosado';
  document.getElementById('randomQuote').textContent = quotes[Math.floor(Math.random()*quotes.length)];
}

/* === Perfil === */
function renderProfile(){
  const bannerEl = document.getElementById('profileBanner');
  const avatarEl = document.getElementById('profileAvatar');
  const bioEl = document.getElementById('profileBio');
  if(!bannerEl) return;

  if(settings.banner){
    bannerEl.style.backgroundImage = `url("${settings.banner.replace(/"/g,'\\"')}")`;
  } else {
    bannerEl.style.backgroundImage = '';
  }
  if(settings.avatar){
    avatarEl.style.backgroundImage = `url("${settings.avatar.replace(/"/g,'\\"')}")`;
    avatarEl.textContent = '';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarEl.textContent = '🌸';
  }
  bioEl.textContent = settings.bio || '';
  renderAnniversaryCard();
}

/* === Render principal === */
function render(){
  renderProfile();
  setGreeting();
  renderStats();
  updateStickersCount();
  document.body.dataset.cat = currentCat;
  Object.keys(CAT_CONFIG).forEach(renderCategory);
  if(currentCat === 'diary') renderDiary();
}

function renderStats(){
  const stats = document.getElementById('stats');
  const counts = {};
  Object.keys(CAT_CONFIG).forEach(cat => counts[cat] = (state[cat]||[]).length);
  counts.diary = (state.diary || []).length;
  const allItems = Object.keys(CAT_CONFIG).flatMap(cat => state[cat]||[]);
  const lovedAll = allItems.filter(i=>i.status==='loved').length;
  const year = new Date().getFullYear();
  const thisYear = allItems.filter(i=>{
    if(!i.dateAdded) return false;
    return new Date(i.dateAdded).getFullYear()===year;
  }).length;

  stats.innerHTML = `
    <div class="stat-card"><div class="stat-num">${counts.movies}</div><div class="stat-label">Películas</div></div>
    <div class="stat-card"><div class="stat-num">${counts.series}</div><div class="stat-label">Series</div></div>
    <div class="stat-card"><div class="stat-num">${counts.music}</div><div class="stat-label">Música</div></div>
    <div class="stat-card"><div class="stat-num">${counts.books}</div><div class="stat-label">Libros</div></div>
    <div class="stat-card"><div class="stat-num">${counts.wishlist}</div><div class="stat-label">Wishlist</div></div>
    <div class="stat-card"><div class="stat-num">${counts.outfits}</div><div class="stat-label">Outfits</div></div>
    <div class="stat-card"><div class="stat-num">${counts.places}</div><div class="stat-label">Lugares</div></div>
    <div class="stat-card"><div class="stat-num">${counts.dates}</div><div class="stat-label">Date Ideas</div></div>
    <div class="stat-card"><div class="stat-num">${counts.diary}</div><div class="stat-label">Páginas de Diario</div></div>
    <div class="stat-card"><div class="stat-num">${lovedAll}</div><div class="stat-label">💖 Adoradas</div></div>
    <div class="stat-card"><div class="stat-num">${thisYear}</div><div class="stat-label">En ${year}</div></div>
  `;
}

function renderCategory(cat){
  const list = state[cat];
  if(!list) return;

  document.getElementById(`${cat}-count-all`).textContent = list.length;
  ['want','current','watched','loved'].forEach(s=>{
    const el = document.getElementById(`${cat}-count-${s}`);
    if(el) el.textContent = list.filter(i=>i.status===s).length;
  });

  const grid = document.getElementById(`${cat}List`);
  if(currentCat!==cat){ return; }
  const filtered = filterByStatus(list, currentStatus);

  if(filtered.length===0){
    const emptyMsg = currentStatus==='all'
      ? `Aún no has añadido nada aquí. Empezá a coleccionar! 🌸`
      : `Nada en esta lista todavía... llenala de cosas bonitas!`;
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="empty-flower">🌷</div><h3>Tu colección está esperando</h3><p>${emptyMsg}</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => cardHTML(cat,item)).join('');
  grid.querySelectorAll('[data-action]').forEach(el=>{
    el.addEventListener('click',(e)=>{
      e.stopPropagation();
      const id = el.closest('.item-card').dataset.id;
      const act = el.dataset.action;
      if(act==='edit') openEdit(cat,id);
      else if(act==='fav') toggleFav(cat,id,e);
      else if(act==='status') cycleStatus(cat,id);
      else if(act==='complete') completeItem(cat,id,e);
    });
  });
  grid.querySelectorAll('.item-card').forEach(c=>{
    c.addEventListener('click',(e)=>{
      if(e.target.tagName==='A') return;
      openEdit(cat,c.dataset.id);
    });
  });
}

function filterByStatus(list,status){
  if(status==='all') return list.slice().sort(byNewest);
  return list.filter(i=>i.status===status).sort(byNewest);
}
function byNewest(a,b){
  // Si los dos tienen eventDate, ordenar por eventDate desc
  if(a.eventDate && b.eventDate) return b.eventDate.localeCompare(a.eventDate);
  if(a.eventDate && !b.eventDate) return -1;
  if(!a.eventDate && b.eventDate) return 1;
  return (b.dateAdded||0) - (a.dateAdded||0);
}

function cardHTML(cat,item){
  const heartsRow = item.rating ? '♥'.repeat(item.rating)+'<span style="color:var(--pink-200)">'+'♥'.repeat(5-item.rating)+'</span>' : '';
  const cover = item.cover
    ? `<img src="${escAttr(item.cover)}" class="item-cover" loading="lazy" onerror="this.style.display='none'"/>`
    : `<div class="item-cover" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:var(--pink-300);">${CAT_CONFIG[cat].icon}</div>`;
  const fav = item.status==='loved';

  const wishlistExtras = cat==='wishlist' ? `
    ${item.price?`<div class="item-price">${esc(item.price)}</div>`:''}
    ${item.link?`<a class="item-link" href="${escAttr(item.link)}" target="_blank" rel="noopener">🔗 Ver tienda</a>`:''}
  ` : '';

  // Fecha + comentarios para "Date ideas"
  const eventExtras = (cat==='dates') ? `
    ${item.eventDate?`<div class="item-meta">📅 ${formatPrettyDate(item.eventDate)}</div>`:''}
    ${item.comments?`<div class="item-note">💬 "${esc(item.comments)}"</div>`:''}
  ` : '';

  return `
    <div class="item-card" data-id="${item.id}">
      <div class="item-badge">${esc(CAT_CONFIG[cat].statusLabels[item.status]||item.status)}</div>
      ${fav?'<div class="item-badge fav-badge">💖</div>':''}
      ${cover}
      <div class="item-info">
        <div class="item-title">${esc(item.title)}</div>
        ${item.meta?`<div class="item-meta">${esc(item.meta)}</div>`:''}
        ${wishlistExtras}
        ${eventExtras}
        <div class="item-rating">${heartsRow}</div>
        ${item.note?`<div class="item-note">"${esc(item.note)}"</div>`:''}
        ${item.status === 'current' ? `
        <button class="btn small btn-complete" data-action="complete">✓ Lo terminé</button>
        ` : ''}
        <div class="item-actions">
          <button class="icon-btn ${fav?'fav active':''}" data-action="fav" title="Marcar favorita">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="icon-btn" data-action="status" title="Cambiar estado">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <button class="icon-btn" data-action="edit" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function esc(s){return (s+'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escAttr(s){return esc(s);}

function formatPrettyDate(isoStr){
  if(!isoStr) return '';
  const d = new Date(isoStr + 'T00:00:00');
  if(isNaN(d.getTime())) return isoStr;
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* === Acciones === */
function toggleFav(cat,id,evt){
  const item = state[cat].find(i=>i.id===id);
  if(!item) return;
  const becomingFav = item.status !== 'loved';
  item.status = becomingFav ? 'loved' : 'watched';
  saveState();
  render();
  if(becomingFav){
    // Confetti desde la posición del click si existe, sino centro
    const x = evt?.clientX ?? window.innerWidth/2;
    const y = evt?.clientY ?? window.innerHeight/2;
    confetti({ x, y, count: 60, duration: 1800 });
    toast('¡Marcado como favorito! 💖');
    checkAchievements();
  } else {
    toast('Movido a vistos ✨');
  }
}
function cycleStatus(cat,id){
  const item = state[cat].find(i=>i.id===id);
  if(!item) return;
  const order = CAT_CONFIG[cat].statuses;
  const idx = order.indexOf(item.status);
  item.status = order[(idx<0?0:(idx+1)) % order.length];
  saveState();
  render();
  checkAchievements();
}

function completeItem(cat,id,evt){
  const item = state[cat].find(i=>i.id===id);
  if(!item) return;
  item.status = 'watched';
  item.completedAt = Date.now();
  saveState();
  render();
  const x = evt?.clientX ?? window.innerWidth/2;
  const y = evt?.clientY ?? window.innerHeight/2;
  confetti({ x, y, count: 50, duration: 1600, colors:['#e96a91','#f291ad','#fde4c9','#d9a86c','#ffffff'] });
  const verb = (cat==='books') ? 'lo leíste' : 'lo viste';
  toast(`¡Genial, ${verb}! ✨`);
  // Chequear logros con un mini delay para que se vea el confetti primero
  setTimeout(()=>checkAchievements(), 800);
}

/* === Modal item === */
const itemModal = document.getElementById('itemModal');
const fTitle = document.getElementById('fTitle');
const fMeta = document.getElementById('fMeta');
const fNote = document.getElementById('fNote');
const fPrice = document.getElementById('fPrice');
const fLink = document.getElementById('fLink');
const statusPills = document.getElementById('statusPills');
const ratingInput = document.getElementById('ratingInput');
const deleteBtn = document.getElementById('deleteBtn');
const imgPreview = document.getElementById('imgPreview');
const imgPlaceholder = document.getElementById('imgPlaceholder');
const imgUrlInput = document.getElementById('imgUrlInput');
const uploadImgInput = document.getElementById('uploadImgInput');
const uploadImgBtn = document.getElementById('uploadImgBtn');
const clearImgBtn = document.getElementById('clearImgBtn');

try {
  document.getElementById('itemModalClose').onclick = closeModal;
  document.getElementById('cancelBtn').onclick = closeModal;
} catch(e) { console.warn('[itemModal handlers]', e); }
itemModal.addEventListener('click',e=>{if(e.target===itemModal) closeModal();});

// Delegación: maneja clicks en pills generadas dinámicamente
statusPills.addEventListener('click', (e)=>{
  const pill = e.target.closest('.pill');
  if(!pill || !statusPills.contains(pill)) return;
  statusPills.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
  pill.classList.add('active');
});

ratingInput.querySelectorAll('.heart').forEach(h=>{
  h.addEventListener('click',()=>{
    const r = +h.dataset.r;
    modalContext.rating = (modalContext.rating===r)?0:r;
    paintRating(modalContext.rating);
  });
});
function paintRating(r){
  ratingInput.querySelectorAll('.heart').forEach(h=>{
    h.classList.toggle('active', +h.dataset.r<=r);
  });
}

/* Image picker */
uploadImgBtn.addEventListener('click',()=>uploadImgInput.click());
uploadImgInput.addEventListener('change',async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){ toast('Eso no parece una imagen'); return; }
  try {
    const dataUrl = await readImageFile(file, 800);
    setModalCover(dataUrl);
    imgUrlInput.value = '';
  } catch(err){ toast('No pude leer la imagen'); }
  e.target.value = '';
});
imgUrlInput.addEventListener('input',()=>{
  const v = imgUrlInput.value.trim();
  if(v) setModalCover(v);
});
clearImgBtn.addEventListener('click',()=>{
  setModalCover('');
  imgUrlInput.value='';
});

function setModalCover(src){
  modalContext.cover = src;
  if(src){
    imgPreview.src = src;
    imgPreview.style.display = 'block';
    imgPlaceholder.style.display = 'none';
  } else {
    imgPreview.style.display = 'none';
    imgPlaceholder.style.display = 'block';
  }
}

function resizeImage(file, maxDim=800){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev)=>{
      const img = new Image();
      img.onerror = reject;
      img.onload = ()=>{
        let w = img.width, h = img.height;
        if(w>h && w>maxDim){ h = Math.round(h*(maxDim/w)); w = maxDim; }
        else if(h>maxDim){ w = Math.round(w*(maxDim/h)); h = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Detecta formatos animados (GIF, WebP animado, APNG) por mime type o extensión.
// Algunos navegadores no setean bien file.type, por eso chequeamos también el nombre.
function isAnimatedFormat(file){
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return type === 'image/gif' ||
         type === 'image/webp' ||
         type === 'image/apng' ||
         name.endsWith('.gif') ||
         name.endsWith('.webp') ||
         name.endsWith('.apng');
}

// Lee la imagen preservando animación si es GIF/WebP/APNG (no los pasa por canvas).
// Para JPG/PNG normales, redimensiona con resizeImage para no llenar el storage.
function readImageFile(file, maxDim=800){
  return new Promise((resolve, reject)=>{
    if(isAnimatedFormat(file)){
      console.log('[readImageFile] formato animado detectado:', file.type, file.name, `${(file.size/1024).toFixed(0)}KB`);
      if(file.size > 3 * 1024 * 1024){
        toast('Archivo grande, puede no caber en el storage 🌸');
      }
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
      return;
    }
    resizeImage(file, maxDim).then(resolve).catch(reject);
  });
}

function applyModalLabels(cat, activeStatus='want'){
  const conf = CAT_CONFIG[cat];
  document.getElementById('fMetaLabel').textContent = conf.metaLabel;
  statusPills.innerHTML = conf.statuses.map(s =>
    `<div class="pill${s===activeStatus?' active':''}" data-status="${s}">${conf.pillLabels[s]}</div>`
  ).join('');

  const dateLabelEl = document.getElementById('fDateLabel');
  const commentsLabelEl = document.getElementById('fCommentsLabel');
  if(dateLabelEl) dateLabelEl.textContent = (cat==='dates') ? 'Fecha en que lo hicieron' : 'Fecha';
  if(commentsLabelEl) commentsLabelEl.textContent = (cat==='dates') ? 'Cómo estuvo' : 'Comentarios';
}

function openAdd(cat, preset={}){
  editingId = null;
  modalContext = { cat, cover:preset.cover||'', rating:preset.rating||0 };
  document.body.dataset.modalCat = cat;
  document.getElementById('modalTitle').textContent = 'Añadir a tu colección';
  deleteBtn.style.display='none';
  fTitle.value = preset.title || '';
  fMeta.value = preset.meta || '';
  fNote.value = '';
  fPrice.value = '';
  fLink.value = '';
  const fDateEl = document.getElementById('fDate');
  const fCommentsEl = document.getElementById('fComments');
  if(fDateEl) fDateEl.value = '';
  if(fCommentsEl) fCommentsEl.value = '';
  applyModalLabels(cat, preset.status||'want');
  setModalCover(preset.cover||'');
  imgUrlInput.value = (preset.cover && preset.cover.startsWith('http'))?preset.cover:'';
  paintRating(modalContext.rating);
  itemModal.classList.add('show');
  setTimeout(()=>fTitle.focus(),100);
}

function openEdit(cat,id){
  const item = state[cat].find(i=>i.id===id);
  if(!item) return;
  editingId = id;
  modalContext = { cat, cover:item.cover||'', rating:item.rating||0 };
  document.body.dataset.modalCat = cat;
  document.getElementById('modalTitle').textContent = 'Editar';
  deleteBtn.style.display='inline-flex';
  fTitle.value = item.title||'';
  fMeta.value = item.meta||'';
  fNote.value = item.note||'';
  fPrice.value = item.price||'';
  fLink.value = item.link||'';
  const fDateEl2 = document.getElementById('fDate');
  const fCommentsEl2 = document.getElementById('fComments');
  if(fDateEl2) fDateEl2.value = item.eventDate || '';
  if(fCommentsEl2) fCommentsEl2.value = item.comments || '';
  applyModalLabels(cat, item.status||'want');
  setModalCover(item.cover||'');
  imgUrlInput.value = (item.cover && item.cover.startsWith('http'))?item.cover:'';
  paintRating(modalContext.rating);
  itemModal.classList.add('show');
}

function closeModal(){
  itemModal.classList.remove('show');
  editingId = null;
}

document.getElementById('saveBtn')?.addEventListener('click',()=>{
  const title = fTitle.value.trim();
  if(!title){ toast('Necesitas un título 🌸'); return; }
  const meta = fMeta.value.trim();
  const note = fNote.value.trim();
  const status = statusPills.querySelector('.pill.active')?.dataset.status || 'want';
  const rating = modalContext.rating;
  const price = fPrice.value.trim();
  const link = fLink.value.trim();

  const dateField = document.getElementById('fDate')?.value || '';
  const comments = document.getElementById('fComments')?.value.trim() || '';

  try {
    if(editingId){
      const item = state[modalContext.cat].find(i=>i.id===editingId);
      if(item){
        item.title = title; item.meta=meta; item.note=note;
        item.status=status; item.rating=rating;
        item.cover = modalContext.cover || '';
        if(modalContext.cat==='wishlist'){ item.price = price; item.link = link; }
        if(modalContext.cat==='dates'){
          item.eventDate = dateField;
          item.comments = comments;
        }
      }
    } else {
      const newItem = {
        id: 'i'+Date.now()+Math.floor(Math.random()*1000),
        title, meta, note, status, rating,
        cover: modalContext.cover || '',
        dateAdded: Date.now()
      };
      if(modalContext.cat==='wishlist'){ newItem.price = price; newItem.link = link; }
      if(modalContext.cat==='dates'){
        newItem.eventDate = dateField;
        newItem.comments = comments;
      }
      state[modalContext.cat].push(newItem);
    }
    saveState();
  } catch(err){
    if(err.name==='QuotaExceededError'){
      toast('No hay espacio. Prueba con una imagen más pequeña 🌸');
    } else {
      toast('Hubo un problema al guardar');
    }
    return;
  }
  render();
  closeModal();
  toast('¡Guardado! ♡');
  checkAchievements();
});

/* === Popup de confirmación bonito === */
function customConfirm(message, options={}){
  return new Promise(resolve=>{
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = options.title || '¿Estás segura?';
    document.getElementById('confirmMessage').textContent = message;
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    okBtn.textContent = options.okText || 'Sí, eliminar';
    cancelBtn.textContent = options.cancelText || 'No, mantener';
    modal.classList.add('show');

    const cleanup = (result)=>{
      modal.classList.remove('show');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBg);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onOk = ()=>cleanup(true);
    const onCancel = ()=>cleanup(false);
    const onBg = (e)=>{ if(e.target===modal) cleanup(false); };
    const onKey = (e)=>{
      if(e.key==='Escape') cleanup(false);
      else if(e.key==='Enter') cleanup(true);
    };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onBg);
    document.addEventListener('keydown', onKey);
  });
}

deleteBtn.addEventListener('click', async ()=>{
  if(!editingId) return;
  const ok = await customConfirm('Esta acción no se puede deshacer.', {
    title: '¿Eliminar este recuerdo?',
    okText: 'Sí, eliminar 🥀',
    cancelText: 'No, mantener'
  });
  if(!ok) return;
  state[modalContext.cat] = state[modalContext.cat].filter(i=>i.id!==editingId);
  saveState();
  render();
  closeModal();
  toast('Eliminado');
});

/* === Settings === */
const settingsModal = document.getElementById('settingsModal');
function updateProviderFields(){
  const selEl = document.getElementById('setAiProvider');
  if(!selEl) return;
  const sel = selEl.value;
  document.querySelectorAll('.provider-field').forEach(el=>{
    el.classList.toggle('show', el.dataset.provider === sel);
  });
}
document.addEventListener('change', (e)=>{
  if(e.target && e.target.id === 'setAiProvider') updateProviderFields();
});

try {
  document.getElementById('settingsBtn').onclick = ()=>{
    document.getElementById('setName').value = settings.name || '';
    document.getElementById('setTmdb').value = settings.tmdbKey || '';
    document.getElementById('setGemini').value = settings.geminiKey || '';
    document.getElementById('setGroq').value = settings.groqKey || '';
    document.getElementById('setOpenai').value = settings.openaiKey || '';
    document.getElementById('setAiProvider').value = settings.aiProvider || 'groq';
    const spotIdEl = document.getElementById('setSpotifyId');
    if(spotIdEl) spotIdEl.value = settings.spotifyClientId || '';
    const uriDisplay = document.getElementById('redirectUriDisplay');
    if(uriDisplay) uriDisplay.textContent = getSpotifyRedirectUri();
    const sbU = document.getElementById('setSbUrl');
    const sbK = document.getElementById('setSbKey');
    if(sbU) sbU.value = settings.sbUrl || '';
    if(sbK) sbK.value = settings.sbKey || '';
    // Cargar playlists si estamos conectados a Spotify
    populatePlaylistSelector();
    updateProviderFields();
    settingsModal.classList.add('show');
  };

  async function populatePlaylistSelector(){
    const select = document.getElementById('setSpotifyPlaylist');
    if(!select) return;
    // Limpiar (mantener "liked" como primera opción)
    select.innerHTML = '<option value="liked">❤️ Mis canciones que me gustan</option>';
    if(!settings.spotifyAccessToken) return;
    const playlists = await fetchUserPlaylists();
    for(const p of playlists){
      if(!p?.id) continue;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `🎵 ${p.name}`;
      select.appendChild(opt);
    }
    select.value = settings.spotifyPlaylistId || 'liked';
  }

  const refreshBtn = document.getElementById('refreshPlaylistsBtn');
  if(refreshBtn){
    refreshBtn.addEventListener('click', async (e)=>{
      e.preventDefault();
      refreshBtn.textContent = '↻';
      refreshBtn.disabled = true;
      await populatePlaylistSelector();
      refreshBtn.disabled = false;
      toast('Listas actualizadas 🎵');
    });
  }
  document.getElementById('settingsClose').onclick = ()=>settingsModal.classList.remove('show');
  settingsModal.addEventListener('click',e=>{if(e.target===settingsModal) settingsModal.classList.remove('show');});
  document.getElementById('saveSettings').onclick = ()=>{
    settings.name = document.getElementById('setName').value.trim();
    settings.tmdbKey = document.getElementById('setTmdb').value.trim();
    settings.geminiKey = document.getElementById('setGemini').value.trim();
    settings.groqKey = document.getElementById('setGroq').value.trim();
    settings.openaiKey = document.getElementById('setOpenai').value.trim();
    settings.aiProvider = document.getElementById('setAiProvider').value;
    const spotIdEl = document.getElementById('setSpotifyId');
    const oldSpotId = settings.spotifyClientId;
    if(spotIdEl) settings.spotifyClientId = spotIdEl.value.trim();
    // Si cambió el client ID, limpiar tokens viejos
    if(oldSpotId && settings.spotifyClientId && oldSpotId !== settings.spotifyClientId){
      settings.spotifyAccessToken = '';
      settings.spotifyRefreshToken = '';
      settings.spotifyTokenExpiry = 0;
    }
    // Playlist seleccionada
    const sbUEl = document.getElementById('setSbUrl');
    const sbKEl = document.getElementById('setSbKey');
    if(sbUEl) settings.sbUrl = sbUEl.value.trim().replace(/\/+$/,'');
    if(sbKEl) settings.sbKey = sbKEl.value.trim();
    const playlistSel = document.getElementById('setSpotifyPlaylist');
    const oldPlaylist = settings.spotifyPlaylistId;
    if(playlistSel) settings.spotifyPlaylistId = playlistSel.value || 'liked';
    saveSettings();
    // Si cambió de playlist y hay conexión, refrescar el conteo / próxima random
    if(oldPlaylist !== settings.spotifyPlaylistId && spotifyDeviceId){
      onSpotifyReady();
    }
    setGreeting();
    settingsModal.classList.remove('show');
    toast('Ajustes guardados ✨');
    // Actualizar el modo del reproductor
    try {
      const widget = document.getElementById('musicWidget');
      if(widget){
        if(settings.spotifyClientId && settings.spotifyAccessToken){
          setMusicWidgetMode(spotifyDeviceId ? 'spotify' : 'connecting');
        } else if(settings.spotifyClientId){
          setMusicWidgetMode('needs-auth');
        } else {
          setMusicWidgetMode('mp3');
        }
      }
    } catch(e){}
  };
  document.getElementById('exportBtn').onclick = ()=>{
    const data = JSON.stringify({state,settings,exportedAt:new Date().toISOString()},null,2);
    const blob = new Blob([data],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-rincon-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  document.getElementById('importBtn').onclick = ()=> document.getElementById('importFile').click();
} catch(e) { console.warn('[settings handlers]', e); }
document.getElementById('importFile')?.addEventListener('change',(e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const data = JSON.parse(ev.target.result);
      if(data.state) state = Object.assign({},emptyState,data.state);
      if(data.settings) settings = Object.assign({},defaultSettings,data.settings);
      saveState();saveSettings();render();
      toast('¡Importado! 🌸');
    } catch(err){ toast('Archivo no válido'); }
  };
  reader.readAsText(file);
});

/* === Modal de perfil === */
const profileModal = document.getElementById('profileModal');
const profBannerPreview = document.getElementById('profBannerPreview');
const profAvatarPreview = document.getElementById('profAvatarPreview');
const bannerUrlInput = document.getElementById('bannerUrlInput');
const avatarUrlInput = document.getElementById('avatarUrlInput');
let profileContext = { avatar:'', banner:'' };

function setProfilePreview(which, src){
  const el = which === 'avatar' ? profAvatarPreview : profBannerPreview;
  if(src){
    el.style.backgroundImage = `url("${src.replace(/"/g,'\\"')}")`;
    el.textContent = '';
  } else {
    el.style.backgroundImage = '';
    el.textContent = which === 'avatar' ? '🌸' : 'sin banner';
  }
  if(which === 'avatar') profileContext.avatar = src;
  else profileContext.banner = src;
}

document.getElementById('profileEditBtn')?.addEventListener('click', ()=>{
  profileContext = {
    avatar: settings.avatar || '',
    banner: settings.banner || ''
  };
  document.getElementById('profName').value = settings.name || '';
  document.getElementById('profBio').value = settings.bio || '';
  document.getElementById('profAnniv').value = settings.anniversaryDate || '';
  setProfilePreview('avatar', profileContext.avatar);
  setProfilePreview('banner', profileContext.banner);
  avatarUrlInput.value = (profileContext.avatar && profileContext.avatar.startsWith('http')) ? profileContext.avatar : '';
  bannerUrlInput.value = (profileContext.banner && profileContext.banner.startsWith('http')) ? profileContext.banner : '';
  profileModal.classList.add('show');
});

try {
  document.getElementById('profileClose').onclick = ()=>profileModal.classList.remove('show');
  document.getElementById('profCancel').onclick = ()=>profileModal.classList.remove('show');
  profileModal.addEventListener('click', e=>{ if(e.target===profileModal) profileModal.classList.remove('show'); });
} catch(e) { console.warn('[profile close handlers]', e); }

// Avatar
try { document.getElementById('uploadAvatarBtn').onclick = ()=>document.getElementById('uploadAvatarInput').click(); } catch(e){}
document.getElementById('uploadAvatarInput')?.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){ toast('Eso no es una imagen'); return; }
  try{
    const dataUrl = await readImageFile(file, 400);
    setProfilePreview('avatar', dataUrl);
    avatarUrlInput.value = '';
  } catch{ toast('No pude leer la imagen'); }
  e.target.value = '';
});
try {
  avatarUrlInput.addEventListener('input', ()=>{
    const v = avatarUrlInput.value.trim();
    if(v) setProfilePreview('avatar', v);
  });
  document.getElementById('clearAvatarBtn').onclick = ()=>{
    setProfilePreview('avatar', '');
    avatarUrlInput.value = '';
  };
} catch(e){}

// Banner
try { document.getElementById('uploadBannerBtn').onclick = ()=>document.getElementById('uploadBannerInput').click(); } catch(e){}
document.getElementById('uploadBannerInput')?.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){ toast('Eso no es una imagen'); return; }
  try{
    const dataUrl = await readImageFile(file, 1200);
    setProfilePreview('banner', dataUrl);
    bannerUrlInput.value = '';
  } catch{ toast('No pude leer la imagen'); }
  e.target.value = '';
});
try {
  bannerUrlInput.addEventListener('input', ()=>{
    const v = bannerUrlInput.value.trim();
    if(v) setProfilePreview('banner', v);
  });
  document.getElementById('clearBannerBtn').onclick = ()=>{
    setProfilePreview('banner', '');
    bannerUrlInput.value = '';
  };
} catch(e){}

try { document.getElementById('profSave').onclick = ()=>{
  const newName = document.getElementById('profName').value.trim();
  const newBio = document.getElementById('profBio').value.trim();
  const oldAvatar = settings.avatar;
  const oldBanner = settings.banner;
  settings.name = newName || settings.name || 'amiga';
  settings.bio = newBio;
  settings.anniversaryDate = document.getElementById('profAnniv').value || '';
  settings.avatar = profileContext.avatar;
  settings.banner = profileContext.banner;
  try{
    saveSettings();
  } catch(err){
    settings.avatar = oldAvatar;
    settings.banner = oldBanner;
    if(err.name === 'QuotaExceededError'){
      toast('No hay espacio. Probá con una imagen más chica 🌸');
    } else {
      toast('Hubo un problema al guardar');
    }
    return;
  }
  renderProfile();
  setGreeting();
  profileModal.classList.remove('show');
  toast('¡Perfil actualizado! ✨');
}; } catch(e) { console.warn('[profSave]', e); }

/* === Tabs === */
document.querySelectorAll('.cat-tab').forEach(t=>{
  t.addEventListener('click',()=>{
    // Si estábamos en diario, guardar antes de cambiar
    if(currentCat === 'diary' && typeof flushDiarySave === 'function') flushDiarySave();
    document.querySelectorAll('.cat-tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    currentCat = t.dataset.cat;
    document.querySelectorAll('.cat-content').forEach(c=>c.classList.remove('active'));
    document.getElementById('cat-'+currentCat).classList.add('active');
    currentStatus='all';
    document.querySelectorAll('.status-tabs').forEach(g=>{
      g.querySelectorAll('.status-tab').forEach((x,i)=>x.classList.toggle('active',i===0));
    });
    render();
  });
});
document.querySelectorAll('.status-tabs').forEach(group=>{
  group.querySelectorAll('.status-tab').forEach(t=>{
    t.addEventListener('click',()=>{
      group.querySelectorAll('.status-tab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      currentStatus = t.dataset.status;
      renderCategory(group.dataset.cat);
    });
  });
});

/* === FAB === */
const fabAddEl = document.getElementById('fabAdd');
if(fabAddEl){
  fabAddEl.addEventListener('click',()=>{
    if(currentCat === 'diary'){
      document.getElementById('diaryNewPage')?.click();
      return;
    }
    openAdd(currentCat);
  });
}

/* === APIs de búsqueda === */
async function searchMovies(q){
  if(!q) return [];
  if(!settings.tmdbKey){
    toast('Configura tu clave de TMDB en ajustes ⚙️');
    return [];
  }
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(settings.tmdbKey)}&query=${encodeURIComponent(q)}&language=es-ES`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('TMDB error');
    const d = await r.json();
    return (d.results||[]).slice(0,20).map(m=>({
      title:m.title,
      meta:[m.release_date?m.release_date.slice(0,4):'',m.original_title&&m.original_title!==m.title?`(${m.original_title})`:''].filter(Boolean).join(' '),
      cover: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : ''
    }));
  } catch(e){
    toast('No pude buscar películas. ¿Clave correcta?');
    return [];
  }
}

async function searchMusic(q){
  if(!q) return [];
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=20`;
  try{
    const r = await fetch(url);
    const d = await r.json();
    return (d.results||[]).map(t=>({
      title:t.trackName,
      meta:`${t.artistName}${t.collectionName?' • '+t.collectionName:''}`,
      cover: (t.artworkUrl100||'').replace('100x100','300x300')
    }));
  } catch(e){ toast('No pude buscar música'); return []; }
}

async function searchSeries(q){
  if(!q) return [];
  if(!settings.tmdbKey){
    toast('Configura tu clave de TMDB en ajustes ⚙️');
    return [];
  }
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${encodeURIComponent(settings.tmdbKey)}&query=${encodeURIComponent(q)}&language=es-ES`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('TMDB error');
    const d = await r.json();
    return (d.results||[]).slice(0,20).map(s=>({
      title: s.name,
      meta: [s.first_air_date?s.first_air_date.slice(0,4):'', s.original_name&&s.original_name!==s.name?`(${s.original_name})`:''].filter(Boolean).join(' '),
      cover: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : ''
    }));
  } catch(e){
    toast('No pude buscar series. ¿Clave correcta?');
    return [];
  }
}

async function searchBooks(q){
  if(!q) return [];
  // Open Library API: sin clave, abierta, más confiable
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('OpenLibrary error');
    const d = await r.json();
    return (d.docs||[]).map(b=>{
      let cover = '';
      if(b.cover_i){
        cover = `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`;
      } else if(b.isbn && b.isbn[0]){
        cover = `https://covers.openlibrary.org/b/isbn/${b.isbn[0]}-M.jpg`;
      }
      return {
        title: b.title || 'Sin título',
        meta: [(b.author_name||[]).slice(0,2).join(', '), b.first_publish_year || ''].filter(Boolean).join(' • '),
        cover
      };
    }).filter(x => x.title);
  } catch(e){ toast('No pude buscar libros'); return []; }
}

function renderSearchResults(containerId, results){
  const c = document.getElementById(containerId);
  if(results.length===0){
    c.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="empty-flower">🌸</div><h3>Nada por aquí</h3><p>Prueba con otra búsqueda</p></div>`;
    return;
  }
  c.innerHTML = results.map((r,i)=>`
    <div class="result-card" data-idx="${i}">
      ${r.cover?`<img src="${escAttr(r.cover)}" class="result-cover" loading="lazy" onerror="this.style.display='none'"/>`:`<div class="result-cover" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem;color:var(--pink-300);">🌷</div>`}
      <div class="result-info">
        <div class="result-title">${esc(r.title)}</div>
        ${r.meta?`<div class="result-meta">${esc(r.meta)}</div>`:''}
      </div>
    </div>
  `).join('');
  c.querySelectorAll('.result-card').forEach(card=>{
    card.addEventListener('click',()=>{
      const r = results[+card.dataset.idx];
      openAdd(currentCat, r);
    });
  });
}

function setupSearch(cat,inputId,btnId,resultsId,fn){
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const res = document.getElementById(resultsId);
  async function run(){
    const q = inp.value.trim();
    if(!q){ res.innerHTML=''; return; }
    res.innerHTML = `<div class="loading-text" style="grid-column:1/-1;"><div class="loader"></div> Buscando...</div>`;
    const results = await fn(q);
    renderSearchResults(resultsId, results);
  }
  btn.addEventListener('click',run);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
}

setupSearch('movies','searchMovies','searchMoviesBtn','searchMoviesResults',searchMovies);
setupSearch('series','searchSeries','searchSeriesBtn','searchSeriesResults',searchSeries);
setupSearch('music','searchMusic','searchMusicBtn','searchMusicResults',searchMusic);
setupSearch('books','searchBooks','searchBooksBtn','searchBooksResults',searchBooks);

/* === Toast === */
let toastTimer;
function toast(msg){
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'),2500);
}

/* === Setup screen === */
const setupScreen = document.getElementById('setupScreen');
const setupBtn = document.getElementById('setupBtn');
const setupName = document.getElementById('setupName');
function maybeShowSetup(){
  if(!settings.name){
    setupScreen.classList.add('show');
    setTimeout(()=>setupName.focus(),200);
  }
}
setupBtn.addEventListener('click',()=>{
  const n = setupName.value.trim();
  if(!n){ setupName.focus(); return; }
  settings.name = n;
  saveSettings();
  setupScreen.classList.remove('show');
  setGreeting();
  toast(`¡Bienvenida, ${n}! 🌸`);
});
setupName.addEventListener('keydown',e=>{if(e.key==='Enter') setupBtn.click();});

/* ==========================================================
   Sticker Book · logros con My Melody
   ========================================================== */
function stickerSVG(hoodColor, innerEar, emoji){
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="${hoodColor}" stroke="white" stroke-width="3"/>
    <ellipse cx="30" cy="20" rx="8" ry="18" fill="${hoodColor}"/>
    <ellipse cx="70" cy="20" rx="8" ry="18" fill="${hoodColor}"/>
    <ellipse cx="30" cy="22" rx="3.5" ry="13" fill="${innerEar}"/>
    <ellipse cx="70" cy="22" rx="3.5" ry="13" fill="${innerEar}"/>
    <ellipse cx="50" cy="55" rx="23" ry="20" fill="white"/>
    <ellipse cx="41" cy="52" rx="2.5" ry="3.5" fill="#3a2530"/>
    <ellipse cx="59" cy="52" rx="2.5" ry="3.5" fill="#3a2530"/>
    <circle cx="41.5" cy="51" r="0.8" fill="white"/>
    <circle cx="59.5" cy="51" r="0.8" fill="white"/>
    <circle cx="34" cy="58" r="3.2" fill="#f291ad" opacity="0.55"/>
    <circle cx="66" cy="58" r="3.2" fill="#f291ad" opacity="0.55"/>
    <path d="M46 60 Q50 63.5 54 60" stroke="#c84068" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="41" rx="14" ry="3" fill="white" opacity="0.4"/>
    <circle cx="78" cy="28" r="14" fill="white" opacity="0.95" stroke="${hoodColor}" stroke-width="1.5"/>
    <text x="78" y="35" font-size="18" text-anchor="middle">${emoji}</text>
  </svg>`;
}

const ACHIEVEMENTS = [
  { id:'first_movie', name:'Primer paso 🎬', desc:'Agregaste tu primera película',
    check: s => (s.movies||[]).length >= 1,
    sticker: () => stickerSVG('#f7b3c6','#ffd5e0','🎬') },
  { id:'cinefile_10', name:'Cinéfila ⭐', desc:'Viste 10 películas',
    check: s => (s.movies||[]).filter(m=>m.status==='watched'||m.status==='loved').length >= 10,
    sticker: () => stickerSVG('#f5c769','#ffe9b3','⭐') },
  { id:'movie_queen', name:'Reina del cine 👑', desc:'Viste 25 películas',
    check: s => (s.movies||[]).filter(m=>m.status==='watched'||m.status==='loved').length >= 25,
    sticker: () => stickerSVG('#e96a91','#ffc0d3','👑') },
  { id:'first_series', name:'Una más 📺', desc:'Agregaste tu primera serie',
    check: s => (s.series||[]).length >= 1,
    sticker: () => stickerSVG('#b89af6','#dfd0fb','📺') },
  { id:'marathon_queen', name:'Maratoneadora 🏃‍♀️', desc:'Viste 10 series',
    check: s => (s.series||[]).filter(m=>m.status==='watched'||m.status==='loved').length >= 10,
    sticker: () => stickerSVG('#f5a058','#fdd3b1','🏃‍♀️') },
  { id:'reader', name:'Lectora 📖', desc:'Leíste 5 libros',
    check: s => (s.books||[]).filter(m=>m.status==='watched'||m.status==='loved').length >= 5,
    sticker: () => stickerSVG('#f5b5a0','#fcdacc','📖') },
  { id:'bookworm', name:'Devoradora de libros 📚', desc:'Leíste 15 libros',
    check: s => (s.books||[]).filter(m=>m.status==='watched'||m.status==='loved').length >= 15,
    sticker: () => stickerSVG('#c8956a','#e6c9a8','📚') },
  { id:'melomane', name:'Melómana 🎶', desc:'Agregaste 20 canciones',
    check: s => (s.music||[]).length >= 20,
    sticker: () => stickerSVG('#8cc8f1','#c4e2f8','🎶') },
  { id:'traveler', name:'Viajera ✈️', desc:'Anotaste 5 lugares',
    check: s => (s.places||[]).length >= 5,
    sticker: () => stickerSVG('#90c8e3','#bbdcec','✈️') },
  { id:'fashionista', name:'Fashionista 👗', desc:'Guardaste 10 outfits',
    check: s => (s.outfits||[]).length >= 10,
    sticker: () => stickerSVG('#d4a4d9','#ecc8ef','👗') },
  { id:'top_picks', name:'Top picks 💖', desc:'Marcaste 20 favoritos',
    check: s => Object.values(s).filter(Array.isArray).flat().filter(i=>i?.status==='loved').length >= 20,
    sticker: () => stickerSVG('#e15a73','#ffb8c5','💖') },
  { id:'diary_writer', name:'Diarista 📔', desc:'Escribiste 7 páginas de diario',
    check: s => (s.diary||[]).filter(p=>(p.content||'').trim().length > 30).length >= 7,
    sticker: () => stickerSVG('#e8d9b3','#f5ebd0','📔') },
  { id:'collector', name:'Coleccionista 🎀', desc:'Tenés 50 cositas en total',
    check: s => Object.values(s).filter(Array.isArray).flat().filter(x=>x?.id).length >= 50,
    sticker: () => stickerSVG('#d9a86c','#ecd1a5','🎀') },
  { id:'dreamer', name:'Soñadora 🌙', desc:'Tu wishlist tiene 10 deseos',
    check: s => (s.wishlist||[]).length >= 10,
    sticker: () => stickerSVG('#a47ec3','#cbb1de','🌙') },
  { id:'romantic', name:'Romántica 💕', desc:'Anotaste 10 date ideas',
    check: s => (s.dates||[]).length >= 10,
    sticker: () => stickerSVG('#f291ad','#ffd0dd','💕') }
];

function checkAchievements(silent = false){
  if(!settings.unlockedStickers) settings.unlockedStickers = [];
  const newlyUnlocked = [];
  for(const ach of ACHIEVEMENTS){
    if(settings.unlockedStickers.includes(ach.id)) continue;
    try {
      if(ach.check(state)){
        settings.unlockedStickers.push(ach.id);
        newlyUnlocked.push(ach);
      }
    } catch(e){}
  }
  if(newlyUnlocked.length > 0){
    saveSettings();
    if(!silent) showStickerUnlocks(newlyUnlocked);
    updateStickersCount();
  }
  return newlyUnlocked;
}

function showStickerUnlocks(achievements){
  // Toast + confetti por cada uno (con un delay)
  achievements.forEach((ach, i)=>{
    setTimeout(()=>{
      confetti({ count: 80, duration: 2500, colors:['#e96a91','#f291ad','#fde4c9','#d9a86c','#ffffff','#fbd0dd'] });
      showStickerPopup(ach);
    }, i * 1800);
  });
}

function showStickerPopup(ach){
  const popup = document.createElement('div');
  popup.className = 'sticker-unlock-popup';
  popup.innerHTML = `
    <div class="sticker-unlock-card">
      <div class="sticker-unlock-label">¡Nuevo sticker desbloqueado!</div>
      <div class="sticker-unlock-svg">${ach.sticker()}</div>
      <div class="sticker-unlock-name">${esc(ach.name)}</div>
      <div class="sticker-unlock-desc">${esc(ach.desc)}</div>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(()=>popup.classList.add('show'), 30);
  setTimeout(()=>{
    popup.classList.remove('show');
    setTimeout(()=>popup.remove(), 400);
  }, 3200);
}

function openStickerBook(){
  const modal = document.getElementById('stickersModal');
  const grid = document.getElementById('stickersGrid');
  const progress = document.getElementById('stickersProgress');
  const unlocked = settings.unlockedStickers || [];

  progress.textContent = `${unlocked.length} de ${ACHIEVEMENTS.length} stickers conseguidos`;
  grid.innerHTML = ACHIEVEMENTS.map(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    return `
      <div class="sticker-card ${isUnlocked?'unlocked':'locked'}" title="${esc(ach.desc)}">
        <div class="sticker-svg">${isUnlocked ? ach.sticker() : ach.sticker()}</div>
        <div class="sticker-name">${isUnlocked ? esc(ach.name) : '???'}</div>
        <div class="sticker-desc">${isUnlocked ? esc(ach.desc) : 'Bloqueado'}</div>
      </div>
    `;
  }).join('');
  modal.classList.add('show');
}

/* ==========================================================
   Ruleta de indecisión
   ========================================================== */
let rouletteCtx = { cat:'movies', status:'want' };
let rouletteSpinning = false;

function openRoulette(){
  const modal = document.getElementById('rouletteModal');
  // Resetear UI
  document.getElementById('rouletteResult').textContent = '';
  document.getElementById('rouletteResult').className = 'roulette-result';
  drawRouletteWheel(0);
  modal.classList.add('show');
}

function getRouletteItems(){
  const cat = rouletteCtx.cat;
  const status = rouletteCtx.status;
  let list = (state[cat] || []).filter(i => i?.title);
  if(status !== 'all') list = list.filter(i => i.status === status);
  return list.slice(0, 20); // máximo 20 para que se vea bien
}

function drawRouletteWheel(rotation, highlightIdx = -1){
  const canvas = document.getElementById('rouletteCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 340;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size/2, cy = size/2, r = size/2 - 16;
  const items = getRouletteItems();

  ctx.clearRect(0, 0, size, size);

  if(items.length === 0){
    ctx.fillStyle = '#fce4eb';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#8a6878';
    ctx.font = 'italic 16px Cormorant Garamond, serif';
    ctx.textAlign = 'center';
    ctx.fillText('No hay cositas aquí', cx, cy);
    return;
  }

  const sliceAngle = (Math.PI*2) / items.length;
  const palette = ['#fbd0dd','#f7b3c6','#fde4c9','#f0d4a8','#fce4eb','#f5c8da'];

  for(let i = 0; i < items.length; i++){
    const start = rotation + i * sliceAngle;
    const end = start + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = (i === highlightIdx) ? '#e96a91' : palette[i % palette.length];
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // texto
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + sliceAngle/2);
    ctx.textAlign = 'right';
    ctx.fillStyle = (i === highlightIdx) ? 'white' : '#5a3a48';
    ctx.font = 'bold 11px Quicksand, sans-serif';
    const txt = items[i].title.length > 16 ? items[i].title.slice(0,15) + '…' : items[i].title;
    ctx.fillText(txt, r - 12, 4);
    ctx.restore();
  }

  // Círculo central
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI*2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#e96a91';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#e96a91';
  ctx.font = 'bold 22px Quicksand, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('♡', cx, cy + 7);
}

function spinRoulette(){
  if(rouletteSpinning) return;
  const items = getRouletteItems();
  if(items.length === 0){
    toast('No hay cositas para girar 🌸');
    return;
  }
  rouletteSpinning = true;
  document.getElementById('rouletteResult').textContent = '';
  document.getElementById('rouletteResult').className = 'roulette-result';

  const sliceAngle = (Math.PI*2) / items.length;
  const winnerIdx = Math.floor(Math.random() * items.length);
  // Queremos que el punto del puntero (arriba = -PI/2) caiga en el centro del slice winner
  const targetSliceCenter = winnerIdx * sliceAngle + sliceAngle/2;
  // rotation final = -PI/2 - targetSliceCenter, más vueltas completas
  const fullSpins = 6;
  const finalRotation = -Math.PI/2 - targetSliceCenter + fullSpins * Math.PI * 2;

  const duration = 4500;
  const start = performance.now();

  function frame(t){
    const elapsed = t - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 4); // ease out cuartic
    const rotation = finalRotation * eased;
    drawRouletteWheel(rotation);

    if(progress < 1){
      requestAnimationFrame(frame);
    } else {
      rouletteSpinning = false;
      drawRouletteWheel(finalRotation, winnerIdx);
      const winner = items[winnerIdx];
      const resultEl = document.getElementById('rouletteResult');
      resultEl.innerHTML = `<div class="roulette-pick">🎯 ${esc(winner.title)}</div>${winner.meta?`<div class="roulette-pick-meta">${esc(winner.meta)}</div>`:''}`;
      resultEl.classList.add('show');
      confetti({ count: 70, duration: 2200 });
    }
  }
  requestAnimationFrame(frame);
}

/* ==========================================================
   Spotify Web Playback SDK + OAuth (PKCE)
   ========================================================== */
const SPOTIFY_SCOPES = 'user-library-read streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state';
function getSpotifyRedirectUri(){
  // Normalizado: sin /index.html, sin trailing slash (excepto si solo es "/")
  let path = window.location.pathname || '/';
  if(path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
  if(path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  if(path === '/' || path === '') return window.location.origin;
  return window.location.origin + path;
}

/* --- PKCE helpers --- */
function spotifyRandomString(length){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let out = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for(let i=0;i<length;i++) out += chars[array[i] % chars.length];
  return out;
}
async function spotifySha256(text){
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return new Uint8Array(hash);
}
function spotifyBase64UrlEncode(bytes){
  let s = '';
  for(const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

/* --- OAuth flow --- */
async function startSpotifyAuth(){
  if(!settings.spotifyClientId){
    toast('Falta el Client ID de Spotify en ajustes ⚙️');
    return;
  }
  const verifier = spotifyRandomString(64);
  const challenge = spotifyBase64UrlEncode(await spotifySha256(verifier));
  sessionStorage.setItem('spotify_verifier', verifier);

  const redirectUri = getSpotifyRedirectUri();
  console.log('[Spotify] Redirect URI que enviamos:', redirectUri);
  console.log('[Spotify] ESTA URL exacta tiene que estar registrada en el dashboard de Spotify');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: settings.spotifyClientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString();
}

async function handleSpotifyCallback(){
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if(error){
    console.warn('Spotify auth error:', error);
    window.history.replaceState({}, '', getSpotifyRedirectUri());
    return false;
  }
  if(!code) return false;
  const verifier = sessionStorage.getItem('spotify_verifier');
  if(!verifier || !settings.spotifyClientId) return false;

  const params = new URLSearchParams({
    client_id: settings.spotifyClientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getSpotifyRedirectUri(),
    code_verifier: verifier
  });
  try{
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: params.toString()
    });
    const data = await r.json();
    if(data.access_token){
      settings.spotifyAccessToken = data.access_token;
      settings.spotifyRefreshToken = data.refresh_token || '';
      settings.spotifyTokenExpiry = Date.now() + (data.expires_in * 1000);
      saveSettings();
      sessionStorage.removeItem('spotify_verifier');
      // Limpiar el ?code= de la URL
      window.history.replaceState({}, '', getSpotifyRedirectUri());
      return true;
    } else {
      console.warn('Spotify token exchange failed:', data);
    }
  } catch(e){
    console.error('Spotify token exchange error:', e);
  }
  return false;
}

async function refreshSpotifyToken(){
  if(!settings.spotifyRefreshToken || !settings.spotifyClientId) return false;
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: settings.spotifyRefreshToken,
    client_id: settings.spotifyClientId
  });
  try{
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: params.toString()
    });
    const data = await r.json();
    if(data.access_token){
      settings.spotifyAccessToken = data.access_token;
      settings.spotifyTokenExpiry = Date.now() + (data.expires_in * 1000);
      if(data.refresh_token) settings.spotifyRefreshToken = data.refresh_token;
      saveSettings();
      return true;
    }
  } catch(e){
    console.error('Spotify refresh error:', e);
  }
  return false;
}

async function ensureSpotifyToken(){
  if(!settings.spotifyAccessToken) return null;
  if(Date.now() >= (settings.spotifyTokenExpiry || 0) - 60000){
    const ok = await refreshSpotifyToken();
    if(!ok){
      settings.spotifyAccessToken = '';
      saveSettings();
      return null;
    }
  }
  return settings.spotifyAccessToken;
}

function spotifyDisconnect(){
  settings.spotifyAccessToken = '';
  settings.spotifyRefreshToken = '';
  settings.spotifyTokenExpiry = 0;
  saveSettings();
  if(spotifyPlayer){
    try { spotifyPlayer.disconnect(); } catch(e){}
  }
  spotifyPlayer = null;
  spotifyDeviceId = null;
  setMusicWidgetMode('needs-auth');
}

/* --- Web Playback SDK --- */
let spotifyPlayer = null;
let spotifyDeviceId = null;
let spotifyTotalLiked = 0;
let spotifyCurrentTrackId = null;
let spotifyLastPosition = 0;
let spotifyWasPlaying = false;

// El SDK llama a esto cuando carga. Si no tenemos auth, no hace nada.
window.onSpotifyWebPlaybackSDKReady = () => {
  if(settings.spotifyAccessToken && settings.spotifyClientId){
    initSpotifyPlayer();
  }
};

async function initSpotifyPlayer(){
  if(typeof Spotify === 'undefined'){
    console.warn('Spotify SDK aún no cargó');
    return;
  }
  const token = await ensureSpotifyToken();
  if(!token) return;

  spotifyPlayer = new Spotify.Player({
    name: 'Mi Rinconcito ♡',
    getOAuthToken: cb => ensureSpotifyToken().then(t => t && cb(t)),
    volume: typeof settings.musicVolume === 'number' ? settings.musicVolume : 0.4
  });

  spotifyPlayer.addListener('ready', ({device_id}) => {
    spotifyDeviceId = device_id;
    console.log('[Spotify] listo, device:', device_id);
    onSpotifyReady();
  });
  spotifyPlayer.addListener('not_ready', ({device_id}) => {
    console.log('[Spotify] no listo:', device_id);
  });
  spotifyPlayer.addListener('player_state_changed', (state) => {
    if(!state) return;
    handleSpotifyStateChange(state);
  });
  spotifyPlayer.addListener('initialization_error', ({message}) => {
    console.error('[Spotify] init error:', message);
    toast('Error iniciando Spotify 🌸');
  });
  spotifyPlayer.addListener('authentication_error', ({message}) => {
    console.error('[Spotify] auth error:', message);
    toast('Spotify necesita reconectarse');
    spotifyDisconnect();
  });
  spotifyPlayer.addListener('account_error', ({message}) => {
    console.error('[Spotify] account error:', message);
    toast('Necesitás Spotify Premium para reproducir 🎀');
  });

  spotifyPlayer.connect().then(success => {
    if(success){
      console.log('[Spotify] conectado');
      setMusicWidgetMode('spotify');
    } else {
      console.warn('[Spotify] no se pudo conectar');
    }
  });
}

async function onSpotifyReady(){
  const token = await ensureSpotifyToken();
  if(!token) return;
  try{
    const r = await fetch('https://api.spotify.com/v1/me/tracks?limit=1', {
      headers: {'Authorization': 'Bearer ' + token}
    });
    const data = await r.json();
    spotifyTotalLiked = data.total || 0;
    console.log('[Spotify] canciones en "me gusta":', spotifyTotalLiked);
  } catch(e){
    console.error('[Spotify] error fetching liked:', e);
  }
}

async function pickRandomLikedTrack(){
  const token = await ensureSpotifyToken();
  if(!token || spotifyTotalLiked === 0) return null;
  const offset = Math.floor(Math.random() * spotifyTotalLiked);
  try{
    const r = await fetch(`https://api.spotify.com/v1/me/tracks?limit=1&offset=${offset}`, {
      headers: {'Authorization': 'Bearer ' + token}
    });
    const data = await r.json();
    return data.items?.[0]?.track || null;
  } catch(e){
    console.error('[Spotify] error pick random:', e);
    return null;
  }
}

async function pickRandomPlaylistTrack(playlistId){
  const token = await ensureSpotifyToken();
  if(!token) return null;
  try{
    // Obtener el total
    const head = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=1&fields=total`,
      { headers: {'Authorization': 'Bearer ' + token} }
    );
    const headData = await head.json();
    const total = headData.total || 0;
    if(total === 0) return null;
    const offset = Math.floor(Math.random() * total);
    const r = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=1&offset=${offset}`,
      { headers: {'Authorization': 'Bearer ' + token} }
    );
    const data = await r.json();
    return data.items?.[0]?.track || null;
  } catch(e){
    console.error('[Spotify] error pick playlist random:', e);
    return null;
  }
}

async function pickRandomTrack(){
  const pl = settings.spotifyPlaylistId || 'liked';
  if(pl && pl !== 'liked') return pickRandomPlaylistTrack(pl);
  return pickRandomLikedTrack();
}

async function fetchUserPlaylists(){
  const token = await ensureSpotifyToken();
  if(!token) return [];
  const all = [];
  let url = 'https://api.spotify.com/v1/me/playlists?limit=50';
  try{
    while(url && all.length < 300){
      const r = await fetch(url, { headers: {'Authorization': 'Bearer ' + token} });
      const data = await r.json();
      if(data.items) all.push(...data.items);
      url = data.next;
    }
  } catch(e){ console.error('[Spotify] fetch playlists:', e); }
  return all;
}

async function checkTrackIsLiked(trackId){
  if(!trackId) return false;
  const token = await ensureSpotifyToken();
  if(!token) return false;
  try{
    const r = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
      headers: {'Authorization': 'Bearer ' + token}
    });
    const data = await r.json();
    return Array.isArray(data) && data[0] === true;
  } catch(e){ return false; }
}

async function toggleTrackLike(trackId, currentlyLiked){
  if(!trackId) return null;
  const token = await ensureSpotifyToken();
  if(!token) return null;
  try{
    const r = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
      method: currentlyLiked ? 'DELETE' : 'PUT',
      headers: {'Authorization': 'Bearer ' + token}
    });
    if(r.ok || r.status === 200 || r.status === 204){
      // Refrescar total si cambió la lista "liked"
      if(settings.spotifyPlaylistId === 'liked' || !settings.spotifyPlaylistId){
        onSpotifyReady();
      }
      return !currentlyLiked;
    }
  } catch(e){ console.error('[Spotify] toggle like:', e); }
  return null;
}

async function playRandomSpotifyTrack(){
  if(!spotifyDeviceId){
    toast('Spotify aún no está listo 🎀');
    return;
  }
  const track = await pickRandomTrack();
  if(!track){
    toast('No pude obtener una canción de tu lista 🌸');
    return;
  }
  const token = await ensureSpotifyToken();
  try{
    const r = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
      method:'PUT',
      headers:{'Authorization': 'Bearer ' + token, 'Content-Type':'application/json'},
      body: JSON.stringify({ uris: [track.uri] })
    });
    if(!r.ok && r.status !== 204){
      const err = await r.json().catch(()=>({}));
      console.warn('[Spotify] play error:', err);
      if(r.status === 403) toast('Spotify Premium requerido 🎀');
    }
  } catch(e){
    console.error('[Spotify] play track error:', e);
  }
}

/* Variables para tracking del progreso entre state-changes */
let spotifyLastStateTime = 0;
let spotifyLastDuration = 0;
let spotifyProgressInterval = null;

function startProgressInterval(){
  if(spotifyProgressInterval) return;
  spotifyProgressInterval = setInterval(()=>{
    if(!spotifyWasPlaying || !spotifyLastDuration) return;
    const elapsed = Date.now() - spotifyLastStateTime;
    const pos = spotifyLastPosition + elapsed;
    const pct = Math.min(100, (pos / spotifyLastDuration) * 100);
    const fill = document.getElementById('musicProgressFill');
    if(fill) fill.style.width = pct + '%';
  }, 500);
}

function updateCoverAndPopup(track){
  // Cover en widget
  const cover = document.getElementById('musicCover');
  const coverImg = document.getElementById('musicCoverImg');
  if(cover && coverImg){
    const imgUrl = track.album?.images?.[0]?.url || '';
    if(imgUrl){
      coverImg.src = imgUrl;
      cover.classList.add('has-image');
    } else {
      cover.classList.remove('has-image');
    }
  }
  // Popup
  showNowPlayingPopup(track);
}

async function updateLikeButton(trackId){
  const likeBtn = document.getElementById('musicLike');
  if(!likeBtn) return;
  const isLiked = await checkTrackIsLiked(trackId);
  likeBtn.classList.toggle('liked', isLiked);
}

function handleSpotifyStateChange(state){
  const track = state.track_window?.current_track;
  if(!track) return;
  const newId = track.id;
  const isPlaying = !state.paused;

  // Update play/pause UI
  const widget = document.getElementById('musicWidget');
  if(widget) widget.classList.toggle('playing', isPlaying);

  // Si cambió la canción: cover, popup
  if(newId && newId !== spotifyCurrentTrackId){
    spotifyCurrentTrackId = newId;
    updateCoverAndPopup(track);
  }

  // Tracking del progreso para interpolar entre eventos
  spotifyLastDuration = state.duration || 0;
  spotifyLastPosition = state.position || 0;
  spotifyLastStateTime = Date.now();
  startProgressInterval();
  // Actualización inmediata del progreso
  const fill = document.getElementById('musicProgressFill');
  if(fill && spotifyLastDuration){
    fill.style.width = ((spotifyLastPosition / spotifyLastDuration) * 100) + '%';
  }

  // Detectar fin de canción: estaba sonando, ahora pausada en posición 0
  if(spotifyWasPlaying && state.paused && state.position === 0 && state.track_window.previous_tracks?.length > 0){
    setTimeout(()=>playRandomSpotifyTrack(), 400);
  }
  spotifyWasPlaying = isPlaying;
}

function showNowPlayingPopup(track){
  const popup = document.getElementById('nowPlaying');
  const cover = document.getElementById('nowPlayingCover');
  const title = document.getElementById('nowPlayingTitle');
  const artist = document.getElementById('nowPlayingArtist');
  if(!popup) return;
  const artistNames = (track.artists || []).map(a => a.name).join(', ');
  const coverUrl = track.album?.images?.[0]?.url || '';
  if(cover) cover.src = coverUrl;
  if(title) title.textContent = track.name || '';
  if(artist) artist.textContent = artistNames;
  // Link a Spotify
  const spotifyUrl = track.external_urls?.spotify || (track.uri ? `https://open.spotify.com/track/${track.id}` : '#');
  if(popup.tagName === 'A') popup.href = spotifyUrl;
  popup.classList.add('show');
  clearTimeout(popup._hideTimer);
  popup._hideTimer = setTimeout(()=>popup.classList.remove('show'), 5500);
}

function setMusicWidgetMode(mode){
  const widget = document.getElementById('musicWidget');
  if(!widget) return;
  widget.classList.remove('spotify-mode','spotify-needs-auth','mp3-mode','spotify-connecting');
  if(mode === 'spotify') widget.classList.add('spotify-mode');
  else if(mode === 'needs-auth') widget.classList.add('spotify-needs-auth');
  else if(mode === 'mp3') widget.classList.add('mp3-mode');
  else if(mode === 'connecting') widget.classList.add('spotify-connecting','spotify-needs-auth');
}

/* ==========================================================
   Reproductor de música de fondo
   ========================================================== */
function initMusicPlayer(){
  const audio = document.getElementById('bgMusic');
  const widget = document.getElementById('musicWidget');
  const toggle = document.getElementById('musicToggle');
  const skip = document.getElementById('musicSkip');
  const volume = document.getElementById('musicVolume');
  const connectBtn = document.getElementById('spotifyConnectBtn');
  if(!audio || !toggle || !widget || !volume){
    console.warn('[initMusicPlayer] faltan elementos del reproductor');
    return;
  }

  // Volumen inicial
  const initialVol = typeof settings.musicVolume === 'number' ? settings.musicVolume : 0.4;
  audio.volume = initialVol;
  volume.value = Math.round(initialVol * 100);

  // Determinar modo del reproductor
  function determineMode(){
    if(settings.spotifyClientId && settings.spotifyAccessToken){
      // Conectado a Spotify (o conectando)
      setMusicWidgetMode(spotifyDeviceId ? 'spotify' : 'connecting');
    } else if(settings.spotifyClientId && !settings.spotifyAccessToken){
      setMusicWidgetMode('needs-auth');
    } else {
      setMusicWidgetMode('mp3');
    }
  }
  determineMode();

  // Conectar Spotify
  if(connectBtn){
    connectBtn.addEventListener('click', ()=>{
      setMusicWidgetMode('connecting');
      startSpotifyAuth();
    });
  }

  // Audio MP3: errors
  audio.addEventListener('error', ()=>{
    console.warn('[bgMusic] error cargando audio:', audio.error);
  });

  function isSpotifyMode(){
    return widget.classList.contains('spotify-mode');
  }

  // Play / pause toggle
  toggle.addEventListener('click', async ()=>{
    if(isSpotifyMode()){
      if(!spotifyPlayer) return;
      const state = await spotifyPlayer.getCurrentState();
      if(!state || state.paused){
        // No hay nada o está pausado: arrancar random
        if(!state || !state.track_window?.current_track){
          await playRandomSpotifyTrack();
        } else {
          await spotifyPlayer.resume();
        }
      } else {
        await spotifyPlayer.pause();
      }
    } else {
      // Modo MP3
      if(audio.paused){
        audio.play().then(()=>{
          widget.classList.add('playing');
          settings.musicPlaying = true;
          saveSettings();
        }).catch(()=>toast('No pude reproducir la música 🌸'));
      } else {
        audio.pause();
        widget.classList.remove('playing');
        settings.musicPlaying = false;
        saveSettings();
      }
    }
  });

  // Skip (solo Spotify)
  if(skip){
    skip.addEventListener('click', ()=>{
      if(isSpotifyMode()) playRandomSpotifyTrack();
    });
  }

  // Previous (solo Spotify)
  const prev = document.getElementById('musicPrev');
  if(prev){
    prev.addEventListener('click', ()=>{
      if(isSpotifyMode() && spotifyPlayer){
        spotifyPlayer.previousTrack().catch(()=>{
          // No hay anterior, intentar otra random
          playRandomSpotifyTrack();
        });
      }
    });
  }


  // Volumen
  volume.addEventListener('input', ()=>{
    const v = parseInt(volume.value, 10) / 100;
    audio.volume = v;
    if(spotifyPlayer){
      try { spotifyPlayer.setVolume(v); } catch(e){}
    }
    settings.musicVolume = v;
    clearTimeout(volume._saveTimer);
    volume._saveTimer = setTimeout(()=>saveSettings(), 300);
  });

  // Loop del MP3 por si falla el atributo loop
  audio.addEventListener('ended', ()=>{
    if(!isSpotifyMode()){
      audio.currentTime = 0;
      audio.play().catch(()=>{});
    }
  });

  // Resume MP3 si estaba sonando antes (solo en modo MP3)
  if(settings.musicPlaying && !settings.spotifyClientId){
    const resume = ()=>{
      if(!isSpotifyMode()){
        audio.play().then(()=>widget.classList.add('playing')).catch(()=>{});
      }
    };
    document.addEventListener('click', resume, { once:true });
    document.addEventListener('keydown', resume, { once:true });
    document.addEventListener('touchstart', resume, { once:true });
  }
}

/* ==========================================================
   My Melody compañera animada
   ========================================================== */
const MELODY_QUOTES = [
  "¡Hola! 🌸",
  "¿Cómo estás hoy?",
  "Sonríe ♡",
  "Te quiero mucho 💕",
  "Eres muy linda",
  "Hoy es un día bonito ✨",
  "🎀 ¡Hola!",
  "Te mando florcitas 🌷",
  "¡Buen día!",
  "Estoy contigo siempre",
  "Acuérdate de tomar agua 💧",
  "Eres genial, en serio",
  "Me alegro de verte ♡",
  "Respira hondo 🌬️",
  "Hoy vas a brillar ✨",
  "¿Ya escribiste en tu diario?",
  "Date un mimo 💖",
  "Sos preciosa por dentro y por fuera",
  "Todo va a estar bien",
  "Mereces todo lo lindo 🎀"
];

function initMelodyCompanion(){
  const companion = document.getElementById('melodyCompanion');
  const bubble = document.getElementById('melodyBubble');
  if(!companion || !bubble) return;

  let bubbleTimer = null;
  let usedQuotes = [];

  function pickQuote(){
    if(usedQuotes.length >= MELODY_QUOTES.length) usedQuotes = [];
    let q;
    do{
      q = MELODY_QUOTES[Math.floor(Math.random() * MELODY_QUOTES.length)];
    } while(usedQuotes.includes(q));
    usedQuotes.push(q);
    // Personalizado si tenemos nombre
    if(settings.name && q === "¿Cómo estás hoy?") q = `¿Cómo estás, ${settings.name}?`;
    if(settings.name && q === "Eres muy linda") q = `Eres muy linda, ${settings.name}`;
    return q;
  }

  function showBubble(text){
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(()=>bubble.classList.remove('show'), 3200);
  }

  companion.addEventListener('click', ()=>{
    showBubble(pickQuote());
    companion.classList.add('jumping');
    setTimeout(()=>companion.classList.remove('jumping'), 600);
  });

  companion.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      companion.click();
    }
  });

  // Saludo inicial después de 2 segundos
  setTimeout(()=>{
    const hour = new Date().getHours();
    let greeting;
    if(hour < 12) greeting = `Buenos días${settings.name?', '+settings.name:''} 🌸`;
    else if(hour < 19) greeting = `Buenas tardes${settings.name?', '+settings.name:''} ✨`;
    else greeting = `Buenas noches${settings.name?', '+settings.name:''} 🌙`;
    showBubble(greeting);
  }, 2000);

  // Frase aleatoria cada 90 segundos (sutil)
  setInterval(()=>{
    if(!document.hidden && Math.random() < 0.4){
      showBubble(pickQuote());
    }
  }, 90000);
}

/* ==========================================================
   Diario · libro con páginas
   ========================================================== */
let currentDiaryPage = 0;
let diarySaveTimer = null;

function ensureDiaryHasPage(){
  if(!Array.isArray(state.diary)) state.diary = [];
  if(state.diary.length === 0){
    state.diary.push({
      id: 'd' + Date.now(),
      date: new Date().toISOString().slice(0,10),
      content: '',
      dateAdded: Date.now()
    });
    saveState();
  }
}

function sortDiaryByDate(){
  state.diary.sort((a,b)=> (a.date||'').localeCompare(b.date||''));
}

function renderDiary(){
  const book = document.getElementById('diaryBook');
  if(!book) return;
  ensureDiaryHasPage();
  sortDiaryByDate();

  if(currentDiaryPage < 0) currentDiaryPage = 0;
  if(currentDiaryPage >= state.diary.length) currentDiaryPage = state.diary.length - 1;
  const page = state.diary[currentDiaryPage];

  const dateEl = document.getElementById('diaryDateInput');
  const contentEl = document.getElementById('diaryContent');
  const numEl = document.getElementById('diaryPageNum');
  const totalEl = document.getElementById('diaryPageTotal');
  const prevBtn = document.getElementById('diaryPrev');
  const nextBtn = document.getElementById('diaryNext');

  if(dateEl) dateEl.value = page.date || '';
  if(contentEl) contentEl.value = page.content || '';
  if(numEl) numEl.textContent = currentDiaryPage + 1;
  if(totalEl) totalEl.textContent = state.diary.length;
  if(prevBtn) prevBtn.disabled = currentDiaryPage === 0;
  if(nextBtn) nextBtn.disabled = currentDiaryPage === state.diary.length - 1;

  // Animación de página al cambiar
  book.classList.remove('page-flip');
  void book.offsetWidth;
  book.classList.add('page-flip');
}

function diarySaveSoon(){
  clearTimeout(diarySaveTimer);
  const indicator = document.getElementById('diarySaving');
  if(indicator) indicator.classList.add('visible');
  diarySaveTimer = setTimeout(()=>{
    flushDiarySave();
    if(indicator){
      indicator.classList.remove('visible');
      indicator.classList.add('saved');
      setTimeout(()=>indicator.classList.remove('saved'), 1500);
    }
  }, 700);
}

function flushDiarySave(){
  clearTimeout(diarySaveTimer);
  diarySaveTimer = null;
  const page = state.diary[currentDiaryPage];
  const contentEl = document.getElementById('diaryContent');
  if(page && contentEl){
    page.content = contentEl.value;
    saveState();
    renderStats();
  }
}

function initDiary(){
  const book = document.getElementById('diaryBook');
  if(!book) return;

  document.getElementById('diaryContent').addEventListener('input', diarySaveSoon);

  document.getElementById('diaryDateInput').addEventListener('change', (e)=>{
    const page = state.diary[currentDiaryPage];
    if(!page) return;
    const oldId = page.id;
    page.date = e.target.value || new Date().toISOString().slice(0,10);
    saveState();
    sortDiaryByDate();
    const newIdx = state.diary.findIndex(p => p.id === oldId);
    if(newIdx >= 0) currentDiaryPage = newIdx;
    renderDiary();
  });

  document.getElementById('diaryPrev').addEventListener('click', ()=>{
    flushDiarySave();
    if(currentDiaryPage > 0){ currentDiaryPage--; renderDiary(); }
  });
  document.getElementById('diaryNext').addEventListener('click', ()=>{
    flushDiarySave();
    if(currentDiaryPage < state.diary.length - 1){ currentDiaryPage++; renderDiary(); }
  });
  document.getElementById('diaryNewPage').addEventListener('click', ()=>{
    flushDiarySave();
    const newPage = {
      id: 'd' + Date.now(),
      date: new Date().toISOString().slice(0,10),
      content: '',
      dateAdded: Date.now()
    };
    state.diary.push(newPage);
    saveState();
    sortDiaryByDate();
    currentDiaryPage = state.diary.findIndex(p => p.id === newPage.id);
    renderDiary();
    renderStats();
    document.getElementById('diaryContent').focus();
  });
  document.getElementById('diaryDeletePage').addEventListener('click', async ()=>{
    if(state.diary.length <= 1){
      toast('No podés borrar la única página 🌸');
      return;
    }
    const ok = await customConfirm('¿Borrar esta página del diario?', {
      title:'Borrar página',
      okText:'Sí, borrar',
      cancelText:'No, mantener'
    });
    if(!ok) return;
    state.diary.splice(currentDiaryPage, 1);
    if(currentDiaryPage > 0) currentDiaryPage--;
    saveState();
    renderDiary();
    renderStats();
    toast('Página borrada 🥀');
  });
}

/* ==========================================================
   IA personal con Google Gemini
   ========================================================== */
const CHAT_STORAGE_KEY = 'cariList_chat_v1';
let chatHistory = [];
try{
  chatHistory = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
} catch(e){ chatHistory = []; }

function saveChat(){
  const trimmed = chatHistory.slice(-30);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
}

function buildAISystemPrompt(){
  const name = settings.name || 'amiga';
  const catNames = {
    movies:'PELÍCULAS', series:'SERIES', music:'MÚSICA', books:'LIBROS', wishlist:'WISHLIST',
    outfits:'OUTFITS', places:'LUGARES',
    dates:'DATE IDEAS (planes en pareja)', diary:'DIARIO PERSONAL'
  };
  const catIcons = {
    movies:'🎬', series:'📺', music:'🎵', books:'📖', wishlist:'🎁',
    outfits:'👗', places:'🗺️', dates:'💕', diary:'📔'
  };

  let context = `Te llamas My Melody (sí, como la de Sanrio 🎀) y eres la mejor amiga virtual de ${name}. Una BFF de verdad — de esas con las que se habla de TODO: el día, cómo se siente, un chisme, un drama, un meme, la vida, la familia, lo random que se le ocurra. También viven juntas en "Mi Rinconcito ♡", su espacio donde colecciona pelis, series, libros, música y wishlist, pero eso es solo contexto extra, NO el tema obligatorio de toda charla.

🎯 REGLA DE ORO — ESCUCHA ANTES QUE NADA:
Tu trabajo principal es ESCUCHAR y RESPONDER a lo que ella dice. Si te cuenta que tuvo un mal día, le respondes sobre eso y le preguntas más. Si te cuenta un chisme, le sigues el chisme. Si está aburrida, charlas de cualquier cosa. Si te pregunta algo random, le contestas eso y ya. NO desvíes la charla hacia sus listas a menos que ella te lo pida directamente.

❌ COSAS QUE NUNCA HACES (importante):
- NO redirijas la conversación hacia recomendaciones si ella no las pidió
- NO digas frases tipo "y hablando de eso, ¿viste tal peli?" o "esto me recuerda a tu wishlist"
- NO uses sus colecciones como gancho para cambiar de tema
- NO le hables romántico ni le digas "hermosa", "princesa", "mi vida", "mi amor", "linda"
- NO le hagas cumplidos sobre lo físico
- NO uses modismos regionales como "che", "boluda", "tipa", "pibe", "guey", "tío", "vale", "pana". Habla en español neutro.
- NO seas empalagosa, formal ni robótica

✅ LO QUE SÍ HACES:
- Hablas en español neutro y limpio, como una amiga cercana pero sin modismos de país. Usas "tú" o evitas el pronombre directamente cuando suena más natural.
- Charlas de lo que sea: sentimientos, cosas del día, dramas, chistes, filosofía de las 3am, sueños, miedos, cualquier tema
- Le tiras halagos lindos cuando vienen al caso: sobre cómo piensa, su humor, sus ideas, su forma de ver las cosas ("eres un genio", "qué bonita forma de verlo", "te entiendo perfecto", "tienes toda la razón")
- Validas lo que siente, le haces preguntas, muestras interés genuino
- Tienes tu propia opinión y la compartes, aunque sea distinta a la suya (con respeto)
- Reaccionas natural: "ay no, en serio?", "te entiendo mucho", "espera, cuéntame más", "qué fuerte", "literal", "obvio"
- Usas palabras universales: "amiga", "súper", "literal", "obvio", "qué lindo", "me encanta", "me da risa"
- Usas emojis con buena vibra 🎀✨💅🌸💕😭🤭 (pocos, sin saturar)
- SOLO recomiendas pelis/libros/series/música/cosas cuando ella te lo pide directamente. Si te pregunta "¿qué peli puedo ver?" ahí sí usas su colección. Si no, ni la menciones.
- Eres breve: 3-5 oraciones promedio, puedes extenderte hasta 7-8 si el tema lo amerita (algo emocional, una charla profunda)

${settings.bio ? `Lo que ella escribió de sí misma en su bio: "${settings.bio}"\n` : ''}
Lo que sabés de ${name} (esto es contexto extra para cuando ella te pida recomendaciones, NO el tema obligado de toda charla):
`;

  const cats = ['movies','series','music','books','wishlist','outfits','places','dates','diary'];
  let hasAny = false;
  for(const cat of cats){
    const list = state[cat] || [];
    if(list.length === 0) continue;
    hasAny = true;

    // Diario: estructura distinta (texto libre por entrada)
    if(cat === 'diary'){
      context += `\n${catIcons[cat]} ${catNames[cat]} (últimas entradas):\n`;
      const recent = list.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).slice(-15);
      for(const p of recent){
        const date = p.date || 'sin fecha';
        const text = (p.content || '').slice(0, 600);
        if(text) context += `  · [${date}] "${text}"\n`;
      }
      continue;
    }

    context += `\n${catIcons[cat]} ${catNames[cat]} (${list.length}):\n`;
    const byStatus = {};
    list.forEach(i=>{
      const s = i.status||'want';
      (byStatus[s] = byStatus[s] || []).push(i);
    });
    for(const s of Object.keys(byStatus)){
      const label = CAT_CONFIG[cat].statusLabels[s] || s;
      const items = byStatus[s].slice(0,30).map(i=>{
        let line = `"${i.title}"`;
        if(i.meta) line += ` (${i.meta})`;
        if(i.rating) line += ` ${'★'.repeat(i.rating)}`;
        if(i.note) line += ` — nota: "${i.note}"`;
        if(i.price) line += ` — ${i.price}`;
        if(i.eventDate) line += ` — ${i.eventDate}`;
        if(i.comments) line += ` — comentario: "${i.comments}"`;
        return line;
      }).join('; ');
      context += `  · ${label}: ${items}\n`;
    }
  }
  if(!hasAny){
    context += '\n(Su colección está vacía todavía. Animala a empezar pero como amiga, no como mami)\n';
  }

  context += `\nQué haces bien (en este orden de importancia):
1. ESCUCHARLA y charlar de cualquier cosa que ella quiera: el día, sentimientos, dudas, chismes, lo que sea
2. Validarla, hacerle preguntas, mostrar interés en lo que le pasa
3. Tirarle halagos lindos sobre cómo piensa, su humor, su criterio (no físicos)
4. Tener charlas profundas si ella las quiere, o livianas si quiere distraerse
5. SOLO si ella te lo pide directamente: recomendar pelis/series/libros/música/cosas para su wishlist (con títulos reales y específicos)
6. Si te pide ayuda para elegir algo (tablet, makeup, figura), ahí sí dale tu opinión con marcas/modelos concretos

Recuerda: ella vino a hablar contigo, no a que le promociones su propia colección. Habla como amiga normal en español neutro. 💕`;

  return context;
}

/* === Proveedores de IA === */
const AI_PROVIDERS = {
  gemini: { name:'Google Gemini', keyField:'geminiKey' },
  groq:   { name:'Groq · Llama',  keyField:'groqKey' },
  openai: { name:'OpenAI ChatGPT', keyField:'openaiKey' }
};

function currentProviderKey(){
  const id = settings.aiProvider || 'groq';
  return AI_PROVIDERS[id] ? id : 'groq';
}
function hasAIKey(){
  const id = currentProviderKey();
  return !!settings[AI_PROVIDERS[id].keyField];
}

async function sendToAI(messages, systemPrompt){
  const id = currentProviderKey();
  const provider = AI_PROVIDERS[id];
  const key = settings[provider.keyField];
  if(!key) throw new Error(`Falta la clave de ${provider.name} en ajustes ⚙️`);

  if(id === 'gemini') return sendGemini(messages, systemPrompt, key);
  if(id === 'groq')   return sendOpenAILike(messages, systemPrompt, {
    url:'https://api.groq.com/openai/v1/chat/completions',
    key, model:'llama-3.3-70b-versatile', name:'Groq'
  });
  if(id === 'openai') return sendOpenAILike(messages, systemPrompt, {
    url:'https://api.openai.com/v1/chat/completions',
    key, model:'gpt-4o-mini', name:'OpenAI'
  });
}

async function sendGemini(messages, systemPrompt, key){
  // gemini-1.5-flash es más estable en el tier gratis que 2.0-flash
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: messages.map(m=>({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    systemInstruction: { parts:[{ text: systemPrompt }] },
    generationConfig: { temperature: 0.9, maxOutputTokens: 800 }
  };
  const r = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  if(!r.ok){
    let msg = 'Error de Gemini';
    try{ const err = await r.json(); msg = err.error?.message || msg; } catch(_){}
    throw new Error(msg);
  }
  const d = await r.json();
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if(!text) throw new Error('La IA no devolvió respuesta');
  return text.trim();
}

async function sendOpenAILike(messages, systemPrompt, config){
  const body = {
    model: config.model,
    messages: [
      { role:'system', content: systemPrompt },
      ...messages.map(m=>({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
    ],
    temperature: 0.9,
    max_tokens: 800
  };
  const r = await fetch(config.url, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': `Bearer ${config.key}`
    },
    body: JSON.stringify(body)
  });
  if(!r.ok){
    let msg = `Error de ${config.name}`;
    try{ const err = await r.json(); msg = err.error?.message || msg; } catch(_){}
    throw new Error(msg);
  }
  const d = await r.json();
  const text = d.choices?.[0]?.message?.content || '';
  if(!text) throw new Error('La IA no devolvió respuesta');
  return text.trim();
}

const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');

if(chatModal){
  safeOn('fabChat', 'click', async ()=>{
    if(!hasAIKey()){
      const ok = await customConfirm('My Melody necesita una clave para hablar contigo. Te recomiendo Groq (gratis sin tarjeta) o Gemini. ¿Abrimos ajustes ahora?', {
        title: 'My Melody se está vistiendo 🎀',
        okText: 'Sí, abrir ajustes',
        cancelText: 'Después'
      });
      if(ok) document.getElementById('settingsBtn')?.click();
      return;
    }
    chatModal.classList.add('show');
    renderChat();
    setTimeout(()=>chatInput?.focus(), 120);
  });

  safeOn('chatClose', 'click', ()=>chatModal.classList.remove('show'));
  chatModal.addEventListener('click', e=>{ if(e.target===chatModal) chatModal.classList.remove('show'); });
}

const CHAT_SUGGESTIONS = [
  { emoji:'💬', text:'Charlemos', prompt:'Hola amiga, cuéntame algo, ¿cómo estás tú?' },
  { emoji:'🥺', text:'Necesito desahogarme', prompt:'Necesito hablar de algo que me está pasando' },
  { emoji:'✨', text:'Algo lindo', prompt:'Dime algo lindo, necesito buena energía hoy' },
  { emoji:'🎬', text:'Recomiéndame una peli', prompt:'Recomiéndame una película según lo que ya me gustó' }
];

function renderChat(){
  if(chatHistory.length === 0){
    const name = settings.name || 'amiga';
    const sugg = CHAT_SUGGESTIONS.map(s=>`<button class="chat-sugg" data-prompt="${escAttr(s.prompt)}">${s.emoji} ${s.text}</button>`).join('');
    chatMessages.innerHTML = `
      <div class="chat-msg ai">¡Hola ${esc(name)}! 🎀 Soy My Melody, tu amiga aquí en este rinconcito. Podemos hablar de lo que quieras — cómo te fue, algo que te pasó, lo más random. Te escucho ✨ ¿Cómo estás?</div>
      <div class="chat-suggestions">${sugg}</div>
    `;
    chatMessages.querySelectorAll('.chat-sugg').forEach(b=>{
      b.addEventListener('click', ()=>{
        chatInput.value = b.dataset.prompt;
        sendChat();
      });
    });
    return;
  }
  chatMessages.innerHTML = chatHistory.map(m=>
    `<div class="chat-msg ${m.role==='user'?'user':'ai'}">${esc(m.content)}</div>`
  ).join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChat(){
  const text = chatInput.value.trim();
  if(!text) return;
  chatInput.value = '';
  chatHistory.push({ role:'user', content:text });
  renderChat();

  const loadingEl = document.createElement('div');
  loadingEl.className = 'chat-msg ai loading';
  loadingEl.innerHTML = '<span class="loader"></span> pensando con flores...';
  chatMessages.appendChild(loadingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const melodyFab = document.getElementById('fabChat');
  melodyFab?.classList.add('thinking');

  try{
    const systemPrompt = buildAISystemPrompt();
    const reply = await sendToAI(chatHistory, systemPrompt);
    loadingEl.remove();
    chatHistory.push({ role:'model', content: reply });
    saveChat();
    renderChat();
  } catch(err){
    loadingEl.remove();
    chatHistory.push({ role:'model', content: `Uy, hubo un problemita: ${err.message} 🥀` });
    saveChat();
    renderChat();
  } finally {
    melodyFab?.classList.remove('thinking');
  }
}

safeOn('chatSend', 'click', sendChat);
if(chatInput){
  chatInput.addEventListener('keydown', e=>{
    if(e.key==='Enter' && !e.shiftKey){
      e.preventDefault();
      sendChat();
    }
  });
}

safeOn('chatClear', 'click', async ()=>{
  const ok = await customConfirm('¿Borrar toda la conversación con tu IA?', {
    title:'Borrar chat 🌸',
    okText:'Sí, borrar',
    cancelText:'No, mantener'
  });
  if(!ok) return;
  chatHistory = [];
  saveChat();
  renderChat();
});

/* ==========================================================
   Selector de tema (4 paletas Sanrio)
   ========================================================== */
const VALID_THEMES = ['melody','kuromi','cinnamoroll','pompompurin'];

function applyTheme(theme){
  if(!VALID_THEMES.includes(theme)) theme = 'melody';
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-option').forEach(b=>{
    b.classList.toggle('active', b.dataset.theme === theme);
  });
  // Re-spawn petals con los colores del tema
  const petalsWrap = document.getElementById('petals');
  if(petalsWrap){
    petalsWrap.innerHTML = '';
    spawnPetals();
  }
}

document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.theme-option');
  if(!btn) return;
  settings.theme = btn.dataset.theme;
  saveSettings();
  applyTheme(settings.theme);
});

/* ==========================================================
   Aniversario contador
   ========================================================== */
function computeAnniversary(){
  if(!settings.anniversaryDate) return null;
  const start = new Date(settings.anniversaryDate + 'T00:00:00');
  if(isNaN(start.getTime())) return null;
  const now = new Date();
  if(start > now) return null;

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if(days < 0){
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if(months < 0){ years -= 1; months += 12; }
  const totalDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const isToday = (now.getMonth() === start.getMonth()) && (now.getDate() === start.getDate()) && totalDays > 0;
  return { years, months, days, totalDays, isToday };
}

function renderAnniversaryCard(){
  const el = document.getElementById('anniversaryCard');
  if(!el) return;
  const info = computeAnniversary();
  if(!info){
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  let parts = [];
  if(info.years > 0) parts.push(`${info.years} ${info.years===1?'año':'años'}`);
  if(info.months > 0) parts.push(`${info.months} ${info.months===1?'mes':'meses'}`);
  if(info.days > 0 || parts.length===0) parts.push(`${info.days} ${info.days===1?'día':'días'}`);
  const text = parts.join(', ').replace(/, ([^,]+)$/, ' y $1');

  el.style.display = '';
  if(info.isToday){
    el.classList.add('anniversary-today');
    el.innerHTML = `🎉 ¡Feliz aniversario! ${text} juntos 🎉`;
    // Lluvia de confetti en el aniversario
    if(!sessionStorage.getItem('annivConfettiShown')){
      sessionStorage.setItem('annivConfettiShown','1');
      setTimeout(()=>confetti({count:120,duration:3500}), 600);
    }
  } else {
    el.classList.remove('anniversary-today');
    el.innerHTML = `<span class="heart-beat">♡</span> ${text} juntos <span class="heart-beat">♡</span>`;
  }
}

/* ==========================================================
   Confetti (sin librerías externas)
   ========================================================== */
function confetti(opts={}){
  const colors = opts.colors || ['#e96a91','#f291ad','#fbd0dd','#fde4c9','#d9a86c','#ffffff'];
  const count = opts.count || 80;
  const duration = opts.duration || 2500;
  const originX = opts.x ?? window.innerWidth/2;
  const originY = opts.y ?? window.innerHeight/2;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = [];
  for(let i=0; i<count; i++){
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random()*colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random()-0.5) * 14,
      shape: Math.random() < 0.55 ? 'heart' : (Math.random() < 0.5 ? 'circle' : 'square'),
      life: 1
    });
  }

  const start = performance.now();
  function drawHeart(s){
    ctx.beginPath();
    ctx.moveTo(0, s*0.3);
    ctx.bezierCurveTo(s*0.5, -s*0.5, s, s*0.2, 0, s);
    ctx.bezierCurveTo(-s, s*0.2, -s*0.5, -s*0.5, 0, s*0.3);
    ctx.closePath();
    ctx.fill();
  }
  function frame(t){
    const elapsed = t - start;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive = 0;
    for(const p of particles){
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life = Math.max(0, 1 - elapsed/duration);
      if(p.life > 0 && p.y < canvas.height + 50){
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        const s = p.size/2;
        if(p.shape === 'heart'){
          drawHeart(s);
        } else if(p.shape === 'square'){
          ctx.fillRect(-s, -s, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0,0,s,0,Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    if(alive > 0 && elapsed < duration + 1500){
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}

/* Helper defensivo: no rompe si el elemento no existe (cache viejo, etc.) */
function safeOn(id, event, handler){
  const el = document.getElementById(id);
  if(el) el.addEventListener(event, handler);
}

/* === Sticker Book handlers === */
safeOn('openStickersBtn', 'click', openStickerBook);
safeOn('stickersClose', 'click', ()=>{
  document.getElementById('stickersModal')?.classList.remove('show');
});
safeOn('stickersModal', 'click', (e)=>{
  if(e.target.id === 'stickersModal') e.target.classList.remove('show');
});

function updateStickersCount(){
  const el = document.getElementById('stickersCount');
  if(!el) return;
  const unlocked = (settings.unlockedStickers || []).length;
  el.textContent = `${unlocked}/${ACHIEVEMENTS.length}`;
}

/* === Ruleta handlers === */
safeOn('openRouletteBtn', 'click', openRoulette);
safeOn('rouletteClose', 'click', ()=>{
  document.getElementById('rouletteModal')?.classList.remove('show');
});
safeOn('rouletteModal', 'click', (e)=>{
  if(e.target.id === 'rouletteModal') e.target.classList.remove('show');
});
safeOn('rouletteCat', 'change', (e)=>{
  rouletteCtx.cat = e.target.value;
  const result = document.getElementById('rouletteResult');
  if(result){ result.textContent = ''; result.classList.remove('show'); }
  drawRouletteWheel(0);
});
safeOn('rouletteStatus', 'change', (e)=>{
  rouletteCtx.status = e.target.value;
  const result = document.getElementById('rouletteResult');
  if(result){ result.textContent = ''; result.classList.remove('show'); }
  drawRouletteWheel(0);
});
safeOn('rouletteSpin', 'click', spinRoulette);

/* ==========================================================
   Modo oscuro 🌙
   ========================================================== */
function applyDarkMode(on){
  document.documentElement.setAttribute('data-dark', on ? 'true' : 'false');
}
function initDarkMode(){
  applyDarkMode(!!settings.darkMode);
  const btn = document.getElementById('darkToggle');
  if(btn){
    btn.addEventListener('click', ()=>{
      settings.darkMode = !settings.darkMode;
      applyDarkMode(settings.darkMode);
      saveSettings();
    });
  }
}


/* ==========================================================
   ☁️ NUBE + AMIGOS
   Cada rinconcito tiene un código tipo  cari#4821
   Los datos se guardan en Supabase para que los amigos
   puedan ver tu perfil siempre actualizado.
   ========================================================== */

/* --- llamada a las funciones de Supabase --- */
async function sbRpc(fn, params){
  if(!settings.sbUrl || !settings.sbKey) throw new Error('Falta configurar la nube en ajustes');
  const url = settings.sbUrl.replace(/\/+$/,'') + '/rest/v1/rpc/' + fn;
  const r = await fetch(url, {
    method:'POST',
    headers:{
      'apikey': settings.sbKey,
      'Authorization': 'Bearer ' + settings.sbKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if(!r.ok){
    const txt = await r.text().catch(()=> '');
    throw new Error(txt || ('Error ' + r.status));
  }
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}

function cloudReady(){ return !!(settings.sbUrl && settings.sbKey); }
function cloudLinked(){ return !!(cloudReady() && settings.myCode && settings.ownerToken); }

/* --- generar código tipo  cari#4821 --- */
function slugName(n){
  const s = (n||'').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-z0-9]/g,'')
    .slice(0,10);
  return s || 'amiga';
}
function randomToken(){
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function createMyCode(){
  const base = slugName(settings.name);
  const token = settings.ownerToken || randomToken();
  for(let intento=0; intento<12; intento++){
    const code = base + '#' + Math.floor(1000 + Math.random()*9000);
    const ok = await sbRpc('claim_profile', {p_code: code, p_token: token});
    if(ok === true){
      settings.myCode = code;
      settings.ownerToken = token;
      saveSettings();
      return code;
    }
  }
  throw new Error('No pude generar un código libre, probá de nuevo');
}

/* --- qué se sube (el diario queda privado, no se comparte) --- */
function buildCloudPayload(){
  const lists = {};
  Object.keys(CAT_CONFIG).forEach(cat=>{ lists[cat] = state[cat] || []; });
  return {
    v: 1,
    profile: {
      name: settings.name || '',
      bio: settings.bio || '',
      avatar: settings.avatar || '',
      banner: settings.banner || '',
      anniversaryDate: settings.anniversaryDate || ''
    },
    lists,
    stickers: settings.unlockedStickers || []
  };
}

let cloudSyncTimer = null;
let cloudSyncing = false;

function setCloudStatus(txt){
  const el = document.getElementById('cloudStatus');
  if(el) el.textContent = txt;
}

async function pushToCloud(silent){
  if(silent === undefined) silent = true;
  if(!cloudLinked()) return false;
  if(cloudSyncing) return false;
  cloudSyncing = true;
  setCloudStatus('subiendo…');
  try{
    const payload = buildCloudPayload();
    const size = JSON.stringify(payload).length;
    if(size > 4.5 * 1024 * 1024){
      setCloudStatus('perfil muy pesado');
      if(!silent) toast('Tu perfil pesa mucho (fotos grandes) 🌸');
      cloudSyncing = false;
      return false;
    }
    const ok = await sbRpc('save_profile', {
      p_code: settings.myCode,
      p_token: settings.ownerToken,
      p_name: settings.name || '',
      p_payload: payload
    });
    if(ok === true){
      settings.lastSync = Date.now();
      saveSettings();
      setCloudStatus('sincronizado ✓');
      if(!silent) toast('¡Perfil sincronizado! ☁️');
      cloudSyncing = false;
      return true;
    }
    setCloudStatus('no autorizado');
    if(!silent) toast('No pude guardar en la nube 🌸');
  } catch(e){
    console.warn('[nube] push:', e);
    setCloudStatus('sin conexión');
    if(!silent) toast('No pude conectar con la nube 🌸');
  }
  cloudSyncing = false;
  return false;
}

/* sincronización automática (con retraso, para no spamear) */
function cloudSyncSoon(){
  if(!cloudLinked()) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(function(){ pushToCloud(true); }, 4000);
}

/* --- amigos --- */
async function loadFriends(){
  if(!cloudLinked()) return [];
  try{
    const rows = await sbRpc('list_friends', {p_code: settings.myCode});
    return Array.isArray(rows) ? rows : [];
  } catch(e){
    console.warn('[nube] amigos:', e);
    return [];
  }
}

async function addFriendByCode(code){
  const clean = (code||'').trim().replace(/^@/,'');
  if(!clean) return;
  if(!cloudLinked()){ toast('Primero creá tu código ☁️'); return; }
  try{
    const res = await sbRpc('add_friend', {
      p_code: settings.myCode, p_token: settings.ownerToken, p_friend: clean
    });
    const msgs = {
      ok: '¡Amigo agregado! 💕',
      no_existe: 'Ese código no existe 🌸',
      vos_mismo: '¡Ese sos vos! 🤭',
      no_auth: 'No pude verificar tu perfil'
    };
    toast(msgs[res] || 'Algo salió raro');
    if(res === 'ok'){
      document.getElementById('friendCodeInput').value = '';
      renderFriendsList();
    }
  } catch(e){
    console.warn('[nube] add friend:', e);
    toast('No pude agregar al amigo 🌸');
  }
}

async function removeFriendByCode(code){
  const ok = await customConfirm('¿Sacar a esta persona de tus amigos?', {
    title:'Quitar amigo', okText:'Sí, quitar', cancelText:'No'
  });
  if(!ok) return;
  try{
    await sbRpc('remove_friend', {
      p_code: settings.myCode, p_token: settings.ownerToken, p_friend: code
    });
    toast('Amigo quitado');
    renderFriendsList();
  } catch(e){ toast('No pude quitarlo 🌸'); }
}

/* --- ver el perfil de un amigo --- */
async function openFriendProfile(code){
  const modal = document.getElementById('friendProfileModal');
  const body  = document.getElementById('fpBody');
  modal.classList.add('show');
  body.innerHTML = '<div class="loading-text"><span class="loader"></span> abriendo su rinconcito…</div>';
  try{
    const rows = await sbRpc('get_profile', {p_code: code});
    const prof = Array.isArray(rows) ? rows[0] : rows;
    if(!prof){
      body.innerHTML = '<div class="empty"><div class="empty-flower">🌸</div><h3>No encontré ese perfil</h3></div>';
      return;
    }
    renderFriendProfile(prof);
  } catch(e){
    console.warn('[nube] perfil:', e);
    body.innerHTML = '<div class="empty"><div class="empty-flower">🥀</div><h3>No pude abrir su perfil</h3><p>Revisá tu conexión</p></div>';
  }
}

function renderFriendProfile(prof){
  const body = document.getElementById('fpBody');
  const payload = prof.payload || {};
  const p = payload.profile || {};
  const lists = payload.lists || {};
  const name = p.name || prof.name || 'Su rinconcito';

  const bannerStyle = p.banner
    ? 'background-image:url("' + String(p.banner).replace(/"/g,'&quot;') + '")'
    : '';
  const avatarInner = p.avatar
    ? '<img src="' + escAttr(p.avatar) + '" alt=""/>'
    : '🌸';

  const cats = Object.keys(CAT_CONFIG).filter(function(c){ return (lists[c]||[]).length > 0; });
  const total = cats.reduce(function(a,c){ return a + lists[c].length; }, 0);
  const loved = cats.reduce(function(a,c){
    return a + lists[c].filter(function(i){ return i.status==='loved'; }).length;
  }, 0);

  const tabsHTML = cats.map(function(c,i){
    const label = CAT_CONFIG[c].sectionTitle.replace(/^Tus?\s+/i,'');
    return '<button class="fp-tab' + (i===0?' active':'') + '" data-cat="' + c + '">' +
           CAT_CONFIG[c].icon + ' ' + esc(label) +
           ' <span class="fp-count">' + lists[c].length + '</span></button>';
  }).join('');

  const gridsHTML = cats.map(function(c,i){
    const items = lists[c].slice().sort(function(a,b){ return (b.dateAdded||0)-(a.dateAdded||0); });
    const cards = items.map(function(it){
      const hearts = it.rating
        ? '♥'.repeat(it.rating) + '<span style="color:var(--pink-200)">' + '♥'.repeat(5-it.rating) + '</span>'
        : '';
      const cover = it.cover
        ? '<img src="' + escAttr(it.cover) + '" class="item-cover" loading="lazy" onerror="this.style.display=\'none\'"/>'
        : '<div class="item-cover" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem;color:var(--pink-300);">' + CAT_CONFIG[c].icon + '</div>';
      return '<div class="item-card">' +
        '<div class="item-badge">' + esc(CAT_CONFIG[c].statusLabels[it.status] || it.status || '') + '</div>' +
        (it.status==='loved' ? '<div class="item-badge fav-badge">💖</div>' : '') +
        cover +
        '<div class="item-info">' +
          '<div class="item-title">' + esc(it.title||'') + '</div>' +
          (it.meta ? '<div class="item-meta">' + esc(it.meta) + '</div>' : '') +
          (it.price ? '<div class="item-price">' + esc(it.price) + '</div>' : '') +
          '<div class="item-rating">' + hearts + '</div>' +
          (it.note ? '<div class="item-note">"' + esc(it.note) + '"</div>' : '') +
        '</div></div>';
    }).join('');
    return '<div class="fp-grid items-grid' + (i===0?' active':'') + '" data-cat="' + c + '">' + cards + '</div>';
  }).join('');

  const contentHTML = cats.length === 0
    ? '<div class="empty"><div class="empty-flower">🌷</div><h3>Todavía no cargó nada</h3><p>Su rinconcito está empezando ✨</p></div>'
    : '<div class="fp-tabs">' + tabsHTML + '</div>' + gridsHTML;

  body.innerHTML =
    '<div class="fp-banner" style="' + bannerStyle + '"></div>' +
    '<div class="fp-avatar-wrap"><div class="fp-avatar">' + avatarInner + '</div></div>' +
    '<div class="fp-head">' +
      '<h3>' + esc(name) + '</h3>' +
      '<div class="fp-code">' + esc(prof.code) + '</div>' +
      (p.bio ? '<div class="fp-bio">' + esc(p.bio) + '</div>' : '') +
      '<div class="fp-stats"><span><b>' + total + '</b> cositas</span>' +
      '<span><b>' + loved + '</b> 💖 favoritas</span></div>' +
    '</div>' + contentHTML;

  body.querySelectorAll('.fp-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      body.querySelectorAll('.fp-tab').forEach(function(t){ t.classList.toggle('active', t===tab); });
      body.querySelectorAll('.fp-grid').forEach(function(g){
        g.classList.toggle('active', g.dataset.cat===tab.dataset.cat);
      });
    });
  });
}

/* --- panel de amigos --- */
async function renderFriendsList(){
  const listEl = document.getElementById('friendsList');
  if(!listEl) return;
  if(!cloudLinked()){ listEl.innerHTML = ''; return; }
  listEl.innerHTML = '<div class="loading-text"><span class="loader"></span> buscando…</div>';
  const friends = await loadFriends();
  if(friends.length === 0){
    listEl.innerHTML = '<div class="friends-empty">Todavía no agregaste a nadie 🌸<br><small>Pedile su código y agregalo arriba</small></div>';
    return;
  }
  listEl.innerHTML = friends.map(function(f){
    return '<div class="friend-row">' +
      '<div class="friend-av">🌸</div>' +
      '<div class="friend-info">' +
        '<div class="friend-name">' + esc(f.name || 'Sin nombre') + '</div>' +
        '<div class="friend-code">' + esc(f.code) + '</div>' +
      '</div>' +
      '<button class="friend-open" data-code="' + escAttr(f.code) + '">Ver ♡</button>' +
      '<button class="friend-del" data-code="' + escAttr(f.code) + '" title="Quitar">✕</button>' +
    '</div>';
  }).join('');
  listEl.querySelectorAll('.friend-open').forEach(function(b){
    b.addEventListener('click', function(){ openFriendProfile(b.dataset.code); });
  });
  listEl.querySelectorAll('.friend-del').forEach(function(b){
    b.addEventListener('click', function(){ removeFriendByCode(b.dataset.code); });
  });
}

function refreshFriendsPanel(){
  const setup  = document.getElementById('friendsSetup');
  const active = document.getElementById('friendsActive');
  const codeEl = document.getElementById('myCodeDisplay');
  if(!setup || !active) return;
  const linked = cloudLinked();
  setup.style.display  = linked ? 'none' : 'block';
  active.style.display = linked ? 'block' : 'none';
  const createBtn = document.getElementById('createCodeBtn');
  const notCfg = document.getElementById('cloudNotConfigured');
  if(createBtn) createBtn.disabled = !cloudReady();
  if(notCfg) notCfg.style.display = cloudReady() ? 'none' : 'block';
  if(linked){
    codeEl.textContent = settings.myCode;
    renderFriendsList();
  }
}

function initFriends(){
  const modal = document.getElementById('friendsModal');
  if(!modal) return;

  document.getElementById('openFriendsBtn').addEventListener('click', function(){
    modal.classList.add('show');
    refreshFriendsPanel();
  });
  document.getElementById('friendsClose').addEventListener('click', function(){
    modal.classList.remove('show');
  });
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.classList.remove('show'); });

  const fpModal = document.getElementById('friendProfileModal');
  document.getElementById('fpClose').addEventListener('click', function(){ fpModal.classList.remove('show'); });
  fpModal.addEventListener('click', function(e){ if(e.target===fpModal) fpModal.classList.remove('show'); });

  document.getElementById('createCodeBtn').addEventListener('click', async function(){
    const btn = document.getElementById('createCodeBtn');
    btn.disabled = true; btn.textContent = 'creando…';
    try{
      const code = await createMyCode();
      toast('¡Tu código es ' + code + '! 🎀');
      await pushToCloud(false);
      refreshFriendsPanel();
    } catch(e){
      console.warn('[nube] crear código:', e);
      toast('No pude crear tu código 🌸');
    }
    btn.disabled = false; btn.textContent = '✨ Crear mi código';
  });

  document.getElementById('copyCodeBtn').addEventListener('click', async function(){
    try{
      await navigator.clipboard.writeText(settings.myCode);
      toast('¡Código copiado! ♡');
    } catch(e){ toast('Copialo a mano 🌸'); }
  });

  document.getElementById('addFriendBtn').addEventListener('click', function(){
    addFriendByCode(document.getElementById('friendCodeInput').value);
  });
  document.getElementById('friendCodeInput').addEventListener('keydown', function(e){
    if(e.key==='Enter'){ e.preventDefault(); addFriendByCode(e.target.value); }
  });
  document.getElementById('syncNowBtn').addEventListener('click', function(){ pushToCloud(false); });

  if(cloudLinked()) pushToCloud(true);
}

/* === Init === */
function safeRun(label, fn){
  try { fn(); }
  catch(e){ console.error('[init '+label+']', e); }
}
safeRun('spawnPetals', spawnPetals);
safeRun('applyTheme', ()=>applyTheme(settings.theme || 'melody'));
safeRun('initDarkMode', initDarkMode);
safeRun('initFriends', initFriends);
safeRun('initDiary', initDiary);
safeRun('initMusicPlayer', initMusicPlayer);
safeRun('initMelodyCompanion', initMelodyCompanion);
safeRun('render', render);
safeRun('maybeShowSetup', maybeShowSetup);
safeRun('checkAchievements', ()=>checkAchievements(true));

// Spotify: detectar callback OAuth en la URL (?code=...) y completar login
(async ()=>{
  try {
    const completed = await handleSpotifyCallback();
    if(completed){
      toast('¡Spotify conectado! 🎵');
    }
    // Si tenemos tokens y el SDK ya cargó, init player de inmediato
    if(settings.spotifyAccessToken && settings.spotifyClientId && typeof Spotify !== 'undefined'){
      initSpotifyPlayer();
    }
  } catch(e){ console.error('[Spotify callback]', e); }
})();
