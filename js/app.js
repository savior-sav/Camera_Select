// ===== Data =====
const SENSORS = {
  '1/4':{w:3.2,h:2.4,label:'1/4″'},'1/3':{w:4.8,h:3.6,label:'1/3″'},
  '1/2.5':{w:5.76,h:4.29,label:'1/2.5″'},'1/2':{w:6.4,h:4.8,label:'1/2″'},
  '1/1.8':{w:7.2,h:5.3,label:'1/1.8″'},'2/3':{w:8.8,h:6.6,label:'2/3″'},
  '1':{w:12.8,h:9.6,label:'1″'},'4/3':{w:17.3,h:13,label:'4/3″'},
  'aps-c':{w:23.6,h:15.7,label:'APS-C'}
};
const CAMERA_RECS = [
  {name:'130万',w:1280,h:1024,total:1.3e6},
  {name:'200万',w:1920,h:1080,total:2.1e6},
  {name:'500万',w:2592,h:1944,total:5.0e6},
  {name:'600万',w:3072,h:2048,total:6.3e6},
  {name:'1200万',w:4096,h:3000,total:12.3e6},
  {name:'2000万',w:5472,h:3648,total:20e6}
];
const INTF_LIMITS = {usb2:35,usb3:350,gige:100,'5gige':500,clink:680};
const INTF_NAMES = {usb2:'USB 2.0',usb3:'USB 3.0',gige:'GigE','5gige':'5GigE',clink:'CamLink'};
const INTF_IDS = ['usb2','usb3','gige','5gige','clink'];

// ===== Resolution =====
function calcResolution(){
  const fov=+document.getElementById('res-fov').value||1,p=+document.getElementById('res-prec').value||1,k=+document.getElementById('res-k').value||1;
  document.getElementById('res-k-hint').textContent='K = '+k.toFixed(1);
  const slider=document.getElementById('res-k'),pct=(k-slider.min)/(slider.max-slider.min)*100;
  slider.style.setProperty('--slider-pct',pct+'%');
  const px=fov/p,pxSafe=px*k;
  document.getElementById('res-val').textContent=Math.round(pxSafe);
  let best=CAMERA_RECS[0];
  for(const c of CAMERA_RECS){if(c.total>=pxSafe){best=c;break}}
  document.getElementById('res-sub').textContent='→ 推荐 '+best.name+' 像素 ('+best.w+'×'+best.h+')';
  document.getElementById('res-extra').innerHTML='<span>理论所需：<strong>'+Math.round(px)+'</strong> px</span><span>含K系数：<strong>'+Math.round(pxSafe)+'</strong> px</span><span>像素当量：<strong>'+(fov/best.w).toFixed(4)+'</strong> mm/px</span>';
}

// ===== Focal =====
function calcFocal(){
  const wd=+document.getElementById('foc-wd').value||100,fov=+document.getElementById('foc-fov').value||100;
  const s=SENSORS[document.getElementById('foc-sensor').value];if(!s)return;
  const f=wd*s.h/fov;
  const std=[2.8,4,6,8,10,12,16,20,25,35,50,75,100];
  const closest=std.reduce((a,b)=>Math.abs(b-f)<Math.abs(a-f)?b:a);
  document.getElementById('foc-val').textContent=Math.round(f*10)/10;
  document.getElementById('foc-sub').textContent='→ 可选用 '+closest+'mm 镜头（'+s.label+' 靶面）';
  const beta=s.h/fov;
  document.getElementById('foc-extra').innerHTML='<span>放大倍率 β：<strong>'+beta.toFixed(4)+'×</strong></span><span>靶面：<strong>'+s.w+'×'+s.h+'</strong> mm</span><span>等效35mm：<strong>'+(f*43.3/Math.sqrt(s.w**2+s.h**2)).toFixed(1)+'</strong> mm</span>';
  document.getElementById('exp-beta').value=beta.toFixed(4);
  calcExposure();
}

// ===== Exposure =====
function calcExposure(){
  const v=+document.getElementById('exp-v').value||100,pu=+document.getElementById('exp-pixel').value,beta=+document.getElementById('exp-beta').value||.01;
  const t=0.5*pu/1000/(v*beta)*1e6;
  document.getElementById('exp-val').textContent=t.toFixed(1);
  document.getElementById('exp-val').className='rval'+(t<50?' orange':t<200?' blue':' green');
  let s='';
  if(t<10)s='⚠️ 极短曝光，需强频闪光源，推荐线阵方案';
  else if(t<50)s='⚠️ 曝光窗口窄，需大光圈+强光频闪';
  else if(t<200)s='✓ 可配合常规频闪光源';
  else if(t<1000)s='✓ 普通LED常亮灯可用';
  else s='✓ 普通照明即可';
  document.getElementById('exp-sub').textContent=s;
}

// ===== Bandwidth =====
function calcBandwidth(){
  const w=+document.getElementById('bw-w').value||1,h=+document.getElementById('bw-h').value||1,fps=+document.getElementById('bw-fps').value||1,d=+document.getElementById('bw-depth').value||8;
  const bw=w*h*d*fps/8/1024/1024;
  document.getElementById('bw-val').textContent=bw.toFixed(1);
  const parts=[];
  for(const k of INTF_IDS){
    const ok=bw<INTF_LIMITS[k];
    parts.push((ok?'✓':'✗')+' '+INTF_NAMES[k]);
    const el=document.getElementById('intf-'+k);
    if(el){el.textContent=ok?'✓':'✗';el.className='intf-check '+(ok?'ok':'fail')}
  }
  let best='USB 2.0';
  for(const k of INTF_IDS){if(bw<INTF_LIMITS[k]){best=INTF_NAMES[k];break}}
  document.getElementById('bw-sub').textContent='→ '+parts.join(' · ');
  document.getElementById('bw-extra').innerHTML='<span>数据率：<strong>'+bw.toFixed(1)+'</strong> MB/s</span><span>总像素：<strong>'+(w*h/1e6).toFixed(2)+'</strong> MP</span>';
}

// ===== Framerate =====
function calcFps(){
  const v=+document.getElementById('fps-v').value||100,fov=+document.getElementById('fps-fov').value||100,L=+document.getElementById('fps-l').value||0,m=+document.getElementById('fps-margin').value||0;
  const eff=fov-L-m,fps=eff>0?v/eff:0;
  const el=document.getElementById('fps-val');
  el.textContent=fps>0?fps.toFixed(1):'—';
  el.className='rval'+(fps<1?' red':fps<30?' blue':' orange');
  let n='';
  if(fps<=0)n='⚠️ FOV过小，无法完整拍摄';
  else if(fps<1)n='帧率极低，触发间隔 >1s';
  else if(fps<10)n='低帧率需求，触发间隔 '+(1/fps).toFixed(2)+'s';
  else if(fps<30)n='中等帧率，多数面阵相机可用';
  else if(fps<100)n='较高帧率，建议选全局快门';
  else n='高帧率场景，建议线阵相机';
  document.getElementById('fps-sub').textContent=n;
}

// ===== Pixel Pitch =====
function calcPixelPitch(){
  const fov=+document.getElementById('pp-fov').value||1,res=+document.getElementById('pp-res').value||1,t=+document.getElementById('pp-target').value||.01;
  const pp=fov/res,k=t>0?t/pp:0;
  document.getElementById('pp-val').textContent=pp.toFixed(4);
  let sub='',cls='blue';
  if(k>=3){sub='✅ 满足需求 K≈'+k.toFixed(1);cls='green'}
  else if(k>=1){sub='⚠️ 勉强达标 K≈'+k.toFixed(1);cls='orange'}
  else{sub='❌ 不足！K≈'+k.toFixed(1);cls='red'}
  document.getElementById('pp-sub').textContent='→ '+sub;
  document.getElementById('pp-val').className='rval '+cls;
  document.getElementById('pp-extra').innerHTML='<span>安全系数 K：<strong>'+k.toFixed(2)+'</strong></span><span>若K≥3需：<strong>'+Math.round(fov/t*3)+'</strong> px</span>';
}

// ===== Line Scan =====
function calcLine(){
  const v=+document.getElementById('line-v').value||100,dy=+document.getElementById('line-dy').value||.01,fov=+document.getElementById('line-fov').value||100;
  const lr=v/dy,ppl=Math.ceil(fov/dy);
  const el=document.getElementById('line-val');
  el.textContent=Math.round(lr).toLocaleString('en-US');
  el.className='rval'+(lr>1e5?' orange':lr>2e4?' blue':' green');
  document.getElementById('line-sub').textContent='→ 每行约 '+ppl+' 像素 · 像素时钟 '+(lr*ppl/1e6).toFixed(1)+' MHz';
}

// ===== DOF =====
function calcDof(){
  const f=+document.getElementById('dof-f').value||4,beta=+document.getElementById('dof-beta').value||.01;
  const delta=3.45/1000,dof=2*f*delta*beta*1000;
  document.getElementById('dof-val').textContent=dof.toFixed(2);
  let n='';
  if(dof<.5)n='⚠️ 景深极浅，需精确调焦';
  else if(dof<2)n='⚠️ 景深较浅，注意工件高度一致性';
  else if(dof<10)n='✓ 景深常规范围';
  else n='✓ 景深充裕';
  document.getElementById('dof-sub').textContent='弥散圆 3.45µm · '+n;
}

// ===== Dock Active Highlight =====
function initDock(){
  const dockItems=document.querySelectorAll('.dock-item');
  const sections=document.querySelectorAll('section');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        dockItems.forEach(i=>i.classList.remove('active'));
        const el=document.querySelector('.dock-item[data-section="'+entry.target.id+'"]');
        if(el)el.classList.add('active');
      }
    });
  },{rootMargin:'-10% 0px -50% 0px'});
  sections.forEach(s=>observer.observe(s));

  // Click handler: immediately set active, bypass observer lag
  dockItems.forEach(item=>{
    item.addEventListener('click',function(){
      dockItems.forEach(i=>i.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ===== Update Recommendation =====
function updateRec(){
  // Resolution
  const fovRes=+document.getElementById('res-fov').value||50,prec=+document.getElementById('res-prec').value||.05,k=+document.getElementById('res-k').value||1;
  const pxSafe=Math.round(fovRes/prec*k);
  let best=CAMERA_RECS[0];
  for(const c of CAMERA_RECS){if(c.total>=pxSafe){best=c;break}}
  const pp=best?fovRes/best.w:0;
  document.getElementById('rec-res').textContent=best.w+' × '+best.h;
  document.getElementById('rec-resnote').textContent='像素当量 '+pp.toFixed(4)+' mm/px';

  // Camera type
  const fpsNeeded=+document.getElementById('fps-val').textContent||0;
  const lineRate=+document.getElementById('line-val').textContent.replace(/,/g,'')||0;
  const isLineScan=lineRate>1000;
  document.getElementById('rec-camtype').textContent=isLineScan?'线阵相机':'面阵相机';
  document.getElementById('rec-camnote').textContent=best.name+' 像素 '+(isLineScan?'CMOS':'CMOS');

  // Global shutter
  const expT=+document.getElementById('exp-val').textContent||999;
  const needGlobal=expT<200||fpsNeeded>30;
  document.getElementById('rec-cambadge').textContent=needGlobal?'全局快门':'卷帘/全局均可';

  // Focal
  document.getElementById('rec-focal').textContent=document.getElementById('foc-val').textContent+' mm';
  document.getElementById('rec-focalnote').textContent='配 '+SENSORS[document.getElementById('foc-sensor').value].label+' 靶面';

  // Interface
  const bw=+(document.getElementById('bw-val').textContent)||0;
  let bestIntf='USB 2.0';
  for(const k of INTF_IDS){if(bw<INTF_LIMITS[k]){bestIntf=INTF_NAMES[k];break}}
  document.getElementById('rec-intf').textContent=bestIntf;
  const ok=document.getElementById('intf-'+Object.keys(INTF_LIMITS).find(k=>INTF_NAMES[k]===bestIntf));
  document.getElementById('rec-intf').className='value'+(ok?.classList.contains('ok')?' green':' orange');
  document.getElementById('rec-intfnote').textContent=bw>0?'带宽 '+bw.toFixed(1)+' MB/s':'—';

  // Light
  let lightTxt='',lightNote='';
  if(expT<10){lightTxt='强频闪 LED';lightNote='曝光窗口仅 '+expT.toFixed(0)+' µs'}
  else if(expT<50){lightTxt='频闪 LED';lightNote='曝光 '+expT.toFixed(0)+' µs'}
  else if(expT<200){lightTxt='频闪 LED';lightNote='最大曝光 '+expT.toFixed(0)+' µs'}
  else{lightTxt='常亮 LED';lightNote='曝光充裕 '+expT.toFixed(0)+' µs'}
  document.getElementById('rec-light').textContent=lightTxt;
  document.getElementById('rec-lightnote').textContent=lightNote;

  // FPS
  document.getElementById('rec-fps').textContent=document.getElementById('fps-val').textContent+' FPS';
  document.getElementById('rec-fpsnote').textContent=fpsNeeded<10?'低帧率，常规满足':fpsNeeded<30?'中等帧率':'较高帧率需求';

  // Subtitle
  document.getElementById('rec-subtitle').textContent='基于上方所有输入参数的综合选型方案 · 参数自动同步';
}

// ===== Theme Toggle =====
function initTheme(){
  const saved=localStorage.getItem('camera-calc-theme');
  const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark=saved!=='light'&&(saved==='dark'||(!saved&&prefersDark));
  if(!isDark)document.body.classList.add('light-mode');
  updateThemeIcon(isDark);
}
function updateThemeIcon(isDark){
  const btn=document.getElementById('theme-toggle');
  if(btn)btn.textContent=isDark?'☀️':'🌙';
}
function toggleTheme(){
  const isLight=document.body.classList.toggle('light-mode');
  localStorage.setItem('camera-calc-theme',isLight?'light':'dark');
  updateThemeIcon(!isLight);
}

// ===== Input Parameters Display =====
function updateRecInputs(){
  const c=document.getElementById('rec-params');if(!c)return;
  const $=id=>document.getElementById(id),v=id=>$(id)?.value||'';
  const st=id=>{const e=$(id);return e?e.options[e.selectedIndex]?.text?.split(' (')[0]||'':''};
  c.innerHTML=[
    {t:'🔍 分辨率',i:[['视野 FOV',v('res-fov')+' mm'],['检测精度',v('res-prec')+' mm'],['安全系数 K',v('res-k')]]},
    {t:'🔭 焦距',i:[['工作距离 WD',v('foc-wd')+' mm'],['视野 FOV',v('foc-fov')+' mm'],['传感器',st('foc-sensor')]]},
    {t:'⚡ 曝光',i:[['运动速度',v('exp-v')+' mm/s'],['像素尺寸',st('exp-pixel')],['放大倍率 β',v('exp-beta')]]},
    {t:'📡 带宽',i:[['分辨率 W×H',v('bw-w')+'×'+v('bw-h')],['帧率',v('bw-fps')+' FPS'],['位深',st('bw-depth')]]},
    {t:'⏱ 帧率',i:[['运动速度',v('fps-v')+' mm/s'],['视野 FOV',v('fps-fov')+' mm'],['物体/边距',v('fps-l')+'/'+v('fps-margin')+' mm']]},
    {t:'📏 线阵 · 🌄 景深',i:[['线阵速度',v('line-v')+' mm/s'],['纵向精度 Δy',v('line-dy')+' mm'],['光圈 F/β',st('dof-f')+'/'+v('dof-beta')]]}
  ].map(g=>'<div class="rp-group"><div class="rp-group-title">'+g.t+'</div><div class="rp-group-grid">'+
    g.i.map(p=>'<div class="rp-cell"><span class="rp-label">'+p[0]+'</span><span class="rp-value">'+p[1]+'</span></div>').join('')+
  '</div></div>').join('');
}

// ===== Full Calculation =====
function calcAll(){
  calcResolution();calcFocal();calcExposure();calcBandwidth();calcFps();calcPixelPitch();calcLine();calcDof();updateRec();updateRecInputs();
}

// ===== Init =====
window.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  initDock();
  document.getElementById('theme-toggle')?.addEventListener('click',toggleTheme);

  // Input listeners
  const inputIds=['res-fov','res-prec','res-k','foc-wd','foc-fov','foc-sensor','exp-v','exp-pixel','bw-w','bw-h','bw-fps','bw-depth','fps-v','fps-fov','fps-l','fps-margin','pp-fov','pp-res','pp-target','line-v','line-dy','line-fov','dof-f','dof-beta'];
  inputIds.forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('input',calcAll);
  });

  // Refresh button
  document.getElementById('btn-refresh').addEventListener('click',()=>{
    calcAll();
    document.getElementById('overview')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // Back to top
  const backTop=document.getElementById('back-top');
  window.addEventListener('scroll',()=>{
    backTop.classList.toggle('visible',window.scrollY>window.innerHeight*0.6);
  });
  backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Initial calculation
  calcAll();
});
