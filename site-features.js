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
  function update(){
    document.querySelectorAll('[data-wishlist-id]').forEach(function(b){
      var on=PLWishlist.has(b.getAttribute('data-wishlist-id'));
      b.classList.toggle('saved',on);b.setAttribute('aria-pressed',on?'true':'false');
      b.setAttribute('title',on?'Remove from wishlist':'Add to wishlist');
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