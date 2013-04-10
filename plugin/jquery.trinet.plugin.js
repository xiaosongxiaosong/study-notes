/*!
 * Trinet plugin v1.0
 *
 */
"use strict";
;var plugin = (function($, plugin) {
	plugin.tabctrl = function() {
		var handles = {
			'index': false,
			'refresh': null,
			'change': null,
			'show': null,
			'hide': null,
			'layout': null
		};
		var methods = {
			init: function(options) {
				handles = $.extend(handles, options);
				this.find("div.windowTitle > ul.tabs > li > a").click(function() {
					var obj = $(this).closest("div.tabsWindow");
					methods.change.call(obj, obj.find("div.windowTitle > ul.tabs > li > a").index(this));
				});
				this.find("div.windowTitle > a.refreshData").click(function() {
					var obj = $(this).closest("div.tabsWindow");
					methods.refresh.call(obj);
				});
				this.find("div.windowTitle > a.closeWindow").click(function() {
					var obj = $(this).closest("div.tabsWindow");
					methods.hide.call(obj);
				});
				$(window).resize(function() {
					var obj = $("div.tabsWindow");
					methods.layout.call(obj);
				});
				return this;
			},
			show: function(index) {
				if (null !== handles.show) {
					handles.show.call(this);
				}
				this.show();
				methods.change.call(this, index);
				methods.layout.call(this);
				return this;
			},
			hide: function() {
				this.hide();
				if (null !== handles.hide) {
					handles.hide.call(this);
				}
				handles.index = false;
				return this;
			},
			change: function(index) {
				handles.index = index;
				this.find("div.windowTitle > ul.tabs > li > a").removeClass("activeTabs").eq(index).addClass("activeTabs");
				this.find("div.windowBody > div").hide().eq(index).show();
				if (null !== handles.change && null !== handles.change[handles.index]) {
					handles.change[handles.index].call(this);
				}
				return this;
			},
			refresh: function() {
				if (null !== handles.refresh && null !== handles.refresh[handles.index]) {
					handles.refresh[handles.index].call(this);
				}
				return this;
			},
			layout: function() {
				var tabsBodyHeight = this.height() - this.children("div.windowTitle").eq(0).outerHeight(true) - 10;
				this.children("div.windowBody").css("height", tabsBodyHeight + "px");
				if (null !== handles.layout) {
					handles.layout.call(this);
				}
				this.css({left: ($("body").width() - this.width()) / 2 + "px"});
				return this;
			},
			get: function(){
				return handles.index;
			}
		};

		$.fn.tabctrl = function() {
			var method = arguments[0];
			if (methods[method]) {
				return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === 'object' || !method) {
				return methods.init.apply(this, arguments);
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.tooltip');
			}
		};
		return plugin;
	};
	plugin.contextMenu = function() {
		var settings = {
			id: [null, null, null], //menu, parent
			menu: null,
			menuClass: ["popupWindow contextMenu", "menuItem", " menuHiddenItem"],
			seperator: "separator",
			handles: [null, null, null], //show,hide,mousedown
			position: [0, 0, 0, 0], //left,top,width,height
			item: []
		};
		var methods = {
			init: function(options) {
				settings = $.extend(settings, options);
				this.on("contextmenu", settings.id[2], function(e) {
					if (null !== settings.handles[2]) {
						settings.handles[2].call(this);
					}
					if (null === settings.menu) {
						methods.create();
					}
					methods.show.call(settings.menu, e);
					e.stopPropagation();
					return false;
				});
				$(document).bind("click contextmenu", function() {
					if (null !== settings.menu) {
						methods.hide.call(settings.menu);
					}
					return true;
				});
				return this;
			},
			create: function() {
				if (null !== settings.menu) {
					return settings.menu;
				}
				var str = '<div id="' + settings.id[0] + '" class="' + settings.menuClass[0] + '"><ul>';
				var i = 0;
				for (i = 0; i < settings.item.length; i++) {
					if (null === settings.item[i]) {
						str += '<li class="separator"></li>';
					} else {
						var style = "";
						var isShow = "";
						if (undefined !== settings.item[i].hide && true === settings.item[i].hide) {
							isShow += settings.menuClass[2];
						}
						if (null !== settings.item[i].icon) {
							style += 'background: url(' + settings.item[i].icon + ') no-repeat 2px 2px;'
						}

						str += '<li class="' + settings.menuClass[1] + isShow + '"><span style="' + style + '">' + settings.item[i].label + '</span></li>';
					}
				}
				str += '</ul></div>';
				var parent = (null === settings.id[1]) ? $("body") : $("#" + settings.id[1]);
				parent.append(str);
				settings.menu = $("#" + settings.id[0]);
				settings.position[2] = settings.menu.outerWidth();
				settings.position[3] = settings.menu.outerHeight();
				settings.menu.bind("click contextmenu", function(e) {
					e.stopPropagation();
					return false;
				}).on("mouseover", "li." + settings.menuClass[1], function() {
					this.style.backgroundColor = "#1665CB";
					this.style.color = "#FFFFFF";
				}).on("mouseout", "li." + settings.menuClass[1], function() {
					this.style.backgroundColor = "#FFFFFF";
					this.style.color = "#000000";
				}).on("click", "li." + settings.menuClass[1], function(e) {
					this.style.backgroundColor = "#FFFFFF";
					this.style.color = "#000000";
					if (null !== settings.menu) {
						methods.hide.call(settings.menu);
					}
					var index = $(this).parent("ul").find("li").index(this);
					if (null !== settings.item[index].action) {
						settings.item[index].action.call(this);
					}
					return true;
				});
				return settings.menu;
			},
			show: function(e) {
				if (null !== settings.handles[0]) {
					settings.handles[0].call(this);
				}
				settings.position[0] = e.pageX;
				settings.position[1] = e.pageY;
				if (settings.position[0] > $(window).width() - settings.position[2]) {
					settings.position[0] -= settings.position[2];
				}
				if (settings.position[1] > $(window).height() - settings.position[3]) {
					settings.position[1] -= settings.position[3];
				}
				this.css({
					left: settings.position[0] + "px",
					top: settings.position[1] + "px"
				});
				this.show();
				return this;
			},
			hide: function() {
				this.hide();
				if (null !== settings.handles[1]) {
					settings.handles[1].call(this);
				}
				return this;
			}
		};

		$.fn.contextMenu = function() {
			var method = arguments[0];
			if (methods[method]) {
				return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === 'object' || !method) {
				return methods.init.apply(this, arguments);
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.tooltip');
			}
		};
		return plugin;
	};

	plugin.pagingBar = function() {
		if ($.pagingBar) {
			return true;
		}
		var settings = {
			id: "paging_bar",
			pageClass: ["pagingBtn", "pagingIpt", "pagingInfo", "pagingNum", "currentPagingNum"],
			handles: [refreshGridData, utils.layout],
			num: {
				max: 100,
				paginal: 25,
				curr: 0,
				total: 1,
				num: 0
			}
		};
		var methods = {
			init: function(options) {
				settings = $.extend(settings, options);

				methods.loadTable();

				$("#" + settings.id).on("click", "input." + settings.pageClass[0], function(e) {
					var pagingBtn = $("#" + settings.id + " input." + settings.pageClass[0]);
					var index = pagingBtn.index(this);
					if ("disabled" == pagingBtn.eq(0).attr("disabled") || !methods.paging(index)) {
						return true;
					}
					pagingBtn.eq(0).attr("disabled", true);
					settings.handles[0]();
				}).on("keyup", "input." + settings.pageClass[1], function(e) {
					if (e.keyCode == 37 || e.keyCode == 39) {
						return true;
					}
					this.value = this.value.replace(/\D/g, "");
				}).on("keypress", "input." + settings.pageClass[1], function(e) {
					if ("disabled" == $("#" + settings.id + " input." + settings.pageClass[0]).eq(0).attr("disabled")) {
						return true;
					}
					if (e.keyCode == 13) {
						var page = parseInt(this.value, 10) - 1;

						if (page < 0 || page >= settings.num.total) {
							return true;
						}
						settings.num.curr = page;
						$("#" + settings.id + " input." + settings.pageClass[0]).eq(0).attr("disabled", true);
						settings.handles[0]();
					}
					return true;
				}).on("click", "span." + settings.pageClass[3], function(e) {
					var paginalNum = parseInt($(this).html(), 10);
					if (paginalNum == settings.num.paginal) {
						return false;
					}
					$("span." + settings.pageClass[3]).removeClass(settings.pageClass[4]);
					$(this).addClass(settings.pageClass[4]);
					settings.num.paginal = paginalNum;
					var totalPage = Math.ceil(settings.num.num / settings.num.paginal);
					totalPage = totalPage < 1 ? 1 : totalPage;
					if (settings.num.curr >= totalPage) {
						settings.num.curr = totalPage - 1;
					}
					$("#" + settings.id + " input." + settings.pageClass[0]).eq(0).attr("disabled", true);
					settings.handles[0]();

					$.ajax({
						url: "/ajaxCall.php",
						type: "post",
						data: {work: "setPaginalNum", paginalNum: paginalNum}
					});
				});
				methods.load();

				return $;
			},
			paging: function(index) {
				switch (index) {
					case 0:
						if (settings.num.curr < 0 || settings.num.curr >= settings.num.total) {
							settings.num.curr = 0;
						}
						break;
					case 1:
						settings.num.curr = 0;
						break;
					case 2:
						if (settings.num.curr <= 0) {
							return false;
						}
						settings.num.curr--;
						break;
					case 3:
						if (settings.num.curr >= settings.num.total - 1) {
							return false;
						}
						settings.num.curr++;
						break;
					case 4:
						settings.num.curr = settings.num.total - 1;
						break;
					default:
						return false;
						break;
				};
				return true;
			},
			set: function(start, total) {
				start = parseInt(start, 10);
				total = parseInt(total, 10);
				settings.num.curr = Math.floor(start / settings.num.paginal);
				settings.num.total = Math.ceil(total / settings.num.paginal);
				if (0 == settings.num.total) {
					settings.num.total = 1;
				}
				if (settings.num.curr >= settings.num.total) {
					settings.num.curr = settings.num.total - 1;
				}
				settings.num.num = total;
				return $;
			},
			get: function() {
				return settings.num;
			},
			show: function() {
				var pagingInfo = $("#" + settings.id + " span." + settings.pageClass[2]);
				pagingInfo.eq(0).html(settings.num.curr + 1);
				pagingInfo.eq(1).html(settings.num.total);
				pagingInfo.eq(2).html(settings.num.num);

				var pagingBtn = $("#" + settings.id + " input." + settings.pageClass[0]);
				pagingBtn.eq(0).attr("disabled", false);
				if (0 == settings.num.curr) {
					pagingBtn.eq(1).attr("disabled", true);
					pagingBtn.eq(2).attr("disabled", true);
				} else {
					pagingBtn.eq(1).attr("disabled", false);
					pagingBtn.eq(2).attr("disabled", false);
				}

				if (settings.num.curr >= settings.num.total - 1) {
					pagingBtn.eq(3).attr("disabled", true);
					pagingBtn.eq(4).attr("disabled", true);
				} else {
					pagingBtn.eq(3).attr("disabled", false);
					pagingBtn.eq(4).attr("disabled", false);
				}
				settings.handles[1]();
				return $;
			},
			load: function() {
				var paginalArray = new Array(25, 50, 100);
				$("span." + settings.pageClass[3]).removeClass(settings.pageClass[4]);
				for (var i = 0; i < 3; i++) {
					if (paginalArray[i] == settings.num.paginal) {
						$("span." + settings.pageClass[3]).eq(i).addClass(settings.pageClass[4]);
						break;
					}
				}
			},
			loadTable: function() {
				$("#checkAllGridTr").click(function() {
					var trObj = $("tr.gridTr").has("input:enabled:visible");
					if (this.checked == true) {
						trObj.find("td.gridCheckbox > input").attr("checked", true);
						trObj.addClass("gridTrChecked");
						trObj.find("span.linkOnText").addClass("linkOnTextChecked");
					} else {
						trObj.find("td.gridCheckbox > input").attr("checked", false);
						trObj.removeClass("gridTrChecked");
						trObj.find("span.linkOnText").removeClass("linkOnTextChecked");
					}
				});

				$("tr.gridTr:odd").addClass("gridTrOdd");

				$("table.gridTable").on("click", "tr.gridTr", function(event) {
					var trObj = $(this);
					if (0 == trObj.find("td.gridCheckbox > input:enabled").length) {
						return false;
					}
					if (false == trObj.hasClass("gridTrChecked")) {
						trObj.find("td.gridCheckbox > input").attr("checked", true);
						trObj.addClass("gridTrChecked");
					} else {
						trObj.find("td.gridCheckbox > input").attr("checked", false);
						trObj.removeClass("gridTrChecked");
					}

					var checkedNum = $("tr.gridTr").find("td.gridCheckbox:visible > input:enabled:checked").length;
					var chckedboxNum = $("td.gridCheckbox:visible > input:enabled").length;
					if (chckedboxNum == checkedNum) {
						$("#checkAllGridTr").attr("checked", true);
					} else if (0 == checkedNum) {
						$("#checkAllGridTr").attr("checked", false);
					}
				});
			}
		};

		$.extend({
			pagingBar: function() {
				var method = arguments[0];
				if (methods[method]) {
					return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
				} else if (typeof method === 'object' || !method) {
					return methods.init.apply(this, arguments);
				} else {
					$.error('Method ' + method + ' does not exist on jQuery.tooltip');
				}
			}
		});
		return plugin;
	};

	plugin.ajaxLoader = function() {
		if ($.ajaxLoader) {
			return plugin;
		}
		var settings = {
			id: ["contentBody", "ajax_loader"],
			button: "dataSubmitButton",
			load: "loading"
		};
		var methods = {
			init: function(options) {
				settings = $.extend(settings, options);
			},
			show: function() {
				if (0 == $("#" + settings.id[1]).length) {
					$("#" + settings.id[0]).append('<div id="' + settings.id[1] + '" class="popupWindow"><span>' + settings.load + '...</span></div>');
				}
				$("." + settings.button).attr("disabled", true);
				$("#" + settings.id[1]).attr("disabled", false).show();
			},
			hide: function() {
				if (0 == $("#" + settings.id[1]).length) {
					return false;
				}
				$("." + settings.button).attr("disabled", false);
				$("#" + settings.id[1]).hide();
			}
		};

		$.extend({
			ajaxLoader: function() {
				var method = arguments[0];
				if (methods[method]) {
					return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
				} else if (typeof method === 'object' || !method) {
					return methods.init.apply(this, arguments);
				} else {
					$.error('Method ' + method + ' does not exist on jQuery.tooltip');
				}
			}
		});
		return plugin;
	};
	plugin.progressRate = function(){
		var settings = {
			id: "progress_rate",
			progClass: ["progressRate", "progressInfo",  "progressBar", "progressBtn"],
			handles: [null, null, null], //sure,cancel,ignore
			layout: null,
			confirm: "Do you sure to stop this operation?"
		};
		var methods = {
			init: function(options) {
				settings = $.extend(settings, options);
				var id = this.attr("id");
				if (undefined !== id && "" !== id){
					settings.id = id;
				}
				this.on("click", "input." + settings.progClass[3], function(){
					var $this = $("#" + settings.id);
					var index = $this.find("input." + settings.progClass[3]).index(this);
					if (1 === index && false === confirm(settings.confirm)){
						return true;
					}
					if (undefined !== settings.handles[index] && null !== settings.handles[index]){
						settings.handles[index]();
					}
					methods.hide.apply($this);
					return true;
				});
				return this;
			},
			set: function(total){
				if (true == isNaN(total) || total <= 0){
					return false;
				}
				this.find("span." + settings.progClass[1]).eq(1).html(total);
				return true;
			},
			show: function(str){
				if (undefined == str || "" == str){
					return false;
				}
				var progInfo = this.find("span." + settings.progClass[1]);
				var progBtn = this.find("input." + settings.progClass[3]);
				progInfo.eq(0).html(str);
				if (progInfo.length > 2){
					progInfo.slice(2).html(0);
				}
				else{
					progInfo.eq(1).html(0);
				}
				this.find("div." + settings.progClass[2] + " > div").css({width: "0%"});
				progBtn.eq(0).attr("disabled", true);
				progBtn.slice(1).attr("disabled", false);
				methods.layout.call(this);
				this.attr("disabled", false).show();
				return this;
			},
			layout: function(){
				if (null !== settings.layout){
					settings.layout.apply(this);
				}
				this.css({left: ($("body").width() - this.width()) / 2 + "px"});
			},
			hide: function(){
				var progInfo = this.find("span." + settings.progClass[1]);
				progInfo.slice(1).html(0);
				var progBtn = this.find("input." + settings.progClass[3]);
				progBtn.eq(0).attr("disabled", true);
				progBtn.slice(1).attr("disabled", false);
				this.hide();
			},
			complete: function(){
				if (true == methods.isFinish.call(this)){
					return false;
				}
				var progInfo = this.find("span." + settings.progClass[1]);
				var total = parseInt(progInfo.eq(1).html());
				var finish = parseInt(progInfo.eq(2).html()) + 1;
				progInfo.eq(2).html(finish);
				if (arguments.length > 0 && false === arguments[0]){
					var error = parseInt(progInfo.eq(3).html()) + 1;
					progInfo.eq(3).html(error);
				}
				this.find("div." + settings.progClass[2] + " > div").css({width: finish * 100 / total + "%"});
				if (true == methods.isFinish.call(this)){
					var progBtn = this.find("input." + settings.progClass[3]);
					progBtn.eq(0).attr("disabled", false);
					progBtn.slice(1).attr("disabled", true);
				}
				return this;
			},
			setRate: function(rate){
				if (isNaN(rate) || rate > 100 || rate < 0 || true == methods.isFinish.call(this)){
					return false;
				}
				this.find("span." + settings.progClass[1]).eq(1).html(rate);
				this.find("div." + settings.progClass[2] + " > div").css({width: rate + "%"});
				if ("100" == rate){
					var progBtn = this.find("input." + settings.progClass[3]);
					progBtn.eq(0).attr("disabled", false);
					progBtn.slice(1).attr("disabled", true);
				}
				return this;
			},
			isFinish: function(){
				if (this.is(":hidden")){
					return true;
				}
				var progInfo = this.find("span." + settings.progClass[1]);
				if ((progInfo.length > 2 && progInfo.eq(1).html() != progInfo.eq(2).html()) || 
				    (progInfo.length <= 2 && "100" != progInfo.eq(1).html())){
					return false;
				}
				return true;
			}
		};

		$.fn.progressRate = function() {
			var method = arguments[0];
			if (methods[method]) {
				return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === 'object' || !method) {
				return methods.init.apply(this, arguments);
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.tooltip');
			}
		};
		return plugin;
	};
	return plugin;
})(jQuery, plugin || {});
