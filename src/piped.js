import {$, $all, $ready_once, $insert, $add, $append} from '../efy/efy.js';

$ready_once('#efy_sidebar').then(()=>{
    $insert($('#efy_sidebar'), 'afterbegin', $add('div', { id: 'piped_efy_module' }));

    /*Custom Menu*/ $append($('#efy_modules'), $add('div', {id: 'custom_sidebar_menu'}));
    for (let a = ['preferences', 'history', 'playlists', 'feed'], b = ['Preferences', 'History', 'Playlists', 'Feed'], c = $('#custom_sidebar_menu'), i = 0; i < a.length; i++){ $append(c, $add('a', {href: `./${a[i]}`}, [b[i]]))}

    /*Custom Settings*/ $append($('#efy_modules'), $add('details', {id: 'piped_style'}, [
        $add('summary', {}, [$add('i', {efy_icon: 'dots'}), 'Piped Style']), $add('div', {efy_tabs: 'piped_style'})]),
    );
    $insert($('#piped_style > summary'), 'beforeend', $add('mark', {efy_lang: 'alpha'}));
    /*Tabs*/ for (let a = ['option1', 'option2', 'option3'], b = ['Tab 1', 'Tab 2', 'Tab 3'], c = $('[efy_tabs=piped_style]'), i = 0; i < a.length; i++) {
        $append(c, $add('button', {efy_tab: a[i]}, [b[i]]));
    }
    for (let a = ['option1', 'option2', 'option3'], c = $('[efy_tabs=piped_style]'), i = 0; i < a.length; i++) {
        $append(c, $add('div', {efy_content: a[i], efy_select: '', id: `efy_${a[i]}`}))
    }
    /*Active*/ for (let a = ['[efy_tab=option1]', '[efy_content=option1]'], b = '[efy_tabs=piped_style] > ', i = 0; i < a.length; i++){$(b + a[i]).setAttribute('efy_active', '')}

    /*Tab1*/ for (let a = 'comments_full captions-trans captions-solid'.split(' '), b = ['Comments - Full Width', 'Captions - No Background', 'Captions - Black Background'], c = $('[efy_tabs=piped_style] [efy_content=option1]'), i = 0; i < a.length; i++) {
        $append(c, $add('input', {type: 'checkbox', name: 'piped_style_option1', id: `piped_style_${a[i]}`}));
        $append(c, $add('label', {for: `piped_style_${a[i]}`}, [b[i]]));
    }
    /*Comments & Captions*/ for (let a = ['comments_full', 'captions-trans', 'captions-solid'], b = ['.pp-comments', '.shaka-text-container', '.shaka-text-container'], c = ['pp-full-width', 'pp-trans', 'pp-solid'], i = 0; i < a.length; i++) {
        $(`#piped_style_${a[i]}`).addEventListener('click', ()=>{
            $all(b[i]).forEach( (e)=>{ e.classList.toggle(c[i]) })
        })
    }
});
