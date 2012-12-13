/*!
 * Trinet plugin v1.0
 * Trinet context menu plugin
 * plugin name: contextmenu
 * Depends: 
 *  
 */
(function($){
    var contextMenu = {
        'menu'      : null,
        'parent'    : null,
        'ids'       : null,
        'items'     : null,
        'handles'   : null,
        'mousedown' : null,
        'show'      : null,
        'hide'      : null,
        'top'       : 0,
        'left'      : 0,
        'width'     : 0,
        'height'    : 0
    };
    var methods = {
        init: function(options){
            contextMenu = $.extend(contextMenu, options);
            this.mousedown(function(event){
                if (3 == event.which){
                    if (null !== contextMenu.mousedown){
                        contextMenu.mousedown.call(this);
                    }
                    var obj =  methods.get();
                    methods.show.call(obj, event);
                    return false;
                }
                return true;
            });
            $("body").click(function(){
                var obj = $("div.contextMenu:visible");
                if (0 !== obj.length){
                    methods.hide.call(obj);
                }
                return true;
            });
            return this;
        },
        create: function(){
            var obj = $("#" + contextMenu.menu);
            if (0 !== obj.length){
                return obj;
            }
            var str = '<div id="'+ contextMenu.menu +'" class="popupWindow contextMenu" oncontextmenu="return false;"><ul>';
            var i = 0;
            for (i = 0; i < contextMenu.items.length; i++){
                if (null === contextMenu.items[i]){
                    str += '<li class="separator"></li>';
                }
                else{
                    if (null === contextMenu.ids[i]){
                        str += '<li><span>'+ contextMenu.items[i] +'</span></li>';
                    }
                    else{
                        str += '<li id="'+ contextMenu.ids[i] +'"><span>'+ contextMenu.items[i] +'</span></li>';
                    }
                }
            }
            str += '</ul></div>';
            $("#" + contextMenu.parent).append(str);
            obj = $("#" + contextMenu.menu);
            contextMenu.width = obj.width();
            contextMenu.height = obj.height();
            var items = obj.find("ul > li > span");
            items.mouseover(function(){
                this.style.backgroundColor = "#1665CB";
                this.style.color = "#FFFFFF";
            }).mouseout(function(){
                this.style.backgroundColor = "#FFFFFF";
                this.style.color = "#000000";
            }).click(function(event){
                var index = $(this).closest("ul").find("li > span").index(this);
                if (null !== contextMenu.handles[index]){
                    contextMenu.handles[index].call(this);
                }
                return true;
            });
            return obj;
        },
        get: function(){
            var obj = $("#" + contextMenu.menu);
            if (0 === obj.length){
                obj = methods.create();
            }
            return obj;
        },
        show: function(event){
            if (null !== contextMenu.show){
                contextMenu.show.call(this);
            }
            contextMenu.left = event.pageX;
            contextMenu.top = event.pageY;
            if (contextMenu.left > $(window).width() - contextMenu.width){
                contextMenu.left -= contextMenu.width;
            }
            if (contextMenu.top > $(window).height() - contextMenu.height){
                contextMenu.top -= contextMenu.height;
            }
            this.css("left", contextMenu.left + "px").css("top", contextMenu.top + "px").show();
            return this;
        },
        hide: function(){
            if (null !== contextMenu.hide){
                contextMenu.hide.call(this);
            }
            this.hide();
            return this;
        }
    };
 
    $.fn.contextmenu = function() {
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