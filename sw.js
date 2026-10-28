// Service Worker IBV Begehung Mobil: App läuft auch ohne Netz.
// Online: immer die neueste index.html (bei schlechtem Netz nach 3 s Wechsel auf die gespeicherte Kopie).
const CACHE='ibv-mobil-v1';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.add(new Request('./index.html',{cache:'reload'}))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||r.mode!=='navigate')return; // Supabase, CDN usw. bleiben unberührt
  const net=fetch(r).then(res=>{
    if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));}
    return res;
  });
  const limit=new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),3000));
  e.respondWith(Promise.race([net,limit]).catch(()=>caches.match('./index.html').then(x=>x||net)));
});
