import {$, $all, $add, $event, $ready} from '../public/efy/efy.js';

$ready('#efy_sidebar', ()=>{
    $add('div', {id: 'piped_efy_module'}, [], $('#efy_sidebar'), 'afterbegin');

    /*Custom Menu*/ $add('div', {id: 'custom_sidebar_menu'}, [], $('#efy_modules'));
    for (let a = ['preferences', 'history', 'playlists', 'feed'], b = ['Preferences', 'History', 'Playlists', 'Feed'], c = $('#custom_sidebar_menu'), i = 0; i < a.length; i++){ $add('a', {href: `./${a[i]}`}, [b[i]], c)}

    /*Custom Settings*/ $add('details', {id: 'piped_style'}, [
        $add('summary', {}, [ $add('i', {efy_icon: 'dots'}), 'Piped Style']),
        $add('div', {efy_tabs: 'piped_style'})
    ], $('#efy_modules'));

    $add('mark', {efy_lang: 'alpha'}, [], $('#piped_style > summary'), 'beforeend');
    /*Tabs*/ for (let a = ['option1', 'option2', 'option3'], b = ['Tab 1', 'Tab 2', 'Tab 3'], c = $('[efy_tabs=piped_style]'), i = 0; i < a.length; i++) {
        $add('button', {efy_tab: a[i]}, [b[i]], c);
    }
    for (let a = ['option1', 'option2', 'option3'], c = $('[efy_tabs=piped_style]'), i = 0; i < a.length; i++) {
        $add('div', {efy_content: a[i], efy_select: '', id: `efy_${a[i]}`}, [], c)
    }
    /*Active*/ for (let a = ['[efy_tab=option1]', '[efy_content=option1]'], b = '[efy_tabs=piped_style] > ', i = 0; i < a.length; i++){
        $(b + a[i]).setAttribute('efy_active', '')
    }

    /*Tab1*/ for (let a = 'comments_full captions-trans captions-solid'.split(' '), b = ['Comments - Full Width', 'Captions - No Background', 'Captions - Black Background'], c = $('[efy_tabs=piped_style] [efy_content=option1]'), i = 0; i < a.length; i++) {
        $add('input', {type: 'checkbox', name: 'piped_style_option1', id: `piped_style_${a[i]}`}, [], c);
        $add('label', {for: `piped_style_${a[i]}`}, [b[i]], c);
    }
    /*Comments & Captions*/ for (let a = ['comments_full', 'captions-trans', 'captions-solid'], b = ['.pp-comments', '.shaka-text-container', '.shaka-text-container'], c = ['pp-full-width', 'pp-trans', 'pp-solid'], i = 0; i < a.length; i++) {
        $event($(`#piped_style_${a[i]}`), 'click', ()=>{
            $all(b[i]).forEach( (e)=>{ e.classList.toggle(c[i]) })
        })
    }
}, 1);