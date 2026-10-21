(function(){var d=document.documentElement,k='hg-theme',s=document.getElementById('theme');
if(s){var sel=document.createElement('select'),cur='system';sel.setAttribute('aria-label','Theme');
[['system','System'],['light','Light'],['dark','Dark']].forEach(function(o){var e=document.createElement('option');e.value=o[0];e.textContent=o[1];sel.appendChild(e)});
try{cur=localStorage.getItem(k)||'system'}catch(e){}sel.value=cur;
sel.onchange=function(){try{localStorage.setItem(k,sel.value)}catch(e){}if(sel.value==='system')delete d.dataset.theme;else d.dataset.theme=sel.value};s.appendChild(sel)}
var t=document.querySelector('details.toc');if(t&&innerWidth<900)t.open=false})();
