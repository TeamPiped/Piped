import {$, $all, $$, $add, $event, $ready, $css_prop, efy} from '../node_modules/efy/efy.js';

$ready('#efy_sidebar', ()=>{

    $add('div', {id: 'piped_efy_module'}, [], $('#efy_sidebar'), 'afterbegin');

    /*Custom Menu*/ $add('div', {id: 'custom_sidebar_menu'}, [], $('#efy_modules'));
    for (let a = ['preferences', 'history', 'playlists', 'feed'],
    b = ['Preferences', 'History', 'Playlists', 'Feed'],
    c = $('#custom_sidebar_menu'), i = 0; i < a.length; i++){
        $add('a', {href: `./${a[i]}`}, [b[i]], c)
    }

    /*Custom Settings*/ $add('details', {id: 'piped_style'}, [
        ['summary', {}, [['i', {efy_icon: 'dots'}], 'Piped Style']],
        ['div', {efy_tabs: 'piped_style'}, [['div', {class: 'efy_tabs'}]]]
    ], $('#efy_modules'));

    $add('mark', {efy_lang: 'alpha'}, [], $('#piped_style > summary'), 'beforeend');
    /*Tabs*/ for (let a = ['comments', 'captions', 'cards'], b = ['Comments', 'Captions', 'Cards'],
    c = $('[efy_tabs=piped_style]'), i = 0; i < a.length; i++) {
        const active = (a[i] === 'comments') ? {efy_active: ''} : null;
        $add('button', {efy_tab: a[i], ...active}, [b[i]], $$(c, '.efy_tabs'));
        $add('div', {efy_content: a[i], efy_select: '', id: `efy_${a[i]}`, ...active}, [], c);
    }

    /*Comments*/ for (let a = 'comments_full comments_nobg'.split(' '), b = ['Full Width', 'No Background'],
    c = $('[efy_tabs=piped_style] [efy_content="comments"]'), i = 0; i < a.length; i++) {
        $add('input', {type: 'checkbox', name: 'piped_style_comments', id: `piped_style_${a[i]}`}, [], c);
        $add('label', {for: `piped_style_${a[i]}`}, [b[i]], c);
    }
    /*Captions*/ for (let a = 'captions-trans captions-solid'.split(' '), b = ['No Background', 'Black Background'],
    c = $('[efy_tabs=piped_style] [efy_content="captions"]'), i = 0; i < a.length; i++) {
        $add('input', {type: 'checkbox', name: 'piped_style_captions', id: `piped_style_${a[i]}`}, [], c);
        $add('label', {for: `piped_style_${a[i]}`}, [b[i]], c);
    }
    /*Cards*/ for (let a = 'cards_horizontal cards_old'.split(' '), b = ['Horizontal', 'Vertical'],
    c = $('[efy_tabs=piped_style] [efy_content="cards"]'), i = 0; i < a.length; i++) {
        $add('input', {type: 'checkbox', name: 'piped_style_cards', id: `piped_style_${a[i]}`}, [], c);
        $add('label', {for: `piped_style_${a[i]}`}, [b[i]], c);
    }
    /*Comments & Captions*/ for (let a = ['comments_full', 'comments_nobg', 'captions-trans', 'captions-solid', 'cards_horizontal', 'cards_old'],
    b = ['.pp-comments', '.pp-comments', '.player-container', '.player-container', 'body', 'body'],
    c = ['pp-full-width', 'pp-no-bg', 'pp-trans', 'pp-solid', 'cards_horizontal', 'cards_old'], i = 0; i < a.length; i++) {
        $event($(`#piped_style_${a[i]}`), 'click', ()=>{
            $all(b[i]).forEach( (e)=>{ e.classList.toggle(c[i]) })
        })
    }

    // Get EFY Color Gradient in Piped
    const efy_piped_color =()=>{ let efy_colors = [];
        efy.colors.forEach((a,i)=>{
            a = a.split(' ').slice(1); a[3] = `/ ${a[3]}`;
            efy_colors[i] = `oklch(${a.join(' ')})`;
        });
        $css_prop('--efy_piped_color', String(efy_colors));
    }; efy_piped_color();

    $event($('#efy_gradient'), 'change', efy_piped_color);

}, 1);