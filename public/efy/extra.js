import {$, $all, $root, $add, $append, $insert, $css_prop, $audio_play, efy_audio, $wait} from './efy.js'; (()=>{ efy_audio.folder = $css_prop('--efy_audio_folder');

/*Nature Effects*/

$append($('.efy_sidebar'), $add('details', {id: 'efy_nature', efy_select: ''}, [$add('summary', {efy_lang: 'nature_effects'}, [$add('i', {efy_icon: 'dots'})]), $add('div', {efy_tabs: 'efy_nature'})]));

/*Tabs*/ for (let a = ['visual', 'audio'], b = $('[efy_tabs=efy_nature]'), i = 0; i < a.length; i++) {
    $append(b, $add('button', {efy_tab: a[i], efy_lang: a[i]}));
}
for (let a = ['visual', 'audio'], c = $('[efy_tabs=efy_nature]'), i = 0; i < a.length; i++) {
    $append(c, $add('div', {efy_content: a[i], efy_select: '', id: `efy_${a[i]}`}))
}

/*Active*/ for (let a = ['[efy_tab=visual]', '[efy_content=visual]'], b = '#efy_nature ', i = 0; i < a.length; i++){$(b + a[i]).setAttribute('efy_active', '')}

for (let a = ['snow', 'rain', 'leaf', 'flower', 'bubble'], b = 'snow rain leaves flowers bubbles'.split(' '), c = $('#efy_nature [efy_content=visual]'), i = 0; i < a.length; i++) {
  $append(c, $add('input', {type: 'checkbox', name: 'efy_nature_visual', id: `efy_nature_visual_${a[i]}`}));
  $append(c, $add('label', {for: `efy_nature_visual_${a[i]}`, efy_lang: b[i]}));
  $insert($('body'), 'afterbegin', $add('div', {efy_anim: a[i], 'aria-hidden': 'true'}));
}

for (let a = 'forest rain waves underwater people fireworks dreamy'.split(' '), b = $('#efy_nature [efy_content=audio]'), i = 0; i < a.length; i++) {
  $append(b, $add('input', {type: 'checkbox', name: 'efy_nature_audio', id: `efy_nature_audio_${a[i]}`}));
  $append(b, $add('label', {for: `efy_nature_audio_${a[i]}`, efy_lang: a[i]}));
}


$('#efy_nature_visual_rain').addEventListener('click', (x)=>{ if (x.target.checked == true){
  for (let i = 0; i < 100; i++){
      $append($('[efy_anim*=rain]'), $add('div', {class: 'efy_anim_child', style: `left: ${Math.floor(Math.random() * window.innerWidth)}px; animation-duration: ${0.2 + Math.random() * 3.9}s; animation-delay: ${Math.random() * 5}s`}));
}} else {$('[efy_anim*=rain]').textContent = ''} })

for (let e = ['snow', 'leaf', 'flower', 'bubble'], ax = ['❅ ❅ ❆ ❄ ❅ ❆ ❄ ❅ ❆ ❄', '🍂 🍁 🍂 🍁 🍂 🍁 🍂 🍁 🍂 🍁', '🌸 🌼 🌸 🌼 🌸 🌼 🌸 🌼 🌸 🌼', '᳃ ⸰ ᪤ ᳃ ⸰ ᪤ ᳃ ⸰ ᪤ ᳃'], j = 0; j < e.length; j++){ let f = $(`[efy_anim*=${e[j]}]`); f.setAttribute('efy_anim', f.getAttribute('efy_anim')+' falling');
  $(`#efy_nature_visual_${e[j]}`).addEventListener('click', (x)=>{ if (x.target.checked == true){
    for (let a = ax[j].split(' '), b = '1 10 20 30 40 50 60 70 80 90'.split(' '), c = '0 1 6 4 2 8 6 2.5 1 3'.split(' '), d = '0 1 .5 2 2 3 2 1 0 1.5'.split(' '), i = 0; i < a.length; i++) {
      $append($(`[efy_anim*=${e[j]}]`), $add('div', {class: 'efy_anim_child', style: `left: ${b[i]}%; animation-delay: ${c[i]}s, ${d[i]}s`}, [a[i]]))
}} else {$(`[efy_anim*=${e[j]}]`).textContent = ''} })}


/*Audio*/ let b = 'forest rain waves underwater people fireworks dreamy'.split(' '); b.forEach(x => { efy_audio[x] = new Audio(`${efy_audio.folder}/${x}.webm`) });
if (localStorage.efy_audio_status == 'on' ){ for (let i = 0; i < b.length; i++){
  $(`#efy_nature_audio_${b[i]}`).addEventListener('click', (x)=>{ if (x.target.checked == true){ $audio_play(efy_audio[b[i]]); efy_audio[b[i]].loop = true; }
  else {efy_audio[b[i]].pause(); efy_audio[b[i]].currentTime = 0;} })}}


/*Keyboard*/

$append($('#efy_accessibility'), $add('details', {id: 'efy_keyboard', efy_select: ''}, [$add('summary', {efy_lang: 'virtual_keyboard'}) ]));

$insert($('body'), 'afterbegin', $add('div', {efy_keyboard: '', class: 'efy_hide_i'}));

for (let c = `${'`'} 1 2 3 4 5 6 7 8 9 0 - = q w e r t y u i o p [ ] a s d f g h j k l ; ' z x c v b n m , . /`, d = `~ ! @ # $ % ^ & * ( ) _ + Q W E R T Y U I O P { } A S D F G H J K L : | Z X C V B N M < > ?`, a = c.split(' '), b = d.split(' '), i = 0; i < a.length; i++) {
    $append($('[efy_keyboard]'), $add('button', {efy_key: a[i]}, [a[i]]));
    $(`[efy_key="${a[i]}"]`).addEventListener('click', ()=>{ $('input').value += a[i] });

    $append($('[efy_keyboard]'), $add('button', {efy_key: `${b[i]}`, class: 'efy_hide'}, [b[i]]));
    $(`[efy_key="${b[i]}"]`).addEventListener('click', ()=>{ $('input').value += b[i] });
}

for (let a = ['space', 'caps', 'backspace', 'close'], b = ['dots', 'star', 'remove', 'remove'], i = 0; i < a.length; i++) {
    $append($('[efy_keyboard]'), $add('button', {efy_key: a[i], class: 'efy_show'}, [$add('i', {efy_icon: b[i]})]))}

$(`[efy_key="space"]`).addEventListener('click', ()=>{ $('input').value += ' ' });

let backspace =()=>{ let a = $('input').value; $('input').value = a.slice(0, -1) }, intv;

$(`[efy_key="caps"]`).addEventListener('click', ()=>{
    $all('[efy_key]:not(.efy_show)').forEach(a =>{ a.classList.toggle('efy_hide') })
});

$(`[efy_key="backspace"]`).addEventListener('click', backspace);
$(`[efy_key="backspace"]`).addEventListener('pointerdown', ()=>{ intv = setInterval(backspace, 100) });
$(`[efy_key="backspace"]`).addEventListener('pointerup', ()=> clearInterval(intv) );
$(`[efy_key="backspace"]`).addEventListener('pointerleave', ()=> clearInterval(intv) );

$all('input:not([type="color"], [type="radio"], [type="checkbox"])').forEach(a =>{ a.addEventListener('focus', ()=>{ $('body').setAttribute('efy_kb', '') })});

$all('[efy_keyboard] [efy_key="close"]').forEach(a =>{ a.addEventListener('click', ()=>{ $('body').removeAttribute('efy_kb')})});

/*Prevent Default*/ $all('[efy_keyboard]').forEach(a => a.addEventListener('contextmenu', ()=> event.preventDefault()));

let a = $('#efy_keyboard');
$append(a, $add('input', {type: 'checkbox', name: 'efy_keyboard', id: 'efy_keyboard_status'}));
$append(a, $add('label', {for: 'efy_keyboard_status', efy_lang: 'on_off'}));
$('#efy_keyboard_status').addEventListener('click', ()=>{
    $('[efy_keyboard]').classList.toggle('efy_hide_i')
});



/*Wait*/ $wait(1, ()=>{
  /*Alpha*/ for (let a =['nature', 'keyboard'], i=0; i<a.length; i++){
    $insert($(`#efy_${a[i]} > summary`), 'beforeend', $add('mark', {efy_lang: 'alpha'}))
  }
});

})();