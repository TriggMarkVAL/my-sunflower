let savedData = null; // { startISO, photo (base64 dataURL, optional) }

function formatDuration(ms){
  const totalSeconds = Math.floor(ms/1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400)/3600);
  const mins = Math.floor((totalSeconds % 3600)/60);
  const secs = totalSeconds % 60;
  return {days, hours, mins, secs};
}

function launchPetals(n){
  for(let i=0;i<n;i++){
    setTimeout(()=>{
      const p = document.createElement('div');
      p.className='petal-fall';
      p.style.left = Math.random()*100+'vw';
      p.style.animationDuration = (3+Math.random()*2)+'s';
      p.style.background = Math.random()>0.5 ? 'var(--sun)' : 'var(--sun-deep)';
      document.body.appendChild(p);
      setTimeout(()=>p.remove(), 6000);
    }, i*60);
  }
}

function renderPhotoSlot(){
  const slot = document.getElementById('yesPhotoSlot');
  if(savedData && savedData.photo){
    slot.innerHTML = `<img src="${savedData.photo}" alt="the day she said yes">`;
  } else {
    slot.innerHTML = `<label for="yesPhotoInput" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0.4em;">
      <span style="font-size:1.6rem;">＋</span>
      <span>add the photo<br>from today</span>
    </label>
    <input type="file" id="yesPhotoInput" accept="image/*" style="display:none;">`;
    document.getElementById('yesPhotoInput').addEventListener('change', handlePhotoUpload);
  }
}

function handlePhotoUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    const img = new Image();
    img.onload = ()=>{
      // resize down so the saved payload stays small
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      savedData.photo = dataUrl;
      renderPhotoSlot();
      saveYesMoment(savedData);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function startCounter(){
  const startDate = new Date(savedData.startISO);
  const sub = document.getElementById('counterSub');
  const dateStr = startDate.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
  const timeStr = startDate.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit'});
  sub.textContent = 'since ' + dateStr + ' · ' + timeStr;
  const mainEl = document.getElementById('counterMain');
  function tick(){
    const diff = Date.now() - startDate.getTime();
    const {days,hours,mins,secs} = formatDuration(Math.max(diff,0));
    mainEl.innerHTML = days + ' day' + (days===1?'':'s') +
      '<br><span style="font-size:0.4em;opacity:0.8">' +
      String(hours).padStart(2,'0')+':'+String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0') +
      '</span>';
  }
  tick();
  setInterval(tick, 1000);
  renderPhotoSlot();
  document.getElementById('question').style.display = 'none';
  document.getElementById('welcomeBackHeading').style.display = 'flex';
  document.getElementById('together').classList.add('show');
  document.getElementById('together').scrollIntoView({behavior:'smooth'});
}

async function checkExistingYes(){
  const data = await getYesMoment();
  if(data && data.startISO){
    savedData = data;
    startCounter();
  }
}

document.getElementById('yesBtn').addEventListener('click', async () => {
  const nowISO = new Date().toISOString();
  savedData = { startISO: nowISO };
  launchPetals(60);
  document.getElementById('yesBtn').disabled = true;
  document.getElementById('yesBtn').textContent = '🌻🌻🌻';
  await saveYesMoment(savedData);
  setTimeout(()=>{ startCounter(); }, 1200);
});

// bloom animation on scroll into view
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){ entry.target.classList.add('bloom'); }
  });
}, {threshold:0.4});
document.querySelectorAll('.sunflower-wrap').forEach(el=>observer.observe(el));

// wire up initial (pre-yes) photo input
const initialInput = document.getElementById('yesPhotoInput');
if(initialInput) initialInput.addEventListener('change', handlePhotoUpload);

checkExistingYes();
