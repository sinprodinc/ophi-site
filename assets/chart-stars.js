/* Bri, 31 Oct: the little chrome stars on the natal chart page, the same ones that turn on This Season and
   Make It Make Sense. They sit in the open space beside each section title and turn as they travel up the screen.
   A star that would touch any text, the wheel, a card or a button is left out, and the check runs again on resize. */
(function(){
  var SRC=['/assets/journal/chrome-star-2.webp','/assets/journal/chrome-star-5.webp','/assets/journal/chrome-star-7.webp','/assets/journal/chrome-star-3.webp'];
  var stars=[], calm=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BLOCK='p,h1,h2,h3,h4,li,td,th,label,button,a,input,select,.byline,.card,#wheel,.wheel-stage,.results,svg';
  function place(){
    stars.forEach(function(s){ s.remove(); }); stars=[];
    var heads=Array.prototype.slice.call(document.querySelectorAll('.band .sec-head'));
    heads.forEach(function(hd,i){
      var h2=hd.querySelector('h2'); if(!h2||!h2.offsetParent) return;
      var rg=document.createRange(); rg.selectNodeContents(h2); var t=rg.getBoundingClientRect(), b=hd.getBoundingClientRect();
      if(!t.width) return;
      if(getComputedStyle(hd).position==='static') hd.style.position='relative';
      var size=Math.round(Math.max(22,Math.min(32,innerWidth*.022))), gap=Math.max(18,innerWidth*.03);
      [[t.left-b.left-gap-size, -.15],[t.right-b.left+gap, .35]].forEach(function(spot,k){
        var x=spot[0], y=t.top-b.top+t.height*spot[1]+(k?6:-4);
        var im=new Image(); im.src=SRC[(i*2+k)%SRC.length]; im.alt=''; im.setAttribute('aria-hidden','true');
        im.className='np-star cs-star'; im.decoding='async';
        im.style.cssText='position:absolute;left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px;width:'+size+'px;height:'+size+'px;object-fit:contain;rotate:'+(k?16:-12)+'deg';
        hd.appendChild(im); stars.push(im);
      });
    });
    /* leave out any star that lands on text, the wheel, a card or a button, or runs off the screen */
    var blocks=Array.prototype.filter.call(document.querySelectorAll(BLOCK),function(e){ return e.offsetParent && !e.classList.contains('cs-star'); });
    stars=stars.filter(function(s){
      var a=s.getBoundingClientRect(), pad=6, bad=a.left<4||a.right>document.documentElement.clientWidth-4;
      for(var j=0;!bad&&j<blocks.length;j++){
        var e=blocks[j], rs;
        if(/^(H2|P|LI|TD|TH|LABEL|A|BUTTON)$/.test(e.tagName)||e.classList.contains('byline')){ var r2=document.createRange(); r2.selectNodeContents(e); rs=r2.getClientRects(); }
        else rs=[e.getBoundingClientRect()];
        for(var q=0;q<rs.length;q++){ var r=rs[q]; if(r.width&&r.height&&a.right+pad>r.left&&a.left-pad<r.right&&a.bottom+pad>r.top&&a.top-pad<r.bottom){ bad=true; break; } }
      }
      /* inside a framed box (the Serpent Bearer on desktop) a star stays well inside the frame */
      for(var box=s.parentElement; !bad && box && box!==document.body; box=box.parentElement){
        var cs=getComputedStyle(box);
        if(parseFloat(cs.borderLeftWidth)>0 && cs.borderLeftStyle!=='none' && parseFloat(cs.borderRightWidth)>0){
          var fb=box.getBoundingClientRect(); if(a.left<fb.left+14||a.right>fb.right-14||a.top<fb.top+10) bad=true; break; }
      }
      if(bad) s.remove();
      return !bad;
    });
    spin();
  }
  var dir=function(i){ return i%2?-1:1; }, queued=false;
  function spin(){ queued=false; if(calm) return; var vh=innerHeight||1;
    stars.forEach(function(s,i){ var r=s.getBoundingClientRect(); if(!r.height) return; var t=(r.top+r.height/2)/vh-.5;
      s.style.transform='rotate('+(Math.max(-1.2,Math.min(1.2,t))*-150*dir(i)).toFixed(1)+'deg)'; s.style.transition='transform .3s ease-out'; }); }
  function start(){
    place();
    addEventListener('scroll',function(){ if(!queued){ queued=true; requestAnimationFrame(spin); } },{passive:true});
    var rt=null; addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(place,180); });
    /* the page grows once a chart is cast: place them again */
    var form=document.getElementById('castForm'); if(form) form.addEventListener('submit',function(){ setTimeout(place,600); });
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(place);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
