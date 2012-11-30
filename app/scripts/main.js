
Ext.application({
    name: 'theme',
    appFolder: '/scripts/theme',
    appProperty: 'app',
    stores: ["Pages","Themes"],
    views: ["PageContainer","PageList","ThemeHeader"],
    controllers: ["PageController"],
    refs:[
        {
            ref: 'ThemeSelector',
            selector: 'themeheader combo'
        }
    ],
    defaultTheme: 'white',
   
    launch: function() {
        var params = Ext.urlDecode(location.search.substr(1));
        var pages = this.getStore('Pages');
        var themes = this.getStore('Themes');
        this.theme = (params.theme === undefined) ? this.defaultTheme : params.theme ;
        
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                {
                    xtype: 'pagelist',
                    region: 'west',
                    store: pages
                },
                {
                    xtype: 'pagecontainer',
                    region: 'center'
                },
                {
                    xtype: 'themeheader',
                    region: 'north',
                    theme: this.theme
                }
            ]
        });
        theme.app =  this;
        if(this.theme !== this.defaultTheme){
            this.getController("PageController").onThemeSelected(null,this.theme,this.defaultTheme);
        }
    }


});