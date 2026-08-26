const IMG = "";
let brinsActuels = 3;
let configVisuels = null;

async function chargerConfiguration() {
  const r = await fetch('config/visuels.json', {cache:'no-store'});
  if (!r.ok) throw new Error('Impossible de charger config/visuels.json');
  configVisuels = await r.json();
}

function changerBrins(nombre, element) {
  brinsActuels = nombre;
  document.querySelectorAll('.grid-options .btn-option').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
  const conteneur = document.getElementById('conteneur-brins');
  conteneur.innerHTML = '';
  for (let i=1;i<=nombre;i++) {
    const div=document.createElement('div'); div.className='brin-selector';
    div.innerHTML=`<div class="brin-header">Brin ${i}</div><div class="select-group"><select id="mat-${i}"><option value="">-- Matière --</option></select><select id="coul-${i}" disabled><option value="">-- Couleur / motif --</option></select></div><img class="swatch" id="swatch-${i}" alt="Aperçu tissu">`;
    conteneur.appendChild(div);
    const mat=div.querySelector(`#mat-${i}`), coul=div.querySelector(`#coul-${i}`);
    Object.keys(configVisuels.materials).forEach(m=>mat.add(new Option(m,m)));
    mat.addEventListener('change',()=>{
      coul.innerHTML='<option value="">-- Couleur / motif --</option>'; coul.disabled=!mat.value;
      if(mat.value) Object.keys(configVisuels.materials[mat.value].colors).forEach(c=>coul.add(new Option(c,c)));
      mettreAJourVisuel(i);
    });
    coul.addEventListener('change',()=>mettreAJourVisuel(i));
  }
  actualiserPreview();
}

function cheminVisuel(mat,coul,usage='choice') {
  const item=configVisuels.materials?.[mat]?.colors?.[coul];
  return item ? (usage==='texture' ? item.texture : item.choice) : '';
}

function mettreAJourVisuel(i) {
  const mat=document.getElementById(`mat-${i}`)?.value;
  const coul=document.getElementById(`coul-${i}`)?.value;
  const swatch=document.getElementById(`swatch-${i}`);
  if(mat&&coul){ swatch.src=cheminVisuel(mat,coul,'choice'); swatch.style.display='block'; }
  else {swatch.removeAttribute('src'); swatch.style.display='none';}
  actualiserPreview();
}

function actualiserPreview(){
  if(!configVisuels) return;
  const stage=document.getElementById('braid-stage');
  const overlay=document.getElementById('braid-overlay');
  overlay.src=configVisuels.overlay[String(brinsActuels)];
  const ids=brinsActuels===4?['preview-4-1','preview-4-2','preview-4-3','preview-4-4']:['preview-1','preview-2','preview-3'];
  document.querySelectorAll('.texture-layer').forEach(box=>{box.style.opacity='0';box.style.display='none';box.style.backgroundImage='none';box.style.backgroundRepeat='no-repeat';box.style.backgroundSize='100% 100%';box.style.backgroundPosition='center';box.style.backgroundBlendMode='normal';box.style.maskImage='none';box.style.webkitMaskImage='none';box.style.filter='saturate(.95)';});
  let any=false;
  ids.forEach((id,index)=>{
    const box=document.getElementById(id); if(!box)return;
    const i=index+1, mat=document.getElementById(`mat-${i}`)?.value, coul=document.getElementById(`coul-${i}`)?.value;
    if(!(mat&&coul)) return;
    const structures=configVisuels.materials?.[mat]?.structures?.[String(brinsActuels)];
    const structure=structures?.[index]; if(!structure) return;
    const texture=cheminVisuel(mat,coul,'texture');
    box.style.display='block'; box.style.opacity='1';
    box.style.maskImage=`url("${structure}")`; box.style.webkitMaskImage=`url("${structure}")`;
    box.style.backgroundColor='transparent';
    const render = configVisuels.materials?.[mat]?.render || {};
    const repeatTexture = !!render.repeat;
    const textureSize = render.size || 'cover';
    const texturePosition = render.position || 'center center';
    if(mat==="Nid d'abeille") {
      // Nid d'abeille : conserver le vrai gaufrage de la photo texture
      // tout en utilisant la structure PNG pour la forme exacte du brin.
      // La structure est placée au-dessus de la texture et son blanc
      // n'écrase pas la photo : il ne fait que renforcer légèrement les reliefs.
      const color = configVisuels.materials?.[mat]?.colors?.[coul]?.color || '#ffffff';
      box.style.backgroundColor = color;
      box.style.backgroundImage = `url("${structure}"), url("${texture}")`;
      box.style.backgroundRepeat = `no-repeat, ${repeatTexture ? 'repeat' : 'no-repeat'}`;
      box.style.backgroundSize = `100% 100%, ${textureSize}`;
      box.style.backgroundPosition = `center center, ${texturePosition}`;
      box.style.backgroundBlendMode = 'multiply, normal';
      box.style.filter = 'saturate(.98) brightness(1.03)';
    } else if(mat==='Double gaze uni' || mat==='Double gaze à pois or') {
      // Double gaze : la texture photo doit rester la couche visible principale.
      // L'ancienne combinaison texture + structure + overlay multipliait les ombres
      // et rendait surtout les blancs gris. La structure sert uniquement de masque.
      box.style.backgroundColor = 'transparent';
      box.style.backgroundImage = `url("${texture}")`;
      box.style.backgroundRepeat = repeatTexture ? 'repeat' : 'no-repeat';
      box.style.backgroundSize = textureSize;
      box.style.backgroundPosition = texturePosition;
      box.style.backgroundBlendMode = 'normal';
      box.style.filter = 'brightness(1.16) saturate(1.02)';
      if((mat==='Double gaze uni' && coul==='Blanc') || (mat==='Double gaze à pois or' && coul==='Blanc à pois or')) {
        box.style.filter = 'brightness(1.28) saturate(1.01)';
      }
    } else if(mat==='Fantaisies') {
      box.style.backgroundImage=`url("${texture}")`;
      box.style.backgroundRepeat=repeatTexture ? 'repeat' : 'no-repeat';
      box.style.backgroundSize=textureSize;
      box.style.backgroundPosition=texturePosition;
      box.style.backgroundBlendMode='normal';
    } else {
      box.style.backgroundImage=`url("${structure}"), url("${texture}")`;
      box.style.backgroundSize=`100% 100%, ${textureSize}`;
      box.style.backgroundPosition=`center center, ${texturePosition}`;
      box.style.backgroundRepeat=`no-repeat, ${repeatTexture ? 'repeat' : 'no-repeat'}`;
    }
    any=true;
  });
  const hasDoubleGaze = Array.from({length: brinsActuels}, (_,k)=>k+1).some(i => {
    const m=document.getElementById(`mat-${i}`)?.value;
    return m==='Double gaze uni' || m==='Double gaze à pois or';
  });
  // Réduit fortement l'overlay de relief quand une double gaze est utilisée,
  // afin d'éviter l'assombrissement et le blanc grisâtre.
  overlay.style.opacity = hasDoubleGaze ? '.12' : '.42';
  overlay.style.mixBlendMode = hasDoubleGaze ? 'normal' : 'multiply';
  document.getElementById('placeholder').style.display=any?'none':'flex';
  stage.style.display=any?'block':'none';
  document.getElementById('zone-visuel').classList.toggle('a-config',any);
}

async function copierTexte(texte){
  if(navigator.clipboard&&window.isSecureContext) return navigator.clipboard.writeText(texte);
  const t=document.createElement('textarea');t.value=texte;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();
}

async function envoyerCommande(){
  const longueur=document.getElementById('select-longueur').value;
  if(!longueur)return alert('Veuillez sélectionner la longueur de la tresse.');
  const resume=[`Modèle: ${brinsActuels} brins`,`Longueur: ${longueur}`];let complet=true;
  for(let i=1;i<=brinsActuels;i++){const mat=document.getElementById(`mat-${i}`).value,coul=document.getElementById(`coul-${i}`).value;if(mat&&coul)resume.push(`Brin ${i}: ${mat} (${coul})`);else complet=false;}
  if(!complet)return alert('Veuillez choisir la matière et la couleur pour chaque brin.');
  const texteConfig=resume.join(' | ');try{await copierTexte(texteConfig)}catch(e){}
  alert('Configuration copiée !\n\n'+texteConfig+'\n\nVous allez être redirigée vers la boutique. Pensez à coller ce résumé dans le champ Note/Message.');
  window.location.href=configVisuels.sumup;
}

(async()=>{try{await chargerConfiguration();changerBrins(3,document.querySelector('.btn-option.active'));}catch(e){console.error(e);alert('Impossible de charger la configuration des visuels. Vérifiez le fichier config/visuels.json.');}})();
