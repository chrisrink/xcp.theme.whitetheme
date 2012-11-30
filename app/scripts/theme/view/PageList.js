Ext.define('theme.view.PageList', {
    extend: 'Ext.panel.Panel',
    requires: ['Ext.view.View','theme.store.Pages'],
    alias: 'widget.pagelist',
    items: [],
    store:'',
    initComponent: function(){
        this.pageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="pageWrap" >',
                  '<span>{name}</span>',
                '</div>',
            '</tpl>'
        );

        this.title= 'Page List';
        this.width= 200;
        this.cls ="thm-pl-ctnr";
        this.layout= 'fit';
    	this.dataview = Ext.create('Ext.view.View',{
	        store: this.store,
	        tpl:  this.pageTpl,
            autoRender:true,
	        itemSelector: 'div.pageWrap',
	        cls: 'hm-pl-sel'
    	});
        

    	this.callParent();
        
        this.add(this.dataview);

    }    
});