AegisLabs = window.AegisLabs || {}
AegisLabs.LightBoxExtensions = {
	
	widestChild : function (element, widths){
		if( $(element).childElements().size() > 0 ){ 
			$(element).childElements().each( function(element){  widths.push( AegisLabs.LightBoxExtensions.widestChild( element, widths ) ) } );
		}
		else{
			return $(element).getDimensions().width
		}
	},
	
	maxWidth : function(element, width){
		var widths = new Array();
		var max = 0;
		if( width == null ){
			AegisLabs.LightBoxExtensions.widestChild( element, widths );
			max = widths.sortBy( function(width){ 
				return width == null ? 0 : parseInt(width);
				} ).last();
			max += 50;
		}else{
			max = width;
		}
		return max;
	},
	
	//Add class 'lbResizable' to the lightbox link to work
	resizeLightBox : function(width, height){		
		width = AegisLabs.LightBoxExtensions.maxWidth($('lightbox'), width)
		height = (height == null) ? '550' : height;		
		alert(height);
		$('lightbox').morph('width:'+width+'px;'); 
		$('lightbox').morph('height:'+height+'px;'); 
	},
		
	//Add class 'lbStealFocus' to the lightbox link to work
	setFocusToForm : function(){
		$$('#lightbox form').first().focusFirstElement();
	}
	
}

