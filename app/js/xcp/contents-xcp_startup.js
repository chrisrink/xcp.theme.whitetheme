
/* xcp_logger/content/xcp/Logger.js */

/**
 * @class xcp.Logger
 * @extends Ext.util.Observable
 * Logger API wraps the firebug lite console to provide dynamic logging enablement and abstraction
 */
if (!xcp.Logger) {
    Ext.define("xcp.Logger", {
        extend: "Ext.util.Observable",
        singleton: true,
        enablement: false,
        fireBugLoaded:false,
        constructor : function() {
            this.callParent(arguments);
            var loggingParam = window.location.search.indexOf("logging=true") != -1; 
            this.addEvents("enablelogging", "disablelogging");

            if(loggingParam) {
                this.enable();
            }

            var loggingKeyMap = new Ext.KeyMap(Ext.getDoc(), [{
                key: Ext.EventObject.X,
                alt: true,
                fn: function() {
                    if (xcp.Logger.enablement) {
                        xcp.Logger.fireEvent("disablelogging");
                    }
                    else {
                        if(loggingParam) {
                            xcp.Logger.fireEvent("enablelogging");
                        } else {
                            var loc = window.location;
                            var url = loc.protocol + "//" + loc.host + xcp.util.Utils.buildResourceUrl("/js/firebug-lite/dist/xcp-firebug-lite.js");
                            var scripts = document.getElementsByTagName('script');
                            for (var i = 0, len = scripts.length; i < len; i++) {
                                if (scripts[i].src === url) {
                                    break;
                                }
                            }
                            if (i < len) {
                                xcp.Logger.fireEvent("enablelogging");
                            } else {
                                Ext.Loader.injectScriptElement(url, function() {
                                    xcp.Logger.fireEvent("enablelogging");
                                });
                            }
                        }
                    }
                },
                stopEvent: true
            }]);

            window.enableLogging = function() {
                xcp.Logger.fireEvent("enablelogging");
            };
            window.disableLogging = function() {
                xcp.Logger.fireEvent("disablelogging");
            };
        },

        log : Ext.emptyFn,
        debug: Ext.emptyFn,
        info: Ext.emptyFn,
        warn: Ext.emptyFn,
        error: Ext.emptyFn,

        //private method
        /**
         * Adds timestamp, logging level and originating function
         */
        getLoggerPrefix : function(level, fnName) {
            var currentTime = new Date();
            var currentTimeStr = Ext.Date.format(currentTime, 'Y-m-d H:i:s.u T');
            var timestamp = "[" + currentTimeStr + " ]";
            return new Array(timestamp, level, fnName);
        },

        //private method
        /**
         * Calls the Firebug lite console API dynamically based on the invoked log function
         * @param arguments
         * @param logFunction
         * @param originatingFunction
         */
        callConsole : function(arguments, logFunction, originatingFunction)
        {
            var args = Array.prototype.slice.call(arguments);
            var prefix = this.getLoggerPrefix("[" + logFunction + "]", originatingFunction);
            args = prefix.concat(args);
            console[logFunction].apply(console, args);
        },

        /**
         * Enables logging. Will be called as part of the enablelogging event.
         * Assigns concrete functions to respective logging methods
         */
        enable : function() {
            this.enablement = true;
            this.log = function() {
                this.callConsole(arguments, "log", arguments.callee.caller);
            };
            this.debug = function() {
                this.callConsole(arguments, "debug", arguments.callee.caller);
            };
            this.info = function() {
                this.callConsole(arguments, "info", arguments.callee.caller);
            };
            this.warn = function() {
                this.callConsole(arguments, "warn", arguments.callee.caller);
            };
            this.error = function () {
                this.callConsole(arguments, "error", arguments.callee.caller);
            };
        },

        /**
         * Disables logging. Will be called as part of the disablelogging event.
         * Assigns empty functions to respective logging methods
         */
        disable : function() {
            this.enablement = false;
            this.log = Ext.emptyFn;
            this.debug = Ext.emptyFn;
            this.info = Ext.emptyFn;
            this.warn = Ext.emptyFn;
            this.error = Ext.emptyFn
        },
        initLogging : function() {
            xcp.Logger.on("enablelogging", function() {
                xcp.Logger.enable();
                xcp.Logger.log("Started logging...");
            });
            xcp.Logger.on("disablelogging", function() {
                xcp.Logger.log("Stopped logging...");
                xcp.Logger.disable();
            });
        },
        onError : function(error) {
            console.error("Could not load the firebug : " + error);
        }
    });
}

/* xcp_utils/content/xcp/util/Utils.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */
/**
 * Utility functions
 */
Ext.define("xcp.util.Utils", {
    statics : {
        /**
         * Returns the app path name.
         */
        getAppPathName: function () {
            var pathname = window.location.pathname;
            if (pathname.charAt(0) == '/') {
                pathname = pathname.substr(1);
            }
            var idx = pathname.indexOf("/");
            if (idx > -1) {
                pathname = pathname.substr(0, idx);
            }
            return pathname;
        },
        /**
         * Build version aware resource URL.
         * @param url The input url.
         */
        buildResourceUrl : function(url, appendLangParam) {
            if (!url) {
                return null;
            }

            if (!xcp.resourceUrlPrefix) {
                var appPath = document.location.pathname;
                if (appPath.charAt(appPath.length - 1) == '/') {
                    appPath = appPath.substr(0, appPath.length - 1);
                }
                xcp.resourceURlPrefix = appPath + "/resources/"+xcp.appContext.version;
            }
            var resourceUrl = xcp.resourceURlPrefix;
            if (url.indexOf("/") != 0){
                resourceUrl += "/";
            }
            resourceUrl += url;
            if (appendLangParam) {
                return xcp.util.Utils.appendLangQueryParam(resourceUrl);
            }
            return resourceUrl;
        },
        appendLangQueryParam: function(url) {
            if (url) {
                var langQueryParam = "lang="+xcp.language;
                if (url.indexOf("?") > 0) {
                    url += "&";
                } else {
                    url += "?";
                }
                url +=langQueryParam;
            }
            return url;
        },

        /**
         * Build version aware resource URL for Artifacts
         * @param url The input url.
         */
        buildArtifactsUrl : function(url) {
            if (url) {
            	//build URL from artifact URN
            	//e.g. URN: "urn:ns:com.emc.xcp.artifact.resource.image:Artifacts/Resources/folder/image.jpg" > URL:"Artifacts/Resources/ns/folder/image.jpg",
            	var urns = url.split(":");
            	if(urns.length == 4){
            		var path = urns[3];
            		var paths = path.split("/");
            		paths.splice(2, 0, urns[1]);
            		url = paths.join("/");
            	}
                if (url.indexOf("/") != 0){
                    url = "/" + url;
                }
                if (xcp.core.NavigationManager) {
                    var prefix = "/Artifacts",
                        appPath = this.getAppPathName(),
                        appVersion = xcp.appContext ?  xcp.appContext.version : null;
                    if (!appVersion || url.indexOf(prefix + "/") !== 0) {
                        url = "/" + appPath + url;
                    } else {
                        url = "/" + appPath + prefix + "/" + appVersion + url.substring(prefix.length);
                    }
                }
            }

            return url;
        },

        buildComponentUrl : function(ext, comp, resolveDependencyAtServer, nominify) {
            var url = "component";  // $NON-NLS-1$ 
            if (comp) {
                url +="/"+comp.bundle + "/" + comp.id;
            }
            url+="/contents";  // $NON-NLS-1$ 
            if (comp) {
                url+= "-"+comp.id;
            }
            url+="-"+xcp.componentVersion+"."+ext;

            var appendQ = true;
            if (resolveDependencyAtServer != undefined && resolveDependencyAtServer != null) {
                url+="?resolveDependency=" + resolveDependencyAtServer;
                appendQ = false;
            }
            if (nominify === true) {
                if (appendQ) {
                    url+="?";
                    appendQ = false;
                }
                url+="nominify=true";
            }
            if (appendQ) {
                url +="?"
                appendQ = false;
            } else {
                url +="&"
            }
            url +="locale="+xcp.language;

            return url;
        },
        /**
         * Given an r_object_type value, and optionally an r_object_id value, return the
         * corresponding model.
         * @param objTypeName
         * @param id
         */
        getModelFromObjectType: function(objTypeName, id) {
            var modelName = objTypeName;
            if (modelName == "dm_cabinet")
                modelName = "xcp_dm_folder";

            // If we don't find the model for the type, then get the base type based on the object id
            if (!Ext.ModelManager.getModel(modelName)) {
                if (!id) {
                    xcp.Logger.debug("error: can't get model from object type " + objTypeName);
                }
                else {
                    if ((id.indexOf("0b") == 0) || (id.indexOf("0c") == 0))
                        modelName = "xcp_dm_folder";
                    else if (id.indexOf("09") == 0)
                        modelName = "xcp_dm_document";
                    else if (id.indexOf("08") == 0)
                        modelName = "xcp_RootBO";
                    else
                        xcp.Logger.debug("error: can't get model from object type " + objTypeName);
                }
            }

            return modelName;
        },

        isSupportedType: function(r_object_type){
            var modelName=this.getModelFromObjectType(r_object_type);
            return this.isSupportedModel(modelName);
        },
        isSupportedModel: function(modelName){
            var modelMap = xcp.appConfiguration.modelsConfig;
            return (modelName && modelMap[modelName]!=undefined);
        },
        isPageExist: function(modelName, pageUrlName) {
            var modelMap = xcp.appConfiguration.modelsConfig;
            if (modelName && modelMap && modelMap[modelName] != undefined) {
                if (pageUrlName) {
                    var pages = modelMap[modelName]['pages'];
                    if (pages && pages.length > 0) {
                        for (var index=0; index < pages.length; index++) {
                            if (pages[index] == pageUrlName) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        },

        /* This function will check if the record belong to a relationship realtime query. All those queries have
        * attributes like parent_ or child_ except the id and the effectivePermissions attributes.*/
        isRelationshipQuery: function(record) {
            var name;
            for (var i = 0; i < record.fields.items.length; i++) {
                name = record.fields.items[i].name;

                if (name === "id" || name === "effectivePermissions" ||
                                name.indexOf("child_") != -1 || name.indexOf("parent_") !== -1) {
                    continue;
                } else{
                    return false;
                }
            }
            return true;
        },

        /**
         * Get a model instance as a specific model type. Returns same model if same or missing modelName
         * @param model
         * @param modelName
         */
        getAsModel: function(model, modelName) {
            if (!model || !modelName)
                return model;
            if (Ext.ClassManager.getName(model)==modelName)
                return model;
            var xmodel = Ext.create(modelName, model.data);
            xmodel = xcp.action.form.DataAction.copyModelInstance(model, xmodel);

            return xmodel;
        },

        // Utility method to build the URL used for navigation.
        //
        //    model         name of the model (e.g. 'folder')
        //    objectId      r_object_id of target object page
        //    page          name of xcp page
        //    src           component user used to invoke navigation
        //    version       flag indicating URL should have version parameter
        makePageUrl: function(model, objectId, page, src, version) {
            return xcp.util.Utils.buildPageUrl(model, objectId, page, xcp.util.Utils.getNavigationAppPage(src), version);
        },

        // Utility method to build the URL used for given info.
        //
        //    model         name of the model (e.g. 'folder')
        //    objectId      r_object_id of target object page
        //    page          name of xcp page
        //    appPage       appPage string
        //    version       flag indicating URL should have version parameter
        buildPageUrl: function(model, objectId, page, appPage, version) {
            var url;

            if (!page)
                page = xcp.defaultPages[model];

            if ((objectId != null) && (objectId != ""))
            {
                url = [model, objectId, page].join("/");
                if(version == true)
                    url = url + "?version=" + version;
            }
            else
            {
                url = [model, page].join("/");
            }
            if (appPage)
                url = [appPage, url].join("/");

            return url;
        },
        /**
         * Utility method to build the URL used by FolderView to setPage and not navigate.
         * @param model   name of the model (e.g. 'folder')
         * @param objectId  r_object_id of target object page
         * @param page   name of xcp page
         * @param role
         * @returns pageUrl
         */
        frameUrl:function (model, objectId, page, role) {
            if (!page)
                page = xcp.util.Utils.getDefaultPageFromContextMenu(model);

            var appPath = document.location.pathname;
            if (appPath.charAt(appPath.length - 1) == '/') {
                appPath = appPath.substr(0, appPath.length - 1);
            }
            var pagePath = ["/ui/pages", model, page].join("/");
            var pageUrl = xcp.util.Utils.buildResourceUrl(pagePath);
            //add role or objectId which ever is available first
            if (role) {
                pageUrl += '?role=' + role;
            } else if (objectId) {
                this.objectId = objectId;
                pageUrl += '?objectId=' + objectId;
            }
            return pageUrl;
        },

        /**
         * Returns the default page to use when rendering a link for a row in a grid or tree node.
         * @param modelName
         */
        getDefaultPageFromContextMenu: function(modelName, record)
        {
            if (modelName == "xcp_task") {
                return xcp.util.Utils.getTaskPageName(record);
            }
            var menu = xcp.core.ActionManager.getContextMenuDefByName(modelName + "-ItemContextMenu");
            var pageUrl = xcp.defaultPages[modelName];

            for (var action in menu)
            {
                var menuItem = menu[action];
                if (menuItem.isDefaultLink == true)
                {
                    pageUrl = menuItem.action.page;
                    break;
                }
            }
            return pageUrl;
        } ,

        // Given a component, return either an empty string ("") or currentNavigationContext.appPage
        // (the name of the current application page), depending on whether the current application
        // page (if any) meets the following:
        //
        //   (1) the given source component is contained (either directly or by a contained page) by
        //       the current application page, and
        //   (2) the current application page has a content area
        //
        getNavigationAppPage: function(src) {
            var appPage = "";
            if (src) {
                // find the page that contains the source widget
                var containingPage = undefined;
                if (src.parentPage) {
                    containingPage = src.parentPage;
                } else if (!src instanceof xcp.widget.Page && Ext.isFunction(src.getPage)) {
                    containingPage = src.getPage();
                }else {
                    containingPage = src.up('xcp_page');
                }
                /*Without this, clicking on an item from the content area of folderview will not navigate the entire page.*/
                if (containingPage && containingPage.insideFolderView)
                    return "";

                // if it's found, and it's not the top page, look for a contained content area
                // ignore content area inside folderview widget
                if (containingPage && (containingPage.id != "_topPageContainer")) {
                    var contentArea = containingPage.getComponentByXType("xcp_page");
                    if (contentArea && !contentArea.insideFolderView  && xcp.navigationManager) {
                        appPage = xcp.navigationManager.currentNavigationContext.appPage;
                    }
                }
                // if no appPage at this point, check one more level up. This handles the case where
                // the source component resides on an object page contained by the current application
                // page.
                if (!appPage && containingPage) {
                    var grandParentPage = containingPage.parentPage;
                    if (!grandParentPage) {
                        grandParentPage = containingPage.up('xcp_page');
                    }

                    if (grandParentPage && (grandParentPage.id != "_topPageContainer") && xcp.navigationManager)
                        appPage = xcp.navigationManager.currentNavigationContext.appPage;
                }
            }
            return appPage;
        },
        /**
         * Replace {vars} in template from model or js object.
         * @param str
         * @param data
         */
        formatTemplateString: function(str, data) {
            if (data){
                if (Ext.isFunction(data.get))
                    data = data.data;
                for (var name in data)
                {
                    var value = data[name];
                    str = str.replace("{"+name+"}", value);
                }
            }
            return str;
        },

        /**
         * Finds if it is an empty object
         * @param obj
         */
        isEmptyObject : function(obj) {
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        },

        /**
         * Shallow merge of two object properties
         * @param obj1
         * @param obj2
         */
        merge : function(obj1, obj2) {
            for(var prop in obj2) {
                if(obj2.hasOwnProperty(prop)) {
                    obj1[prop] = obj2[prop];
                }
            }
        },
        deepCopy: function(source, target) {
            target = target || (source.constructor === Array ? [] : {});
            for (var i in source) {
                if (typeof source[i] === 'object') {
                    target[i] = source[i].constructor === Array ? [] : {};
                    xcp.util.Utils.deepCopy(source[i], target[i]);
                } else {
                    target[i] = source[i];
                }
            }
            return target;
        },
        /**
         * Update browser window title with:
         * [app title] - [page title]
         */
        updateBrowserTitle : function(title) {
            var separator = ' - ',
                title = title || {},
                appTitle = title.appTitle || xcp.appContext.name || '',
                pageTitle = title.pageTitle || '';

            if (!Ext.isEmpty(appTitle)) {
                title = Ext.isEmpty(pageTitle) ? appTitle : appTitle + separator + pageTitle;
            } else if (!Ext.isEmpty(pageTitle)) {
                title = pageTitle;
            } else {
                //empty string can't override the current title
                //mimick default browser behavior when no title is present, it just display the url
                title = window.location.href;
            }

            document.title = title;
        },
        isSubTypeOf: function(subClass, superClass) {
            if (subClass && superClass) {
                var superClassName = superClass.$className;
                var parentClass = subClass.superclass;
                //Check for ExtJs Based class
                if (superClassName && parentClass) {
                    var parentClassName = parentClass.$className;
                    if (parentClassName == superClassName) {
                        return true;
                    }
                    else {
                        return xcp.util.Utils.isSubTypeOf(parentClass, superClass);
                    }
                } else {
                    //May not be ExtJs generated classes
                    if (subClass.prototype && superClass.prototype) {
                        if (subClass.prototype.constructor == superClass.prototype.constructor) {
                            return true;
                        }
                    }

                }
            }
            return false;
        },
        getTaskPageName: function(record) {
            if (record) {
                var processName = record.get("process_system_name");
                var activityName = record.get("activity_system_name");
                if (xcp.util.Utils.isPageExist(processName, activityName)) {
                    return activityName;
                }
            }
            return undefined;
        },
        isTaskModel: function(modelName, record) {
            if (modelName && modelName == "xcp_task") {
                return true;
            } else if (!Ext.isEmpty(record.get("process_system_name"))) {
                return true;
            }
            return false;
        },
        getProcessName: function(record) {
            if (!Ext.isEmpty(record.get("process_system_name"))) {
                return record.get("process_system_name");
            } else {
                return undefined;
            }
        },
        queryComponentByXCPIdOrName: function(scope, xcpIdOrName) {
            var componentQueryStr = "component[xcpId='" + xcpIdOrName + "']";
            var component = scope.query(componentQueryStr);
            if (!component || component.length == 0) {
                //fallback to name property
                componentQueryStr = "component[name='" + xcpIdOrName + "']";
                component = scope.query(componentQueryStr);
            }
            return component;

        },
        queryComponentByModelName: function(scope, modelNameOrAlias) {
            var componentQueryStr = "component[modelName='" + modelNameOrAlias + "']";
            var components = scope.query(componentQueryStr);
            if (components && components.length != 0) {
                return components[0];
            }

            //component is a form which contains multiple model instances
            componentQueryStr = "component[modelNames]";  // $NON-NLS-1$
            components = scope.query(componentQueryStr);
            if (components && components.length != 0) {
                for (i = 0; i < components.length; i++) {
                    if (components[i].modelNames[modelNameOrAlias]) {
                        return components[i];
                    }
                }
            }
            //Fallback to look for modelAlias
            componentQueryStr = "component[modelAlias='" + modelNameOrAlias + "']";
            components = scope.query(componentQueryStr);
            if (components && components.length != 0) {
                return components[0];
            }
            return null;
        },
        queryComponentByXType: function(scope, xtype) {
            if (scope && xtype && Ext.isFunction(scope.down)) {
                return scope.down(xtype);
            }
            return undefined;
        },

        /**
         * remove object references to short cut memory leaks.
         * @param obj
         */
        makeObjectEmpty : function(obj) {
            if (obj) {
                for (var name in obj) {
                    if (name) {
                        var val = obj[name];
                        if (val && typeof val === "object" && obj.hasOwnProperty(name)) {
                            delete obj[name];
                        }
                    }
                }
            }
        },

        /**
         * remove object references to short cut memory leaks for a component.
         * @param obj
         */
        makeComponentEmpty : function(obj) {
            if (!obj) {
                return;
            }

            var makeObjectEmpty = this.makeObjectEmpty;
            var v;

            if (v = obj.view) {
                makeObjectEmpty(v);
            }
            if (v = obj.loadMask) {
                makeObjectEmpty(v);
            }
            if (v = obj.headerCt) {
                makeObjectEmpty(v);
            }
            if (v = obj.componentLayout) {
                makeObjectEmpty(v);
            }
            if (v = obj.layout) {
                makeObjectEmpty(v);
            }
            if (v = obj.initialConfig) {
                makeObjectEmpty(v);
            }
            if (v = obj.selModel) {
                makeObjectEmpty(v);
            }
            if (v = obj.viewConfig) {
                makeObjectEmpty(v);
            }

            makeObjectEmpty(obj);
        }
    }
});




/* xcp_component_lib/content/xcp/core/ComponentConfig.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * A Configuration object to store required meta data info for component. The component config object is capable of
 * loading the component content.
 */
Ext.define("xcp.core.ComponentConfig", {
    extend:"Object",

    /**
     * Constructor
     */
    constructor : function() {
        this.id = null;
        this.loaded = false;
        this.bundle = null;
        this.dependencies = [];
        this.failLoad = false;
        this.loading = false;
    },
    /**
     * Load the component content
     * @param resolveDependencyAtClient : True resolve componenet dependency
     * @param synchronous : True - load componenet content synchronously.
     * @param callBack : Callback function
     * @param scope - Callback scope
     */
    load : function(resolveDependencyAtClient, synchronous, callBack, scope) {
        if (!(this.loading || this.loaded) && !this.failLoad) {
            if (resolveDependencyAtClient) {
                var dependencies = this.dependencies;
                if (dependencies) {
                    for (var i = 0; i < dependencies.length; i++) {
                        var dependencyComp = xcp.core.ComponentManager.getComponentConfig(dependencies[i].componentId);
                        if (dependencyComp && !dependencyComp.loaded) {
                            //Don't need to pass callback to dependency load
                            dependencyComp.load(resolveDependencyAtClient, synchronous);
                        } else if (!dependencyComp) {
                            xcp.Logger.warn("For component [" + this.id + " ] - invalid dependency component id specified : " + dependencies[i]);
                        }
                    }
                }
            }
            var successCallBack = this.onLoad;
            if (callBack) {
                successCallBack = function() {
                    this.onLoad();
                    if (!scope) {
                        scope = new Object();
                    }
                    callBack.call(scope);
                };
            }
            this.loading = true;
            if (!synchronous) {
                synchronous = false;
            }
            var componentURL = this.getComponentUrl(false);
            Ext.Loader.loadScriptFile(componentURL, successCallBack, this.onError, this, synchronous);
        } else if (this.failLoad) {
            xcp.Logger.error("Ignore loading of component as the load was failed previously : " + this.id);
        } else {
            if (callBack) {
                if (!scope) {
                    scope = new Object();
                }
                callBack.call(scope);
            }
        }
    },
    /**
     * Get a component content load URL.
     * @param resolveDependencyAtServer
     */
    getComponentUrl : function(resolveDependencyAtServer) {
        return xcp.util.Utils.buildComponentUrl("js", this, resolveDependencyAtServer);
    },
    /**
     * Success handler for component content load 
     * @param applyToDependencyComp
     */
    onLoad : function(applyToDependencyComp) {
        xcp.Logger.debug("Loaded the component["+this.id+"] successfully");
        this.loaded = true;
        this.loading = false;
        if (applyToDependencyComp) {
            var dependencies = this.dependencies;
            if (dependencies) {
                for (var i = 0; i < dependencies.length; i++) {
                    var dependencyComp = xcp.core.ComponentManager.getComponentConfig(dependencies[i]);
                    if (dependencyComp) {
                        dependencyComp.onLoad(true);
                    }
                }
            }
        }
    },
    /**
     * Error handler for component content load
     * @param error
     */
    onError : function(error) {
        this.failLoad = true;
        xcp.Logger.error("Error loading component[" + this.id + "] : " + error);
    }
});

/* xcp_component_lib/content/xcp/core/ComponentManager.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * A manager responsible for loading & mananging component config. The component manager support two mode
 * for loading the components, namely
 * development : Load all components individually during application startup.
 * ondemand : Load xcp bootstrap (as specified in xcp_bootstrap library definition) components during
 * application startup, and there after load components and require components just in time.
 */
Ext.define("xcp.core.ComponentManager", {
    extend:'Ext.util.Observable',
    singleton:true,
    componenetsList : new Object(),
    /**
     * Initialize Component Manager.
     * @param componentLoadMode
     * @param callback
     * @param scope
     */
    init : function(componentLoadMode, callback, scope) {
        //Go and get the component definition
        Ext.Ajax.request({
            url:  "component/definitions.json",
            async: false,
            scope: this,
            success: function(response, options) {
                xcp.Logger.debug("Loaded component defintion configuration");
                var object = Ext.JSON.decode(response.responseText);
                var definitions = object.definitions;

                if (definitions) {
                    var resolvedComponentIdList = new Array();
                    for (var i = 0; i < definitions.length; i++) {
                        var def = definitions[i];
                        var comp = new xcp.core.ComponentConfig();
                        comp.id = def.id;
                        comp.bundle = def.bundle;
                        if (def.dependencies) {
                            var dependencyList = def.dependencies.dependency;
                            for (var j = 0; j < dependencyList.length; j++) {
                                comp.dependencies[comp.dependencies.length] = dependencyList[j];
                            }
                        }
                        resolvedComponentIdList[resolvedComponentIdList.length] = def.id;
                        this.componenetsList[def.id] = comp;
                    }
                    //Do not reload the already loaded components
                    this.componenetsList["xcp_startup"].onLoad(true);
                    if (componentLoadMode == 'development') {  // $NON-NLS-1$ 
                        var cmp = null;
                        var cmpId = null;

                        for (var j = 0; j < resolvedComponentIdList.length; j++) {

                            cmp = this.componenetsList[resolvedComponentIdList[j]];
                            if (cmp instanceof xcp.core.ComponentConfig) {
                                if (j == resolvedComponentIdList.length - 1) {
                                    cmp.load(false, false, callback, scope);
                                } else {
                                    cmp.load(false, false);
                                }

                            }
                        }
                    } else {
                        var _getNameByAlias = function(alias) {
                            if (alias && alias.length != 0) {
                                var comp = xcp.core.ComponentManager.getComponentConfig(alias);
                                if (!comp) {
                                    if (alias.indexOf(".") != -1) {
                                        comp = xcp.core.ComponentManager.getComponentConfig(alias.substring(alias.indexOf(".") + 1));
                                    }
                                }
                                if (comp) {
                                    comp.load(true, true);
                                }
                            }
                            return this._getNameByAlias(alias);
                        };
                        //Ext.Loader.disableCaching=false;
                        Ext.ClassManager._getNameByAlias = Ext.ClassManager.getNameByAlias;
                        Ext.ClassManager.getNameByAlias = _getNameByAlias;
                        var bootstrapComp = this.getComponentConfig("xcp_bootstrap");
                        if (bootstrapComp) {
                            bootstrapComp.load(true, false, callback, scope);
                        }
                        else {
                             xcp.Logger.error("Could not find the xcp_bootstrap component def");
                        }
                    }
                }
            },
            failure: function(response, options) {
                // todo:  change this to follow standard app service error pattern once that's defined
                 xcp.Logger.error("Error during component defintions loading, cannot complete application initializtion", response);
            }

        });
    },
    /**
     * Get component config object
     * @param id : component Id
     */
    getComponentConfig: function(id) {
        if (id && id.length > 0) {
            return this.componenetsList[id];
        } else {
            return null;
        }
    },
    /**
     * Error handler
     */
    onError : function() {
    }
});

/* xcp_picklist/content/xcp/picklist/models/StringModel.js */

/*
 * Copyright (c) 2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * @class xcp.picklist.models.StringModel
 * @extends Ext.data.Model
 * The model used for stores representing string picklists
 */
Ext.define("xcp.picklist.models.StringModel", {
    "extend": "Ext.data.Model",
    "idProperty": "value",
    "fields":[{
        "name":"value",
        "type":"string"
     },{
        "name":"label",
        "type":"string"
    }]
});
/* xcp_picklist/content/xcp/picklist/models/IntegerModel.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * @class xcp.picklist.models.IntegerModel
 * @extends Ext.data.Model
 * The model used for stores representing integer picklists
 */
Ext.define("xcp.picklist.models.IntegerModel", {
    "extend": "Ext.data.Model",
    "idProperty": "value",
    "fields":[{
        "name":"value",
        "type":"int"
     },{
        "name":"label",
        "type":"string"
    }]
});
/* xcp_picklist/content/xcp/picklist/models/FloatModel.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */
/**
 * @class xcp.picklist.models.FloatModel
 * @extends Ext.data.Model
 * The model used for stores representing float picklists
 */

Ext.define("xcp.picklist.models.FloatModel", {
    "extend": "Ext.data.Model",
    "idProperty": "value",
    "fields":[{
        "name":"value",
        "type":"float"
     },{
        "name":"label",
        "type":"string"
    }]
});
/* xcp_picklist/content/xcp/picklist/PicklistManager.js */

/*
 * Copyright (c) 2011. EMC Corporation.  All Rights Reserved.
 */
Ext.define("xcp.picklist.PicklistManager", {
    singleton: true,
    requires: [
        "xcp.picklist.models.StringModel",
        "xcp.picklist.models.IntegerModel",
        "xcp.picklist.models.FloatModel"
    ],
    /**
     * Loads picklist data and creates actual picklist instances
     * @param {Function} [callback] The callback function invoked after picklist data has been initialized
     * @param {Object} [scope] The scope (<code>this</code> reference) in which the callback is executed.
     */
    initializePicklists: function(callback, scope) {
        var url = xcp.util.Utils.buildResourceUrl("ui/picklist", true);
        Ext.Ajax.request({
            url: url,
            async: true,
            scope: this,
            disableCaching: false,
            success: function(response, options) {
                xcp.Logger.debug("Got picklist data");
                var responseText = response.responseText;
                var data = Ext.JSON.decode(responseText);
                var gridConfig;
                var picklistData;
                var store;
                var storeId;
                for (var picklistName in data) {
                    if (data.hasOwnProperty(picklistName)) {
                        storeId = "xcp.picklist." + picklistName;
                        picklistData = data[picklistName];
                        gridConfig = Ext.apply(picklistData, {
                            autoLoad: true,
                            storeId: storeId
                        });
                        Ext.create('Ext.data.Store', gridConfig);
                    }
                }
                if (callback) {
                    callback.call(scope);
                }
            },
            failure: function(response, options) {
                xcp.Logger.log("Failed to load picklist data");
                if (callback) {
                    callback.call(scope);
                }
            }
        });
    }
});/*
 * Copyright (c) 2012-2012. EMC Corporation.  All Rights Reserved.
 */

Ext.namespace("xcp.Strings.facets.FacetManager");

Ext.apply(xcp.Strings.facets.FacetManager, {
    firstQuarterFormatString: "Q1 {0}",
    secondQuarterFormatString: "Q2 {0}",
    thirdQuarterFormatString: "Q3 {0}",
    fourthQuarterFormatString: "Q4 {0}"
});
/* xcp_facet_manager/content/xcp/facets/FacetManager.js */

/*
 * Copyright (c) 2012. EMC Corporation.  All Rights Reserved.
 */
Ext.define("xcp.facets.FacetManager", {
    singleton: true,
    /*requires: [
        "xcp.util.Utils",
        "xcp.Logger"
    ],*/
    /**
     * Loads facet related data
     * @param {Function} [callback] The callback function invoked after facet data has been initialized
     * @param {Object} [scope] The scope (<code>this</code> reference) in which the callback is executed.
     */
    initializeFacets: function(callback, scope) {
        var url = xcp.util.Utils.buildResourceUrl("ui/facets", true);
        Ext.Ajax.request({
            url: url,
            async: true,
            scope: true,
            disableCaching: false,
            success: function(response, options) {
                xcp.Logger.debug("Got facets data");
                var responseText = response.responseText;
                var data = Ext.JSON.decode(responseText);
                xcp.facets.FacetManager.localizationData = data;
                if (callback) {
                    callback.call(scope);
                }
            },
            failure: function(response, options) {
                xcp.Logger.log("Failed to load facets data");
                if (callback) {
                    callback.call(scope);
                }
            }
        });
    },
    /**
     * Returns facet label given the search id and facet id
     * @param {String} searchId id of the search
     * @param {String} facetId id of the facet
     * @return {String} facet label
     */
    getFacetLabel: function(searchId, facetId) {
        var label = facetId;

        // JSON Format:
        // {
        // 		searchName: {
        //			facetName:  {
        //				label: "${localized label key}"
        //				values: {
        //					valueId1: "${localized label key}"
        //					valueId2: "${localized label key}"
        //				}
        //				dateFrequency:  {number corresponding to Frequency value}
        //			}
        //		}
        // }
        if (this.localizationData) {
            var searchData = this.localizationData[searchId];
            if (searchData) {
                var facetData = searchData[facetId];
                label = facetData.label;
            }
        }

        return label;
    },
    /**
     * Returns facet label given the search id and facet id
     * @param {String} searchId id of the search
     * @param {String} facetId id of the facet
     * @param {String} value facet value
     * @return {String} facet value label
     */
    getFacetValueLabel: function(searchId, facetId, value) {
        var label = value;  // Initialize to the value, since there may not be a mapping defined

        // JSON Format:
        // {
        // 		searchName: {
        //			facetName:  {
        //				label: "${localized label key}"
        //				values: {
        //					valueId1: "${localized label key}"
        //					valueId2: "${localized label key}"
        //				}
        //				dateFrequency:  {number corresponding to Frequency value}
        //			}
        //		}
        // }
        if (this.localizationData) {
            var searchData = this.localizationData[searchId];
            if (searchData) {
                var facetData = searchData[facetId];
                if (facetData) {
                    if (facetData.values) {
                        var v = facetData.values[value];
                        if (v) {
                            label = v;
                        }
                    } else if (facetData.picklist) {
                        var picklistStore = Ext.data.StoreManager.lookup(facetData.picklist);
                        if (picklistStore) {
                            var index = picklistStore.find("value", value, 0, false, true, true);
                            if (index != -1) {
                                var record = picklistStore.getAt(index);
                                label = record.get("label");
                            }
                        }
                    } else if (Ext.isDefined(facetData.dateFrequency)) {
                        // Facet returns ISO 8601 date without timezone information, add "Z" to make it UTC time
                        // or else ExtJS will interpret the date using the local time zone
                        var dateValue = Ext.Date.parse(value + "Z", "c");
                        switch (facetData.dateFrequency) {
                            case 0:
                            {
                                // Day
                                label = Ext.Date.format(dateValue, xcp.Formats.dateFormats["long"]);
                                break;
                            }
                            case 1:
                            {
                                // Week
                                var endDate = Ext.Date.add(dateValue, Ext.Date.DAY, 6);
                                var shortFormat = xcp.Formats.dateFormats["short"];
                                label = Ext.Date.format(dateValue, shortFormat) + " - " + Ext.Date.format(endDate, shortFormat);
                                break;
                            }
                            case 2:
                            {
                                // Month
                                label = Ext.Date.format(dateValue, "F Y");  // $NON-NLS-1$ 
                                break;
                            }
                            case 3:
                            {
                                // Quarter
                                var month = dateValue.getMonth() + 1;
                                var year = dateValue.getFullYear();
                                switch (month) {
                                    case 1:
                                    {
                                        label = Ext.String.format(xcp.Strings.facets.FacetManager.firstQuarterFormatString, year);
                                        break;
                                    }
                                    case 4:
                                    {
                                        label = Ext.String.format(xcp.Strings.facets.FacetManager.secondQuarterFormatString, year);
                                        break;
                                    }
                                    case 7:
                                    {
                                        label = Ext.String.format(xcp.Strings.facets.FacetManager.thirdQuarterFormatString, year);
                                        break;
                                    }
                                    case 10:
                                    {
                                        label = Ext.String.format(xcp.Strings.facets.FacetManager.fourthQuarterFormatString, year);
                                        break;
                                    }
                                }
                                break;
                            }
                            case 4:
                            {
                                // Year
                                label = Ext.Date.format(dateValue, "Y");
                                break;
                            }
                        }
                    }
                }
            }
        }

        return label;
    }
});
/* xcp_event_lib/content/xcp/event/EventBus.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

Ext.define("xcp.event.EventBus", {
    singleton: true,

    /**
     * Publish a message to a channel in the event bus
     * @param channel   name of the channel
     * @param message   message/data to go with the event
     */
    publish: function(channel, message) {
        OpenAjax.hub.publish(channel, message);
    },

    /**
     * Subscribe to a channel in the event bus
     * @param channel   name of the channel
     * @param callback  function to call back when a message is published
     * @param scope     scope to invoke the callback
     * @param subData   subsriber's data
     */
    subscribe: function(channel, callback, scope, subData) {
        return OpenAjax.hub.subscribe(channel, callback, scope, subData);
    },

    /**
     * Unsubscribe to a channel in the event bus
     * @param subscription  subscription
     */
    unsubscribe: function(sub) {
        OpenAjax.hub.unsubscribe(sub);
    }
});
/* xcp_event_lib/content/xcp/event/Publisher.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

Ext.define("xcp.event.Publisher", {
    requires: ['xcp.event.EventBus'],

    /**
     * Initilize the mixin for an object or a class
     * @param config    config
     */
    initMixin: function(config) {
        config = config || this.initialConfig;

        var xcpeventpub = (config && config.xcpeventpub) || this.xcpeventpub;
        if (!xcpeventpub) {
            xcpeventpub = [];
        }
        var xcpeventconfig = (config && config.xcpeventconfig) || this.xcpeventconfig;
        var widgetInstanceId = (config && config.xcpId) || "";
        var baseChannelName = widgetInstanceId + ".";
        if (xcpeventconfig) {
            for (var i = 0; i < xcpeventconfig.length; i++) {
                var cfg = xcpeventconfig[i];
                var event = cfg.event;
                var targetEvent = cfg.targetEvent;
                if (!targetEvent) {
                    targetEvent = event;
                }
                //Check if channel name is available for this event;
                var found=false;
                for(var j=0; j<xcpeventpub.length; j++) {
                    if (xcpeventpub[j]['event'] && xcpeventpub[j]['event'] == targetEvent) {
                        found=true;
                        break;
                    }
                }
                if (!found) {
                    var channelName = baseChannelName + targetEvent;
                    var pubEvent = {
                        event:targetEvent,
                        channel:channelName
                    };
                    xcpeventpub.push(pubEvent);
                }
                this.xcpeventpub = xcpeventpub;
                this.relayXcpEvent(cfg.origin, event, targetEvent, cfg.data);
            }
        }
    },

    /**
     * Publish a message to the channel in the event bus
     * @param event         event that triggers the message
     * @param data          data or message to publish
     * @param useconfig     flag to indicate whether it should publish to a channel or the event bus.
     *                      True to publish to a channel. False, otherwise.
     */
    publishXcpEvent: function(event, data, useconfig) {
        if (!useconfig) {
             xcp.event.EventBus.publish(event, data);
        }

        else if (this.xcpeventpub) {
            var published = {};
            if (!this.baseChannelName) {
                var containerXType = "xcp_page";
                var container;
                if (this.getXType && this.getXType() == containerXType) {
                    container = this;
                } else {
                    if (Ext.isFunction(this.getPage) && this.getPage()) {
                        container = this.getPage();
                    } else {
                        container = this.up(containerXType);
                    }
                }
                if (container) {
                    this.baseChannelName = container.id + ".";
                } else {
                    this.baseChannelName = "";
                }
            }
            for(var i=0; i<this.xcpeventpub.length; i++) {
                var e = this.xcpeventpub[i];
                if (e.event == event && e.channel && !published[e.channel]) {
                    var channelName = this.baseChannelName + e.channel;
                    xcp.event.EventBus.publish(channelName, data);
                    published[e.channel] = true;
                }
            }
        }
    },

    /**
     * Relay the internal ExtJS event to the corresponding external event
     * @param origin        ExtJS component that generates the event
     * @param oevent        name of event generated by ExtJS component
     * @param tevent        name of event generated the widget
     * @param data          data to be published
     */
    relayXcpEvent: function(origin, oevent, tevent, data) {
        origin = origin || this;
        var handler = function() {
            var d = data;
            if (Ext.isFunction(d)) {
                d = d.apply(this, Ext.Array.toArray(arguments));
            }
            this.publishXcpEvent(tevent, d, true);
        }
        origin.on(oevent, handler, this);
    }

});

/* xcp_event_lib/content/xcp/event/Subscriber.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

Ext.define("xcp.event.Subscriber", {
    requires: ['xcp.event.EventBus'],


    /**
     * Initilize the mixin for an object or a class
     * @param config    config
     */
    initMixin : function(config) {
        config = config || this.initialConfig;
        this.xcpEventSubs = new Ext.util.HashMap();
        // register the bindings
        var xcpeventsub = config && config.xcpeventsub || this.xcpeventsub;
        if (xcpeventsub) {
            for (var i = 0; i < xcpeventsub.length; i++) {
                this.subscribeXcpEvent(xcpeventsub[i]);
            }
        }
        // cleanup
        if (this.isObservable && this.events && this.events["destroy"]) {
            this.on("destroy", function() {
                var count = this.xcpEventSubs.getCount();
                if (count > 0) {
                    var keys = this.xcpEventSubs.getKeys();
                    for (var i=0; i < count; i++) {
                        var key = keys[i];
                        this.unsubscribeXcpEvent(key);
                    }
                }

            }, this);
        }
    },

    /**
     * Subscribe to a channel in the event bus
     * @param e     config containing the channel and handler
     */
    subscribeXcpEvent : function(e) {
        var subKey = e.channel;
        var sub = xcp.event.EventBus.subscribe(subKey, this[e.handler], this);
        this.xcpEventSubs.add(subKey, sub);
    },

    /**
     * Unsubscribe to a channel
     * @param e     config containing the channel
     */
    unsubscribeXcpEvent : function(e) {
        if (e) {
            var subKey = Ext.isString(e) ? e : e.channel;

            var sub = this.xcpEventSubs.get(subKey);
            if (sub !== undefined) {
                this.xcpEventSubs.removeAtKey(subKey);
                xcp.event.EventBus.unsubscribe(sub);
            }
        }
    }
});

/* xcp_event_lib/content/xcp/event/EventManager.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * @class xcp.event.EventManager
 *
 * This class is responsible for initializing the event bus framework.
 */
Ext.define("xcp.event.EventManager", {
    singleton: true,
    requires: ['xcp.event.Publisher', 'xcp.event.EventBus'],

    /**
     * Initialize the event mechanism in the system
     * This function adds publisher and subscriber functionality to Component and Store base class.
     * This allows instances of Component or Store to publish or subscribe to the event bus. 
     */
    init: function() {
        // Add pub/sub functionality to Component as mixins
        //move this logic into ExtjsPatch.js XCPUIC-1331
//        Ext.Component.mixin('xcppublisher', xcp.event.Publisher);
//        Ext.Component.mixin('xcpsubscriber', xcp.event.Subscriber);
//        Ext.override(Ext.Component, {
//            constructor: function() {
//                this.callOverridden(arguments);
//                this.mixins.xcppublisher.initMixin.call(this);
//                this.mixins.xcpsubscriber.initMixin.call(this);
//            }
//        });

        // Add pub/sub functionality to Store as mixins 
        Ext.data.Store.mixin('xcppublisher', xcp.event.Publisher);
        Ext.data.Store.mixin('xcpsubscriber', xcp.event.Subscriber);
        Ext.override(Ext.data.Store, {
            constructor: function() {
                this.callOverridden(arguments);
                this.mixins.xcppublisher.initMixin.call(this);
                this.mixins.xcpsubscriber.initMixin.call(this);
            }
        });
    }
});
/* xcp_event_lib/content/xcp/event/ApplicationEvent.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * @class xcp.event.ApplicationEvent
 *
 * This is an abstract base class for application event data.  It should be subclassed before use.
 * All subclasses must define an applicationEventType
 */
Ext.define("xcp.event.ApplicationEvent", {
    statics: {
        registerEventType: function(name, eventClass){
            this._eventTypes.add(name, eventClass);
        },

        // Utility method to enumerate registered application event types.
        getEventTypes: function() {
            return this._eventTypes.getKeys();
        },

        _eventTypes: new Ext.util.HashMap()
    },
    constructor: function() {
        var cls = Ext.ClassManager.getClass(this);
        if (typeof(cls.prototype.applicationEventType) == 'undefined') {
            Ext.Error.raise('Unregistered application event type: ' + Ext.ClassManager.getName(cls) +
            '.  applicationEventType must be defined on all xcp.event.ApplicationEvent subtypes.')
        }
    }
});

// This class manager post processor watches for class definitions that inherit from
// ApplicationEvent, and registers the event type in a static application event registry.
Ext.ClassManager.registerPostprocessor("applicationEventType", function(name, cls, data){
    xcp.event.ApplicationEvent.registerEventType(data.applicationEventType, cls);
});
Ext.ClassManager.setDefaultPostprocessorPosition("applicationEventType", "last");  // $NON-NLS-L$ 

Ext.define('xcp.event.ContainerChangedEvent', {
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.container.changed',
    documentId: '',
    statics:{
        CONTAINER_CHANGED_EVENT: 'xcpApp.container.changed',
        NAME: "xcpApp.container.changed"
    }
});

Ext.define('xcp.event.ItemLockedEvent', {
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.item.locked',
    documentId: '',
    statics:{
        ITEM_LOCKED_EVENT: 'xcpApp.item.locked',
        NAME: 'xcpApp.item.locked'
    }
});

Ext.define('xcp.event.ItemUnlockedEvent', {
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.item.unlocked',
    documentId: '',
    statics:{
        ITEM_UNLOCKED_EVENT: 'xcpApp.item.unlocked',
        NAME: 'xcpApp.item.unlocked'
    }
});

Ext.define('xcp.event.ItemDeleted', {
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.item.ItemDeleted',
    statics:{
        ITEM_CONTAINER_CHANGED: 'xcpApp.item.deleted',
        NAME: 'xcpApp.item.deleted'
    }
});

Ext.define('xcp.event.ItemModified', {
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.item.ItemModified',
    statics:{
        NAME: 'xcpApp.item.modified'
    }
});

Ext.define('xcp.event.SelectorEvent',{
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.selector.selectionDone',
    statics:{
        NAME: 'xcpApp.selector.selectionDone'
    }
});
Ext.define('xcp.event.PageModEvent',{
    extend: 'xcp.event.ApplicationEvent',
    applicationEventType: 'xcpApp.viewer.docModified',
    statics:{
        NAME: 'xcpApp.viewer.docModified'
    }
});


/* xcp_hidden_mixin/content/xcp/util/mixin/SetHiddenMixin.js */

/*
 * Copyright (c) 2010-2011. EMC Corporation.  All Rights Reserved.
 */

/**
 * Mixin to add a setHidden method to a class which has a setVisible method
 */
Ext.define("xcp.util.mixin.SetHiddenMixin", {
    extend: "Ext.Base",

    /**
     * Sets whether an object is hidden or not
     * @param {Boolean} hidden true if the object should not be visible, false if the object should be visible
     */
    setHidden: function(hidden) {
        this.setVisible(!hidden);
    }
});
/* xcp_application/content/xcp/data/model/NamespaceConfigModel.js */

/*
 * Copyright (c) 2012-2012. EMC Corporation.  All Rights Reserved.
 */

Ext.define("xcp.data.model.NamespaceConfigModel", {
    extend: 'Ext.data.Model',
    fields: [
        {name: "config_description", type: "string"},
        {name: "config_label", type: "string" },
        {name: "config_name", type: "string" },
        {name: "config_type", type: "string" },
        {name: "id", type: "string" },
        {name: "namespace", type: "string" },
        {name: "property_datatype"},
        {name: "property_name"},
        {name: "property_value"}
    ]
});

/* xcp_application/content/xcp/core/ApplicationParameterManager.js */

/*
 * Copyright (c) 2012-2012. EMC Corporation.  All Rights Reserved.
 */


Ext.define("xcp.core.ApplicationParameterManager", {
    singleton: true,

    /**
     * Loads application parameter data, assumes that xcp.appContext.namespace is defined
     *
     * @param callback
     * @param scope
     */
    initAppParameters: function(callback, scope) {
        // Load application parameters localization data, then if that's successful, load the actual values
        // Note:  The localization data needs to be loaded first since that determines sort order of values
        var url = xcp.util.Utils.buildResourceUrl("ui/appParam", true);
        Ext.Ajax.request({
            url: url,
            async: true,
            scope: this,
            disableCaching: false,
            success: function(response, options) {
                var responseText = response.responseText;
                this.appParametersLocalizationData = Ext.JSON.decode(responseText);
                var proxyUrl = "application/" + xcp.appContext.namespace + "/parameters";
                this.appParametersStore = Ext.create("Ext.data.Store", {
                    autoLoad: true,
                    model: "xcp.data.model.NamespaceConfigModel",
                    proxy: {
                        type: 'rest',
                        url: proxyUrl
                    },
                    listeners: {
                        load: {
                            scope: this,
                            fn:  function(store, records, successful, eOpts) {
                                if (successful) {
                                    xcp.Logger.debug("Loaded application parameters");
                                } else {
                                    xcp.Logger.log("Failed to load application parameters");
                                }

                                if (callback) {
                                    callback.call(scope);
                                }
                            }
                        }
                    },
                    sorters: {
                        sorterFn: function(paramRecord1, paramRecord2) {
                            // Sort the list of parameters by label, name, and namespace
                            var strCmp = function(a, b) {
                                var la = a.toLocaleLowerCase();
                                var lb = b.toLocaleLowerCase();
                                var lc = la.localeCompare(lb);
                                return lc;
                            };
                            var namespace1 = paramRecord1.get("namespace");
                            var namespace2 = paramRecord2.get("namespace");
                            var name1 = paramRecord1.get("config_name");
                            var name2 = paramRecord2.get("config_name");
                            var label1 = xcp.core.ApplicationParameterManager.getAppParameterLabel(namespace1, name1);
                            var label2 = xcp.core.ApplicationParameterManager.getAppParameterLabel(namespace2, name2);
                            var cmpRet = strCmp(label1, label2);
                            if (cmpRet != 0) {
                                return cmpRet;
                            }
                            cmpRet = strCmp(name1, name2);
                            if (cmpRet != 0) {
                                return cmpRet;
                            }
                            return strCmp(namespace1, namespace2);
                        }
                    },
                    filters: [{
            					property: "config_type",
            					value   : "PARAMETER"
        			}]
                });
            },
            failure: function(response, options) {
                xcp.Logger.log("Failed to load application parameter localization data");
                if (callback) {
                    callback.call(scope);
                }
            }
        });
    },

    getAppParameter: function(namespace, param) {
        if (this.appParametersStore) {
            var record = this.getMatchingRecord(namespace, param);
            if (record) {
                var paramValue = record.get("property_value")[0];
                var paramType = record.get("property_datatype")[0];
                switch (paramType) {
                    case "int":
                        return parseInt(paramValue);
                    case "string":
                        return paramValue;
                    case "float":
                        return parseFloat(paramValue);
                    case "boolean":
                        return paramValue == "true";
                    case "Datetime":
                    case "dm_user":
                    case "dm_group":
                    case "dm_folder":
                    case "dmc_workqueue":
                    case "dmc_calendar":
                        return paramValue;
                }
                return paramValue;
            }
        }
        return "";
    },

    getAppParameterDescription: function(namespace, param) {
        // Look up description based on namespace and param for I18N support
        var namespaceEntry = this.appParametersLocalizationData[namespace];
        if (namespaceEntry) {
            var paramEntry = namespaceEntry[param];
            if (paramEntry) {
                return paramEntry.description;
            }
        }

        // Fallback to whatever was entered in builder
        var record = this.getMatchingRecord(namespace, param);
        return record.get("config_description");
    },

    getAppParameterLabel: function(namespace, param) {
        // Look up label based on namespace and param for I18N support
        var namespaceEntry = this.appParametersLocalizationData[namespace];
        if (namespaceEntry) {
            var paramEntry = namespaceEntry[param];
            if (paramEntry) {
                return paramEntry.label;
            }
        }

        // Fallback to whatever was entered in builder
        var record = this.getMatchingRecord(namespace, param);
        return record.get("config_label");
    },

    getMatchingRecord: function(namespace, param) {
        var cmpFunc = function(record, id) {
            return ((record.get("namespace") == namespace) &&
                (record.get("config_name") == param));
        };
        var index = this.appParametersStore.findBy(cmpFunc, this);
        if (index != -1) {
            return this.appParametersStore.getAt(index);
        }
        return null;
    },

    getParameters: function() {
        return this.appParametersStore;
    }
});
/* xcp_startup/content/xcp/Startup.js */

/*
 * Copyright (c) 2010-2012. EMC Corporation.  All Rights Reserved.
 */

Ext.namespace("xcp");
/**
 * Provide a dummy console API for browsers that don't have one.
 */
if (typeof window.console == "undefined") {
    window.console = {
        log: Ext.emptyFn,
        error: Ext.emptyFn,
        warn: Ext.emptyFn,
        info: Ext.emptyFn,
        debug: Ext.emptyFn
    };
}
else if (!window.console.debug && window.console.log) {
    window.console.debug = window.console.log;
}

/**
 * A application startup class, responsible for loading
 * - Component configuration and content
 * - Initializing User profile, themes, event and navigation manager.
 *
 */
if (!xcp.Startup) {
(function() {
    // the application is going to start when the counter reaches zero during the initialization stage
    var readyCounter = 0;
    function decCounter() {
        readyCounter--;
    }

    Ext.define("xcp.Startup", {
        singleton: true,
        appConfig: null,

        /**
         * This method gets called as a response to Ext.onReady and so it is a entry point for xcp application
         * initialization.
         * @param appConfig
         */
        start : function(appConfig) {
            xcp.Logger.initLogging();
            xcp.Logger.debug("Starting application config with ", appConfig);
            this.appConfig = appConfig || {};
            this.loadUserDetails();
        },
        /**
         * Load Current user details
         */
        loadUserDetails: function() {
            Ext.Ajax.request({
                url: "application/currentUser",
                async: true,
                scope: this,
                success: function(response, options) {
                    xcp.Logger.debug("Got current user details");
                    var responseText = response.responseText;
                    xcp.currentUser = Ext.JSON.decode(responseText);
                    this.loadComponents();
                },
                failure: function(response, options) {
                    console.log("Failed to load current user details");
                    this.loadComponents();
                }
            });
        },
        /**
         * Load component configuration and content.
         */
        loadComponents : function() {
            var componentLoadMode = null;
            if (this.appConfig && this.appConfig.componentLoadMode) {
                componentLoadMode = this.appConfig.componentLoadMode;
            }
            xcp.Logger.debug("Loading components with mode", componentLoadMode);
            //Ext messes up the namespace if we try to reload the same component def.
            Ext.ClassManager.enableNamespaceParseCache = false;
            //Check if it is a development mode, then load all widgets one by one
            if (componentLoadMode && (componentLoadMode == 'development' || componentLoadMode == 'ondemand')) {  // $NON-NLS-L$ 
                xcp.core.ComponentManager.init(componentLoadMode, this.onComponentsLoad, this);
            } else {
                var url = xcp.util.Utils.buildComponentUrl("js", null, null, this.appConfig.nominify);
                Ext.Loader.injectScriptElement(url, this.onComponentsLoad, this.onError, this);
            }
        },
        /**
         * Component content load handler.
         */
        onComponentsLoad: function() {
            xcp.Logger.debug("Components load completed...");
            Ext.ClassManager.enableNamespaceParseCache = true;
            Ext.Component.mixin('xcphidden', xcp.util.mixin.SetHiddenMixin);
            xcp.event.EventManager.init();
            this.initModels();
            this.initExpressions();
            this.initUserProfile();
        },
        /**
         * Application models loader.
         */
        initModels : function() {
            var modelsUrl = xcp.util.Utils.buildResourceUrl("/js/Models.js");
            Ext.Loader.injectScriptElement(modelsUrl, this.onModelsLoad, this.onError, this);
        },
        /**
         * Application expressions loader.
         */
        initExpressions : function() {
            var expressionUrl = xcp.util.Utils.buildResourceUrl("/js/Expressions.js");
            Ext.Loader.injectScriptElement(expressionUrl, this.onExpressionsLoad, this.onError, this);
        },

        /**
         * User profile initializer
         */
        initUserProfile : function() {

            xcp.core.UserProfile.initProfile(this.initUserPreferences, this);
        },

        initUserPreferences : function() {
            readyCounter++;

            var me = this;
            function setUserPreferences() {
                if (!Ext.isDefined(xcp.data.model.UserPreferences)) {
                    // wait for Models.js to be loaded.
                    return setTimeout(setUserPreferences, 10);
                }

                var userPreferencesModel = Ext.ModelManager.getModel("xcp.data.model.UserPreferences");
                userPreferencesModel.load("", {
                    callback : decCounter,
                    success: function(instance)  {
                        xcp.UserPreferences = instance;
                    },
                    error: me.onError
                });
            }

            setUserPreferences();
            this.initPicklists();
        },

        /*
         * Picklist initializer
         */
        initPicklists : function() {
            readyCounter++;
            xcp.picklist.PicklistManager.initializePicklists(decCounter, this);
            this.initFacets();
        },
        /**
         * Facet initializer
         */
        initFacets: function() {
            readyCounter++;
            xcp.facets.FacetManager.initializeFacets(decCounter, this);
            this.initApplicationParameters();
        },
        /**
         * Initialize application parameters cache
         */
        initApplicationParameters: function() {
            readyCounter++;
            xcp.core.ApplicationParameterManager.initAppParameters(decCounter, this);
            this.initActionManager();
        },
        /*
         * ActionManager initializer
         */
        initActionManager : function() {
            readyCounter++;
            xcp.core.ActionManager.init(decCounter, this);
            this.initTypeManager();
        },
        /*
         * TypeManager initializer
         */
        initTypeManager : function() {
            readyCounter++;
            xcp.core.TypeManager.initTypeManager(decCounter, this);
            this.initTheme();
        },
        /**
         * Theme initializer
         */
        initTheme : function() {
            xcp.Logger.debug("User profile initializtion completed");
            xcp.core.ThemeManager.initThemes();
            xcp.core.ThemeManager.loadCustomTheme(this.initView, this);
        },

        /**
         * XCP application view port and navigation initializer.
         */
        initView : function() {
            var me = this;
            function start() {
                if (readyCounter > 0) {
                    setTimeout(start, 5);
                    return;
                }
                xcp.Logger.debug("Theme initialization completed.");
                xcp.Logger.debug("Initializing application view...");
                var appMaster = new xcp.widget.Page({
                    id:'_topPageContainer',

                    // force overflow styling for size measurement
                    autoScroll: false,
                    overflowX: "visible",
                    overflowY: "visible",

                    includeFeedbackTypes: [
                        'systemErrors',
                        'notifications',
                        'validationErrors'
                    ]
                });

                new Ext.Viewport({
                    cls:'xcp-viewport',

                    // enable vertical scrolling.
                    overflowY: "auto",

                    // force overflow-x styling to support miniWidth
                    overflowX: "auto",
                    xcpMinWidth: 1024, // internal constant for min width; extjs won't enforce minWidth at this container level

                    items: [{
                        xtype: 'container',
                        id: '_scrollContainer',

                        // force overflow styling for size measurement
                        autoScroll:false,
                        overflowX: "visible",
                        overflowY: "visible",

                        items: appMaster
                    }],

                     xhooks: {
                        beforeLayout: function() {
                            // Need to hook this to fix the problem which once the scrollbar is shown
                            // it never go away regardless of the the browser size
                            var xcpMinWidth = this.xcpMinWidth;
                            if (xcpMinWidth) {
                                var scrollContainer = Ext.getCmp('_scrollContainer'),
                                    el = scrollContainer.el;
                                if (scrollContainer.rendered) {
                                    // always clear the width followed by a read to force a browser re-flow for accurate width measurement.
                                    el.dom.style.width = '';  // write
                                    if (el.getWidth() < xcpMinWidth) { // read
                                        el.setWidth(xcpMinWidth);  // force minWidth
                                    }
                                }
                            }

                            return this.callParent(arguments);
                        }
                    }

                });

                me.initNavigation();
            }
            start();
        },
        initNavigation : function() {
            xcp.navigationManager = new xcp.core.NavigationManager();
        },
        onError : function(error) {
            xcp.Logger.error(error);
        },
        onModelsLoad : function() {
             xcp.Logger.debug("Models.js loaded");
        },
        onExpressionsLoad : function() {
             xcp.Logger.debug("Expressions.js loaded");
        }
    });
})();
}

