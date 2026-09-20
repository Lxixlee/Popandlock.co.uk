/* Pop & Lock collector features: wishlist + recently viewed */
(function(){
  function read(key){try{var v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
  function write(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch(e){}}
  window.PLWishlist={
    all:function(){return read('popandlock-wishlist')},
    has:function(id){return this.all().some(function(x){return String(x)===String(id)})},
    toggle:function(id){var a=this.all(),i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.unshift(id);write('popandlock-wishlist',a);document.dispatchEvent(new CustomEvent('pl:wishlist'));return i<0},
    count:function(){return this.all().length}
  };
  window.PLRecent={
    all:function(){return read('popandlock-recent').filter(Boolean)},
    add:function(id){var a=this.all().filter(function(x){return String(x)!==String(id)});a.unshift(id);write('popandlock-recent',a.slice(0,12));document.dispatchEvent(new CustomEvent('pl:recent'))}
  };
  function addWishlistHeaderStyle(){
    if(document.getElementById('pl-wishlist-header-style'))return;
    var s=document.createElement('style');
    s.id='pl-wishlist-header-style';
    s.textContent='.wishlist-header{position:relative}.wishlist-header svg{fill:none!important;stroke:#111!important;filter:none}.wishlist-header.has-wishlist svg{fill:#111!important;stroke:#111!important}.wishlist-header .wishlist-count{position:absolute!important;top:50%!important;left:50%!important;right:auto!important;transform:translate(-50%,-50%)!important;min-width:0!important;width:auto!important;height:auto!important;padding:0!important;border-radius:0!important;background:transparent!important;color:#fff!important;border:0!important;font-size:10px!important;font-weight:800!important;line-height:1!important;display:none;align-items:center;justify-content:center;pointer-events:none;text-align:center}';
    document.head.appendChild(s);
  }
  function update(){
    addWishlistHeaderStyle();
    var hasWishlist=PLWishlist.count()>0;
    document.querySelectorAll('.wishlist-header').forEach(function(b){b.classList.toggle('has-wishlist',hasWishlist)});
    document.querySelectorAll('[data-wishlist-id]').forEach(function(b){
      var on=PLWishlist.has(b.getAttribute('data-wishlist-id'));
      b.classList.toggle('saved',on);
      b.setAttribute('aria-pressed',on?'true':'false');
      b.setAttribute('title',on?'Remove from wishlist':'Add to wishlist');
      b.setAttribute('aria-label',on?'Remove from wishlist':'Add to wishlist');
      b.innerHTML=on?'♥':'♡';
    });
    document.querySelectorAll('.wishlist-count').forEach(function(e){
      var n=PLWishlist.count();
      e.textContent=n;
      e.style.display=n?'flex':'none';
    });
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-wishlist-id]');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    PLWishlist.toggle(b.getAttribute('data-wishlist-id'));
    update();
  });
  document.addEventListener('pl:wishlist',update);
  document.addEventListener('DOMContentLoaded',update);
})();
(function(){
  function bagCount(){try{return JSON.parse(localStorage.getItem('popandlock-bag')||'[]').reduce(function(n,x){return n+Math.max(0,Number(x.qty)||0)},0)}catch(e){return 0}}
  function mountMobileUI(){
    var nav=document.querySelector('.pl-mobile-nav');
    if(nav)nav.remove();
    var basket=document.querySelector('.pl-persistent-bag');
    if(!basket){
      basket=document.createElement('a');
      basket.href='bag.html';
      basket.className='pl-persistent-bag';
      basket.innerHTML='<span>🛍</span><b>BAG</b><i>0</i>';
      document.body.appendChild(basket);
    }
    function refresh(){var n=bagCount();basket.querySelector('i').textContent=n;basket.style.display=n?'flex':'none'}
    refresh();
    window.addEventListener('storage',refresh);
    setInterval(refresh,1500);
  }
  function transitions(){
    document.documentElement.classList.add('pl-transitions');
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');
      if(!a||a.target==='_blank')return;
      var href=a.getAttribute('href');
      if(!href||href.charAt(0)==='#'||href.indexOf('javascript:')===0||href.indexOf('mailto:')===0)return;
      try{var u=new URL(href,location.href);if(u.origin!==location.origin)return}catch(err){return}
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();
      document.documentElement.classList.add('pl-leaving');
      setTimeout(function(){location.href=href},180);
    });
  }
  function refreshMobileBag(){var n=bagCount();document.querySelectorAll('.pl-mobile-bag i').forEach(function(x){x.textContent=n})}
  document.addEventListener('DOMContentLoaded',function(){mountMobileUI();transitions();refreshMobileBag()});
  window.addEventListener('pageshow',function(){document.documentElement.classList.remove('pl-leaving');document.body.classList.remove('pl-leaving')});
  window.addEventListener('storage',refreshMobileBag);
})();
(function(){
  function scrollReveal(){
    if(document.getElementById('pl-scroll-reveal-style'))return;
    var s=document.createElement('style');
    s.id='pl-scroll-reveal-style';
    s.textContent='
      @media (prefers-reduced-motion:no-preference){
        .pl-reveal{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);will-change:opacity,transform}
        .pl-reveal.pl-revealed{opacity:1;transform:none}
        .pl-reveal[data-reveal-delay="1"]{transition-delay:.07s}
        .pl-reveal[data-reveal-delay="2"]{transition-delay:.14s}
        .pl-reveal[data-reveal-delay="3"]{transition-delay:.21s}
        .pl-reveal[data-reveal-delay="4"]{transition-delay:.28s}
        .pl-reveal[data-reveal-delay="5"]{transition-delay:.35s}
      }
    ';
    document.head.appendChild(s);
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var selectors='.heading,.section,.category-grid,.event-grid,.grid,.related-products,.collection-strip,.benefits,.footer-info,.footer-links,.event-product,.card,.related-card,.collector-panel,.product-share,.sell-card,.contact-card,.live-card';
    var nodes=[];
    document.querySelectorAll(selectors).forEach(function(el){
      if(el.closest('.hero-reel,.hero-track,.event-opening-system'))return;
      if(el.classList.contains('pl-reveal'))return;
      el.classList.add('pl-reveal');
      nodes.push(el);
    });
    if(!('IntersectionObserver' in window)){
      nodes.forEach(function(el){el.classList.add('pl-revealed')});
      return;
    }
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        entry.target.classList.add('pl-revealed');
        observer.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    nodes.forEach(function(el){observer.observe(el)});
  }
  document.addEventListener('DOMContentLoaded',scrollReveal);
})();
