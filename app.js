/* ==========================================================
   Mi Rincón Rosado · lógica de la app
   ========================================================== */

/* === Estado y persistencia === */
const STORAGE_KEY = 'cariList_v2';
const SETTINGS_KEY = 'cariList_settings_v2';

const defaultSettings = { name:'', tmdbKey:'' };
const emptyState = { movies:[], music:[], books:[], wishlist:[] };

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
    statusLabels:{ want:'Quiero verla', watched:'Vista', loved:'Favorita' },
    pillLabels:['💭 Quiero verla','✨ Ya la vi','💖 Me encantó'],
    countLabels:{ all:'Todas', want:'💭 Quiero ver', watched:'✨ Vistas', loved:'💖 Favoritas' }
  },
  music: {
    icon:'🎵',
    sectionTitle:'Tu Música',
    sectionSubtitle:'Canciones y álbumes que tocan tu corazón',
    metaLabel:'Artista / Álbum',
    statusLabels:{ want:'Quiero escuchar', watched:'Escuchada', loved:'Favorita' },
    pillLabels:['💭 Quiero escuchar','✨ Ya la escuché','💖 Me encantó'],
    countLabels:{ all:'Todas', want:'💭 Quiero escuchar', watched:'✨ Escuchadas', loved:'💖 Favoritas' }
  },
  books: {
    icon:'📖',
    sectionTitle:'Tus Libros',
    sectionSubtitle:'Páginas que te han marcado y aventuras por descubrir',
    metaLabel:'Autor / Año',
    statusLabels:{ want:'Quiero leer', watched:'Leído', loved:'Favorito' },
    pillLabels:['💭 Quiero leerlo','✨ Ya lo leí','💖 Me encantó'],
    countLabels:{ all:'Todos', want:'💭 Quiero leer', watched:'✨ Leídos', loved:'💖 Favoritos' }
  },
  wishlist: {
    icon:'🎁',
    sectionTitle:'Tu Wishlist',
    sectionSubtitle:'Todas las cositas lindas que sueñas con tener',
    metaLabel:'Categoría / Tienda',
    statusLabels:{ want:'Lo quiero', watched:'¡Lo tengo!', loved:'Top deseo' },
    pillLabels:['💭 Lo quiero','🎁 ¡Lo tengo!','💖 Top deseo'],
    countLabels:{ all:'Todos', want:'💭 Quiero', watched:'🎁 Lo tengo', loved:'💖 Top deseo' }
  }
};

/* === Petals === */
function spawnPetals(){
  const wrap = document.getElementById('petals');
  const colors = ['#f7b3c6','#fbd0dd','#f291ad','#fde4c9'];
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

/* === Render principal === */
function render(){
  setGreeting();
  renderStats();
  document.body.dataset.cat = currentCat;
  Object.keys(CAT_CONFIG).forEach(renderCategory);
}

function renderStats(){
  const stats = document.getElementById('stats');
  const totalMovies = state.movies.length;
  const totalMusic = state.music.length;
  const totalBooks = state.books.length;
  const totalWishlist = state.wishlist.length;
  const lovedAll = [...state.movies,...state.music,...state.books,...state.wishlist].filter(i=>i.status==='loved').length;
  const year = new Date().getFullYear();
  const thisYear = [...state.movies,...state.music,...state.books,...state.wishlist].filter(i=>{
    if(!i.dateAdded) return false;
    return new Date(i.dateAdded).getFullYear()===year;
  }).length;

  stats.innerHTML = `
    <div class="stat-card"><div class="stat-num">${totalMovies}</div><div class="stat-label">Películas</div></div>
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
  document.getElementById(`${cat}-count-want`).textContent = list.filter(i=>i.status==='want').length;
  document.getElementById(`${cat}-count-watched`).textContent = list.filter(i=>i.status==='watched').length;
  document.getElementById(`${cat}-count-loved`).textContent = list.filter(i=>i.status==='loved').length;

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
      else if(act==='fav') toggleFav(cat,id);
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
function toggleFav(cat,id){
  const item = state[cat].find(i=>i.id===id);
  if(!item) return;
  item.status = item.status==='loved' ? 'watched' : 'loved';
  saveState();
  render();
  toast(item.status==='loved'?'¡Marcado como favorito! 💖':'Movido a vistos ✨');
}
function cycleStatus(cat,id){
  const item = state[cat].find(i=>i.id===id);
  if(!item) return;
  const order = ['want','watched','loved'];
  item.status = order[(order.indexOf(item.status)+1) % order.length];
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

statusPills.querySelectorAll('.pill').forEach(p=>{
  p.addEventListener('click',()=>{
    statusPills.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
  });
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
    const dataUrl = await resizeImage(file, 800);
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

function applyModalLabels(cat){
  const conf = CAT_CONFIG[cat];
  document.getElementById('fMetaLabel').textContent = conf.metaLabel;
  const pills = statusPills.querySelectorAll('.pill');
  pills[0].textContent = conf.pillLabels[0];
  pills[1].textContent = conf.pillLabels[1];
  pills[2].textContent = conf.pillLabels[2];
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
  statusPills.querySelectorAll('.pill').forEach(p=>p.classList.toggle('active', p.dataset.status===(preset.status||'want')));
  applyModalLabels(cat);
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
  statusPills.querySelectorAll('.pill').forEach(p=>p.classList.toggle('active', p.dataset.status===item.status));
  applyModalLabels(cat);
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

deleteBtn.addEventListener('click',()=>{
  if(!editingId) return;
  if(!confirm('¿Eliminar este recuerdo? Esta acción no se puede deshacer.')) return;
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
  settingsModal.classList.add('show');
};
document.getElementById('settingsClose').onclick = ()=>settingsModal.classList.remove('show');
settingsModal.addEventListener('click',e=>{if(e.target===settingsModal) settingsModal.classList.remove('show');});
document.getElementById('saveSettings').onclick = ()=>{
  settings.name = document.getElementById('setName').value.trim();
  settings.tmdbKey = document.getElementById('setTmdb').value.trim();
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

async function searchBooks(q){
  if(!q) return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20&printType=books`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('Books error');
    const d = await r.json();
    return (d.items||[]).map(b=>{
      const v = b.volumeInfo || {};
      return {
        title: v.title || 'Sin título',
        meta: [(v.authors||[]).join(', '), v.publishedDate?v.publishedDate.slice(0,4):''].filter(Boolean).join(' • '),
        cover: (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail))?.replace('http:','https:') || ''
      };
    });
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

/* === Init === */
spawnPetals();
render();
maybeShowSetup();
