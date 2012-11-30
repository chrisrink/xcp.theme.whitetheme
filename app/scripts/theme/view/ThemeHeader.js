Ext.define('theme.view.ThemeHeader', {
    extend: 'Ext.container.Container',
    alias: 'widget.themeheader',
    cls: 'thm-header',
    store: '',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    theme: '',
    
    initComponent: function(){
        var title = Ext.create('Ext.Component', {
            html: '<span>xCP Theme Previewer</span>',
            flex: 3
        });

        var combo = Ext.create('Ext.form.field.ComboBox',{
            label: 'Themes',
            flex: 1,
            displayField: 'name',
            valueField: 'id',
            queryMode: 'local',
            value: this.theme,
            store: Ext.StoreManager.get("Themes")
        });

       
        //if(this.theme != theme.defaultTheme){
           // window.theme.app.getController("PageController").onThemeSelect(null,'white',this.theme);
       // }

         this.callParent();
         this.add(title);
         this.add(combo);
        
    //     this.add(this.dataview);

     }
 });