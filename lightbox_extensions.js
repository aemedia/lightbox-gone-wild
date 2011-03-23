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
	
	//Add class 'lbResizable' to the lightbox link to work
	resizeLightBox : function(){
		var widths = new Array();
		AegisLabs.LightBoxExtensions.widestChild( $('lightbox'), widths );
		var widest = widths.sortBy( function(width){ 
			return width == null ? 0 : parseInt(width);
			} ).last();
			widest += 50;
			$('lightbox').morph('width:'+widest+'px;'); 
			$('lightbox').morph('height:550px;'); 
		},
		
	//Add class 'lbStealFocus' to the lightbox link to work
	setFocusToForm : function(){
		$$('#lightbox form').first().focusFirstElement();
	}
	
}

