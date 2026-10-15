
(function(){
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
          dot.style.transform='translate('+dx+'px,'+dy+'px)';
          orb.style.transform='translate('+ox+'px,'+oy+'px) translate(-50%,-50%)';
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
  try{
    /* Bri's doodles that bleed off the page edge get the same swell; they keep their own tilt (CSS transform)
       because the motion uses the separate translate / rotate / scale properties */
    var relics=Array.prototype.slice.call(document.querySelectorAll('.relic, .bleed'));
    if(relics.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      relics.forEach(function(el){
        if(el.classList.contains('set')) return;
        el.style.setProperty('--rs',(0.8+Math.random()*0.2).toFixed(2));
        el.style.setProperty('--rt',((Math.random()*2-1)*6).toFixed(1)+'deg');
      });
      var queued=false, vh=0, GROW=1.7;
      var measure=function(){
        vh=window.innerHeight;
        var sy=window.pageYOffset;
        relics.forEach(function(el){ el._t=el.style.transform; el.style.transform='none'; el.style.translate=el.style.rotate=el.style.scale=''; });
        relics.forEach(function(el){
          if(!el.offsetParent){ el._m=null; return; }
          var r=el.getBoundingClientRect();
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
          var first=m.cy<vh,                                  /* on the first screen */
              start=first?m.cy:vh*.36, end=-(vh*.16+m.h*.5),
              p=Math.max(0,Math.min(1,(start-mid)/(start-end))),
              d=first?Math.max(-.7,-sy/vh):Math.max(-.7,Math.min(.7,(mid-vh/2)/vh)),
              depth=(+el.getAttribute('data-depth')||40)*(small?.5:1);
          var ty=(-d*depth).toFixed(1), rot=(d*-9).toFixed(2), sc=(1+p*p*(small?GROW*.7:GROW)+p*.25).toFixed(3);
          if(el.classList.contains('bleed')){ el.style.translate='0 '+ty+'px'; el.style.rotate=rot+'deg'; el.style.scale=sc; }
          else el.style.transform='translate3d(0,'+ty+'px,0) rotate('+rot+'deg) scale('+sc+')';
          el.style.opacity=(1-Math.pow(p,1.5)).toFixed(3);
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
      var SRC='/assets/ophi-music.mp3', KEY='ophi-music', VOL=.75, on=false, started=false, navSeen=true, stage=0, token=0,
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
        on=true; started=true; token++; store('0');
        /* created inside the tap so the browser lets it sound later if route 3 is needed */
        if(!elOK){ try{ if(AC && !ctx){ ctx=new AC(); gain=ctx.createGain(); gain.gain.value=0; gain.connect(ctx.destination); } if(ctx && ctx.state==='suspended') ctx.resume(); }catch(e){} }
        if(stage>=2) viaCtx(token); else viaEl(token);
        paint();
      };
      var stop=function(){
        on=false; token++; clearTimeout(watch); store(null);
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
        if(p && p.then) p.then(ok,function(){ store(null); paint(); }); else ok();
      }
      var navEl2=document.querySelector('.hero nav');
      if(window.IntersectionObserver && navEl2) new IntersectionObserver(function(en){ navSeen=en[0].isIntersecting; paint(); },{threshold:.2}).observe(navEl2);
      sBtn.hidden=false;
      paint();
    }
  })(); }catch(e){}

  /* testimonial carousel */
  try{
    Array.prototype.forEach.call(document.querySelectorAll('.tq-carousel'),function(car){
      var track=car.querySelector('.tq-track'),
          slides=Array.prototype.slice.call(track.children),
          dots=Array.prototype.slice.call(car.querySelectorAll('.tq-dots button')),
          calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches,
          cur=0, timer=null, auto=!calm, onScreen=false, held=false, settle=null;
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
        timer=setTimeout(function(){ go(cur+1); plan(); }, Math.min(40000,Math.max(6500,words*330)));
      };
      var quit=function(){ auto=false; clearTimeout(timer); };
      car.querySelector('.prev').addEventListener('click',function(){ quit(); go(cur-1); });
      car.querySelector('.next').addEventListener('click',function(){ quit(); go(cur+1); });
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
      car.addEventListener('mouseenter',function(){ held=true; clearTimeout(timer); });
      car.addEventListener('mouseleave',function(){ held=false; plan(); });
      car.addEventListener('focusin',function(){ held=true; clearTimeout(timer); });
      car.addEventListener('focusout',function(){ held=false; plan(); });
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
        var size=function(){ var r=host.getBoundingClientRect(); dpr=Math.min(2,devicePixelRatio||1); W=r.width; H=r.height; cv.width=W*dpr; cv.height=H*dpr; };
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
          var r=host.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
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
        var r=host.getBoundingClientRect(); dpr=Math.min(2,window.devicePixelRatio||1);
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
        host.addEventListener('pointermove',function(e){ var r=host.getBoundingClientRect(); px=e.clientX-r.left; py=e.clientY-r.top; inside=true; wake(); },{passive:true});
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
        var src=String(M2.post.body||M2.post.takeaway||'').split(/\n\s*\n/).filter(function(x){ return !/^\s*## /.test(x); }).map(function(x){ return x.replace(/^\s*~ /,''); }).join(' ').replace(/\*/g,'').replace(/\s+/g,' ').trim();
        var sent=src.match(/[^.!?]+[.!?]+["')\]]*/g)||[src];
        Array.prototype.forEach.call(document.querySelectorAll('[data-season-preview]'),function(el){ el.textContent=sent.slice(0,3).join(' ').trim(); });
      }
    }
  }catch(e){} };
  seasonDoor(); if(!window.OPHI_SEASON) addEventListener('load',seasonDoor);

  /* This Season: fill the page from assets/season-data.js for the current month (Pacific time) */
  try{
    var DATA=window.OPHI_SEASON;
    if(DATA && document.querySelector('.season-now')){
      var ym=(function(){ try{ var f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit'}).formatToParts(new Date());
        var y,m; f.forEach(function(p){ if(p.type==='year') y=p.value; if(p.type==='month') m=p.value; }); return y+'-'+m; }catch(e){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2); } })();
      var keys=Object.keys(DATA).sort(), key=null;
      keys.forEach(function(k){ if(k<=ym && DATA[k].post && DATA[k].post.ready) key=k; });  /* the newest finished month; an unfinished month never replaces it */
      if(!key) key=keys[0];
      var M=DATA[key], esc=function(t){ return String(t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
      var rich=function(t){ return esc(t).replace(/\*([^*]+)\*/g,'<em>$1</em>'); };
      /* paragraphs are separated by a blank line; a paragraph starting with "## " is a small heading */
      var paras=function(t){ return String(t||'').split(/\n\s*\n/).map(function(x){ x=x.trim(); return /^## /.test(x)?'<h4 class="sub-h">'+rich(x.slice(3))+'</h4>':/^~ /.test(x)?'<p class="pen">'+rich(x.slice(2))+'</p>':'<p>'+rich(x)+'</p>'; }).join(''); };
      Array.prototype.forEach.call(document.querySelectorAll('[data-month]'),function(el){ el.textContent=el.textContent.replace(/^[A-Z][a-z]+ \d{4}/,M.label); });
      var now=document.querySelector('.season-now');
      if(M.post && M.post.ready){
        now.querySelector('h3').innerHTML=rich(M.post.title);
        var dd=now.querySelectorAll('.summary dd'); dd[0].textContent=M.post.when; dd[1].textContent=M.post.what; dd[2].textContent=M.post.takeaway;
        var old=now.querySelectorAll(':scope > p'); Array.prototype.forEach.call(old,function(p){ p.remove(); });
        now.insertAdjacentHTML('beforeend',paras(M.post.body));
      }
      var ri=document.querySelector('[data-rising-intro]');
      if(ri && M.risingIntro){ ri.innerHTML=rich(M.risingIntro); ri.hidden=false; }
      var sc=document.querySelector('[data-season-close]');
      if(sc && M.closing && M.closing.body){ sc.querySelector('h3').innerHTML=rich(M.closing.title||''); sc.querySelector('div').innerHTML=paras(M.closing.body); sc.hidden=false; }
      Object.keys(M.signs||{}).forEach(function(s){
        var c=M.signs[s], li=document.querySelector('.rising[data-sign="'+s+'"]'); if(!li||!c) return;
        if(c.teaser){ var tg=li.querySelector('.tagline'); if(tg) tg.textContent=c.teaser; }   /* the month's teaser replaces the sign's standing tagline */
        if(!c.ready) return;
        var ch=li.querySelector('.chapter');
        ch.querySelector('h4').innerHTML=rich(c.title);
        Array.prototype.forEach.call(ch.querySelectorAll(':scope > div > p'),function(p){ p.remove(); });
        ch.querySelector(':scope > div').insertAdjacentHTML('beforeend',paras(c.body));
        if(c.house){ var mt=ch.querySelector('.meta'); if(mt) mt.textContent=M.label+' \u2726 '+c.house; }
        var ul=ch.querySelector('aside ul'), k=ch.querySelector('aside .k');
        if(c.note){ k.textContent='Remember'; ul.outerHTML='<p class="note">'+rich(c.note)+'</p>'; }
        else if(c.tries && c.tries.length) ul.innerHTML=c.tries.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join('');
        else ch.querySelector('aside').querySelectorAll('.k,ul').forEach(function(n){ n.remove(); });
      });
    }
  }catch(e){}

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
          var top=li.getBoundingClientRect().top;
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
})();
