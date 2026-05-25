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
  anniversaryDate:'2023-12-15'
};
const emptyState = { movies:[], series:[], music:[], books:[], wishlist:[] };

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
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadSettings(){
  try{ return Object.assign({},defaultSettings,JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}); }
  catch(e){ return {...defaultSettings}; }
}
function saveSettings(){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

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
  document.body.dataset.cat = currentCat;
  Object.keys(CAT_CONFIG).forEach(renderCategory);
}

function renderStats(){
  const stats = document.getElementById('stats');
  const totalMovies = state.movies.length;
  const totalSeries = state.series.length;
  const totalMusic = state.music.length;
  const totalBooks = state.books.length;
  const totalWishlist = state.wishlist.length;
  const allItems = [...state.movies,...state.series,...state.music,...state.books,...state.wishlist];
  const lovedAll = allItems.filter(i=>i.status==='loved').length;
  const year = new Date().getFullYear();
  const thisYear = allItems.filter(i=>{
    if(!i.dateAdded) return false;
    return new Date(i.dateAdded).getFullYear()===year;
  }).length;

  stats.innerHTML = `
    <div class="stat-card"><div class="stat-num">${totalMovies}</div><div class="stat-label">Películas</div></div>
    <div class="stat-card"><div class="stat-num">${totalSeries}</div><div class="stat-label">Series</div></div>
    <div class="stat-card"><div class="stat-num">${totalMusic}</div><div class="stat-label">Música</div></div>
    <div class="stat-card"><div class="stat-num">${totalBooks}</div><div class="stat-label">Libros</div></div>
    <div class="stat-card"><div class="stat-num">${totalWishlist}</div><div class="stat-label">Wishlist</div></div>
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
function byNewest(a,b){ return (b.dateAdded||0) - (a.dateAdded||0); }

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

  return `
    <div class="item-card" data-id="${item.id}">
      <div class="item-badge">${esc(CAT_CONFIG[cat].statusLabels[item.status]||item.status)}</div>
      ${fav?'<div class="item-badge fav-badge">💖</div>':''}
      ${cover}
      <div class="item-info">
        <div class="item-title">${esc(item.title)}</div>
        ${item.meta?`<div class="item-meta">${esc(item.meta)}</div>`:''}
        ${wishlistExtras}
        <div class="item-rating">${heartsRow}</div>
        ${item.note?`<div class="item-note">"${esc(item.note)}"</div>`:''}
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

document.getElementById('itemModalClose').onclick = closeModal;
document.getElementById('cancelBtn').onclick = closeModal;
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

document.getElementById('saveBtn').addEventListener('click',()=>{
  const title = fTitle.value.trim();
  if(!title){ toast('Necesitas un título 🌸'); return; }
  const meta = fMeta.value.trim();
  const note = fNote.value.trim();
  const status = statusPills.querySelector('.pill.active')?.dataset.status || 'want';
  const rating = modalContext.rating;
  const price = fPrice.value.trim();
  const link = fLink.value.trim();

  try {
    if(editingId){
      const item = state[modalContext.cat].find(i=>i.id===editingId);
      if(item){
        item.title = title; item.meta=meta; item.note=note;
        item.status=status; item.rating=rating;
        item.cover = modalContext.cover || '';
        if(modalContext.cat==='wishlist'){ item.price = price; item.link = link; }
      }
    } else {
      const newItem = {
        id: 'i'+Date.now()+Math.floor(Math.random()*1000),
        title, meta, note, status, rating,
        cover: modalContext.cover || '',
        dateAdded: Date.now()
      };
      if(modalContext.cat==='wishlist'){ newItem.price = price; newItem.link = link; }
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
document.getElementById('settingsBtn').onclick = ()=>{
  document.getElementById('setName').value = settings.name || '';
  document.getElementById('setTmdb').value = settings.tmdbKey || '';
  document.getElementById('setGemini').value = settings.geminiKey || '';
  document.getElementById('setGroq').value = settings.groqKey || '';
  document.getElementById('setOpenai').value = settings.openaiKey || '';
  document.getElementById('setAiProvider').value = settings.aiProvider || 'groq';
  updateProviderFields();
  settingsModal.classList.add('show');
};

function updateProviderFields(){
  const sel = document.getElementById('setAiProvider').value;
  document.querySelectorAll('.provider-field').forEach(el=>{
    el.classList.toggle('show', el.dataset.provider === sel);
  });
}
document.addEventListener('change', (e)=>{
  if(e.target && e.target.id === 'setAiProvider') updateProviderFields();
});
document.getElementById('settingsClose').onclick = ()=>settingsModal.classList.remove('show');
settingsModal.addEventListener('click',e=>{if(e.target===settingsModal) settingsModal.classList.remove('show');});
document.getElementById('saveSettings').onclick = ()=>{
  settings.name = document.getElementById('setName').value.trim();
  settings.tmdbKey = document.getElementById('setTmdb').value.trim();
  settings.geminiKey = document.getElementById('setGemini').value.trim();
  settings.groqKey = document.getElementById('setGroq').value.trim();
  settings.openaiKey = document.getElementById('setOpenai').value.trim();
  settings.aiProvider = document.getElementById('setAiProvider').value;
  saveSettings();
  setGreeting();
  settingsModal.classList.remove('show');
  toast('Ajustes guardados ✨');
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
document.getElementById('importFile').addEventListener('change',(e)=>{
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

document.getElementById('profileEditBtn').addEventListener('click', ()=>{
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

document.getElementById('profileClose').onclick = ()=>profileModal.classList.remove('show');
document.getElementById('profCancel').onclick = ()=>profileModal.classList.remove('show');
profileModal.addEventListener('click', e=>{ if(e.target===profileModal) profileModal.classList.remove('show'); });

// Avatar
document.getElementById('uploadAvatarBtn').onclick = ()=>document.getElementById('uploadAvatarInput').click();
document.getElementById('uploadAvatarInput').addEventListener('change', async (e)=>{
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
avatarUrlInput.addEventListener('input', ()=>{
  const v = avatarUrlInput.value.trim();
  if(v) setProfilePreview('avatar', v);
});
document.getElementById('clearAvatarBtn').onclick = ()=>{
  setProfilePreview('avatar', '');
  avatarUrlInput.value = '';
};

// Banner
document.getElementById('uploadBannerBtn').onclick = ()=>document.getElementById('uploadBannerInput').click();
document.getElementById('uploadBannerInput').addEventListener('change', async (e)=>{
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
bannerUrlInput.addEventListener('input', ()=>{
  const v = bannerUrlInput.value.trim();
  if(v) setProfilePreview('banner', v);
});
document.getElementById('clearBannerBtn').onclick = ()=>{
  setProfilePreview('banner', '');
  bannerUrlInput.value = '';
};

document.getElementById('profSave').onclick = ()=>{
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
};

/* === Tabs === */
document.querySelectorAll('.cat-tab').forEach(t=>{
  t.addEventListener('click',()=>{
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
document.getElementById('fabAdd').addEventListener('click',()=>openAdd(currentCat));

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
  const catNames = { movies:'PELÍCULAS', series:'SERIES', music:'MÚSICA', books:'LIBROS', wishlist:'WISHLIST' };
  const catIcons = { movies:'🎬', series:'📺', music:'🎵', books:'📖', wishlist:'🎁' };

  let context = `Te llamás My Melody (sí, como la de Sanrio 🎀) y sos la mejor amiga virtual de ${name}. Una BFF de verdad — de esas con las que se habla de TODO: el día, cómo se siente, un chisme, un drama, un meme, la vida, la familia, lo random que se le ocurra. También viven juntas en "Mi Rinconcito ♡", su espacio donde colecciona pelis, series, libros, música y wishlist, pero eso es solo contexto extra, NO el tema obligatorio de toda charla.

🎯 REGLA DE ORO — ESCUCHÁ ANTES QUE NADA:
Tu trabajo principal es ESCUCHAR y RESPONDER a lo que ella dice. Si te cuenta que tuvo un mal día, le respondés sobre eso y le preguntás más. Si te cuenta un chisme, le seguís el chisme. Si está aburrida, charlás de cualquier cosa. Si te pregunta algo random, contestás eso y ya. NO desvíes la charla hacia sus listas a menos que ella te lo pida explícitamente.

❌ COSAS QUE NO HACÉS NUNCA (importante):
- NO redirijas la conversación hacia recomendaciones de cosas si ella no las pidió
- NO digas frases tipo "y hablando de eso, ¿viste tal peli?" o "esto me recuerda a tu wishlist"
- NO uses sus colecciones como gancho para cambiar de tema
- NO le hables romántico ni le digas "hermosa", "princesa", "mi vida", "mi amor", "linda"
- NO le hagas cumplidos sobre lo físico
- NO seas empalagosa, formal o robótica

✅ LO QUE SÍ HACÉS:
- Charlás de lo que sea: sentimientos, cosas del día, dramas, chistes, filosofía de las 3am, política liviana, sueños, miedos, cualquier tema
- Tirás halagos lindos cuando vienen al caso: sobre cómo piensa, su humor, sus ideas, su forma de ver las cosas ("amiga sos un genio", "qué buena la mirada que tenés sobre esto", "te re re escucho", "tenés razón total")
- Validás lo que siente, le hacés preguntas, mostrás interés genuino
- Tenés tu propia opinión y la compartís, aunque sea distinta a la suya (con respeto)
- Reaccionás real: "noooo no me digas", "ay amiga te entiendo", "pará pará pará", "literal", "obvio"
- Hablás natural: "amiga", "tipa", "che", "obvio", "literal", "tipo", "re"
- Usás emojis con onda 🎀✨💅🌸💕😭🤭 (pocos, sin saturar)
- SOLO recomendás pelis/libros/series/música/cosas cuando ella te lo pide directamente. Si te pregunta "¿qué peli puedo ver?" ahí sí usás su colección. Si no, ni la menciones.
- Sos breve: 3-5 oraciones promedio, podés extenderte hasta 7-8 si el tema lo amerita (algo emocional, una charla profunda)

${settings.bio ? `Lo que ella escribió de sí misma en su bio: "${settings.bio}"\n` : ''}
Lo que sabés de ${name} (esto es contexto extra para cuando ella te pida recomendaciones, NO el tema obligado de toda charla):
`;

  const cats = ['movies','series','music','books','wishlist'];
  let hasAny = false;
  for(const cat of cats){
    const list = state[cat] || [];
    if(list.length === 0) continue;
    hasAny = true;
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
        return line;
      }).join('; ');
      context += `  · ${label}: ${items}\n`;
    }
  }
  if(!hasAny){
    context += '\n(Su colección está vacía todavía. Animala a empezar pero como amiga, no como mami)\n';
  }

  context += `\nQué hacés bien (en este orden de importancia):
1. ESCUCHARLA y charlar de cualquier cosa que ella quiera: el día, sentimientos, dudas, chismes, random talk
2. Validarla, hacerle preguntas, mostrar interés en lo que le pasa
3. Tirarle halagos lindos sobre cómo piensa, su humor, su criterio (no físicos)
4. Tener charlas profundas si ella las quiere, o livianas si está para distraerse
5. SOLO si ella te lo pide explícitamente: recomendar pelis/series/libros/música/wishlist (con títulos reales y específicos)
6. Si te pide ayuda para elegir algo (tablet, makeup, figura), ahí sí dale tu opinión con marcas/modelos concretos

Recordá: ella vino a hablar con vos, no a que le promociones su propia colección. Charlá como amiga normal. 💕`;

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

document.getElementById('fabChat').addEventListener('click', async ()=>{
  if(!hasAIKey()){
    const ok = await customConfirm('My Melody necesita una clave para hablar contigo. Te recomiendo Groq (gratis sin tarjeta) o Gemini. ¿Abrimos ajustes ahora?', {
      title: 'My Melody se está vistiendo 🎀',
      okText: 'Sí, abrir ajustes',
      cancelText: 'Después'
    });
    if(ok) document.getElementById('settingsBtn').click();
    return;
  }
  chatModal.classList.add('show');
  renderChat();
  setTimeout(()=>chatInput.focus(), 120);
});

document.getElementById('chatClose').onclick = ()=>chatModal.classList.remove('show');
chatModal.addEventListener('click', e=>{ if(e.target===chatModal) chatModal.classList.remove('show'); });

const CHAT_SUGGESTIONS = [
  { emoji:'💬', text:'Charlemos', prompt:'Hola amiga, contame algo, ¿cómo estás vos?' },
  { emoji:'🥺', text:'Necesito desahogarme', prompt:'Necesito hablar de algo que me está pasando' },
  { emoji:'✨', text:'Algo lindo', prompt:'Decime algo lindo, necesito buena energía hoy' },
  { emoji:'🎬', text:'Recomendame una peli', prompt:'Recomendame una película según lo que ya me gustó' }
];

function renderChat(){
  if(chatHistory.length === 0){
    const name = settings.name || 'amiga';
    const sugg = CHAT_SUGGESTIONS.map(s=>`<button class="chat-sugg" data-prompt="${escAttr(s.prompt)}">${s.emoji} ${s.text}</button>`).join('');
    chatMessages.innerHTML = `
      <div class="chat-msg ai">¡Hola ${esc(name)}! 🎀 Soy My Melody, tu amiga acá en este rinconcito. Podemos hablar de lo que vos quieras — cómo te fue, algo que te pasó, lo random que sea. Te escucho ✨ ¿Qué onda?</div>
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

document.getElementById('chatSend').addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e=>{
  if(e.key==='Enter' && !e.shiftKey){
    e.preventDefault();
    sendChat();
  }
});

document.getElementById('chatClear').addEventListener('click', async ()=>{
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

/* === Init === */
spawnPetals();
applyTheme(settings.theme || 'melody');
render();
maybeShowSetup();
