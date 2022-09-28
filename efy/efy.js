/*EFY UI 2022.09.28*/ let $ = document.querySelector.bind(document), $all = document.querySelectorAll.bind(document), $create = document.createElement.bind(document), $body, $root, $efy_module,
/*Append: Where, Element*/ $append = (where, el) =>{ where.appendChild(el)},
/*Insert: Where, Position, Element*/ $insert = (where, pos, el) =>{ where.insertAdjacentElement(pos,el)},
/*Get CSS Property*/ $css_prop = (a) =>{ return getComputedStyle($root).getPropertyValue(a).replaceAll(' ','')},
/*Add: Element, {Attributes}, [Children, Text] (optional)*/ $add = (el, atb = {}, cld = []) => { const x = $create(el);
  for (let a = Object.keys(atb), b= Object.values(atb), i = 0; i < a.length; i++){ x.setAttribute(a[i], b[i])}
  cld.forEach(c => { if(!c) return; const cd = (typeof c === 'string') ? document.createTextNode(c) : c; x.appendChild(cd) })
return x},
/*Cursor FN*/ cursor_fn = (e) =>{let x = $('[efy_cursor]'); x.style.left = e.pageX + 'px'; x.style.top = e.pageY + 'px'};

window.onload = async ()=>{ $root = $(":root"), $body = $("body"); $efy_module = (a) =>{ let b = $css_prop('--efy_modules').split(',').includes(a) ? true : false; return b}; let a;

/*Check LocalStorage*/ try {let x = 'LS'; localStorage.setItem(x, x); let y = localStorage.getItem(x); localStorage.removeItem(x); if (x !== y) {throw new Error()}} catch (exception) {$append($body, $add('div', {class: 'efy_no_ls', efy_alert: '', style: 'background: #eee; grid-template-columns: 1fr; gap: 0'}, [$add('h6', {}, ['EFY - Your browser blocks LocalStorage']), $add('p', {}, ["Privacy matters! So block 3rd party cookies if you want, no worries, but please allow 1st party cookies in your browser's settings, to be able to save your EFY preferences locally. Have fun!"])]))}

/*Sidebar Modules*/ $append($body, $add('div', {id: 'efy_sidebar', class: 'efy_sidebar', efy_search: 'details:not(.efy_quick_shortcuts, [efy_logo]), .efy_sidebar [efy_tabs] > *'}, [ $add('div', {efy_about: ''}, [
    $add('details', {class: 'efy_about', efy_logo: ''}, [
    $add('summary', {}, [$add('code', {}, ['EFY']), $add('code', {}, [' UI']) ]),
    $add('div', {}, ['This page uses ', $add('code', {}, ['EFY']), ', a customisable, convergent, transparent, modular, futuristic css / js framework that can be added to your own web / local apps & websites.', $add('br', {}), $add('a', {href: 'https://efy.ooo/ui'}, [$add('button', {tabindex: '-1'}, ['Learn more'])]), $add('a', {href: 'https://matrix.to/#/#efy_ui:matrix.org'}, [$add('button', {tabindex: '-1'}, ['Matrix Chat'])]) ])
  ]), $add('button', {efy_sidebar_btn_close: ''}, [$add('i',{efy_icon: 'remove'})])
])
])); $append($body, $add('div', {efy_sidebar_btn_open: ''}));

/*Quick Shortcuts*/ if ($efy_module('efy_quick')){ $append($('.efy_sidebar'), $add('details', {id: 'efy_quick', class: 'efy_quick_shortcuts'}, [$add('summary', {}, [ $add('i', {efy_icon: 'star'}), 'Quick Shortcuts']),
    $add('div', {class: 'efy_quick_buttons'}),
    $add('div', {efy_clock: ''}), $add('div', {efy_timer: 'efy_ui0'})
]));
for (let a = ['search', 'reload', 'fullscreen', 'back', 'forward'], b = ['search', 'reload', 'fullscreen', 'chevron', 'chevron'], i = 0; i < a.length; i++) {
    $append($('.efy_quick_buttons'), $add('button', {'class': `efy_quick_${a[i]}`}, [$add('i', {efy_icon: b[i]})]))
}
$append($('.efy_quick_buttons'), $add('input', {type: 'text', efy_search_input: '', efy_display_none: '', placeholder: 'Search through menu...'}));

$(".efy_quick_search").onclick =()=> $('.efy_quick_shortcuts [efy_search_input]').toggleAttribute('efy_display_none');
$(".efy_quick_reload").onclick =()=> location.reload();
$(".efy_quick_fullscreen").onclick =()=> { document.exitFullscreen(); document.documentElement.requestFullscreen(); };
$(".efy_quick_back").onclick =()=> window.history.go(-1);
$(".efy_quick_forward").addEventListener('pointerup', async ()=> window.history.go(1));
}

/*Theme*/ if ($efy_module('efy_mode')){ $append($('.efy_sidebar'), $add('details', {id: 'efy_sbtheme', efy_select: ''}, [$add('summary', {}, [ $add('i', {efy_icon: 'star'}), 'Theme']), $add('div', {efy_tabs: 'efyui_0'})]));

/*Tabs*/ for (let a = ['mode', 'colors', 'images', 'border'], b = ['Mode', 'Colors', 'Images', 'Border'], c = $('[efy_tabs=efyui_0]'), i = 0; i < a.length; i++) { $append(c, $add('button', {efy_tab: a[i]}, [b[i]]))}
for (let a = ['mode', 'colors', 'images', 'border'], c = $('[efy_tabs=efyui_0]'), i = 0; i < a.length; i++) { $append(c, $add('div', {efy_content: a[i], efy_select: '', id: `efy_${a[i]}`})) }
/*Active*/ for (let a = ['[efy_tab=mode]', '[efy_content=mode]'], b = '[efy_tabs=efyui_0] > ', i = 0; i < a.length; i++){$(b + a[i]).setAttribute('efy_active', '')}

/*Mode*/ for (let a = ['default_mode', 'light_light', 'light_sepia', 'dark_dark', 'dark_nord', 'dark_black', 'light_trans', 'dark_trans'], b = ['Default', 'Light', 'Sepia', 'Dark', 'Nord', 'Black', 'Light', 'Dark'], c = $('#efy_sbtheme [efy_content=mode]'), i = 0; i < a.length; i++) { $append(c, $add('input', {type: 'radio', name: 'efy_mode', id: a[i]})); $append(c, $add('label', {for: a[i]}, [b[i]]))}

$insert($('#efy_sbtheme [efy_content=mode] #light_trans'), 'beforebegin', $add('details', {efy_help: ''}, [$add('summary', {}, ['Transparency']), $add('div', {}, ['If your operating system or window manager supports transparency, the background becomes transparent. Otherwise just import your own images and turn this on.'])]));

/*Colors*/ for (let a = ['efy_color1', 'efy_color2', 'efy_color_text', 'efy_color_bgcol'], b = ['Color 1', 'Color 2', 'Text', 'Background'], c = $('#efy_sbtheme [efy_content=colors]'), i = 0; i < a.length; i++) { $append(c, $add('label', {for: a[i]}, [b[i], $add('input', {id: a[i], type: 'color', value: '#555555'})]))}

for (let a = ['text', 'bgcol'], c = 'afterend', i = 0; i < a.length; i++){ let b = $(`#efy_sbtheme [efy_content=colors] [for=efy_color_${a[i]}]`); $insert(b, c, $add('label', {for: `efy_${a[i]}_status`}, ['On / Off'])); $insert(b, c, $add('input', {type: 'checkbox', name: `efy_${a[i]}_color_status`, id: `efy_${a[i]}_status`}))}
$insert($('#efy_sbtheme [efy_content=colors] [for=efy_text_status]'), 'afterend', $add('br',{}));

$insert($('#efy_sbtheme [efy_content=colors] [for=efy_color_text]'), 'beforebegin', $add('details', {efy_help: ''}, [$add('summary', {}, ['Custom Colors']), $add('div', {}, ['These colors override the default ones'])]));

/*Images*/ a = $('#efy_sbtheme [efy_content=images]'); $append(a, $add('input', {type: 'file', accept: 'image/*', id: 'pictureTest'})); $append(a, $add('div', {class: 'efy_img_previews'})); $append(a, $add('button', {class: 'efy_idb_reset'}, [$add('i', {efy_icon: 'reload'}), 'Reset']));

/*Help*/ $insert($('#efy_sbtheme [efy_content=images] .efy_img_previews'), 'afterend', $add('details', {efy_help: ''}, [$add('summary', {}, ['Warning! Bigger = Slower']), $add('div', {}, ['Keep them bellow 1MB per image, unless your device has a powerful CPU / GPU. You can also convert png, jpg etc to webp to reduce the size'])]));

/*Radius*/ a = $('#efy_sbtheme [efy_content=border]'); $append(a, $add('p', {}, ['Radius'])); $append(a, $add('div', {class: 'efy_sidebar_range'})); $append(a, $add('input', {class: 'efy_sidebar_selectRadius', type: 'range', min: '0', max: '25', value: '12', step: '1'}))
}

/*Visual Filters*/ if ($efy_module('efy_filters')){ $append($('.efy_sidebar'), $add('details', {id: 'efy_vfilters', efy_select: ''}, [$add('summary', {}, [ $add('i', {efy_icon: 'dots'}), 'Visual Filters (Beta)']), $add('div', {efy_tabs: 'efyui_filters'})]));

/*Tabs*/ for (let a = ['bg', 'content', 'trans'], b = ['Background', 'Content', 'Trans Elements'], c = $('[efy_tabs=efyui_filters]'), i = 0; i < a.length; i++) { $append(c, $add('button', {efy_tab: a[i]}, [b[i]])) }
for (let a = ['bg', 'content', 'trans'], c = $('[efy_tabs=efyui_filters]'), i = 0; i < a.length; i++) { $append(c, $add('form', {efy_content: a[i], efy_select: '', class: `efy_${a[i]}_filter`})) }
/*Active*/ for (let a = ['[efy_tab=bg]', '[efy_content=bg]'], b = '[efy_tabs=efyui_filters] >', i = 0; i < a.length; i++) { $(b +' '+ a[i]).setAttribute('efy_active', '')}

$all('[efy_tabs=efyui_filters] form').forEach(y =>{ let z = y.getAttribute('efy_content');
  $append(y, $add('button', {type: 'reset'}, [$add('i', {efy_icon: 'reload'}), 'Reset']));
  $append(y, $add('input', {class: `efy_${z}_brightness`, type: 'range', min: '0', max: '3', value: '1', step: '0.1'}));
  $append(y, $add('input', {class: `efy_${z}_blur`, type: 'range', min: '0', max: '100', value: '0', step: '1'}));
  $append(y, $add('input', {class: `efy_${z}_saturate`, type: 'range', min: '0', max: '3', value: '1', step: '0.1'}));
  $append(y, $add('input', {class: `efy_${z}_contrast`, type: 'range', min: '0.1', max: '3', value: '1', step: '0.1'}));
  $append(y, $add('input', {class: `efy_${z}_hue-rotate`, type: 'range', min: '0', max: '360', value: '0', step: '1'}));
  $append(y, $add('input', {class: `efy_${z}_sepia`, type: 'range', min: '0', max: '1', value: '0', step: '0.1'}));

  for (let a = ['Brightness', 'Blur', 'Saturation', 'Contrast', 'Hue', 'Sepia'], i = 0; i < a.length; i++){
    $insert($(`[efy_tabs=efyui_filters] [efy_content=${z}] input:nth-of-type(${i+1})`), 'beforebegin', $add('p', {}, [a[i]]))}
})}

/*Backup*/ if ($efy_module('efy_backup')){ $append($('.efy_sidebar'), $add('details', {id: 'efy_backup'}, [$add('summary', {}, [ $add('i', {efy_icon: 'arrow_down'}), 'Save & Restore'])]));
for (let a = ['localstorage', 'idb'], b = ['Settings', 'Images'], c = '#efy_backup', i = 0; i < a.length; i++) {
    $append($(c), $add('p', {}, [`EFY ${b[i]}`]));
    $append($(c), $add('a', {href: '#', class: `efy_${a[i]}_export`, download: `efy_${b[i]}.json`}, [
        $add('button', {tabindex: '-1'}, [ $add('i', {efy_icon: 'arrow_down'}), 'Save'])]));
    $append($(c), $add('button', {type: 'reset', class: `efy_${a[i]}_reset`}, [$add('i', {efy_icon: 'reload'}), 'Reset']));
    $append($(c), $add('input', {type: 'file', class: `efy_${a[i]}_import`, accept: '.json'}))
}}

/*Accessibility*/ if ($efy_module('efy_accessibility')){ $append($('.efy_sidebar'), $add('details', {id: 'efy_accessibility', efy_select: ''}, [$add('summary', {}, [ $add('i', {efy_icon: 'accessibility'}), 'Accessibility (Beta)']),
  $add('details', {id: 'efy_btn_align', efy_select: ''}, [$add('summary', {}, ['Menu Button Position']), $add('div', {})]),
  $add('details', {id: 'efy_accessibility_outline', efy_select: ''}, [$add('summary', {}, ['Outline']), $add('p', {}, ["Safari & Webkit don't support custom outline radius yet, so it's not up to efy, but the outline itself works and the radius as well on other browsers."]), $add('input', {id: 'efy_outline', type: 'checkbox', name: 'efy_accessibility'}), $add('label', {for: 'efy_outline'}, ['Focus Outline'])]),
  $add('details', {id: 'efy_accessibility_text', efy_select: ''}, [$add('summary', {}, ['Text Size']), $add('form', {class: 'efy_text_accessibility'}, [
    $add('button', {type: 'reset'}, [$add('i', {efy_icon: 'reload'}), 'Reset']),
    $add('p', {}, ['Zoom']), $add('input', {class: 'efy_ui_zoom', type: 'range', min: '1', max: '2', value: '1', step: '0.01'}),
    $add('p', {}, ['Text Spacing']), $add('input', {class: 'efy_text_spacing', type: 'range', min: '0', max: '15', value: '0', step: '1'})
  ])]),
  $add('details', {id: 'efy_accessibility_cursor', efy_select: ''}, [$add('summary', {}, ['Cursor']), $add('p', {}, ['WARNING! Only hide it on touchscreen devices!'])])
]));
for (let i = 0, a = ['left_top', 'middle_top', 'right_top', 'left_middle', 'middle_middle', 'right_middle', 'left_bottom', 'middle_bottom', 'right_bottom']; i < a.length; i++){ $append($('#efy_btn_align > div'), $add(['input'], {type: 'radio', name: 'efy_btn_align', id: a[i]}))} $('#middle_middle[name=efy_btn_align]').setAttribute('disabled','');

for (let a = ['efy_cursor_default', 'efy_cursor_custom', 'efy_cursor_none'], b = ['Default', 'Custom', 'Hide (Touchscreen)'], c = $('#efy_accessibility_cursor'), i = 0; i < a.length; i++) {
  $append(c, $add('input', {type: 'radio', name: 'efy_accessibility_cursor', id: a[i]}));
  $append(c, $add('label', {for: a[i]}, [b[i]]));
} $('#efy_cursor_default').setAttribute('checked', '');

/*Cursor*/ $append($body, $add('div', {efy_cursor: ''})); /*Storage*/ if (localStorage.efy_cursor == 'custom') {$root.setAttribute('efy_cursor_custom', ''); document.addEventListener('pointermove', cursor_fn); $('#efy_cursor_custom').setAttribute('checked','')} else if (localStorage.efy_cursor == 'none') {$root.setAttribute('efy_cursor_none', ''); $('#efy_cursor_none').setAttribute('checked','')}

/*Custom*/ $('#efy_cursor_custom').addEventListener('change', ()=>{ if ($('#efy_cursor_custom').checked) {$root.removeAttribute('efy_cursor_none'); $root.setAttribute('efy_cursor_custom', ''); document.addEventListener('pointermove', cursor_fn); localStorage.efy_cursor = 'custom'}});

/*None*/ $('#efy_cursor_none').addEventListener('change', ()=>{ if ($('#efy_cursor_none').checked) {$root.removeAttribute('efy_cursor_custom'); $root.setAttribute('efy_cursor_none',''); document.removeEventListener('pointermove', cursor_fn); localStorage.efy_cursor = 'none'}});

/*Default*/ $('#efy_cursor_default').addEventListener('change', ()=>{ if ($('#efy_cursor_default').checked) {$root.removeAttribute('efy_cursor_custom'); $root.removeAttribute('efy_cursor_none'); document.removeEventListener('pointermove', cursor_fn); localStorage.removeItem('efy_cursor')}});
}

/*Audio*/ if ($efy_module('efy_audio')){ $append($('.efy_sidebar'), $add('details', {efy_select: '', id: 'efy_audio'}, [
    $add('summary', {}, [ $add('i', {efy_icon: 'audio'}), 'Audio Effects (Beta)']),
    $add('p', {}, ['You might have to click / tap on the ssl / lock icon on your browser & allow sounds, to hear them automatically.'])]));
for (let a = ['status', 'click', 'hover'], b = ['On / Off', 'Click & Tap', 'Mouse Hover'], c = '#efy_audio > p', d = 'beforebegin', i = 0; i < a.length; i++) {
    $insert($(c), d, $add('input', {type: 'checkbox', name: 'efy_audio', id:`efy_audio_${a[i]}`}));
    $insert($(c), d, $add('label', {for: `efy_audio_${a[i]}`}, [b[i]]))
}}

/*Sidebar Modules - End*/


/*Theme*/ if (localStorage.efy_mode) {$root.setAttribute("efy_mode", localStorage.efy_mode); $("#" + localStorage.efy_mode).setAttribute("checked", "1")}
else {$root.setAttribute('efy_mode', 'default_mode'); $("#default_mode").setAttribute("checked", "1")}
$all("[name=efy_mode]").forEach(x => { x.onclick = () => { $root.setAttribute("efy_mode", x.id); localStorage.efy_mode = x.id; }; });

/*Colors*/ let efy_color = {'color1': 'efy_color', 'color2': 'efy_color2', 'color_text': 'efy_text', 'color_bgcol': 'efy_bgcol'}, rgb2hex = c => "#" + c.match(/\d+/g).map(x => (+x).toString(16).padStart(2, 0)).join``;
Object.keys(efy_color).forEach(z =>{ $(`#efy_${z}`).oninput = ev => {
let x = ev.target.value, r = parseInt(x.substr(1, 2), 16), g = parseInt(x.substr(3, 2), 16), b = parseInt(x.substr(5, 2), 16); x = `${r},${g},${b}`; localStorage.setItem(efy_color[z], x); $root.style.setProperty(`--efy_${z}_var`, x); }
let y = $css_prop(`--efy_${z}_var`);
if (localStorage.getItem(efy_color[z])) {y = localStorage.getItem(efy_color[z]); $root.style.setProperty(`--efy_${z}_var`, y)}
$(`#efy_${z}`).value = rgb2hex("rgb(" + y + ")"); });

/*Radius*/ let efy_radius_input = $(".efy_sidebar_selectRadius"), efy_sidebar_range = $(".efy_sidebar_range");
// efy_radius_steps = (efy_radius_input.max - efy_radius_input.min) , - use this instead of width // efy_radius = localStorage.efy_radius;

async function efy_radius_fn(){ let x, radius = localStorage.efy_radius; if (radius) { x = radius.replace('rem', ''); efy_radius_input.value = x; $root.style.setProperty("--efy_radius", radius); } else {x = 12;}

/*Radius: Input*/ $('[efy_tabs=efyui_0] [efy_tab="border"]').addEventListener('pointerup', ()=>{ setTimeout( ()=>{ let za = $('.efy_sidebar_selectRadius'), z = getComputedStyle(za).getPropertyValue('width').replace('px','');  efy_sidebar_range.innerText = x; efy_sidebar_range.style.left = (x * (z - 32) / efy_radius_input.max) + 'rem'; }, 100); }, {once: true}); } efy_radius_fn();

efy_radius_input.oninput = () => { let za = $('.efy_sidebar_selectRadius'), z = getComputedStyle(za).getPropertyValue('width').replace('px',''), x = efy_radius_input.value; $root.style.setProperty("--efy_radius", x + "rem"); localStorage.efy_radius = x + "rem"; efy_sidebar_range.style.left = (x * (z - 32) / efy_radius_input.max) + 'rem'; efy_sidebar_range.innerText = x; };
/*Radius: Window Resize*/ window.addEventListener('resize', () => { let za = $('.efy_sidebar_selectRadius'), z = getComputedStyle(za).getPropertyValue('width').replace('px',''), x = efy_radius_input.value; efy_sidebar_range.style.left = (x * (z - 32) / efy_radius_input.max) + 'rem'; });


/*EFY Button Position*/ if (localStorage.efy_btn_align) { $("#" + localStorage.efy_btn_align).setAttribute("checked", "1"); $("[efy_sidebar_btn_open]").setAttribute("efy_btn_align", localStorage.efy_btn_align); } else { let y = $css_prop('--efy_sidebar_button');
$('#'+y).setAttribute("checked", "1"); $('[efy_sidebar_btn_open]').setAttribute('efy_btn_align', y);}
$all("[name=efy_btn_align]").forEach(x => { x.onclick = () => { $("[efy_sidebar_btn_open]").setAttribute("efy_btn_align", x.id); localStorage.efy_btn_align = x.id; }; });

/*BgImg Filter*/ let efy_bg_filter = {}, efy_css_bg_filter = $create("style"); efy_css_bg_filter.classList.add("efy_css_bg_filter"); document.head.appendChild(efy_css_bg_filter); async function efy_bg_filter_fn(){
    ['blur','brightness','saturate','contrast','hue-rotate','sepia'].forEach(x => { efy_bg_filter[x] = $(`.efy_bg_${x}`).value; if (x == 'blur') { efy_bg_filter[x] = efy_bg_filter[x] + 'px' } else if (x == 'hue-rotate') { efy_bg_filter[x] = efy_bg_filter[x] + 'deg' } });

    let string = ''; Object.keys(efy_bg_filter).forEach(x =>{ string = string + ` ${x}(${efy_bg_filter[x]})` });
    let y = `html:before, html:after {filter: ${string} !important}`;
    efy_css_bg_filter.textContent = y; localStorage.efy_bg_filter = JSON.stringify(efy_bg_filter); localStorage.efy_bg_filter_css = y }

if (localStorage.efy_bg_filter) { efy_css_bg_filter.textContent = localStorage.efy_bg_filter_css; let efy_bg_filter = JSON.parse(localStorage.efy_bg_filter); Object.keys(efy_bg_filter).forEach(x => $(`.efy_bg_${x}`).value = efy_bg_filter[x].replace('px','').replace('deg','') ) }
$all('.efy_bg_filter input').forEach(x =>{ x.addEventListener("input", ()=>{ efy_bg_filter_fn() })  });
$all('.efy_bg_filter [type=reset]').forEach(x =>{ x.addEventListener("pointerup", ()=>{ efy_bg_filter_fn(); localStorage.removeItem('efy_bg_filter'); localStorage.removeItem('efy_bg_filter_css'); efy_css_bg_filter.textContent = '' })  });

/*Content Filter*/ let efy_content_filter = {}, efy_css_content_filter = $create("style"); efy_css_content_filter.classList.add("efy_css_content_filter"); document.head.appendChild(efy_css_content_filter); async function efy_content_filter_fn(){
    ['blur','brightness','saturate','contrast','hue-rotate','sepia'].forEach(x => { efy_content_filter[x] = $(`.efy_content_${x}`).value; if (x == 'blur') { efy_content_filter[x] = efy_content_filter[x] + 'px' } else if (x == 'hue-rotate') { efy_content_filter[x] = efy_content_filter[x] + 'deg' } });

    let string = ''; Object.keys(efy_content_filter).forEach(x =>{ string = string + ` ${x}(${efy_content_filter[x]})` });
    let y = `img, video {filter: ${string} !important}`;
    efy_css_content_filter.textContent = y; localStorage.efy_content_filter = JSON.stringify(efy_content_filter); localStorage.efy_content_filter_css = y }

if (localStorage.efy_content_filter) { efy_css_content_filter.textContent = localStorage.efy_content_filter_css; let efy_content_filter = JSON.parse(localStorage.efy_content_filter); Object.keys(efy_content_filter).forEach(x => $(`.efy_content_${x}`).value = efy_content_filter[x].replace('px','').replace('deg','') ) }
$all('.efy_content_filter input').forEach(x =>{ x.addEventListener("input", ()=>{ efy_content_filter_fn() })  });
$all('.efy_content_filter [type=reset]').forEach(x =>{ x.addEventListener("pointerup", ()=>{ efy_content_filter_fn(); localStorage.removeItem('efy_content_filter'); localStorage.removeItem('efy_content_filter_css'); efy_css_content_filter.textContent = '' })  });

/*Trans Filter*/ let efy_trans_filter = {}, efy_css_trans_filter = $create("style"); efy_css_trans_filter.classList.add("efy_css_trans_filter"); document.head.appendChild(efy_css_trans_filter); async function efy_trans_filter_fn(){
    ['blur','brightness','saturate','contrast','hue-rotate','sepia'].forEach(x => { efy_trans_filter[x] = $(`.efy_trans_${x}`).value; if (x == 'blur') { efy_trans_filter[x] = efy_trans_filter[x] + 'px' } else if (x == 'hue-rotate') { efy_trans_filter[x] = efy_trans_filter[x] + 'deg' } });

    let string = ''; Object.keys(efy_trans_filter).forEach(x =>{ string = string + ` ${x}(${efy_trans_filter[x]})` });
    let y = `details:not([efy_help]), select, input, textarea, blockquote, pre, article, table, [efy_tabs] [efy_content], [efy_timer], [efy_clock] {backdrop-filter: ${string} !important; -webkit-backdrop-filter: ${string} !important}`;
    efy_css_trans_filter.textContent = y; localStorage.efy_trans_filter = JSON.stringify(efy_trans_filter); localStorage.efy_trans_filter_css = y }

if (localStorage.efy_trans_filter) { efy_css_trans_filter.textContent = localStorage.efy_trans_filter_css; let efy_trans_filter = JSON.parse(localStorage.efy_trans_filter); Object.keys(efy_trans_filter).forEach(x => $(`.efy_trans_${x}`).value = efy_trans_filter[x].replace('px','').replace('deg','') ) }
$all('.efy_trans_filter input').forEach(x =>{ x.addEventListener("input", ()=>{ efy_trans_filter_fn() })  });
$all('.efy_trans_filter [type=reset]').forEach(x =>{ x.addEventListener("pointerup", ()=>{ efy_trans_filter_fn(); localStorage.removeItem('efy_trans_filter'); localStorage.removeItem('efy_trans_filter_css'); efy_css_trans_filter.textContent = '' })  });

/* Text Size*/ let efy_text_accessibility = $create("style"); efy_text_accessibility.classList.add("efy_text_accessibility"); document.head.appendChild(efy_text_accessibility); $all('.efy_text_accessibility input').forEach(x => x.oninput =()=>{ efy_text_accessibility.textContent = `:root {--efy_font_size: ${$('.efy_ui_zoom').value}px!important;} html {letter-spacing: ${$('.efy_text_spacing').value}px!important;}`; });

/*Checkbox Toggles*/  ["efy_audio_status", "efy_audio_click", "efy_audio_hover", "efy_outline", 'efy_text_status', 'efy_bgcol_status'].forEach(x => { if (localStorage.getItem(x) == "on") {$("#" + x).setAttribute("checked", "1");} $("#" + x).onclick = () => { if (localStorage.getItem(x) == "on") { localStorage.setItem(x, "off"); } else { localStorage.setItem(x, "on"); } };});

/*Focus Outline*/ if (localStorage.efy_outline == 'on') {$root.setAttribute('efy_outline', '1');}  $('#efy_outline').onchange = () => {$root.toggleAttribute('efy_outline')}
/*Custom Text Color*/ if (localStorage.efy_text_status == 'on') {$root.setAttribute('efy_color_text', '1')}  $('#efy_text_status').onchange = () => {$root.toggleAttribute('efy_color_text')}
/*Custom BG Color*/ if (localStorage.efy_bgcol_status == 'on') {$root.setAttribute('efy_color_bgcol', '1')}  $('#efy_bgcol_status').onchange = () => {$root.toggleAttribute('efy_color_bgcol')}


/*EFY Menu Toggles*/ $body.addEventListener("click", ()=>{ if (event.target.matches('[efy_sidebar_btn_open]')) {
    $("[efy_sidebar_btn_open]:not([efy_sidebar_btn_open=relative])").style.display = "none";
    $("[efy_sidebar_btn_close]").style.display = "block";
    $(".efy_sidebar").classList.toggle("efy_toggle_efy_sidebar_panel");
    $("body").classList.toggle("efy_toggle_efy_sidebar");
}});
/*Close*/ $("[efy_sidebar_btn_close]").onclick = () => { $(".efy_sidebar").classList.toggle("efy_toggle_efy_sidebar_panel"); $("body").classList.toggle("efy_toggle_efy_sidebar"); $("[efy_sidebar_btn_open]:not([efy_sidebar_btn_open=relative])").style.display = "block"; $("[efy_sidebar_btn_close]").style.display = "none"; };



/*Change bg image*/ let efy_css_bgimg = $create("style"); efy_css_bgimg.classList.add("efy_css_bgimg"); document.head.appendChild(efy_css_bgimg);

/*Background image*/ let db; $("#pictureTest").addEventListener("change", efy_add_bgimg);
let request = indexedDB.open('efy');
request.onerror = () => console.error("efy: Can't open db");
request.onsuccess = e => (db = e.target.result);
request.onupgradeneeded = e => { let db = e.target.result; db.createObjectStore("images", { keyPath: "id", autoIncrement: true }); db.createObjectStore("settings", { keyPath: "id", autoIncrement: true }); };

async function efy_add_bgimg(e) { let reader = new FileReader(); reader.readAsDataURL(e.target.files[0]); reader.onload = e => { let ob = { data: e.target.result };
    db.transaction(["images"], "readwrite").objectStore("images").add(ob).onerror = e => { console.error(e); };

async function efy_bg_update_fn2(){ let request2 = indexedDB.open('efy');
request2.onsuccess = () => { let efy_count_img2 = 0, transaction2 = request2.result.transaction(["images"], "readonly"), invoiceStore2 = transaction2.objectStore("images"), getCursorRequest2 = invoiceStore2.openCursor();
    getCursorRequest2.onerror = () => console.error("efy: no db entries");
    getCursorRequest2.onsuccess = e => { let cursor2 = e.target.result;
        if (cursor2) { efy_count_img2++; cursor2.continue(); }
        else { /*Set bgimg nr*/ localStorage.efy_bg_nr = efy_count_img2;
            /*Add Preview*/ let efy_bg_item2 = $create("div"); efy_bg_item2.style.background = 'url('+reader.result+')'; efy_bg_item2.setAttribute("efy_bg_nr", efy_count_img2); $(".efy_img_previews").appendChild(efy_bg_item2); $all('.efy_img_previews [efy_bg_nr]').forEach(z => z.removeAttribute('efy_active'));
            /*Restore Background*/ efy_css_bgimg.textContent = `html:before, html:after {background: url(${reader.result})!important; background-size: cover!important} html {background: var(--efy_text2)!important}`; $('.efy_img_previews [efy_bg_nr="'+efy_count_img2+'"]').setAttribute('efy_active',1);
             /*Preview Click*/ let y = $('.efy_img_previews [efy_bg_nr="'+efy_count_img2+'"]'); y.onclick = () => { efy_css_bgimg.textContent = `html:before, html:after {background: url(${reader.result})!important; background-size: cover!important} html {background: var(--efy_text2)!important}`; localStorage.efy_bg_nr = efy_count_img2; $all('.efy_img_previews [efy_bg_nr]').forEach(z => z.removeAttribute('efy_active')); y.setAttribute('efy_active',1); };
        }
    };};
} efy_bg_update_fn2();

};}

/*Count images*/ async function efy_bg_update_fn(){ request = indexedDB.open('efy');
request.onsuccess = () => { let efy_count_img = 0, transaction = request.result.transaction(["images"], "readonly"), invoiceStore = transaction.objectStore("images"), getCursorRequest = invoiceStore.openCursor();
    getCursorRequest.onerror = () => console.error("efy: no db entries");
    getCursorRequest.onsuccess = e => { let cursor = e.target.result;
        if (cursor) { efy_count_img++; let req = invoiceStore.get(efy_count_img);
            req.onsuccess = e => { let x = e.target.result.data;
                /*Preview Click*/ let efy_bg_item = $create("div"); efy_bg_item.style.background = 'url('+x+')'; efy_bg_item.setAttribute("efy_bg_nr", efy_count_img); $(".efy_img_previews").appendChild(efy_bg_item); let y = $('.efy_img_previews [efy_bg_nr="'+efy_count_img+'"]'); y.onclick = () => { efy_css_bgimg.textContent = `html:before, html:after {background: url(${x})!important; background-size: cover!important} html {background: var(--efy_text2)!important; background-size: cover!important}`; localStorage.efy_bg_nr = e.target.result.id; $all('.efy_img_previews [efy_bg_nr]').forEach(z => z.removeAttribute('efy_active')); y.setAttribute('efy_active',1); };
            }; cursor.continue();
        } else { /*Check bgimg number*/ let bgnr; if (localStorage.efy_bg_nr) { bgnr = JSON.parse(localStorage.efy_bg_nr); } else { bgnr = 1; }

            /*Restore Background*/ if (efy_count_img > 0) { invoiceStore.get(bgnr).onsuccess = e => { let x = e.target.result.data, y = e.target.result.id; efy_css_bgimg.textContent = `html:before, html:after {background: url(${x})!important; background-size: cover!important}`; $('.efy_img_previews [efy_bg_nr="'+y+'"]').setAttribute('efy_active',1); }; }

            /*Remove BG - Button*/ $all(".efy_idb_reset").forEach(z =>{ z.onclick = () => { indexedDB.deleteDatabase("efy"); location.reload()}});
        }
    };};
} efy_bg_update_fn();

/*Export IndexedDB*/ (async () => { try {
    let dbExists = await new Promise(resolve => { let request = window.indexedDB.open('efy');
        request.onupgradeneeded = e => { e.target.transaction.abort(); resolve(false); };
        request.onerror = () => resolve(true); request.onsuccess = () => resolve(true); });
    if (!dbExists) { throw new Error("efy: db doesn't exist"); }

    let idbDatabase = await new Promise((resolve, reject) => { let request = window.indexedDB.open('efy');
        request.onerror = () => reject("efy: Can't open db");
        request.onsuccess = () => resolve(request.result); });
    let json = await new Promise((resolve, reject) => { let exportObject = {};
        if (idbDatabase.objectStoreNames.length === 0) { resolve(JSON.stringify(exportObject)); }
        else { let transaction = idbDatabase.transaction(idbDatabase.objectStoreNames, "readonly");
            transaction.addEventListener("error", reject);

            for (let storeName of idbDatabase.objectStoreNames) { let allObjects = [];
                transaction.objectStore(storeName).openCursor().addEventListener("success", event => { let cursor = event.target.result;
                    if (cursor) { /*Store data*/ allObjects.push(cursor.value); cursor.continue();}
                    else { /*Store completed*/ exportObject[storeName] = allObjects;
                        if (idbDatabase.objectStoreNames.length === Object.keys(exportObject).length) { resolve(JSON.stringify(exportObject)); } } }); } } });

    $(".efy_idb_export").onclick = () => { efyaudio.ok4.cloneNode().play(); $(".efy_idb_export").href = "data:application/json," + json; };
} catch (error) { console.error(error); } })();

/*Import indexedDB*/ let efy_idb_import = $(".efy_idb_import");
efy_idb_import.addEventListener("change", () => { let file = efy_idb_import.files[0], reader = new FileReader();
    reader.onload = async () => { let data = JSON.parse(reader.result);
        function importIDB(storename = "images", storename2 = "settings", arr = data["images"], arr2 = data["settings"]) {
            return new Promise(resolve => { let r = window.indexedDB.open("efy");
                r.onupgradeneeded = () => { let idb = r.result; idb.createObjectStore(storename, { keyPath: "id", autoIncrement: true }); idb.createObjectStore(storename2, { keyPath: "id", autoIncrement: true }); };
                r.onsuccess = () => { let idb = r.result, store = idb.transaction(storename, "readwrite").objectStore(storename), store2 = idb.transaction(storename2, "readwrite").objectStore(storename2);
                    for (let obj of arr) { store.put(obj); }
                    for (let obj of arr2) { store2.put(obj); }
                    resolve(idb);
                }; r.onerror = e => console.log(e.target.errorCode); }); }
await importIDB(); }; reader.readAsText(file); });


/*Save & Restore Preferences*/ $('.efy_localstorage_export').onclick =()=>{ let x=''; Object.entries(localStorage).forEach(([k,v])=>{ if (k.includes('efy')){ x=x+ JSON.stringify(k, null, 2)+' :'+JSON.stringify(v, null, 2) +',\n'; } }); $('.efy_localstorage_export').href = "data:application/json," + '{\n'+x.slice(0,-2)+'\n}'};

/*Import Settings*/ let efy_localstorage_import = $('.efy_localstorage_import'); efy_localstorage_import.addEventListener('change', function() {
	let file = efy_localstorage_import.files[0], reader = new FileReader();
	reader.onload = function() { Object.entries(JSON.parse(reader.result)).forEach(([k,v])=>localStorage.setItem(k,v)); location.reload() }
	reader.readAsText(file); });

/*Reset Settings*/ $all(".efy_localstorage_reset").forEach(x =>{ x.onclick = () => { Object.entries(localStorage).forEach(([k])=>{ if (k.includes('efy')){ localStorage.removeItem(k)} }); location.reload() }});

/*Determine Audio Path*/ let audioPath = $css_prop('--efy_audio_path');

/*Audio*/ let efyaudio = {}; ['pop','ok','ok2','ok3','ok4','hover','slide','squish','step','error','disabled'].forEach(x => { efyaudio[x] = new Audio(`${audioPath}/${x}.mp3`) }); $body.addEventListener("pointerdown", efyaudio_fn, {once: true});

async function efyaudio_fn() { if (localStorage.efy_audio_status == 'on' ){ if (localStorage.efy_audio_click == 'on') {
    /*Ok*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('button:not([disabled], [type=submit], [type=reset], [efy_tab], .shaka-overflow-menu button, .shaka-overflow-menu-button, .shaka-back-to-overflow-button), .video-grid>div')) { efyaudio.ok.cloneNode().play() }});
    /*Ok: Online*/ window.addEventListener("online", ()=>{ efyaudio.ok.cloneNode().play()});
    /*Ok2*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('.efy_img_previews [efy_bg_nr]')) { efyaudio.ok2.cloneNode().play() }});
    /*Ok4*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('[type=submit]')) { efyaudio.ok4.cloneNode().play() }});
    /*Ok: on Change*/ $body.addEventListener("change", ()=>{ if (event.target.matches('input, textarea')) { efyaudio.ok.cloneNode().play() }});
    /*Pop*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('summary, select:not([multiple], [disabled]), [efy_tabs] [efy_tab], [efy_alert], [efy_alert] *, .shaka-overflow-menu button, .shaka-overflow-menu-button, .shaka-back-to-overflow-button')) { efyaudio.pop.cloneNode().play() }});
    /*Slide*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('[efy_sidebar_btn_open], [efy_sidebar_btn_close]')) { efyaudio.slide.cloneNode().play() }});
    /*Error*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('[type=reset]')) { efyaudio.error.cloneNode().play() }});
    /*Error: Offline*/ window.addEventListener("offline", ()=>{ efyaudio.error.cloneNode().play()});
    /*Disabled*/ $body.addEventListener("pointerup", ()=>{ if (event.target.matches('[disabled]')) { efyaudio.disabled.cloneNode().play() }});
    /*Step*/ $body.addEventListener("pointerdown", ()=>{ if (event.target.matches('input:not([type=radio], [type=checkbox], [type=reset], [disabled]), textarea:not([disabled])')) { efyaudio.step.cloneNode().play() }});
} /*Hover*/ if (localStorage.efy_audio_hover == "on") { $all("summary, select:not([multiple], [disabled]), [type=submit], [type=reset], [efy_sidebar_btn_open], [efy_sidebar_btn_close], .video-grid>div").forEach(x => x.addEventListener("mouseenter",()=> efyaudio.hover.cloneNode().play() ));}}}

/*EFY Tabs*/ $all('[efy_tabs]').forEach(z => { let x = '[efy_tabs='+z.getAttribute('efy_tabs')+'] > ';
    $all(x+'[efy_tab]').forEach(y => { let cld = $create('code'); cld.textContent = y.textContent; y.textContent = ''; y.appendChild(cld); y.onclick = e => { let efy_tab = e.target.getAttribute('efy_tab');
        $all(x+'[efy_tab]').forEach(y => y.removeAttribute('efy_active') ); e.target.setAttribute('efy_active', '1');
        $all(x+'[efy_content]').forEach(y => y.removeAttribute('efy_active') ); $(x+' [efy_content="'+efy_tab+'"]').setAttribute('efy_active', '1');
} }); });

/*Clock & Timer*/ function efy_time_0(i) { if (i < 10) {i = '0' + i} return i; }

/*Clock*/ function efy_clock() {let t = new Date(), h = t.getHours(), m = t.getMinutes(); m = efy_time_0(m);
$all('[efy_clock]').forEach(x =>{ x.textContent =  h+':'+m; }); setTimeout(efy_clock, 10000); } efy_clock();

/*Timer*/ $all('[efy_timer]').forEach(y => { $append(y, $add('div', {efy_text: ''}, ['00:00:00'])); $append(y, $add('button', {efy_start: ''})); $append(y, $add('button', {efy_reset: ''}));

let x = '[efy_timer='+y.getAttribute('efy_timer')+'] ', play = $(x+'[efy_start]'), reset= $(x+'[efy_reset]'), timer_text = $(x+'[efy_text]'), interval, [hour,minute,second,h,m,s] = [0,0,0,'00','00','00'];
play.addEventListener("click", () => {clearInterval(interval); play.toggleAttribute('efy_active'); if (play.hasAttribute('efy_active')) { interval = setInterval(() => { second++;
    s = efy_time_0(second); if (second > 59) {s = '00'; second = 0; minute++;
    m = efy_time_0(minute); if (minute > 59) {m = '00'; minute = 0; hour++;
    h = efy_time_0(hour);
}} timer_text.textContent = h+':'+m+':'+s; }, 1000); } else { clearInterval(interval); } });
reset.addEventListener("click", () => {clearInterval(interval); [hour,minute,second,h,m,s] = [0,0,0,'00','00','00']; timer_text.textContent = "00:00:00"; play.removeAttribute('efy_active');}); });

/*Search Filter */ $all('[efy_search]').forEach(a =>{ let search = a.getAttribute('efy_search'), container = `#${a.id}[efy_search="${search}"]`;
$all(container +' [efy_search_input]').forEach(z =>{ z.addEventListener('keyup', ()=>{ let val = z.value.toLowerCase();
$all(container +' '+ search).forEach(x =>{ if (x.innerHTML.toLowerCase().includes(val) == 0) {x.setAttribute('efy_display_none','1')} else {x.removeAttribute('efy_display_none')}})})})});

/*Alerts*/ $insert($body, 'afterbegin', $add('div', {efy_alerts: ''})); $body.addEventListener("pointerup", ()=>{ if (event.target.matches('[efy_alert]')) { event.target.remove() }});

/*Online / Offline*/ for (let a = ['offline', 'online'], b = ["You're OFFLINE", "You're back ONLINE"], c = ['Maybe check your internet connection?', 'Reload the page if needed'], i = 0; i <a.length; i++) { window.addEventListener(a[i], () =>{ $append($('[efy_alerts]'), $add('div', {efy_alert: '', class: `efy_alert_${a[i]}`}, [$add('div', {}, [$add('h6', {}, [b[i]]), $add('p', {}, [c[i]])]), $add('button', {efy_btn_square: ''}, [$add('i', {efy_icon: 'remove'})])]))})}

/*End scope*/}
