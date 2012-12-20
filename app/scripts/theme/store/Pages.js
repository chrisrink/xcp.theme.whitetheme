Ext.define('theme.store.Pages', {
    extend: 'Ext.data.Store',
    require: 'theme.model.Page',
    model: 'theme.model.Page',
   // alias: 'store.Pages',
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
            name: 'Simple Form',
            url: 'scripts/pages/new_Story.json'
        },
         {
            name: 'Form Panel',
            url: 'scripts/pages/doc_create_story_with_p.json'
        },
        {
            name: 'Form Alignment',
            url: 'scripts/pages/form_alignment.json'
        },
         {
            name: 'Columns',
            url: 'scripts/pages/doc_columnbox.json'
        },
         {
            name: 'buttons',
            url: 'scripts/pages/doc_buttons.json'
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