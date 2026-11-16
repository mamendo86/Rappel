// Rappel - service worker. Pagina e manifest: PRIMA la rete (versione nuova subito), copia salvata solo se offline o lenta.
const C='rappel-cache-v6',F=['index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'],T=4000;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('rappel-')&&x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const doc=u=>u.pathname.endsWith('/')||/\.(html|json)$/.test(u.pathname);
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(caches.open(C).then(c=>{
  const net=fetch(new Request(r.url,{cache:'no-cache'})).then(x=>{if(x.ok)c.put(r,x.clone());return x});
  const old=()=>c.match(r,{ignoreSearch:true}).then(m=>m||c.match('index.html'));
  if(doc(u))return Promise.race([net,new Promise((_,j)=>setTimeout(j,T))]).catch(()=>old().then(m=>m||net));
  return c.match(r).then(m=>{net.catch(()=>{});return m||net})}))});
