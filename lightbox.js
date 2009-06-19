/*
Created By: Chris Campbell
Website: http://particletree.com
Date: 2/1/2006

Inspired by the lightbox implementation found at http://www.huddletogether.com/projects/lightbox/
*/

/**
Modified by Murray Steele for compatibility with Dean Edwards IE7.  
You need the ie7-recalc.js so we can use document.recalc to re-evaluate the styles
and make it good.  
TODO Need to work out if there is a way we can detect if IE7 has been used...
**/

/**
Modified by Chris to allow for
- initializing by element
- setting the method to 'get' by including the 'lbGet' class
*/

/**
Modified by Murray Steele to add new browser detect stuff and not do some of the
extra work for IE when you're using IE 7.
*/


/*-------------------------------GLOBAL VARIABLES------------------------------------*/

var detect = navigator.userAgent.toLowerCase();
var OS,browser,version,total,thestring;

/*-----------------------------------------------------------------------------------------------*/

//Browser detect script from http://www.quirksmode.org/js/detect.html 
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

/*-----------------------------------------------------------------------------------------------*/

Event.observe(window, 'load', initializeLightBox, false);

//Event.unloadCache was designed to prevent memory leaks in IE
//however, it throws an error when used with prototype 1.6
//according to this doc: http://www.prototypejs.org/api/event/unloadCache
//the cache is automatically unloaded on window unload
//so, we've disabled this method call:
//Event.observe(window, 'unload', Event.unloadCache, false);

var lightbox = Class.create();

lightbox.prototype = {

	yPos : 0,
	xPos : 0,
  use_dismiss : false,
  announce_load : false,

	initialize: function(ctrl) {
		this.content = ctrl.href;
		Event.observe(ctrl, 'click', this.activate.bindAsEventListener(this), false);
		ctrl.onclick = function(){return false;};
		this.method = 'post';
	},
	
	// Turn everything on - mainly the IE fixes
	activate: function(){
		if ((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 7)) {
			this.getScroll();
			this.prepareIE('100%', 'hidden');
			this.setScroll(0,0);
			this.hideSelects('hidden');
		}
		this.displayLightbox("block");
		if ((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 7)) {
		  document.recalc(); // For compatiblity with dean edwards ie7.. how to check I'm using it?
		}
	},
	
	// Ie requires height to 100% and overflow hidden or else you can scroll down past the lightbox
	prepareIE: function(height, overflow){
		bod = document.getElementsByTagName('body')[0];
		bod.style.height = height;
		bod.style.overflow = overflow;
  
		htm = document.getElementsByTagName('html')[0];
		htm.style.height = height;
		htm.style.overflow = overflow; 
	},
	
	// In IE, select elements hover on top of the lightbox
	hideSelects: function(visibility){
		selects = document.getElementsByTagName('select');
		for(i = 0; i < selects.length; i++) {
			selects[i].style.visibility = visibility;
		}
	},
	
	// Taken from lightbox implementation found at http://www.huddletogether.com/projects/lightbox/
	getScroll: function(){
		if (self.pageYOffset) {
			this.yPos = self.pageYOffset;
		} else if (document.documentElement && document.documentElement.scrollTop){
			this.yPos = document.documentElement.scrollTop; 
		} else if (document.body) {
			this.yPos = document.body.scrollTop;
		}
	},
	
	setScroll: function(x, y){
		window.scrollTo(x, y); 
	},
	
	displayLightbox: function(display){
		$('overlay').style.display = display;
		$('lightbox').style.display = display;
		if(display != 'none') this.loadInfo();
	},
	
	// Begin Ajax request based off of the href of the clicked linked
	loadInfo: function() {
		var myAjax = new Ajax.Request(
        this.content,
        {method: this.method, parameters: "", onComplete: this.processInfo.bindAsEventListener(this)}
		);
		
	},
	
	// Display Ajax response
	processInfo: function(response){
		info = "<div id='lbContent'>" + response.responseText + "</div>";
		new Insertion.Before($('lbLoadMessage'), info)
		$('lightbox').className = "done";	
		this.actions();
		if ((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 7)) {
		  document.recalc(); // For compatiblity with dean edwards ie7.. how to check I'm using it?
		}
	  if (this.announce_load) {
	    $('lightbox').fire('lightbox:loaded', this);
	  }
	},
	
	// Search through new links within the lightbox, and attach click event
	actions: function(){
		lbActions = document.getElementsByClassName('lbAction');

		for(i = 0; i < lbActions.length; i++) {
			Event.observe(lbActions[i], 'click', this[lbActions[i].rel].bindAsEventListener(this), false);
			lbActions[i].onclick = function(){return false;};
		}

	},
	
	// Example of creating your own functionality once lightbox is initiated
	insert: function(e){
	   var link = Event.element(e);
	   Element.remove($('lbContent'));
	   
	   var the_method = 'post';
     if (Element.hasClassName(link, 'lbGet')) {
   		 the_method = 'get';
     }
     $('lightbox').className = "loading";	
	   var myAjax = new Ajax.Request(
			  link.href,
			  {method: the_method, parameters: "", onComplete: this.processInfo.bindAsEventListener(this)}
	   );
	 
	},
	
	// Example of creating your own functionality once lightbox is initiated
	deactivate: function(){
		if ($('lbContent')) {
		  Element.remove($('lbContent'));
	  }
		
		if ((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 7)) {
			this.setScroll(0,this.yPos);
			this.prepareIE("auto", "auto");
			this.hideSelects("visible");
		}
		
		this.displayLightbox("none");
	}
}

/*-----------------------------------------------------------------------------------------------*/

// Onload, make all links that need to trigger a lightbox active
function initializeLightBox(){
  addLightboxMarkup(lightbox.prototype.use_dismiss)
	lbox = document.getElementsByClassName('lbOn');
	for(i = 0; i < lbox.length; i++) {
		lightboxizeElement(lbox[i])
	}
}

function lightboxizeElement(element){
  valid = new lightbox(element);
	if (Element.hasClassName(element, 'lbGet')) {
		valid.method = 'get';
  }
}

// Add in markup necessary to make this work. Basically two divs:
// Overlay holds the shadow
// Lightbox is the centered square that the content is put into.
function addLightboxMarkup(with_dismiss) {
	bod 				= document.getElementsByTagName('body')[0];
	overlay 			= document.createElement('div');
	overlay.id		= 'overlay';
	lb					= document.createElement('div');
	lb.id				= 'lightbox';
	lb.className 	= 'loading';
	var with_dismiss_chrome = '';
	if ((with_dismiss !== undefined) || (with_dismiss)) {
	  with_dismiss_chrome = '<div id="lbDismiss">' + 
  	            '<a href="javascript:lightbox.prototype.deactivate();" title="Click to dismiss this box and go back to the page underneath.">Dismiss</a>' +
  	            '</div>';
	}
	lb.innerHTML	= with_dismiss_chrome + 
	            '<div id="lbLoadMessage">' +
						  '<p>Loading</p>' +
						  '</div>';
	lb.style.display = 'none';
	overlay.style.display = 'none';
	bod.appendChild(overlay);
	bod.appendChild(lb);
}

function reinitializeLightboxDiv(div_id) {
	var div_element = document.getElementById(div_id);	
	lbox = div_element.getElementsByClassName('lbOn');
	for(i = 0; i < lbox.length; i++) {
		lightboxizeElement(lbox[i]);
	}
}