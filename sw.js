const VERSION="3bec4d378446d9b4", RELEASE="0.27.24", ASSETS=["./index.html","./PLAY.html","./squad.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
const PREFIX='afterlight-'+encodeURIComponent(self.registration.scope)+'-',CACHE=PREFIX+VERSION;
const inScope=url=>{const scope=new URL(self.registration.scope);return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);};
const knownAsset=url=>{const scope=new URL(self.registration.scope),relative='./'+url.pathname.slice(scope.pathname.length);return relative==='./'||ASSETS.includes(relative);};
// A new worker never activates with a partial cache. If any file fails, this
// candidate cache is removed and the previously active release stays usable.
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));for(const path of ASSETS.filter(path=>path.endsWith('.html'))){const response=await cache.match(new URL(path,self.registration.scope).href),html=await response.text();if(!html.includes('<meta name="afterlight-release" content="'+RELEASE+'">')||!html.includes('/* Embedded: squad-ui.js */')||html.includes('<script src='))throw Error('Incomplete or mixed game release');}await self.skipWaiting();}catch(error){await caches.delete(CACHE);throw error;}})()));
// Only versioned game caches are removed. localStorage, IndexedDB and all save
// formats are deliberately outside this worker and are never touched here.
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
// Online requests always win. The offline fallback reads the last fully
// installed release; individual responses are not written into it, preventing
// a half-published deployment from creating a mixed offline build.
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(!inScope(url)||!knownAsset(url))return;event.respondWith((async()=>{try{const response=await fetch(new Request(event.request,{cache:'no-cache'}));if(!response.ok)throw Error('Game request failed: '+response.status);return response;}catch(error){const cache=await caches.open(CACHE),key=url.pathname===new URL(self.registration.scope).pathname?new URL('index.html',self.registration.scope).href:event.request,cached=await cache.match(key,{ignoreSearch:true});if(cached)return cached;throw error;}})());});
