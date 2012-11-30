Ext.define('theme.controller.PageController', {
    extend: 'Ext.app.Controller',
   // stores:['Pages'],
    views:['PageContainer','PageList','ThemeHeader'],
    refs: [
        {
            ref: 'pageList',
            selector: 'dataview'
        },
        {
            ref:  'pageContainer',
            selector: 'panel[cls~=thm-pg-ctn]'
        },
        {
            ref: 'ThemeSelector',
            selector: 'themeheader combo'
        }
    ],
    
    

    init: function() {
        this.control(
            {
                'pagelist dataview': {
                    itemclick: this.onPageSelect
                },
                'themeheader combo': {
                    change: this.onThemeSelected
                }
            }
        );

      
    },

    onPageSelect: function(me, record, item, index, e, eOpts ){
        var pageContainer = this.getPageContainer();
        pageContainer.setLoading(true);
        var url = record.get("url");
        this.getPage(url);
	},
       
    getPage: function(url){
        Ext.Ajax.request({
            url: url,
            success: this.loadPage,
            scope: this
        });
    },

    loadPage: function(response){
        var text = response.responseText;
        var cmp = JSON.parse(text);
        var pageContainer = this.getPageContainer();
        if(pageContainer.childEls.length !== 0){
            pageContainer.removeAll();
        }

        pageContainer.add(cmp);
        pageContainer.setLoading(false);

    },

    onThemeSelected: function(cmp, newValue, oldValue, eOpts ){
        if(newValue === 'default'){
            this.unloadTheme(oldValue);
        }else if(oldValue == 'default'){
            this.loadTheme(newValue);
        }else{
            this.unloadTheme(oldValue);
            this.loadTheme(newValue);
        }
    },

    unloadTheme: function(id){
        var cssEl = document.getElementById(id);
        if (cssEl) {
            cssEl.disabled = true;
        } else {
            //link element not found
          
            delete this._loadedCSS[id];
        }
    },

    loadTheme: function(id,path){
        var head,link;
        var cssEl = document.getElementById(id);
        if (cssEl) {
            cssEl.disabled = false;
        }else{
            head = document.getElementsByTagName('head')[0]; // reference to document.head for appending/ removing link nodes
            link = document.createElement('link');           // create the link node
            link.setAttribute('href', path);
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute("id", id);
            link.setAttribute("disabled", false);
            head.appendChild(link);  // insert the link node into the DOM and start loading the style sheet
        }
    }
});