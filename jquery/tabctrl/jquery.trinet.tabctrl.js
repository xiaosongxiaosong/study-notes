/*!
 * Trinet plugin v1.0
 * Trinet tab control plugin
 * plugin name: tabctrl
 * Depends: 
 *  
 */
(function($){
    var handles = {
        'index'     : 0,
        'refresh'   : null,
        'change'    : null,
        'show'      : null,
        'hide'      : null
    };
    var methods = {
        init: function(options){
            handles = $.extend(handles, options);
            this.find("div.windowTitle > ul.tabs > li > a").click(function(){
                var obj = $(this).closest("div.tabsWindow");
                methods.change.call(obj, obj.find("div.windowTitle > ul.tabs > li > a").index(this));
            });
            this.find("div.windowTitle > a.refreshData").click(function(){
                var obj = $(this).closest("div.tabsWindow");
                methods.refresh.call(obj);
            });
            this.find("div.windowTitle > a.closeWindow").click(function(){
                var obj = $(this).closest("div.tabsWindow");
                methods.hide.call(obj);
            });
            $(window).resize(methods.layout);
            return this;
        },
        show: function(index){
            this.show();
            methods.layout.call(this);
            if (null !== handles.show){
                handles.show.call(this);
            }
            methods.change.call(this,index);
            return this;
        },
        hide: function(){
            this.hide();
            if (null !== handles.hide){
                handles.hide.call(this);
            }
            return this;
        },
        change: function(index){
            handles.index = index;
            this.find("div.windowTitle > ul.tabs > li > a").removeClass("activeTabs").eq(index).addClass("activeTabs");
            this.find("div.windowBody > div").hide().eq(index).show();
            handles.change[handles.index].call(this);
            return this;
        },
        refresh: function(){
            handles.refresh[handles.index].call(this);
            return this;
        },
        layout: function(){
            var visibleTabs = $("div.tabsWindow:visible");
            if (visibleTabs.length > 0){
                var tabsBodyHeight = visibleTabs.eq(0).height() - visibleTabs.children("div.windowTitle").eq(0).outerHeight(true) - 10;
                visibleTabs.children("div.windowBody").css("height", tabsBodyHeight + "px");
            }
            return this;
        }
    };
 
    $.fn.tabctrl = function() {
        var method = arguments[0];
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } 
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } 
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }
    };
})( jQuery );