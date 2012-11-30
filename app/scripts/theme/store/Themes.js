Ext.define('theme.store.Themes', {
    extend: 'Ext.data.Store',
    fields:[
        {
            name: "name",
            type: "string"
        },
        {
            name: "path",
            type: "string"
        },
        {
            name: "id",
            type: "string"
        }
    ],
    data : [
        {
            name: 'xCP Default',
            path: 'none',
            id: 'default'
        },
        {
            name: 'White Theme',
            path: 'js/resources/css/white-theme.css',
            id: 'white'
        }
    ],
    autoload: true,
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
            
        }
    }
 });