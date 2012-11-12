Ext.onReady(function(){

            var pageStore =  Ext.create('Ext.data.Store', {
                fields: [
                    {name: 'name',  type: 'string'},
                    {name: 'url',   type: 'string'}
                ],
                data : [
                    {
                        name: 'Application Master',
                        url: 'scripts/pages/app_master.json'
                    },
                    {
                        name: 'All Reviews',
                        url: 'scripts/pages/all_reviews.json'
                    },
                    {
                        name: 'New Story',
                        url: 'scripts/pages/new_Story.json'
                    }
                ],
                autoload:true
            });

            var pageTpl = new Ext.XTemplate(
                '<tpl for=".">',
                    '<div style="margin-bottom: 10px;" class="pageWrap" >',
                      '<span>{name}</span>',
                      '</div>',
                '</tpl>'
            );

            var updatePage = function(response){
               
                var text = response.responseText;
                var cmp = JSON.parse(text);
                if(content.childEls.length !==0){
                    content.removeAll();
                }

                content.add(cmp);
                content.setLoading(false);

            };

            var content =  Ext.create('Ext.panel.Panel',{
                region:'center',
                html: "Loading",
                layout: "fit"
            });
            var vp = Ext.create('Ext.container.Viewport',{
                layout:'border',
                cls: 'xcp-viewport',
                items: [
                    {
                        region: 'west',
                        xtype: 'dataview',
                        store: pageStore,
                        tpl: pageTpl,
                        itemSelector: 'div.pageWrap',
                        width:250,
                        cls: 'pageSelector',
                        listeners: {
                            itemclick: {
                                fn: function( me, record, item, index, e, eOpts ){
                                    content.setLoading(true);
                                    Ext.Ajax.request({
                                        url: record.get("url"),
                                        success: updatePage
                                    });
                                }
                            }
                        }
                    },
                   content
                ]
            });

        });