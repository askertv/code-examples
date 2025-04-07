$(document).ready(function(){
    $('input[name^=hour].dataInput').change(function() {
        campaignsFormPopUpHandlerHelper.handleTClick('time',$(this));
    });

    $('input[name^=day].dataInput').change(function() {
        campaignsFormPopUpHandlerHelper.handleTClick('day', $(this));
    });

	// .. frequency
	$('#maxUniqueImpressions').keyup(function() {
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('maxUniqueImpressions',$(this));
	});

	$('#maxUniqueClicks').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('maxUniqueClicks',$(this));
	});

	$('#datePeriod').change(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('datePeriod',$(this));
	});

	$('#uniquePeriodImpressions').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('uniquePeriodImpressions',$(this));
	});

	$('#impressionsPerPeriod').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('impressionsPerPeriod',$(this));
	});

	$('#minimalPeriodImpressions').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('minimalPeriodImpressions',$(this));
	});

	$('#uniquePeriodClicks').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('uniquePeriodClicks',$(this));
	});

	$('#clicksPerPeriod').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('clicksPerPeriod',$(this));
	});

	$('#minimalPeriodClicks').keyup(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('minimalPeriodClicks',$(this));
	});

	$('#frequencyTypeImpressions').change(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('frequencyTypeImpressions',$(this));
	});

	$('#frequencyTypeClicks').change(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('frequencyTypeClicks',$(this));
	});

	// .. UT
	$('#UTLogic').change(function(){
		campaignsFormPopUpHandlerHelper.handleInputKeyUp('UTLogic',$(this));
	});

	$('select[id^="UTNot"]').each(function(i){
		$(this).change(function(){
			campaignsFormPopUpHandlerHelper.handleInputKeyUp('UTNot'+(i+1),$(this))
		});
	});

	$('select[id^="categoryID"]').each(function(i){
		$(this).change(function(){
			campaignsFormPopUpHandlerHelper.handleInputKeyUp('categoryID'+(i+1),$(this))
		});
	});

	$('input[id^="visits"]').each(function(i){
		$(this).keyup(function(){
			campaignsFormPopUpHandlerHelper.handleInputKeyUp('visits'+(i+1),$(this))
		});
	});

	$('input[id^="timeout"]').each(function(i){
		$(this).keyup(function(){
			campaignsFormPopUpHandlerHelper.handleInputKeyUp('timeout'+(i+1),$(this))
		});
	});

	var geoID = '';
	if(document.location.pathname.indexOf('profileAIPCountriesForm')!==-1) {
        geoID='country';
        elementID = 'countries[]';
    }
	if(document.location.pathname.indexOf('profileAIPStatesForm')!==-1){
        geoID='state';
        elementID = 'states[]';
    }
	if(document.location.pathname.indexOf('profileMaxmindCitiesForm')!==-1) {
        geoID='city';
        elementID = 'cities[]'
    }
    $('input[name="'+elementID+'"]').change(function(){
            campaignsFormPopUpHandlerHelper.handleT2Click(geoID,$(this));
    });

	// =========================================================================

	// uncheck elements
	$('input[name*="hour"]').prop('checked',false);

	$('input[name^="day"]').prop('checked',false);

	// update checkbox checked
	$('input[name*="hour"]').each(function(){
		campaignsFormPopUpHandlerHelper.updateTCheckboxes('time',$(this));
	});

	$('input[name^="day"]').each(function(){
		campaignsFormPopUpHandlerHelper.updateTCheckboxes('day',$(this));
	});

	// update frequency
	for(p in campaignsFormPopUpHandlerHelper.frequency){
		campaignsFormPopUpHandlerHelper.updateInputValue(p,$('#'+p));
	}

	campaignsFormPopUpHandlerHelper.updateInputValue('frequencyTypeImpressions',$('#frequencyTypeImpressions'));
	campaignsFormPopUpHandlerHelper.updateInputValue('frequencyTypeClicks',$('#frequencyTypeClicks'));

	// .. disable UT
	$('select[id^="categoryID"]').prop('disabled',true);

	$('input[id^="visits"]').prop('disabled',true);

	$('input[id^="timeout"]').prop('disabled',true);

	// .. update UT
	var isTmpCategories=campaignsFormPopUpHandlerHelper.isUTTmpCategories();

	campaignsFormPopUpHandlerHelper.updateInputValue('UTLogic'+(isTmpCategories==1?'P':''),$('#UTLogic'));

	$('select[id^="UTNot"]').each(function(i){
		campaignsFormPopUpHandlerHelper.updateInputValue('UTNot'+(isTmpCategories==1?'P':'')+(i+1),$(this));
	});

	$('select[id^="categoryID"]').each(function(i){
		campaignsFormPopUpHandlerHelper.updateInputValue('categoryID'+(isTmpCategories==1?'P':'')+(i+1),$(this));
	});

	$('input[id^="visits"]').each(function(i){
		campaignsFormPopUpHandlerHelper.updateInputValue('visits'+(isTmpCategories==1?'P':'')+(i+1),$(this));
	});

	$('input[id^="timeout"]').each(function(i){
		campaignsFormPopUpHandlerHelper.updateInputValue('timeout'+(isTmpCategories==1?'P':'')+(i+1),$(this));
	});

	// .. update geo
	$('input[name^="macro"]').each(function(){
		$(this).prop('checked',false);
	});

	/*$('input[name^="macro"]').each(function(){
		//campaignsFormPopUpHandlerHelper.updateTCheckboxes('subRegions',$(this),'macro');
		campaignsFormPopUpHandlerHelper.updateTCheckboxes('subRegions',$(this));
	});*/

	$('input[name^="item"]').each(function(){
		$(this).prop('checked',false);
	});

	if(geoID)
		$('input[name^="item"]').each(function(){
			campaignsFormPopUpHandlerHelper.updateTCheckboxes(geoID,$(this),'item');
		});

	// add call helher
	campaignsFormPopUpHandlerHelper.addSearchTargetingHelper();
});
