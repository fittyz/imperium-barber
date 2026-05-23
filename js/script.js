document.addEventListener('DOMContentLoaded',function(){
  // Preloader
  const preloader = document.getElementById('preloader');
  setTimeout(()=>{
    if(preloader){preloader.style.opacity='0';setTimeout(()=>preloader.style.display='none',400)}
  },800);

  // Year
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  // Nav toggle for small screens
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(toggle && navLinks){
    toggle.addEventListener('click',()=>{
      navLinks.classList.toggle('open');
      navLinks.style.display = navLinks.classList.contains('open') ? 'flex' : '';
    });
    navLinks.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click',()=>{
        if(navLinks.classList.contains('open')){
          navLinks.classList.remove('open');
          navLinks.style.display='';
        }
      });
    });
  }

  // Smooth reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting) e.target.classList.add('visible')});
  },{threshold:0.12});
  document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
});

const reviewsKey = 'imperium_reviews';
const seedReviews = [
  {name:'João S.',text:'Atendimento impecável e corte com acabamento cinematográfico.',rating:5},
  {name:'Pedro M.',text:'Ambiente sofisticado, excelente profissionalismo. Voltarei sempre.',rating:5},
  {name:'Marcos T.',text:'Melhor barbearia da cidade, experiência premium do início ao fim.',rating:5}
];
function getReviews(){
  try{return JSON.parse(localStorage.getItem(reviewsKey)) || seedReviews;}catch(e){return seedReviews}
}
function renderReviews(){
  const reviewsContainer = document.getElementById('reviews-slider');
  const reviews = getReviews();
  if(!reviewsContainer) return;
  reviewsContainer.innerHTML = '';
  reviews.forEach(r=>{
    const el = document.createElement('blockquote');
    el.className = 'review';
    const stars = '<div class="stars">'+Array.from({length:r.rating}).map(()=>'<span class="star">★</span>').join('')+'</div>';
    el.innerHTML = `${stars}<p>"${r.text.replace(/</g,'&lt;')}"</p><cite>— ${r.name}</cite>`;
    reviewsContainer.appendChild(el);
  });
}

// initialize reviews on load
renderReviews();

// Optional: helper to open WhatsApp window centered
function openWhatsApp(phone){
  const url = `https://wa.me/${phone}`;
  window.open(url,'_blank');
}

/* ---------------- Reviews modal / form ---------------- */
// create review form HTML
function createReviewForm(){
  return `
    <h3>Deixe sua avaliação</h3>
    <div class="form-row"><label>Nome</label><input id="rv-name" class="input" placeholder="Seu nome"/></div>
    <div class="form-row"><label>Avaliação</label><textarea id="rv-text" placeholder="Conte como foi sua experiência..."></textarea></div>
    <div class="form-row"><label>Nota</label>
      <div class="rating-stars" id="rating-stars">
        <button data-value="1">★</button>
        <button data-value="2">★</button>
        <button data-value="3">★</button>
        <button data-value="4">★</button>
        <button data-value="5">★</button>
      </div>
    </div>
    <div style="display:flex;gap:.6rem;justify-content:flex-end;margin-top:.6rem">
      <button id="rv-cancel" class="btn-secondary">Cancelar</button>
      <button id="rv-submit" class="btn-primary">Enviar Avaliação</button>
    </div>
  `;
}

function openModal(html){
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  overlay.style.display = 'flex';
  content.innerHTML = html;
  document.getElementById('modal-close').onclick = closeModal;
}
function closeModal(){
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  overlay.style.display = 'none';
  content.innerHTML = '';
}

document.addEventListener('click',function(e){
  if(e.target && e.target.id==='open-review'){
    openModal(createReviewForm());
    // attach rating handlers
    const stars = document.querySelectorAll('#rating-stars button');
    let current = 5;
    stars.forEach(s=> s.addEventListener('click',()=>{
      current = parseInt(s.getAttribute('data-value'));
      stars.forEach(b=> b.classList.toggle('active', parseInt(b.getAttribute('data-value'))<=current));
    }));

    document.getElementById('rv-cancel').addEventListener('click',closeModal);
    document.getElementById('rv-submit').addEventListener('click',()=>{
      const name = (document.getElementById('rv-name').value || 'Cliente').trim();
      const text = (document.getElementById('rv-text').value || '').trim();
      if(!text){alert('Por favor escreva um comentário.');return}
      const rv = {name,text,rating:current};
      try{
        const key = 'imperium_reviews';
        const arr = JSON.parse(localStorage.getItem(key)) || [];
        arr.unshift(rv);
        localStorage.setItem(key, JSON.stringify(arr));
      }catch(e){console.error(e)}
      // re-render (simple reload)
      location.reload();
    });
  }
});

/* ---------------- Gallery admin ---------------- */
function renderGallery(){
  const key = 'imperium_gallery';
  const container = document.getElementById('gallery-grid');
  let imgs = [];
  try{imgs = JSON.parse(localStorage.getItem(key)) || [
    'assets/images/gallery-1.svg',
    'assets/images/gallery-2.svg',
    'assets/images/gallery-3.svg',
    'assets/images/gallery-4.svg',
    'assets/images/gallery-5.svg',
    'assets/images/gallery-6.svg',
    'assets/images/gallery-7.svg',
    'assets/images/gallery-8.svg',
    'assets/images/gallery-9.svg',
    'assets/images/gallery-10.svg',
    'assets/images/gallery-11.svg',
    'assets/images/gallery-12.svg'
  ];}catch(e){imgs = []}
  container.innerHTML = '';
  imgs.forEach((u,i)=>{
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.style.backgroundImage = `url('${u}')`;
    // remove btn
    const btn = document.createElement('button');
    btn.className = 'remove-btn';
    btn.textContent = 'Remover';
    btn.addEventListener('click',()=>{
      if(!isAdmin()) return alert('Apenas administrador pode remover fotos.');
      imgs.splice(i,1);
      localStorage.setItem(key, JSON.stringify(imgs));
      renderGallery();
    });
    el.appendChild(btn);
    container.appendChild(el);
  });
  updateAdminUI();
}

function isAdmin(){return sessionStorage.getItem('imperium_admin')==='1'}
function updateAdminUI(){
  const adminEls = document.querySelectorAll('.admin-only');
  adminEls.forEach(el=> el.style.display = isAdmin()? (el.classList.contains('btn-primary')? 'inline-block':'inline-block') : 'none');
  // show remove buttons on gallery items
  document.querySelectorAll('.gallery-item .remove-btn').forEach(b=> b.style.display = isAdmin()? 'block':'none');
}

document.addEventListener('click',function(e){
  if(e.target && e.target.id==='admin-enter'){
    const pass = prompt('Senha de administrador:');
    // default demo password: imperiumadmin
    if(pass === 'imperiumadmin'){
      sessionStorage.setItem('imperium_admin','1');
      alert('Acesso de administrador ativado.');
      updateAdminUI();
    }else{alert('Senha inválida.')}
  }
  if(e.target && e.target.id==='add-photo-btn'){
    openModal(`<h3>Adicionar foto à galeria</h3>
      <div class="form-row"><label>URL da imagem</label><input id="img-url" class="input" placeholder="https://..."/></div>
      <div class="form-row"><label>Ou selecione um arquivo</label><input id="img-file" type="file" accept="image/*" class="input"/></div>
      <div style="display:flex;justify-content:flex-end;gap:.6rem"><button id="img-cancel" class="btn-secondary">Cancelar</button><button id="img-add" class="btn-primary">Adicionar</button></div>
    `);
    document.getElementById('img-cancel').addEventListener('click',closeModal);
    document.getElementById('img-add').addEventListener('click',()=>{
      const fileInput = document.getElementById('img-file');
      const urlInput = document.getElementById('img-url').value.trim();
      const key = 'imperium_gallery';
      const arr = JSON.parse(localStorage.getItem(key)) || [];
      const addImage = (src)=>{
        arr.unshift(src);
        localStorage.setItem(key, JSON.stringify(arr));
        closeModal();
        renderGallery();
      };
      if(fileInput && fileInput.files && fileInput.files.length){
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = ()=> addImage(reader.result);
        reader.readAsDataURL(file);
        return;
      }
      if(urlInput){
        addImage(urlInput);
        return;
      }
      alert('Insira uma URL ou selecione um arquivo de imagem.');
    });
  }
  if(e.target && e.target.id==='clear-data-btn'){
    if(confirm('Deseja realmente limpar todas as fotos e avaliações adicionadas?')){
      localStorage.removeItem('imperium_gallery');
      localStorage.removeItem('imperium_reviews');
      sessionStorage.removeItem('imperium_admin');
      renderGallery();
      renderReviews();
      updateAdminUI();
      closeModal();
      alert('Dados limpos com sucesso.');
    }
  }
});

// initialize gallery on load
document.addEventListener('DOMContentLoaded',function(){renderGallery();updateAdminUI();});

