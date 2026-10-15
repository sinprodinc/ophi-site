/* The cursor star trail from the main site, for the chart page's masthead. Kept in sync with src/ophi.base.js. */
(function(){
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

})();
