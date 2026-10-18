// The one blocking inline script: ?lang= and the saved language preference, plus the dismissed
// demo banner, applied before first paint. @aw/astro puts its SHA-256 into the page CSP.

export const LANG_SCRIPT =
  "(function(){var d=document.documentElement;try{if(localStorage.getItem('aw.demo')==='0')d.setAttribute('data-demo-dismissed','1')}catch(e){}" +
  "try{var p=location.pathname,q=new URLSearchParams(location.search),l=q.get('lang'),en=p==='/en/'||p==='/en'||p.indexOf('/en/')===0,pref=null;" +
  "if(p.indexOf('/owner')===0||p.indexOf('/pay/')===0)return;" +
  "try{pref=localStorage.getItem('aw.lang')}catch(e){}" +
  "if(l==='en'||l==='ar'){pref=l;try{localStorage.setItem('aw.lang',l)}catch(e){}document.cookie=l==='en'?'lang_en=1;path=/;max-age=31536000;samesite=lax':'lang_en=;path=/;max-age=0'}" +
  "if(l)q.delete('lang');var r=q.toString(),s=r?'?'+r:'',h=location.hash;" +
  "if(pref==='en'&&!en){location.replace('/en'+p+s+h)}else if(pref==='ar'&&en){location.replace(p.replace(/^\\/en(\\/|$)/,'/')+s+h)}else if(l&&history.replaceState){history.replaceState(null,'',p+s+h)}" +
  "}catch(e){}})();";
