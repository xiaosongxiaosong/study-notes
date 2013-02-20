/*!
 * Trinet plugin v1.0 
 *  
 */
var plugin = (function($, plugin){
	plugin.tabctrl = function(){
		var handles = {
			'index'     : 0,
			'refresh'   : null,
			'change'    : null,
			'show'      : null,
			'hide'      : null,
			'layout'    : null
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
				$(window).resize(function() {
					var obj = $("div.tabsWindow");
					methods.layout.call(obj);
				});
				return this;
			},
			show: function(index){
				if (null !== handles.show){
					handles.show.call(this);
				}
				this.show();
				methods.change.call(this,index);
				methods.layout.call(this);
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
				if (null !== handles.change && null !== handles.change[handles.index]){
					handles.change[handles.index].call(this);
				}
				return this;
			},
			refresh: function(){
				if (null !== handles.change && null !== handles.change[handles.index]){
					handles.change[handles.index].call(this);
				}
				return this;
			},
			layout: function(){
				var tabsBodyHeight = this.height() - this.children("div.windowTitle").eq(0).outerHeight(true) - 10;
				this.children("div.windowBody").css("height", tabsBodyHeight + "px");
				if (null !== handles.layout){
					handles.layout.call(this);
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
	};
	plugin.contextMenu = function(){
		var settings = {
			id			: [null, null],			//menu, parent
			menu		: null,
			menuClass   : "popupWindow contextMenu",
			itemClass	: "menuItem",
			seperator   : "separator",
			handles     : [null, null, null],     		//show,hide,mousedown
			position    : [0, 0, 0, 0],     			//left,top,width,height
			item : []
		};
		var methods = {
			init: function(options){
				settings = $.extend(settings, options);
				this.bind("contextmenu", function(e){
					if (null !== settings.handles[2]){
						settings.handles[2].call(this);
					}
					if (null === settings.menu){
						methods.create();
					}
					methods.show.call(settings.menu, e);
					e.stopPropagation();
					return false;
				});
				$(document).bind("click contextmenu", function(){
					if (null !== settings.menu){
						methods.hide.call(settings.menu);
					}
					return true;
				});
				return this;
			},
			create: function(){
				if (null !== settings.menu){
					return settings.menu;
				}
				var str = '<div id="'+ settings.id[0] +'" class="'+ settings.menuClass +'"><ul>';
				var i = 0;
				for (i = 0; i < settings.item.length; i++){
					if (null === settings.item[i]){
						str += '<li class="separator"></li>';
					}
					else if (undefined === settings.item[i].hide){
						if (null === settings.item[i].icon){
							str += '<li class="'+ settings.itemClass + '"><span>'+ settings.item[i].label +'</span></li>';
						}
						else{
							str += '<li class="'+ settings.itemClass +'"><span style="background: url('+ settings.item[i].icon +') no-repeat 2px 2px;">'+ 
								settings.item[i].label +'</span></li>';
						}
					}
				}
				str += '</ul></div>';
				var parent = (null === settings.id[1]) ? $("body") : $("#" + settings.id[1]);
				parent.append(str);
				settings.menu = $("#" + settings.id[0]);
				settings.position[2] = settings.menu.outerWidth();
				settings.position[3] = settings.menu.outerHeight();
				settings.menu.on("mouseover", "li > span", function(){
					this.style.backgroundColor = "#1665CB";
					this.style.color = "#FFFFFF";
				}).on("mouseout", "li > span", function(){
					this.style.backgroundColor = "#FFFFFF";
					this.style.color = "#000000";
				}).on("click", "li > span", function(e){
					var index = $(this).closest("ul").find("li > span").index(this);
					if (null !== settings.item[index].action){
						settings.item[index].action.call(this);
					}
					return true;
				});
				return settings.menu;
			},
			show: function(e){
				if (null !== settings.handles[0]){
					settings.handles[0].call(this);
				}
				settings.position[0] = e.pageX;
				settings.position[1] = e.pageY;
				if (settings.position[0] > $(window).width() - settings.position[2]){
					settings.position[0] -= settings.position[2];
				}
				if (settings.position[1] > $(window).height() - settings.position[3]){
					settings.position[1] -= settings.position[3];
				}
				this.css({left: settings.position[0] + "px", top: settings.position[1] + "px"});
				this.show();
				return this;
			},
			hide: function(){
				this.hide();
				if (null !== settings.handles[1]){
					settings.handles[1].call(this);
				}
				return this;
			}
		};
	 
		$.fn.contextMenu = function() {
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
	};
	return plugin;
})(jQuery, plugin || {});