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
    s.textContent='.wishlist-header svg{fill:#111!important;stroke:#111!important}.wishlist-count{background:#111!important;color:#fff!important;border:0!important;font-weight:800!important;display:none;align-items:center;justify-content:center}';
    document.head.appendChild(s);
  }
  function update(){
    addWishlistHeaderStyle();
    document.querySelectorAll('[data-wishlist-id]').forEach(function(b){
      var on=PLWishlist.has(b.getAttribute('data-wishlist-id'));
      b.classList.toggle('saved',on);b.setAttribute('aria-pressed',on?'true':'false');
      b.setAttribute('title',on?'Remove from wishlist':'Add to wishlist');
      b.setAttribute('aria-label',on?'Remove from wishlist':'Add to wishlist');
      b.innerHTML=on?'♥':'♡';
    });
    document.querySelectorAll('.wishlist-count').forEach(function(e){var n=PLWishlist.count();e.textContent=n;e.style.display=n?'inline-flex':'none'});
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-wishlist-id]');if(!b)return;
    e.preventDefault();e.stopPropagation();PLWishlist.toggle(b.getAttribute('data-wishlist-id'));update();
  });
  document.addEventListener('pl:wishlist',update);
  document.addEventListener('DOMContentLoaded',update);
})();
(function(){
  function bagCount(){try{return JSON.parse(localStorage.getItem('popandlock-bag')||'[]').reduce(function(n,x){return n+Math.max(0,Number(x.qty)||0)},0)}catch(e){return 0}}
  function mountMobileUI(){
    if(document.querySelector('.pl-mobile-nav'))return;
    var nav=document.querySelector('.pl-mobile-nav');if(nav)nav.remove();
    var basket=document.createElement('a');basket.href='bag.html';basket.className='pl-persistent-bag';basket.innerHTML='<span>🛍</span><b>BAG</b><i>'+bagCount()+'</i>';document.body.appendChild(basket);
    function refresh(){var n=bagCount();basket.querySelector('i').textContent=n;basket.style.display=n?'flex':'none'}refresh();window.addEventListener('storage',refresh);setInterval(refresh,1500);
  }
  function transitions(){
    document.documentElement.classList.add('pl-transitions');
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');if(!a||a.target==='_blank')return;
      var href=a.getAttribute('href');if(!href||href.charAt(0)==='#'||href.indexOf('javascript:')===0||href.indexOf('mailto:')===0)return;
      try{var u=new URL(href,location.href);if(u.origin!==location.origin)return}catch(err){return}
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();document.documentElement.classList.add('pl-leaving');setTimeout(function(){location.href=href},180);
    });
  }
  function refreshMobileBag(){var n=bagCount();document.querySelectorAll('.pl-mobile-bag i').forEach(function(x){x.textContent=n})}
  document.addEventListener('DOMContentLoaded',function(){mountMobileUI();transitions();refreshMobileBag()});
  window.addEventListener('pageshow',function(){document.documentElement.classList.remove('pl-leaving');document.body.classList.remove('pl-leaving');});
  window.addEventListener('storage',refreshMobileBag);
})();