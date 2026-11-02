
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
      /* Bri, 30 Oct: arrows either side of the month. The page always opens on the current month (Pacific time);
         ?m=yyyy-mm shows another one. Back goes up to six months before the current month, ahead goes as far as
         there are finished months ("ready: true"). A month outside that range falls back to the current one. */
      var addM=function(k,n){ var y=+k.slice(0,4), m=+k.slice(5,7)-1+n; y+=Math.floor(m/12); m=((m%12)+12)%12; return y+'-'+('0'+(m+1)).slice(-2); };
      var home=key, oldest=addM(ym,-6),
          open=keys.filter(function(k){ return DATA[k].post && DATA[k].post.ready && k>=oldest; });
      if(open.indexOf(home)<0) open.push(home), open.sort();
      var asked=(location.search.match(/[?&]m=(\d{4}-\d{2})/)||[])[1];
      /* Bri, 2 Nov: each finished month has its own page (/this-season/2026/11/); that page always shows its month */
      var fixed=(document.querySelector('.ts-mast')||{}).getAttribute && document.querySelector('.ts-mast').getAttribute('data-ts-key');
      if(fixed && /\/this-season\/\d{4}\/\d{2}\//.test(location.pathname) && DATA[fixed]) asked=fixed;
      if(asked && open.indexOf(asked)<0 && asked<=home && DATA[asked] && DATA[asked].post && DATA[asked].post.ready) open.push(asked), open.sort();
      if(asked && open.indexOf(asked)>-1) key=asked;
      var idx=open.indexOf(key), nm=function(k){ return String(DATA[k].label||'').replace(/\s*\d{4}\s*$/,''); },
          flip=function(sel,k,word){ var a=document.querySelector('[data-ts-'+sel+']'); if(!a||!k) return;
            a.href=(k===home?'/this-season/':k<=home?'/this-season/'+k.slice(0,4)+'/'+k.slice(5,7)+'/':'/this-season/?m='+k)+'#now'; a.hidden=false;
            a.setAttribute('aria-label',word+': '+DATA[k].label); a.querySelector('[data-ts-'+sel+'-l]').textContent=nm(k); };
      flip('prev',open[idx-1],'Previous month'); flip('next',open[idx+1],'Next month');
      var tagEl=document.querySelector('[data-ts-tag]');
      if(tagEl && key!==home) tagEl.textContent=key<home?'Looking back':'Coming up';
      if(key!==home){ var tk=document.querySelector('.ts-theme-k'); if(tk) tk.textContent=key<home?"That month's theme":"The month ahead"; }
      var M=DATA[key], P=M.post||{}, esc=function(t){ return String(t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
      var rich=function(t){ return esc(t).replace(/\*([^*]+)\*/g,'<em>$1</em>'); };
      var ART=P.art||{}, side=0;
      var artSrc=function(n){ return '/assets/season/'+key+'/'+n+'.webp'; };
      var artImg=function(n,cls){ var a=ART[n]||{}; return '<img class="'+cls+'" src="'+artSrc(n)+'" alt="'+esc(a.alt||'')+'"'+(a.alt?'':' aria-hidden="true"')+' loading="lazy" decoding="async">'; };
      /* paragraphs are separated by a blank line; "## " is a small heading, "~ " is in Bri's hand, [[name]] is a graphic */
      var paras=function(t){ return String(t||'').split(/\n\s*\n/).map(function(x){ x=x.trim(); var g=x.match(/^\[\[([\w-]+)\]\]$/);
        if(g){ side++; return '<figure class="ts-art ts-art-'+(side%2?'r':'l')+((ART[g[1]]||{}).wide?' ts-art-wide':'')+' ts-inart">'+artImg(g[1],'')+'</figure>'; }   /* art.wide: a wide graphic (the lion) gets more room */
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
              (first?'<figure class="ts-fig ts-inart">'+artImg(first[1],'')+'</figure>':'')+
              '<div class="ts-sec-in"><h3 class="np-h">'+rich(sc.h)+'</h3><div class="np-cols ts-body">'+paras(rest.join('\n\n'))+'</div></div></article>';
          }).join('');
          var dl=q('[data-ts-dates]');
          if(P.dates && P.dates.length) dl.innerHTML=P.dates.map(function(d){ var m2=String(d.date).match(/^(\D*?)\s*(\d+(?:\s*[–-]\s*\d+)?)$/)||[0,'',d.date];   /* "Nov 14–15" keeps the range */
            return '<li><span class="ts-d"><b>'+esc(m2[2])+'</b><i>'+esc(m2[1])+'</i></span><span class="ts-dt">'+rich(d.text)+'</span></li>'; }).join('');
          else dl.outerHTML='<p>'+rich(P.when||'')+'</p>';
          q('[data-ts-what]').innerHTML=rich(P.what||'');
          if(P.side) q('[data-ts-side-art]').innerHTML=artImg(P.side,'ts-inart');
          var bl=q('.ts-byline time'); if(bl){ bl.textContent=mo+' 1, '+yr; bl.setAttribute('datetime',key+'-01'); }   /* Bri, 2 Nov: byline under the main article */
          if(M.closing && M.closing.body){ q('[data-ts-close-k]').innerHTML=rich(M.closing.title||''); q('[data-ts-close-b]').innerHTML=paras(M.closing.body); q('[data-ts-close]').hidden=false; }
          /* each sticker slot lives in an open space: above the paper (1, 2), the sidebar (3, 7), the corner of the
             second article's graphic (4) and around the closing note (5, 6, 8) */
          var HOST=['.ts-paper .np-page','.ts-paper .np-page','.ts-what','.ts-fig','.ts-close','.ts-close','.ts-side-art','.ts-close'],
              MOVE=[[22,34,6],[-24,30,-5],[10,16,8],[-18,26,-6],[26,30,4],[-24,28,-7],[16,24,6],[-14,20,-8]];   /* Bri, 29 Oct: they travel and zoom; only the little chrome stars spin */
          (P.stickers||[]).slice(0,8).forEach(function(n,i){
            var host=q(HOST[i]); if(!host || (i===6 && !P.side)) return;   /* no sidebar graphic this month: that slot stays empty */
            /* post.stickerW = {name: px} gives a wide piece (a word sticker) its own width on desktop, scaled down on smaller screens */
            var sw=(P.stickerW||{})[n], wst=sw?' style="width:clamp('+Math.round(sw*.55)+'px,'+(sw/12.8).toFixed(2)+'vw,'+sw+'px)"':'';
            /* post.scatter[name] (Bri, 31 Oct): the graphic is rebuilt from single pieces (each sequin on its own) that sit
               together low on the screen and drift apart from each other as it scrolls up. {piece, size:[w,h], dots:[[x,y,r]]} */
            var SC=(P.scatter||{})[n];
            if(SC){ var W0=SC.size[0], H0=SC.size[1];
              host.insertAdjacentHTML('beforeend','<span class="ts-sticker ts-st'+(i+1)+' ts-scatter" data-spread="'+(SC.spread||.32)+'" aria-hidden="true" style="aspect-ratio:'+W0+'/'+H0+(sw?';width:clamp('+Math.round(sw*.55)+'px,'+(sw/12.8).toFixed(2)+'vw,'+sw+'px)':'')+'">'+
                SC.dots.map(function(d,k){ return '<img class="sp" src="'+artSrc(SC.piece)+'" alt="" loading="lazy" decoding="async" style="left:'+((d[0]-d[2])/W0*100).toFixed(2)+'%;top:'+((d[1]-d[2])/H0*100).toFixed(2)+'%;width:'+(d[2]*2/W0*100).toFixed(2)+'%;rotate:'+((k*137)%360)+'deg">'; }).join('')+'</span>');
              return; }
            /* post.onLine = names that start centred on the divider line above the story and move away from it */
            var onl=(P.onLine||[]).indexOf(n)>-1;
            host.insertAdjacentHTML('beforeend',artImg(n,'ts-sticker ts-st'+(i+1)+(onl?' ts-online':'')).replace('<img ','<img data-drift="'+MOVE[i].join(' ')+' -.09"'+(onl?' data-drift-from=".45"':'')+wst+' '));
          });
          paper.hidden=false; q('[data-ts-jump]').hidden=false;
        }
      }
      /* Bri's notepads (assets/notes): per note the image w, h, clear writing area x, y, w, h (%), note number, first
         ruled line y % (0 = unruled), line spacing %, tilt deg. Each month the longest takeaways go to the roomiest
         papers so every one fits at a readable size; every sign still gets a different notepad. */
      var NB=[[689, 717, 16, 33, 66, 36, 1, 0, 0, 0], [685, 642, 28, 32, 52, 44, 2, 34.0, 6.91, 0], [666, 637, 18, 35, 68, 33, 3, 33.4, 3.914, 0], [760, 708, 15, 27, 53, 52, 4, 0, 0, 0], [865, 795, 28, 26, 50, 50, 5, 28.95, 5.2, -1.93], [670, 900, 22, 37, 57, 49, 6, 0, 0, 0], [731, 724, 29, 31, 56, 54, 7, 35.67, 4.66, 0.95], [656, 753, 24, 24, 66, 40, 8, 28.6, 5.67, 0], [843, 900, 14, 34, 64, 44, 9, 0, 0, 0], [900, 890, 15, 34, 60, 44, 10, 0, 0, 0], [900, 791, 23, 12, 70, 64, 15, 13.6, 6.47, 0], [900, 684, 27, 36, 54, 46, 12, 31.41, 5.25, -1.1]], NOTEFOR={};
      (function(){
        var cap=function(n){ var W=420, H=W*n[1]/n[0], bw=W*n[4]/100, bh=H*n[5]/100, sp=n[8]/100*H, fs, lines;
          fs=16;   /* compare every paper at the same writing size */
          if(n[7]){ if(sp<18 && sp*2*.92>=fs) sp*=2; lines=Math.max(1,Math.floor(bh/sp)-1); }
          else lines=Math.floor((bh-20)/(fs*1.18));
          return lines*bw/(fs*.42); };
        var want=Object.keys(M.signs||{}).filter(function(s){ return M.signs[s].note; })
              .sort(function(a,b){ return String(M.signs[b].note).length-String(M.signs[a].note).length; });
        var notes=NB.slice().sort(function(a,b){ return cap(b)-cap(a); });
        want.forEach(function(s,i){ NOTEFOR[s]=notes[i%notes.length]; });
      })();
      Object.keys(M.signs||{}).forEach(function(s){
        /* Bri, 2 Nov: the readings are editorial articles (built into the page by tools/season_build.py);
           this refills them for a month picked with ?m= */
        var c=M.signs[s], li=document.querySelector('.ed-sign[data-sign="'+s+'"]'); if(!li||!c) return;
        if(c.teaser){ var tg=li.querySelector('.tagline'); if(tg) tg.textContent=c.teaser; }   /* the month's teaser is the deck */
        if(!c.ready) return;
        var ch=document.getElementById(s+'-chapter'); if(!ch) return;
        ch.querySelector('h4').innerHTML=rich(c.title);
        ch.querySelector('.ed-cols').innerHTML=paras(c.body);
        if(c.house){ var mt=ch.querySelector('.meta'); if(mt) mt.textContent=M.label+' ✦ '+c.house; }
        var asd=ch.querySelector('aside'), old=asd.querySelector('.ts-note,.k,ul'); while(old){ old.remove(); old=asd.querySelector('.ts-note,.k,ul'); }
        asd.insertAdjacentHTML('afterbegin','<span class="k"></span><ul></ul>');
        var ul=ch.querySelector('aside ul'), k=ch.querySelector('aside .k');
        /* Bri, 31 Oct: the takeaway sits on one of her clipboards / notepads (assets/notes/note-NN.webp), a different
           one for each sign, like the corkboards on the other pages. The words sit inside the paper's writing area
           (NB: image width, height, then the area as x, y, w, h in percent) and shrink to fit it.
           Body font by default (legibility first); ?notes=hand shows the handwriting version for comparison. */
        if(c.note){
          var nb=NOTEFOR[s], nn=('0'+nb[6]).slice(-2);   /* [w, h, x, y, w%, h%, note number] */
          k.remove();
          ul.outerHTML='<div class="ts-note" style="aspect-ratio:'+nb[0]+'/'+nb[1]+';background-image:url(/assets/notes/note-'+nn+'.webp)">'+
            '<div class="ts-note-in'+(nb[7]?' ruled':'')+'" data-box="'+nb.slice(2,6).join(' ')+'" data-rule="'+nb.slice(7,10).join(' ')+'" style="left:'+nb[2]+'%;top:'+nb[3]+'%;width:'+nb[4]+'%;height:'+nb[5]+'%"><span class="k">Remember</span><p class="note">'+rich(c.note)+'</p></div></div>';
          ch.querySelector('aside').classList.add('has-note');
        }
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
    var papers=Array.prototype.slice.call(document.querySelectorAll('.torn, .sticker, .tour-go, .pan-tag, .strip-go, .duo-sway, .ts-tag, .ts-inart'));
    if(papers.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var pq=false;
      var sway=function(){ pq=false; var vh=innerHeight;
        papers.forEach(function(el,i){ var r=BOX(el); if(r.bottom<-80||r.top>vh+80) return;
          var k=((r.top+r.height/2)-vh/2)/vh;   /* -1..1 as it crosses the screen */
          /* Bri, 31 Oct: a graphic that belongs to a This Season article stays inside the article's lines. It doesn't
             travel or turn; it only breathes a little smaller and back, so it never reaches a rule. */
          if(el.classList.contains('ts-inart')){ el.style.scale=(1-.045*Math.abs(Math.sin(k*2.2+i))).toFixed(3); return; }
          var lean=(i%2?2.2:-2.6);   /* its resting lean, alternating */
          /* the big pieces on the home page (photo, plate, notes) and the strip's tags move more gently */
          var calm=el.classList.contains('ts-calm'), big=el.classList.contains('duo-big'),
              a=calm?.18:big?.5:el.classList.contains('duo-sway')?1:el.classList.contains('strip-go')?.35:1,
              m=calm?(innerWidth>900 && !el.classList.contains('ts-art')?Math.min(3.4,innerWidth/430):1.3):big?1.1:a;   /* how far it travels; This Season's graphics barely turn (Bri, 29 Oct) */
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

  /* (31 Oct: this used to be called drift too, which replaced the floating stamps' own drift and froze them site-wide.)
     Drift (Bri, 28 Oct): the lace butterfly and the lace bow turn and travel as they cross the screen.
     data-drift="x y turn" = pixels and degrees over one screen of scrolling, plus a little flutter. Scrolling down,
     a positive x carries the piece toward the left. Separate translate / rotate properties keep each resting tilt. */
  try{
    var drifters=Array.prototype.slice.call(document.querySelectorAll('[data-drift]'));
    if(drifters.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var dq=false;
      var driftBy=function(){ dq=false; var vh=innerHeight;
        drifters.forEach(function(el){ var r=BOX(el); if(r.bottom<-120||r.top>vh+120) return;
          var v=(el.getAttribute('data-drift')||'0 0 0').split(/\s+/).map(Number);
          /* Bri, 31 Oct: on a wide screen This Season's graphics barely seemed to move, so there they travel and zoom
             further (the turn stays the same) */
          if(el.classList.contains('ts-sticker') && innerWidth>900){ var g=Math.min(2.6,innerWidth/560); v=[v[0]*g,v[1]*g,v[2],v[3]*1.8]; }
          var
              k=Math.max(-1.2,Math.min(1.2,((r.top+r.height/2)-vh/2)/vh)), f=Math.sin(k*5.2);
          /* optional data-drift-from="k0": the piece sits exactly where it is placed when it enters low on the screen (k0)
             and only travels away from there as it rises (Plot Twist starts on the divider line, Bri 31 Oct) */
          var k0=el.getAttribute('data-drift-from'); if(k0!==null){ k=Math.min(0,k-(+k0)); f=Math.sin(k*5.2)*.4; }
          el.style.translate=(v[0]*k+f*3).toFixed(1)+'px '+(v[1]*k+Math.cos(k*4.4)*3).toFixed(1)+'px';
          el.style.rotate=(v[2]*k+f*v[2]*.25).toFixed(2)+'deg';
          /* optional 4th value: it stretches and squashes, changing shape as it goes */
          if(v[3]>0){ var q=Math.sin(k*4.8)*v[3]; el.style.scale=(1+q).toFixed(3)+' '+(1-q*.7).toFixed(3); }
          else if(v[3]<0){ el.style.scale=(1-v[3]*Math.cos(k*2.4)).toFixed(3); }   /* negative: a slow zoom in and out */ }); };
      addEventListener('scroll',function(){ if(!dq){ dq=true; requestAnimationFrame(driftBy); } },{passive:true});
      addEventListener('resize',driftBy); driftBy();
    }
  }catch(e){}

  /* Spread (Bri, 31 Oct): a group marked data-spread="k" keeps its pieces (.sp) together while it sits low on the screen;
     as it scrolls up they move apart, each straight away from the group's centre (k = how far, as a share of its distance). */
  try{
    var groups=Array.prototype.slice.call(document.querySelectorAll('[data-spread]'));
    if(groups.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      var spq=false;
      var spreadOut=function(){ spq=false; var vh=innerHeight;
        groups.forEach(function(g){ var r=BOX(g); if(r.bottom<-200||r.top>vh+200||!r.width) return;
          var k=+g.getAttribute('data-spread')||.3, cy=r.top+r.height/2,
              t=Math.max(0,Math.min(1,(vh*.85-cy)/(vh*.7))); t=t*t*(3-2*t);   /* 0 near the bottom of the screen, 1 near the top */
          var z=window.OPHI_Z||1;
          Array.prototype.forEach.call(g.querySelectorAll('.sp'),function(p){
            var dx=(p.offsetLeft+p.offsetWidth/2)-g.offsetWidth/2, dy=(p.offsetTop+p.offsetHeight/2)-g.offsetHeight/2;
            p.style.translate=(dx*k*t).toFixed(1)+'px '+(dy*k*t).toFixed(1)+'px'; }); }); };
      addEventListener('scroll',function(){ if(!spq){ spq=true; requestAnimationFrame(spreadOut); } },{passive:true});
      addEventListener('resize',spreadOut); addEventListener('load',spreadOut); spreadOut();
    }
  }catch(e){}

  /* the takeaway notes: the words shrink until they fit the paper's writing area (they're measured when a card opens) */
  try{
    /* Bri, 31 Oct (evening): handwriting on the notes, with nothing overlapping the clips, pins or stars, and on ruled
       paper every line of writing sits on a printed line. data-rule = "first line y %, line spacing %, tilt deg"
       (measured from each notepad image); the label takes the first line, the takeaway the lines below it.
       ?notes=body shows the body-font version; ?ink=charcoal|gray|purple previews the handwriting colour. */
    var R=document.documentElement;
    if(/[?&]notes=body\b/.test(location.search)) R.classList.add('notes-body');
    var ink=(location.search.match(/[?&]ink=(\w+)/)||[])[1]; if(ink) R.classList.add('ink-'+ink);
    var baseline=function(el){ var m=document.createElement('i'); m.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
      el.insertBefore(m,el.firstChild); var y=m.getBoundingClientRect().top; m.remove(); return y; };
    var fitNotes=function(){ Array.prototype.forEach.call(document.querySelectorAll('.ts-note-in'),function(n){
      if(!n.offsetParent) return;
      var body=R.classList.contains('notes-body'), p=n.querySelector('.note'), k=n.querySelector('.k'), note=n.parentNode,
          W=note.offsetWidth, H=note.offsetHeight, bx=n.getAttribute('data-box').split(' ').map(Number),
          rl=(n.getAttribute('data-rule')||'0 0 0').split(' ').map(Number);
      p.style.top=k.style.top=''; n.style.transform='';
      if(!rl[0]){   /* plain paper: fit inside the clear writing area */
        /* Bri, 2 Nov: the writing grows to fill the clear area (largest size that fits), not just shrinks to fit */
        var lo=body?11.5:12, hi=body?19:32, fits=function(f){ p.style.fontSize=f+'px'; return n.scrollHeight<=n.clientHeight+1 && n.scrollWidth<=n.clientWidth+1; };
        p.style.lineHeight='';
        if(fits(hi)) return;
        while(hi-lo>.25){ var mid=(lo+hi)/2; if(fits(mid)) lo=mid; else hi=mid; }
        fits(lo);
        return; }
      /* ruled paper: one line of writing per printed line */
      /* tightly ruled paper writes on every other line; if the takeaway is too long for that, on every line */
      var lay=function(sp){
        var pitch=sp/100*H, first=rl[0], top=bx[1], bot=bx[1]+bx[3];
        while(first<top+sp*.7) first+=rl[1];                        /* room above the first line for the tall letters */
        var lines=0; while(first+lines*sp<=bot+.01) lines++;        /* lines inside the clear area */
        n.style.top=(first-sp)+'%'; n.style.height=(lines*sp)+'%'; n.style.justifyContent='flex-start';
        k.style.lineHeight=p.style.lineHeight=pitch+'px'; k.style.margin='0'; p.style.margin='0';
        var fs=Math.min(body?19:32, pitch*(body?.62:.92)), min=body?11:12.5;
        p.style.fontSize=fs+'px';
        while(p.offsetHeight>pitch*(lines-1)+1 && fs>min){ fs-=.5; p.style.fontSize=fs+'px'; }
        return {sp:sp, pitch:pitch, fs:fs, ok:p.offsetHeight<=pitch*(lines-1)+1};
      };
      /* tightly ruled: try every other line and every line, keep whichever lets the writing be bigger */
      /* Bri, 2 Nov: write on every line, every other line or every third, whichever lets the writing be biggest */
      var best=null;
      [1,2,3].forEach(function(m){ var sp=rl[1]*m; if(sp/100*H<15||sp/100*H>52) return;
        var T=lay(sp); if(T.ok && (!best || T.fs>best.fs)) best=T; });
      /* Bri, 2 Nov: on lined paper the writing always sits on the printed lines; it only writes freely if no spacing fits at all */
      if(!best){
        n.style.top=bx[1]+'%'; n.style.height=bx[3]+'%'; n.style.justifyContent='';
        k.style.lineHeight=p.style.lineHeight=k.style.margin=p.style.margin='';
        var lo2=body?11.5:12, hi2=body?19:32, fit2=function(f){ p.style.fontSize=f+'px'; return n.scrollHeight<=n.clientHeight+1 && n.scrollWidth<=n.clientWidth+1; };
        if(!fit2(hi2)){ while(hi2-lo2>.25){ var md=(lo2+hi2)/2; if(fit2(md)) lo2=md; else hi2=md; } fit2(lo2); }
        if(rl[2]) n.style.transform='rotate('+rl[2]+'deg)';
        return;
      }
      var L=lay(best.sp);
      var pitch=L.pitch;
      /* drop each baseline onto its printed line (a hair above it) */
      var t0=n.getBoundingClientRect().top;
      k.style.top=((pitch-2)-(baseline(k)-t0)).toFixed(1)+'px';
      p.style.top=((2*pitch-2)-(baseline(p)-t0)).toFixed(1)+'px';
      if(rl[2]) n.style.transform='rotate('+rl[2]+'deg)';
    }); };
    document.addEventListener('click',function(e){ if(e.target.closest('.rising > button, .ed-sign')) setTimeout(fitNotes,30); });
    addEventListener('resize',fitNotes); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitNotes);
    window.OPHI_FIT_NOTES=fitNotes;
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

  /* This Season (Bri, 2 Nov): each rising article opens its chapter under its row; one open at a time.
     Links to #leo and the older #leo-rising both open Leo. */
  try{
    var eds=Array.prototype.slice.call(document.querySelectorAll('.ed-sign'));
    var chOf=function(a){ return document.getElementById(a.getAttribute('data-sign')+'-chapter'); };
    var shut=function(a){ a.classList.remove('open'); var c=chOf(a); if(c) c.classList.remove('open'); a.querySelector('.ed-btn').setAttribute('aria-expanded','false'); };
    var show=function(a,scroll){
      var was=a.classList.contains('open');
      eds.forEach(shut);
      if(was) return;
      a.classList.add('open'); var c=chOf(a); if(c) c.classList.add('open');
      a.querySelector('.ed-btn').setAttribute('aria-expanded','true');
      if(history.replaceState) history.replaceState(null,'','#'+a.id);
      if(window.OPHI_FIT_NOTES) setTimeout(window.OPHI_FIT_NOTES,30);
      if(scroll!==false){ var top=BOX(a).top;
        if(top<70||top>innerHeight*.6) a.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'}); }
    };
    eds.forEach(function(a){
      a.addEventListener('click',function(e){ if(e.target.closest('a')) return; show(a); });
      var c=chOf(a), x=c&&c.querySelector('.close');
      if(x) x.addEventListener('click',function(){ shut(a); a.querySelector('.ed-btn').focus(); });
    });
    if(eds.length){
      document.addEventListener('keydown',function(e){
        if(e.key!=='Escape') return;
        eds.forEach(function(a){ if(a.classList.contains('open')){ shut(a); a.querySelector('.ed-btn').focus(); } });
      });
      /* the "Find your sign" index opens the sign it jumps to */
      Array.prototype.forEach.call(document.querySelectorAll('.ed-index a'),function(l){
        l.addEventListener('click',function(e){ var a=document.getElementById(l.getAttribute('href').slice(1)); if(!a) return;
          e.preventDefault(); if(!a.classList.contains('open')) show(a,false);
          a.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'}); });
      });
      var openHash=function(){ var id=location.hash.slice(1).replace(/-rising$/,''), a=id&&document.getElementById(id);
        if(a && a.classList.contains('ed-sign') && !a.classList.contains('open')) show(a); };
      openHash(); addEventListener('hashchange',openHash);
    }
  }catch(e){}

  /* Book a Reading FAQ (2 Nov): a link to one answer (/book/#faq-birth-time) opens it */
  try{
    var faqHash=function(){ var d=location.hash&&document.getElementById(location.hash.slice(1));
      if(d && d.tagName==='DETAILS'){ d.open=true; d.scrollIntoView({block:'start'}); } };
    faqHash(); addEventListener('hashchange',faqHash);
    /* Bri, 2 Nov: one answer open at a time; a click anywhere else closes it */
    var qs=Array.prototype.slice.call(document.querySelectorAll('.faq-q'));
    qs.forEach(function(d){ d.addEventListener('toggle',function(){ if(d.open) qs.forEach(function(o){ if(o!==d) o.open=false; }); }); });
    if(qs.length) document.addEventListener('click',function(e){ if(!e.target.closest('.faq-q')) qs.forEach(function(o){ o.open=false; }); });
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
