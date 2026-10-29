
(function(){
  /* boxes in real screen pixels in every browser (see OPHI_BOX in the page head) */
  var BOX=function(el){ return window.OPHI_BOX?window.OPHI_BOX(el):el.getBoundingClientRect(); };
  /* custom cursor + trailing orb (desktop, motion-ok only) */
  try{
    if(window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var dot=document.querySelector('.cursor-dot'), orb=document.querySelector('.cursor-orb');
      if(dot&&orb){
        document.body.classList.add('custom-cursor');
        var mx=innerWidth/2,my=innerHeight/2,dx=mx,dy=my,ox=mx,oy=my,ready=false;
        dot.style.opacity='0';orb.style.opacity='0';
        addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;
          if(!ready){ready=true;dot.style.opacity='1';orb.style.opacity='.85';}},{passive:true});
        Array.prototype.forEach.call(document.querySelectorAll('a,button,[role=button]'),function(el){
          el.addEventListener('mouseenter',function(){document.body.classList.add('cur-hover');});
          el.addEventListener('mouseleave',function(){document.body.classList.remove('cur-hover');});
        });
        (function loop(){
          dx=mx; dy=my;
          ox+=(mx-ox)*0.12; oy+=(my-oy)*0.12;
          var z=window.OPHI_Z||1;   /* the page may be zoomed to fit a wide window: pointer positions are in window pixels */
          dot.style.transform='translate('+dx/z+'px,'+dy/z+'px)';
          orb.style.transform='translate('+ox/z+'px,'+oy/z+'px) translate(-50%,-50%)';
          requestAnimationFrame(loop);
        })();
      }
    }
  }catch(e){}

  /* scroll reveal */
  try{
    if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches && 'IntersectionObserver' in window){
      var sel='.sec-head,.why-spread,.tq-carousel,.price-inner,.cta-final > p,.cta-final .cta,.marquee';
      var els=Array.prototype.slice.call(document.querySelectorAll(sel));
      els.forEach(function(el){el.classList.add('reveal');});
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
      },{threshold:0.1, rootMargin:'0px 0px -6% 0px'});
      els.forEach(function(el){io.observe(el);});
    }
  }catch(e){}

  /* floating relics.
     Scrolling down, each stamp swells (and thins out) as it leaves by the top of the screen; scrolling back up it shrinks
     to its resting size and spot. Stamps on the first screen start growing with the very first scroll; the rest hold their
     size while their section is being read and only start once they pass the upper part of the screen.
     Each also slides and tips a little on the way through. */
  /* This Season: fill the page from assets/season-data.js for the current month (Pacific time).
     Bri, 29 Oct: newspaper layout. Front: month, year, theme (post.title), summary (post.summary, else post.takeaway).
     Paper (below the rising cards): the body's first "## " section is the lead article, later sections follow;
     "~ " lines are pulled out in Bri's hand; a paragraph that is just [[name]] places that month's graphic
     (assets/season/<yyyy-mm>/<name>.webp) in the story, or beside the section when it opens the section.
     post.dates = [{date:"Oct 3", text:"..."}] lists the key dates (post.when is shown when there are none).
     post.stickers = graphics scattered in the margins (slots 1-8), post.side = a graphic under the sidebar,
     post.art = {name:{alt:"..."}} for graphics that carry meaning (the rest are decoration). */
  try{
    var DATA=window.OPHI_SEASON;
    if(DATA && document.querySelector('.ts-mast')){
      var ym=(function(){ try{ var f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit'}).formatToParts(new Date());
        var y,m; f.forEach(function(p){ if(p.type==='year') y=p.value; if(p.type==='month') m=p.value; }); return y+'-'+m; }catch(e){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2); } })();
      var keys=Object.keys(DATA).sort(), key=null;
      keys.forEach(function(k){ if(k<=ym && DATA[k].post && DATA[k].post.ready) key=k; });  /* the newest finished month; an unfinished month never replaces it */
      if(!key) key=keys[0];
      var M=DATA[key], P=M.post||{}, esc=function(t){ return String(t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
      var rich=function(t){ return esc(t).replace(/\*([^*]+)\*/g,'<em>$1</em>'); };
      var ART=P.art||{}, side=0;
      var artSrc=function(n){ return '/assets/season/'+key+'/'+n+'.webp'; };
      var artImg=function(n,cls){ var a=ART[n]||{}; return '<img class="'+cls+'" src="'+artSrc(n)+'" alt="'+esc(a.alt||'')+'"'+(a.alt?'':' aria-hidden="true"')+' loading="lazy" decoding="async">'; };
      /* paragraphs are separated by a blank line; "## " is a small heading, "~ " is in Bri's hand, [[name]] is a graphic */
      var paras=function(t){ return String(t||'').split(/\n\s*\n/).map(function(x){ x=x.trim(); var g=x.match(/^\[\[([\w-]+)\]\]$/);
        if(g){ side++; return '<figure class="ts-art ts-art-'+(side%2?'r':'l')+' duo-sway">'+artImg(g[1],'')+'</figure>'; }
        return /^## /.test(x)?'<h4 class="sub-h">'+rich(x.slice(3))+'</h4>':/^~ /.test(x)?'<p class="ts-pen">'+rich(x.slice(2))+'</p>':'<p>'+rich(x)+'</p>'; }).join(''); };
      var lab=String(M.label||''), mo=lab.replace(/\s*\d{4}\s*$/,''), yr=(lab.match(/\d{4}/)||[''])[0];
      Array.prototype.forEach.call(document.querySelectorAll('[data-month]'),function(el){ el.textContent=el.textContent.replace(/^[A-Z][a-z]+ \d{4}/,lab); });
      var q=function(sel){ return document.querySelector(sel); };
      q('[data-ts-month]').textContent=mo; q('[data-ts-year]').textContent=yr;
      if(P.ready){
        q('[data-ts-theme]').innerHTML=rich(P.title);
        q('[data-ts-sum]').innerHTML=rich(P.summary||P.takeaway||'');
        /* the paper */
        var paper=q('[data-ts-paper]'), secs=[], cur=null;
        String(P.body||'').split(/\n\s*\n/).forEach(function(x){ var h=x.trim().match(/^## (.+)$/);
          if(h){ cur={h:h[1],t:[]}; secs.push(cur); } else { if(!cur){ cur={h:'',t:[]}; secs.push(cur); } cur.t.push(x); } });
        if(secs.length){
          var lead=secs[0];
          if(lead.h) q('[data-ts-lead-k]').textContent=lead.h.replace(/\*/g,'');
          q('[data-ts-lead-h]').innerHTML=rich(P.title);
          q('[data-ts-lead-body]').innerHTML=paras(lead.t.join('\n\n'));
          q('[data-ts-more]').innerHTML=secs.slice(1).map(function(sc){
            var first=String(sc.t[0]||'').trim().match(/^\[\[([\w-]+)\]\]$/), rest=first?sc.t.slice(1):sc.t;
            return '<article class="np-story ts-sec'+(first?' has-fig':'')+'">'+
              (first?'<figure class="ts-fig duo-sway">'+artImg(first[1],'')+'</figure>':'')+
              '<div class="ts-sec-in"><h3 class="np-h">'+rich(sc.h)+'</h3><div class="np-cols ts-body">'+paras(rest.join('\n\n'))+'</div></div></article>';
          }).join('');
          var dl=q('[data-ts-dates]');
          if(P.dates && P.dates.length) dl.innerHTML=P.dates.map(function(d){ var m2=String(d.date).match(/^(\D*?)\s*(\d+)$/)||[0,'',d.date];
            return '<li><span class="ts-d"><b>'+esc(m2[2])+'</b><i>'+esc(m2[1])+'</i></span><span class="ts-dt">'+rich(d.text)+'</span></li>'; }).join('');
          else dl.outerHTML='<p>'+rich(P.when||'')+'</p>';
          q('[data-ts-what]').innerHTML=rich(P.what||'');
          if(P.side) q('[data-ts-side-art]').innerHTML=artImg(P.side,'duo-sway');
          if(M.closing && M.closing.body){ q('[data-ts-close-k]').innerHTML=rich(M.closing.title||''); q('[data-ts-close-b]').innerHTML=paras(M.closing.body); q('[data-ts-close]').hidden=false; }
          /* each sticker slot lives in an open space: above the paper (1, 2), the sidebar (3, 7), the corner of the
             second article's graphic (4) and around the closing note (5, 6, 8) */
          var HOST=['.ts-paper .np-page','.ts-paper .np-page','.ts-what','.ts-fig','.ts-close','.ts-close','.ts-side-art','.ts-close'],
              MOVE=[[14,18,40],[-16,14,-44],[10,12,60],[-12,14,-40],[16,16,28],[-18,18,-50],[12,14,36],[-14,16,-70]];
          (P.stickers||[]).slice(0,8).forEach(function(n,i){
            var host=q(HOST[i])||q('.ts-paper .np-page');
            host.insertAdjacentHTML('beforeend',artImg(n,'ts-sticker ts-st'+(i+1)).replace('<img ','<img data-drift="'+MOVE[i].join(' ')+' .1" '));
          });
          paper.hidden=false; q('[data-ts-jump]').hidden=false;
        }
      }
      var ri=document.querySelector('[data-rising-intro]');
      if(ri && M.risingIntro){ ri.innerHTML=rich(M.risingIntro); ri.hidden=false; }
      Object.keys(M.signs||{}).forEach(function(s){
        var c=M.signs[s], li=document.querySelector('.rising[data-sign="'+s+'"]'); if(!li||!c) return;
        if(c.teaser){ var tg=li.querySelector('.tagline'); if(tg) tg.textContent=c.teaser; }   /* the month's teaser replaces the sign's standing tagline */
        if(!c.ready) return;
        var ch=li.querySelector('.chapter');
        ch.querySelector('h4').innerHTML=rich(c.title);
        Array.prototype.forEach.call(ch.querySelectorAll(':scope > div > p'),function(p){ p.remove(); });
        ch.querySelector(':scope > div').insertAdjacentHTML('beforeend',paras(c.body));
        if(c.house){ var mt=ch.querySelector('.meta'); if(mt) mt.textContent=M.label+' ✦ '+c.house; }
        var ul=ch.querySelector('aside ul'), k=ch.querySelector('aside .k');
        if(c.note){ k.textContent='Remember'; ul.outerHTML='<p class="note">'+rich(c.note)+'</p>'; }
        else if(c.tries && c.tries.length) ul.innerHTML=c.tries.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join('');
        else ch.querySelector('aside').querySelectorAll('.k,ul').forEach(function(n){ n.remove(); });
      });
    }
  }catch(e){ if(window.console) console.error(e); }

  try{
    /* All of Bri's doodles (edge doodles, small accents, the testimonial bow, the pink glitter stars, the quote heart) get the same swell; they keep their own tilt (CSS transform)
       because the motion uses the separate translate / rotate / scale properties */
    var relics=Array.prototype.slice.call(document.querySelectorAll('.relic, .bleed, .accent, .ink-stamp, .eph.car-bow, .eph.words-stars, .in-heart'));
    if(relics.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      relics.forEach(function(el){
        if(el.classList.contains('set')) return;
        el.style.setProperty('--rs',(0.8+Math.random()*0.2).toFixed(2));
        el.style.setProperty('--rt',((Math.random()*2-1)*6).toFixed(1)+'deg');
      });
      var queued=false, vh=0, GROW=1.15;
      /* Stamps marked data-dodge step out of the way of the nav buttons and the hero text (19 Oct).
         At rest each looks for the nearest spot where it covers no more than a corner of any button, stays off the words,
         and keeps most of itself on screen. It may still graze a button: it just never sits in front of one. */
      var dodgers=Array.prototype.slice.call(document.querySelectorAll('[data-dodge]'));
      var dodge=function(){
        if(!dodgers.length) return;
        var z=window.OPHI_Z||1, W=document.documentElement.clientWidth;
        var boxes=function(sel){ return Array.prototype.map.call(document.querySelectorAll(sel),function(e){ return BOX(e); }).filter(function(r){ return r.width&&r.height; }); };
        var btns=boxes('.hero nav a, .hero nav button, .om-btn'), words=boxes('.hero h1, .hero .byline, .hero .hand-line, .hero .brand, .hero .logo');
        var labels=[];   /* a wing may brush a button's frame, never the words on it */
        Array.prototype.forEach.call(document.querySelectorAll('.hero nav a, .hero nav button, .om-btn'),function(b){
          try{ var rg=document.createRange(); rg.selectNodeContents(b); var r=BOX(rg); if(r.width) labels.push({left:r.left-4,right:r.right+4,top:r.top-2,bottom:r.bottom+2}); }catch(e){} });
        var ov=function(a,b){ var w=Math.min(a.r,b.right)-Math.max(a.l,b.left), h=Math.min(a.b,b.bottom)-Math.max(a.t,b.top); return w>0&&h>0?w*h:0; };
        dodgers.forEach(function(el){
          el.style.translate='';
          if(!el.offsetParent) return;
          var art=(BOX(el.querySelector('i')||el)), A=art.width*art.height; if(!A) return;
          /* the drawing fills about 70% of its box: test against a slightly smaller box so transparent corners don't count */
          var ix=art.width*.14, iy=art.height*.14, best=null, step=8*z;
          for(var dy=-6*step; dy<=26*step; dy+=step) for(var dx=-34*step; dx<=10*step; dx+=step){
            var a={l:art.left+ix+dx, r:art.right-ix+dx, t:art.top+iy+dy, b:art.bottom-iy+dy}, inner=(a.r-a.l)*(a.b-a.t), bad=0;
            btns.forEach(function(b){ var c=ov(a,b)/(b.width*b.height); if(c>.06) bad+=c; });
            words.forEach(function(b){ var c=ov(a,b)/inner; if(c>.05) bad+=c*2; });
            var a2={l:art.left+art.width*.05+dx, r:art.right-art.width*.05+dx, t:art.top+art.height*.05+dy, b:art.bottom-art.height*.05+dy};
            labels.forEach(function(b){ var c=ov(a2,b)/((b.right-b.left)*(b.bottom-b.top)); if(c>0) bad+=1+c; });
            var vis=(Math.min(a.r,W)-Math.max(a.l,0))/(a.r-a.l); if(vis<.6) bad+=(.6-vis)*2;
            if(a.t<0) bad+=(-a.t)/(a.b-a.t);
            var cost=bad*1e4+Math.hypot(dx,dy*1.3);
            if(!best||cost<best.c) best={c:cost,x:dx,y:dy};
          }
          if(best&&(best.x||best.y)) el.style.translate=(best.x/z).toFixed(1)+'px '+(best.y/z).toFixed(1)+'px';   /* .relic motion uses transform, so this adds to it */
        });
      };
      var measure=function(){
        vh=window.innerHeight;
        var sy=window.pageYOffset;
        relics.forEach(function(el){ el._t=el.style.transform; el.style.transform='none'; el.style.translate=el.style.rotate=el.style.scale=''; });
        dodge();
        relics.forEach(function(el){
          if(!el.offsetParent){ el._m=null; return; }
          var r=BOX(el);
          el._m={cy:r.top+sy+r.height/2, h:r.height};
        });
        relics.forEach(function(el){ el.style.transform=el._t; });
      };
      var drift=function(){
        queued=false;
        var sy=window.pageYOffset, small=window.innerWidth<700;
        relics.forEach(function(el){
          var m=el._m; if(!m) return;
          var mid=m.cy-sy;
          /* 19 Oct (Bri): each piece holds still while its section is read, then from about halfway up the screen it grows
             and turns, gently at first and more as it goes. It never fades: it stays in view, just bigger, until it scrolls away. */
          var first=m.cy<vh*.5,                               /* already above the middle on the first screen */
              start=first?m.cy:vh*.5, end=-(vh*.35+m.h*.5),
              p=Math.max(0,Math.min(1,(start-mid)/(start-end))),
              d=first?Math.max(-.7,-sy/vh):Math.max(-.7,Math.min(.7,(mid-vh/2)/vh)),
              depth=(+el.getAttribute('data-depth')||40)*(small?.5:1),
              dir=(el._dir||(el._dir=(Math.random()<.5?-1:1)));
          var ty=(-d*depth).toFixed(1), rot=(d*-6+p*p*14*dir).toFixed(2), sc=(1+p*p*(small?GROW*.7:GROW)+p*.12).toFixed(3);
          if(!el.classList.contains('relic')){ el.style.translate='0 '+ty+'px'; el.style.rotate=rot+'deg'; el.style.scale=sc; }
          else el.style.transform='translate3d(0,'+ty+'px,0) rotate('+rot+'deg) scale('+sc+')';
        });
      };
      var ask=function(){ if(!queued){ queued=true; requestAnimationFrame(drift); } };
      addEventListener('scroll',ask,{passive:true});
      addEventListener('resize',function(){ measure(); ask(); });
      addEventListener('load',function(){ measure(); ask(); });
      if(window.ResizeObserver) new ResizeObserver(function(){ measure(); ask(); }).observe(document.body);
      measure(); drift();
    }
  }catch(e){}

  try{
    var navEl=document.querySelector('.hero nav'), heroEl=document.querySelector('.hero');
    var setNav=function(){ heroEl.style.setProperty('--nav-b',(navEl.offsetTop+navEl.offsetHeight-6)+'px'); };
    setNav(); addEventListener('resize',setNav);
  }catch(e){}

  /* music: nothing plays until the visitor presses the button.
     The track is a separate file (/assets/ophi-music.mp3) that streams when the button is pressed; nothing is saved to
     the visitor's device. Playback tries three routes in turn, because some embedded viewers block one or another:
     1) an audio element pointed at the file, 2) the same element fed from memory, 3) the Web Audio engine.
     Moving to another page of the site: if the music was playing, the next page picks it up where it left off
     (browsers allow this after the visitor has pressed play once; if one refuses, the button simply waits). */
  try{ (function(){
    var sBtn=document.querySelector('nav .sound'), sFab=document.querySelector('.sound-fab'), sTxt=sBtn&&sBtn.querySelector('.sound-txt');
    if(sBtn && sFab){
      var SRC='/assets/ophi-music.mp3?v=binaural-1', KEY='ophi-music', VOL=.75, on=false, started=false, navSeen=true, stage=0, token=0,
          bytes=null, el=null, fadeT=null, watch=null,
          AC=window.AudioContext||window.webkitAudioContext, elOK=false, ctx=null, gain=null, node=null, pcm=null, offset=0, t0=0, failT=null;
      var store=function(v){ try{ if(v===null) sessionStorage.removeItem(KEY); else sessionStorage.setItem(KEY,v); }catch(e){} };
      var stored=function(){ try{ return sessionStorage.getItem(KEY); }catch(e){ return null; } };
      var paint=function(){
        [sBtn,sFab].forEach(function(b){ b.setAttribute('aria-pressed',on?'true':'false'); b.setAttribute('aria-label',on?'Pause music':'Play music'); });
        sFab.hidden=!(started && !navSeen);
      };
      var load=function(cb,bad){
        if(bytes){ cb(); return; }
        fetch(SRC).then(function(r){ if(!r.ok) throw 0; return r.arrayBuffer(); })
          .then(function(b){ bytes=new Uint8Array(b); cb(); }).catch(bad);
      };
      var fadeEl=function(to,ms,done){
        clearInterval(fadeT);
        var from=el.volume, s0=Date.now();
        fadeT=setInterval(function(){
          var k=Math.min(1,(Date.now()-s0)/ms);
          try{ el.volume=from+(to-from)*k; }catch(e){}
          if(k>=1){ clearInterval(fadeT); if(done) done(); }
        },40);
      };
      var fail=function(){
        on=false; store(null); paint();
        sBtn.setAttribute('aria-label','Music could not play in this window');
        if(sTxt){ sTxt.textContent='No sound here'; clearTimeout(failT); failT=setTimeout(function(){ sTxt.textContent='Music'; },4500); }
      };
      /* route 3: Web Audio */
      var ctxPlay=function(my){
        if(my!==token || !on) return;
        try{
          node=ctx.createBufferSource(); node.buffer=pcm; node.loop=true; node.connect(gain);
          gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.setValueAtTime(0,ctx.currentTime);
          gain.gain.linearRampToValueAtTime(VOL,ctx.currentTime+.7);
          node.start(0,offset%pcm.duration); t0=ctx.currentTime-offset;
        }catch(e){ fail(); }
      };
      var viaCtx=function(my){
        stage=2;
        if(!ctx || !AC){ fail(); return; }
        if(pcm){ ctxPlay(my); return; }
        load(function(){
          try{ ctx.decodeAudioData(bytes.buffer.slice(0),function(buf){ pcm=buf; ctxPlay(my); },function(){ if(my===token) fail(); }); }
          catch(e){ fail(); }
        },function(){ if(my===token) fail(); });
      };
      /* routes 1 and 2: audio element */
      var mkEl=function(){
        if(el) return;
        el=new Audio(); el.loop=true; el.preload='auto';
        el.addEventListener('error',function(){ next(token,el._try); });
      };
      var playEl=function(my,at){
        el.volume=0; el._try=at;
        var p=el.play();
        if(p && p.catch) p.catch(function(){ next(my,at); });
        fadeEl(VOL,700);
        clearTimeout(watch);
        watch=setTimeout(function(){
          if(my!==token || !on || stage>=2) return;
          if(el.paused || el.error || el.currentTime<.05) next(my,at);
          else{ elOK=true; try{ if(ctx) ctx.suspend(); }catch(e){} }      /* the simple route works here: stand the spare engine down */
        },3500);
      };
      var viaEl=function(my){
        try{
          mkEl();
          if(stage===0){ if(!el._src){ el._src=1; el.src=SRC; } playEl(my,0); return; }
          var at=stage;
          load(function(){
            if(my!==token || !on) return;
            if(!el._blob){ el._blob=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'})); el.src=el._blob; }
            playEl(my,at);
          },function(){ next(my,at); });
        }catch(e){ next(my,stage); }
      };
      var next=function(my,from){
        if(my!==token || !on || stage>=2 || from!==stage) return;   /* one failure moves on one route, however many ways it is reported */
        clearTimeout(watch); clearInterval(fadeT);
        try{ el.pause(); }catch(e){}
        stage++;
        if(stage===1) viaEl(my); else viaCtx(my);
      };
      var start=function(){
        on=true; started=true; token++; store('0'); try{ sessionStorage.removeItem('ophi-music-off'); }catch(e){}
        /* created inside the tap so the browser lets it sound later if route 3 is needed */
        if(!elOK){ try{ if(AC && !ctx){ ctx=new AC(); gain=ctx.createGain(); gain.gain.value=0; gain.connect(ctx.destination); } if(ctx && ctx.state==='suspended') ctx.resume(); }catch(e){} }
        if(stage>=2) viaCtx(token); else viaEl(token);
        paint();
      };
      var stop=function(){
        on=false; token++; clearTimeout(watch); store(null); try{ sessionStorage.setItem('ophi-music-off','1'); }catch(e){}
        if(stage>=2){
          try{
            offset=(ctx.currentTime-t0)%pcm.duration;
            gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.setValueAtTime(gain.gain.value,ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0,ctx.currentTime+.28);
            var old=node; setTimeout(function(){ try{ old.stop(); }catch(e){} },320);
          }catch(e){}
        }else if(el){
          fadeEl(0,280,function(){ try{ el.pause(); }catch(e){} });
        }
        paint();
      };
      var toggle=function(){ if(on) stop(); else start(); };
      var armed=false;
      var armGesture=function(){
        if(armed) return; armed=true;
        var go=function(e){
          ['pointerdown','keydown','touchstart'].forEach(function(t){ removeEventListener(t,go,true); });
          if(on || (e.target && e.target.closest && e.target.closest('.sound,.sound-fab'))) return;   /* the music button handles its own click */
          var off=false; try{ off=sessionStorage.getItem('ophi-music-off')==='1'; }catch(err){}
          if(!off) start();
        };
        ['pointerdown','keydown','touchstart'].forEach(function(t){ addEventListener(t,go,true); });
      };
      sBtn.addEventListener('click',toggle); sFab.addEventListener('click',toggle);
      /* remember where the track was, so the next page can carry on from there */
      addEventListener('pagehide',function(){
        if(!on) return;
        var t=0; try{ t=stage>=2?(ctx.currentTime-t0)%pcm.duration:el.currentTime; }catch(e){}
        store(String(t||0));
      });
      /* arriving with the music on: try to carry on quietly; if the browser wants a tap first, just wait for one */
      var was=stored();
      if(was!==null){
        mkEl(); el._src=1; el.src=SRC; el.volume=0;
        try{ el.currentTime=parseFloat(was)||0; }catch(e){}
        el.addEventListener('loadedmetadata',function(){ try{ if(el.currentTime<1) el.currentTime=parseFloat(was)||0; }catch(e){} },{once:true});
        var p=el.play();
        var ok=function(){ on=true; started=true; elOK=true; token++; fadeEl(VOL,900); paint(); };
        if(p && p.then) p.then(ok,function(){ store(null); paint(); armGesture(); }); else ok();
      }else{
        /* first visit (and the visitor hasn't switched it off): music starts on its own.
           Most browsers only allow sound after the visitor's first tap, click or key press, so if the
           quiet start is refused it begins on that first interaction instead. */
        var off=false; try{ off=sessionStorage.getItem('ophi-music-off')==='1'; }catch(e){}
        if(!off){
          mkEl(); el._src=1; el.src=SRC; el.volume=0;
          var p2=el.play();
          var ok2=function(){ on=true; started=true; elOK=true; token++; store('0'); fadeEl(VOL,1200); paint(); };
          if(p2 && p2.then) p2.then(ok2,function(){ armGesture(); }); else ok2();
        }
      }
      var navEl2=document.querySelector('.hero nav');
      if(window.IntersectionObserver && navEl2) new IntersectionObserver(function(en){ navSeen=en[0].isIntersecting; paint(); },{threshold:.2}).observe(navEl2);
      sBtn.hidden=false;
      paint();
    }
  })(); }catch(e){}

  /* Paper labels sway as you scroll (19 Oct), the same motion as the cards on the rituals page: each keeps its own lean
     and rocks a few degrees as it travels through the screen. They use the separate rotate / translate properties,
     so their resting tilt (CSS transform) stays as designed. */
  try{
    var papers=Array.prototype.slice.call(document.querySelectorAll('.torn, .sticker, .tour-go, .pan-tag, .strip-go, .duo-sway, .ts-tag'));
    if(papers.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var pq=false;
      var sway=function(){ pq=false; var vh=innerHeight;
        papers.forEach(function(el,i){ var r=BOX(el); if(r.bottom<-80||r.top>vh+80) return;
          var k=((r.top+r.height/2)-vh/2)/vh;   /* -1..1 as it crosses the screen */
          var lean=(i%2?2.2:-2.6);   /* its resting lean, alternating */
          /* the big pieces on the home page (photo, plate, notes) and the strip's tags move more gently */
          var big=el.classList.contains('duo-big'), a=big?.5:el.classList.contains('duo-sway')?1:el.classList.contains('strip-go')?.35:1,
              m=big?1.1:a;   /* how far it travels */
          el.style.rotate=((lean+Math.sin(k*2.6+i*1.3)*6.5)*a).toFixed(2)+'deg';
          el.style.translate=(Math.sin(k*2.1+i*.7)*7*m).toFixed(1)+'px '+(Math.sin(k*1.8+i)*14*m).toFixed(1)+'px'; }); };
      addEventListener('scroll',function(){ if(!pq){ pq=true; requestAnimationFrame(sway); } },{passive:true});
      addEventListener('resize',sway); sway();
    }
  }catch(e){}

  /* Push pins rock very slightly as they scroll by, like the stickers on the rituals page (19 Oct).
     rotate adds to each pin's own tilt (CSS transform), so their resting angles stay as designed. */
  try{
    var pins=Array.prototype.slice.call(document.querySelectorAll('.eph.pin, .pan-art, .duo-rock'));
    if(pins.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var nq=false;
      var rock=function(){ nq=false; var vh=innerHeight;
        pins.forEach(function(el,i){ var r=BOX(el); if(r.bottom<-40||r.top>vh+40) return;
          var k=((r.top+r.height/2)-vh/2)/vh, amp=el.classList.contains('pan-art')?9:el.classList.contains('duo-rock')?14:4;   /* the banner pieces and the home pins turn more */
          el.style.rotate=(Math.sin(k*2.6+i*1.7)*amp).toFixed(2)+'deg'; }); };
      addEventListener('scroll',function(){ if(!nq){ nq=true; requestAnimationFrame(rock); } },{passive:true});
      addEventListener('resize',rock); rock();
    }
  }catch(e){}

  /* Drift (Bri, 28 Oct): the lace butterfly and the lace bow turn and travel as they cross the screen.
     data-drift="x y turn" = pixels and degrees over one screen of scrolling, plus a little flutter. Scrolling down,
     a positive x carries the piece toward the left. Separate translate / rotate properties keep each resting tilt. */
  try{
    var drifters=Array.prototype.slice.call(document.querySelectorAll('[data-drift]'));
    if(drifters.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var dq=false;
      var drift=function(){ dq=false; var vh=innerHeight;
        drifters.forEach(function(el){ var r=BOX(el); if(r.bottom<-120||r.top>vh+120) return;
          var v=(el.getAttribute('data-drift')||'0 0 0').split(/\s+/).map(Number),
              k=Math.max(-1.2,Math.min(1.2,((r.top+r.height/2)-vh/2)/vh)), f=Math.sin(k*5.2);
          el.style.translate=(v[0]*k+f*3).toFixed(1)+'px '+(v[1]*k+Math.cos(k*4.4)*3).toFixed(1)+'px';
          el.style.rotate=(v[2]*k+f*v[2]*.25).toFixed(2)+'deg';
          /* optional 4th value: it stretches and squashes, changing shape as it goes */
          if(v[3]){ var q=Math.sin(k*4.8)*v[3]; el.style.scale=(1+q).toFixed(3)+' '+(1-q*.7).toFixed(3); } }); };
      addEventListener('scroll',function(){ if(!dq){ dq=true; requestAnimationFrame(drift); } },{passive:true});
      addEventListener('resize',drift); drift();
    }
  }catch(e){}

  /* testimonial carousel */
  try{
    Array.prototype.forEach.call(document.querySelectorAll('.tq-carousel'),function(car){
      var track=car.querySelector('.tq-track'),
          slides=Array.prototype.slice.call(track.children),
          dots=Array.prototype.slice.call(car.querySelectorAll('.tq-dots button')),
          calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches,
          cur=0, timer=null, auto=!calm, onScreen=false, held=false, settle=null,
          every=+car.getAttribute('data-every')||0, wake=null;   /* data-every: turn on a fixed beat (the home strip, 2.5 s) */
      var mark=function(){
        dots.forEach(function(d,k){ if(k===cur){d.setAttribute('aria-current','true');}else{d.removeAttribute('aria-current');} });
      };
      /* seamless loop: a copy of the first slide waits after the last, so "next" from the end keeps sliding
         forward and then quietly resets to the real first slide (and "back" from the first does the reverse) */
      var N=slides.length, ghost=null;
      if(N>1){ ghost=slides[0].cloneNode(true); ghost.setAttribute('aria-hidden','true'); ghost.removeAttribute('aria-label');
        Array.prototype.forEach.call(ghost.querySelectorAll('a,button,[tabindex]'),function(el){ el.setAttribute('tabindex','-1'); });
        track.appendChild(ghost); }
      var instant=function(x){ track.style.scrollBehavior='auto'; track.scrollTo({left:x,behavior:'instant'}); track.offsetWidth; track.style.scrollBehavior=''; };
      var go=function(n,jump){
        var smooth=!(jump||calm);
        if(ghost && smooth && n>=N){ cur=0; mark(); track.scrollTo({left:ghost.offsetLeft,behavior:'smooth'}); return; }
        if(ghost && smooth && n<0){ instant(ghost.offsetLeft); cur=N-1; mark(); requestAnimationFrame(function(){ track.scrollTo({left:slides[N-1].offsetLeft,behavior:'smooth'}); }); return; }
        cur=(n+N)%N;
        if(smooth) track.scrollTo({left:slides[cur].offsetLeft,behavior:'smooth'}); else instant(slides[cur].offsetLeft);
        mark();
      };
      /* turn by itself, giving each testimonial as long as it takes to read */
      var plan=function(){
        clearTimeout(timer);
        if(!auto||!onScreen||held||N<2) return;
        var words=slides[cur].textContent.trim().split(/\s+/).length;
        timer=setTimeout(function(){ go(cur+1); plan(); }, every||Math.min(40000,Math.max(6500,words*330)));
      };
      /* a touch stops the testimonials for good; the fixed-beat strip just pauses and picks up again */
      var quit=function(){ clearTimeout(timer); clearTimeout(wake);
        if(every){ wake=setTimeout(plan,6000); } else { auto=false; } };
      var pb=car.querySelector('.prev'), nb=car.querySelector('.next');
      if(pb) pb.addEventListener('click',function(){ quit(); go(cur-1); });
      if(nb) nb.addEventListener('click',function(){ quit(); go(cur+1); });
      dots.forEach(function(d,k){ d.addEventListener('click',function(){ quit(); go(k); }); });
      track.addEventListener('keydown',function(e){
        if(e.key==='ArrowLeft'){ e.preventDefault(); quit(); go(cur-1); }
        if(e.key==='ArrowRight'){ e.preventDefault(); quit(); go(cur+1); }
      });
      ['pointerdown','touchstart','wheel'].forEach(function(ev){ track.addEventListener(ev,quit,{passive:true}); });
      track.addEventListener('scroll',function(){
        clearTimeout(settle);
        settle=setTimeout(function(){
          var k=Math.round(track.scrollLeft/track.clientWidth);
          if(ghost && k>=N){ instant(slides[0].offsetLeft); k=0; }
          if(k!==cur&&k>=0&&k<N){ cur=k; mark(); }
        },110);
      },{passive:true});
      /* the testimonials hold still under the pointer; the fixed-beat strip keeps moving (Bri, 28 Oct) */
      if(!every){
        car.addEventListener('mouseenter',function(){ held=true; clearTimeout(timer); });
        car.addEventListener('mouseleave',function(){ held=false; plan(); });
        car.addEventListener('focusin',function(){ held=true; clearTimeout(timer); });
        car.addEventListener('focusout',function(){ held=false; plan(); });
      }
      addEventListener('resize',function(){ go(cur,true); });
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(en){ onScreen=en[0].isIntersecting; plan(); },{threshold:.45}).observe(car);
      }
      if(N<2) car.classList.add('single');
      car.classList.add('is-ready');
      go(0,true);
    });
  }catch(e){}


  /* Dark bands: no star field; the cursor leaves a short trail of sparkling stars that drift, shrink and fade.
     Capped at 36 so it never gets busy. (?grid on the address brings back the old star grid for comparison.) */
  try{
    if(!/[?&]grid\b/.test(location.search) && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      document.documentElement.classList.add('trail-mode');
      var STAR2=new Path2D('M12 0C12.7 6.9 17.1 11.3 24 12 17.1 12.7 12.7 17.1 12 24 11.3 17.1 6.9 12.7 0 12 6.9 11.3 11.3 6.9 12 0Z');
      Array.prototype.forEach.call(document.querySelectorAll('canvas.stars'),function(cv){
        var host=cv.parentNode, ctx=cv.getContext('2d'), W=0,H=0,dpr=1, parts=[], lx=null, ly=null, run=false, last=0;
        var size=function(){ var r=BOX(host); dpr=Math.min(2,devicePixelRatio||1); W=r.width; H=r.height; cv.width=W*dpr; cv.height=H*dpr; };
        var loop=function(t){
          var dt=Math.min(50,t-(last||t)); last=t;
          ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
          parts=parts.filter(function(p){ p.age+=dt; return p.age<p.life; });
          parts.forEach(function(p){
            var k=p.age/p.life, s=p.s*(1-k*.6); p.x+=p.vx*dt; p.y+=p.vy*dt;
            ctx.save(); ctx.translate(p.x-s/2,p.y-s/2); ctx.scale(s/24,s/24);
            ctx.fillStyle=p.coral?'rgba(239,83,52,'+(1-k)+')':'rgba(236,231,220,'+(1-k)*.95+')'; ctx.fill(STAR2); ctx.restore();
          });
          if(parts.length){ requestAnimationFrame(loop); } else { run=false; last=0; }
        };
        host.addEventListener('pointermove',function(e){
          var r=BOX(host), x=e.clientX-r.left, y=e.clientY-r.top;
          if(lx===null){ lx=x; ly=y; return; }
          var d=Math.hypot(x-lx,y-ly);
          if(d>16 && parts.length<36){
            parts.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*.02,vy:.012+Math.random()*.02,
              s:5+Math.random()*9,life:650+Math.random()*450,age:0,coral:Math.random()<.18});
            lx=x; ly=y;
            if(!run){ run=true; requestAnimationFrame(loop); }
          }
        },{passive:true});
        host.addEventListener('pointerleave',function(){ lx=null; });
        if(window.ResizeObserver) new ResizeObserver(size).observe(host); size();
      });
    }
  }catch(e){}

  /* masthead star field: three layers of Bri's four-point stars for depth.
     Far: many tiny, faint stars that twinkle slowly. Middle: the even grid. Near: a few larger ones.
     Near the pointer they brighten and grow (a few turn coral); behind it they leave a soft trail that eases out slowly.
     Touch screens get the twinkle only; "reduce motion" gets still stars. */
  try{
    var STAR=new Path2D('M12 0C12.7 6.9 17.1 11.3 24 12 17.1 12.7 12.7 17.1 12 24 11.3 17.1 6.9 12.7 0 12 6.9 11.3 11.3 6.9 12 0Z');
    var calmStars=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var finePtr=window.matchMedia('(pointer:fine)').matches;
    if(!document.documentElement.classList.contains('trail-mode')) Array.prototype.forEach.call(document.querySelectorAll('canvas.stars'),function(cv){
      var host=cv.parentNode, ctx=cv.getContext('2d'), stars=[], W=0, H=0, dpr=1, px=-9999, py=-9999, inside=false, running=false, onScreen=true, last=0;
      var seed=7; var rnd=function(){ seed=(seed*16807)%2147483647; return seed/2147483647; };
      var layout=function(){
        var r=BOX(host); dpr=Math.min(2,window.devicePixelRatio||1);
        W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
        stars=[]; seed=7;
        var i, n;
        /* one even grid of stars */
        var step=W<600?30:36;
        for(var y=step*.45;y<H;y+=step){ for(var x=(Math.round(y/step)%2)*step/2+step*.4;x<W;x+=step){
          stars.push({x:x+(rnd()-.5)*12,y:y+(rnd()-.5)*12,s:5+rnd()*5,a:.11,depth:1,coral:rnd()<.16,glow:0,tw:rnd()*6.28,sp:.25+rnd()*.4});
        }}
        draw(performance.now());
      };
      var draw=function(t){
        ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
        var still=calmStars;
        for(var i=0;i<stars.length;i++){
          var st=stars[i], g=st.glow;
          var tw=0;
          if(!finePtr && !still) g=Math.max(g,Math.pow(Math.max(0,Math.sin(t/1700*st.sp+st.tw)),22)*.7);
          var size=st.s*(1+g*.95*st.depth), al=Math.min(1,st.a*(1+tw*1.4)+g*.86*st.depth);
          ctx.save(); ctx.translate(st.x-size/2,st.y-size/2); ctx.scale(size/24,size/24);
          ctx.fillStyle=(st.coral&&g>.3)?'rgba(239,83,52,'+al+')':'rgba(236,231,220,'+al+')';
          ctx.fill(STAR); ctx.restore();
        }
      };
      var tick=function(t){
        if(!onScreen){ running=false; last=0; return; }
        var dt=Math.min(64,t-(last||t)); last=t; var R=Math.min(250,Math.max(160,W*.17));
        for(var i=0;i<stars.length;i++){
          var st=stars[i], d=inside?Math.hypot(st.x-px,st.y-py):9999, target=d<R?Math.pow(1-d/R,1.5):0;
          if(target>st.glow) st.glow+=(target-st.glow)*Math.min(1,dt/60);
          else st.glow=Math.max(target,st.glow-dt/1100);
        }
        draw(t);
        var busy=false; for(var k=0;k<stars.length;k++){ if(stars[k].glow>.002){ busy=true; break; } }
        if(!calmStars && (busy||inside||!finePtr)) requestAnimationFrame(tick); else { running=false; last=0; }
      };
      var wake=function(){ if(!running && onScreen){ running=true; requestAnimationFrame(tick); } };
      if(finePtr){
        host.addEventListener('pointermove',function(e){ var r=BOX(host); px=e.clientX-r.left; py=e.clientY-r.top; inside=true; wake(); },{passive:true});
        host.addEventListener('pointerleave',function(){ inside=false; wake(); });
      }
      /* only animate while the masthead is on screen */
      if('IntersectionObserver' in window) new IntersectionObserver(function(en){ onScreen=en[0].isIntersecting; if(onScreen) wake(); }).observe(host);
      if(window.ResizeObserver) new ResizeObserver(layout).observe(host); else addEventListener('resize',layout);
      layout(); wake();
    });
  }catch(e){}

  /* This Season door card (any page): the month's name and the first three sentences of its post.
     season-data.js may load after this script, so it runs again once the page has loaded. */
  var seasonDoor=function(){ try{
    var SD=window.OPHI_SEASON, pv=document.querySelectorAll('[data-season-preview],[data-season-label]');
    if(SD && pv.length){
      var ym2=(function(){ try{ var y,m; new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit'}).formatToParts(new Date()).forEach(function(p){ if(p.type==='year') y=p.value; if(p.type==='month') m=p.value; }); return y+'-'+m; }catch(e){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2); } })();
      var k2=null, ks=Object.keys(SD).sort(); ks.forEach(function(k){ if(k<=ym2 && SD[k].post && SD[k].post.ready) k2=k; }); if(!k2) k2=ks[0];
      var M2=SD[k2];
      Array.prototype.forEach.call(document.querySelectorAll('[data-season-label]'),function(el){ el.textContent=M2.label; });
      if(M2.post && M2.post.ready){
        var src=String(M2.post.body||M2.post.takeaway||'').split(/\n\s*\n/).filter(function(x){ return !/^\s*## /.test(x) && !/^\s*\[\[[\w-]+\]\]\s*$/.test(x); }).map(function(x){ return x.replace(/^\s*~ /,''); }).join(' ').replace(/\*/g,'').replace(/\s+/g,' ').trim();
        var sent=src.match(/[^.!?]+[.!?]+["')\]]*/g)||[src];
        Array.prototype.forEach.call(document.querySelectorAll('[data-season-preview]'),function(el){ el.textContent=sent.slice(0,3).join(' ').trim(); });
      }
    }
  }catch(e){} };
  seasonDoor(); if(!window.OPHI_SEASON) addEventListener('load',seasonDoor);

  /* This Season: each rising card opens in place to show its chapter; one open at a time */
  try{
    var cards=Array.prototype.slice.call(document.querySelectorAll('.rising'));
    var shut=function(li){ li.classList.remove('open'); li.querySelector('button').setAttribute('aria-expanded','false'); };
    cards.forEach(function(li){
      var b=li.querySelector('button'), x=li.querySelector('.close');
      b.addEventListener('click',function(){
        var was=li.classList.contains('open');
        cards.forEach(shut);
        if(!was){
          li.classList.add('open'); b.setAttribute('aria-expanded','true');
          if(history.replaceState) history.replaceState(null,'','#'+li.id);
          var top=BOX(li).top;
          if(top<70||top>innerHeight*.6) li.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
        }
      });
      if(x) x.addEventListener('click',function(){ shut(li); b.focus(); });
    });
    /* a click anywhere outside the open card (or Esc) closes it */
    if(cards.length){
      document.addEventListener('click',function(e){
        cards.forEach(function(li){ if(li.classList.contains('open') && !li.contains(e.target)) shut(li); });
      });
      document.addEventListener('keydown',function(e){
        if(e.key!=='Escape') return;
        cards.forEach(function(li){ if(li.classList.contains('open')){ shut(li); li.querySelector('button').focus(); } });
      });
    }
    /* a link straight to a sign (ophibybri.com/this-season/#leo-rising) opens that card */
    var h=location.hash && document.getElementById(location.hash.slice(1));
    if(h && h.classList.contains('rising')) h.querySelector('button').click();
  }catch(e){}

  /* Bri, 28 Oct: the little chrome stars on Make It Make Sense turn as they travel up the screen, about half a turn from bottom to top (Bri: make it obvious); no growing. */
  (function(){
    var st=Array.prototype.slice.call(document.querySelectorAll('.np-star'));
    if(!st.length||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
    var dir=st.map(function(s,i){return i%2?-1:1;}),queued=false;
    function spin(){queued=false;var vh=window.innerHeight||1;
      st.forEach(function(s,i){var r=s.getBoundingClientRect();if(!r.height)return;var t=(r.top+r.height/2)/vh-.5;
        s.style.setProperty('--spin',(Math.max(-1.2,Math.min(1.2,t))*-150*dir[i]).toFixed(1)+'deg');});}
    window.addEventListener('scroll',function(){if(!queued){queued=true;requestAnimationFrame(spin);}},{passive:true});
    window.addEventListener('resize',spin);spin();
  })();
})();
