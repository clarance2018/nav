if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,t)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let r={};const f=e=>n(e,o),c={module:{uri:o},exports:r,require:f};i[o]=Promise.all(s.map((e=>c[e]||f(e)))).then((e=>(t(...e),r)))}}define(["./workbox-12caf6bf"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-1d79eb5a.js",revision:null},{url:"assets/index-9f19d527.css",revision:null},{url:"index.html",revision:"d2e7429725601b1923621a2bfb805f78"},{url:"lib/iconfont.js",revision:"6c36a7e4d9bb8f63c92659af3dd865d0"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"icon/logo-144.png",revision:"773fb3bd137bdba4ad6038152bf0d238"},{url:"manifest.webmanifest",revision:"c06fe6c331d24cbd6f17079afdcc8bfa"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/(.*?)\.(woff2|woff|ttf)/,new e.CacheFirst({cacheName:"file-cache",plugins:[]}),"GET"),e.registerRoute(/(.*?)\.(webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,new e.CacheFirst({cacheName:"image-cache",plugins:[]}),"GET")}));
