function flexSetStyle(btn) {
	var style = btn.getAttribute ? btn.getAttribute('data-scheme') : btn, href;
	if(! style || ! style.length) return;
	Set_Cookie(''+SUGAR.session.theme+'_style', style, 365,'/','','');
	href = location.href.replace(/#.*/, '');
	location.replace(href);
}

function flexApplyBackground() {
	var url = $('personalise_background_url').value;
	if (url != '')
	{
		localStorage.setItem('background', url);
		location.reload();
	}
}

function flexRemoveBackground() {
	localStorage.removeItem('background');
	location.reload();	
}

function flexInit() {
    // assign background
    background = localStorage.getItem('background');
    var body = document.body;

    if(background != null){
        var css =
            'body { background-image: url("' + background + '") !important}',
            style = document.createElement('style');

        // cross browser stuff
        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        // insert style designating background origin
        document.head.appendChild(style);
    }
}

if(window.SUGAR) {
	SUGAR.themes.disableGroupTabs = true;

	SUGAR.themes.topMenuSize = function(modules) {
		if(modules) return 90;
	}
	
	SUGAR.themes.renderSidebar = function() {
		var side = SUGAR.dom.elementOrId('left-sidebar'),
			hist = SUGAR.dom.elementOrId('app-history'),
			TH = SUGAR.themes,
			MakeElt = SUGAR.dom.makeElement,
			pg = TH.page_info || {},
			shortcuts = pg.shortcuts,
			recent = pg.recent,
			hide = (pg.no_decoration || pg.hide_side_menu);

		renderShortcut = function(opt) {
			return MakeElt('div.sidebar-item',
				MakeElt('a.sidebar-item-link-basic',
					{href: opt.url},
					SUGAR.ui.createIcon(opt.icon),
					MakeElt('span.sidebar-item-label', opt.label)
				).on('click', function(evt) {
					SUGAR.util.navigateTo(opt.url, evt, {async: get_default(opt.async, true)});
				}));
		}
		
		renderRecent = function(opt) {
			return MakeElt('a.history-item',
					{href: opt.url},
					SUGAR.ui.createIcon(opt.icon),
					MakeElt('span.history-item-name', opt.label)
				).on('click', function(evt) {
					SUGAR.util.navigateTo(opt.url, evt);
				});
		}

		if(side) {
			if(TH.sidebarInited)
				side.addClass('inited');
			side.empty();
			MakeElt('div.sidebar-heading-section',
				MakeElt('span.input-icon.icon-shortcut.sidebar-heading-icon', ' '),
				MakeElt('h3.sidebar-heading', app_string('LBL_SHORTCUTS')))
				.appendTo(side);
						
			if(shortcuts && shortcuts.keys && shortcuts.keys.length) {
				for(var i = 0; i < shortcuts.keys.length; i++) {
					renderShortcut(shortcuts.values[shortcuts.keys[i]]).appendTo(side);
				}
			} else {
				hide = true;
			}
		}

		TH.sidebarRendered = true;
		TH.toggleSidebar(! hide);

		if(hist) {
			hist.empty();
			if(recent && recent.keys && recent.keys.length) {
				MakeElt('span.history-label', app_string('LBL_LAST_VIEWED')).appendTo(hist);
				for(var i = 0; i < recent.keys.length; i++) {
					renderRecent(recent.values[recent.keys[i]]).appendTo(hist);
				}
			}
		}		
	}
}

flexInit();

