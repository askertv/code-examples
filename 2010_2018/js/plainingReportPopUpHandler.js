var LOCALE = {RU: {}, EN: {}};
LOCALE.RU = {
    ALL_VALUES: '<все>',
    NOT_SELECTED: '<не выбрано>'
}
$(document).ready(function() {
	var dMaxUserCriterias=63;
	var siteIDs = window.opener.document.filterForm.siteIDs.value;
    var siteIDsCount = $('.site-checkbox').length;
	var siteIDsArray = new Array();
	if(siteIDs!=''&&siteIDs!='all'){
		siteIDsArray=siteIDs.split(',');
	}
	$('.site-checkbox').each(function(){
		if(siteIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var siteID = $(this).prop('id').replace(/site-/,'');
			for(i=0;i<siteIDsArray.length;i++){
				if(siteIDsArray[i]==siteID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var sectionIDs = window.opener.document.filterForm.sectionIDs.value;
	var sectionIDsArray = new Array();
	if(sectionIDs!=''&&sectionIDs!='all'){
		sectionIDsArray=sectionIDs.split(',');
	}
	$('.section-checkbox').each(function(){
		if(sectionIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var sectionID = $(this).prop('id').replace(/section-/,'');
			for(i=0;i<sectionIDsArray.length;i++){
				if(sectionIDsArray[i]==sectionID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var placeIDs = window.opener.document.filterForm.placeIDs.value;
	var placeIDsArray = new Array();
	if(placeIDs!=''&&placeIDs!='all'){
		placeIDsArray=placeIDs.split(',');
	}
	$('.place-checkbox').each(function(){
		if(placeIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var placeID = $(this).prop('id').replace(/place-/,'');
			for(i=0;i<placeIDsArray.length;i++){
				if(placeIDsArray[i]==placeID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var bannerTypeIDs = window.opener.document.filterForm.bannerTypeIDs.value;
	var bannerTypeIDsArray = new Array();
	if(bannerTypeIDs!=''&&bannerTypeIDs!='all'){
		bannerTypeIDsArray=bannerTypeIDs.split(',');
	}
	$('.bannerType').each(function(){
		if(bannerTypeIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var bannerTypeID = $(this).prop('name').replace(/item/,'');
			for(i=0;i<bannerTypeIDsArray.length;i++){
				if(bannerTypeIDsArray[i]==bannerTypeID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var countriesIDs = window.opener.document.filterForm.countriesIDs.value;
    var countriesIDsCount = $('.state-0').length;
	var countriesIDsArray = new Array();
	if(countriesIDs!=''&&countriesIDs!='all'){
		countriesIDsArray=countriesIDs.split(',');
	}
	$('.state-0').each(function(){
		if(countriesIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var countriesID = $(this).prop('name').replace(/item/,'');
			for(i=0;i<countriesIDsArray.length;i++){
				if(countriesIDsArray[i]==countriesID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var regionsRUIDs = window.opener.document.filterForm.regionsRUIDs.value;
	var regionsRUIDsArray = new Array();
	if(regionsRUIDs!=''&&regionsRUIDs!='all'){
		regionsRUIDsArray=regionsRUIDs.split(',');
	}
	$('.state-1764410409').each(function(){
		if(regionsRUIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var regionsRUID = $(this).prop('name').replace(/item/,'');
			for(i=0;i<regionsRUIDsArray.length;i++){
				if(regionsRUIDsArray[i]==regionsRUID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var regionsUAIDs = window.opener.document.filterForm.regionsUAIDs.value;
	var regionsUAIDsArray = new Array();
	if(regionsUAIDs!=''&&regionsUAIDs!='all'){
		regionsUAIDsArray=regionsUAIDs.split(',');
	}
	$('.state-1139238260').each(function(){
		if(regionsUAIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var regionsUAID = $(this).prop('name').replace(/item/,'');
			for(i=0;i<regionsUAIDsArray.length;i++){
				if(regionsUAIDsArray[i]==regionsUAID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	var regionsBYIDs = window.opener.document.filterForm.regionsBYIDs.value;
	var regionsBYIDsArray = new Array();
	if(regionsBYIDs!=''&&regionsBYIDs!='all'){
		regionsBYIDsArray=regionsBYIDs.split(',');
	}
	$('.state-1217456916').each(function(){
		if(regionsBYIDs=='all'){
			$(this).prop('checked',true);
		}else{
			var regionsBYID = $(this).prop('name').replace(/item/,'');
			for(i=0;i<regionsBYIDsArray.length;i++){
				if(regionsBYIDsArray[i]==regionsBYID){
					$(this).prop('checked',true);
				}
			}
		}
	});

	for(k=1;k<=dMaxUserCriterias;k++) {
		if($('.userCriteria-'+k).html()==null){
			continue;
		}
		var criteriaIDs = 'userCriteria'+k+'IDs';
		if (window.opener.document.filterForm[criteriaIDs] == 'undefined') {
			continue;
		}

		var criteriaIDsStr = window.opener.document.filterForm[criteriaIDs].value;
		var criteriaIDsArray = new Array();
		if(criteriaIDsStr!=''&&criteriaIDsStr!='all'){
			criteriaIDsArray=criteriaIDsStr.split(',');
		}
		$('.userCriteria-'+k).each(function(){
			if(criteriaIDsStr=='all'){
				$(this).prop('checked',true);
			}else{
				var criteriaID = $(this).prop('name').replace(/item/,'');
				for(i=0;i<criteriaIDsArray.length;i++){
					if(criteriaIDsArray[i]==criteriaID){
						$(this).prop('checked',true);
					}
				}
			}
		});
	}


	//--------------------------------------------
	$('.site-checkbox').change(function(){
		// names
		var ob = window.opener.document.getElementById('siteNames');
		var text = ob.innerHTML;
		var curName = $(this).parent().children("span").text()
		var curID = $(this).prop('id').replace(/site-/,'');

		// ids
		var curIDs = window.opener.document.filterForm.siteIDs;
		var curIDsStr = curIDs.value;

        var checkedCount = $($(this).selector).length;
        if (checkedCount == 0 || checkedCount == siteIDsCount) {
            namesStr = LOCALE.RU.ALL_VALUES;
        }

		if ($(this).is(':checked')) {
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('id').replace(/site-/,'');
			curIDs.value = curIDsStr;
		} else {
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}

	});

	$('.section-checkbox').change(function(){

		// names
		var ob = window.opener.document.getElementById('sectionNames');
		var text = ob.innerHTML;
		var curName = $(this).parent().children("span").text()
		var curID = $(this).prop('id').replace(/section-/,'');

		// ids
		var curIDs = window.opener.document.filterForm.sectionIDs;
		var curIDsStr = curIDs.value;

		if($(this).is(':checked')){
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('id').replace(/section-/,'');
			curIDs.value = curIDsStr;
		}else{
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}

	});

	$('.place-checkbox').change(function(){

		// names
		var ob = window.opener.document.getElementById('placeNames');
		var text = ob.innerHTML;
		var names = window.opener.document.filterForm.placeNames;
		var curName = $(this).parent().children("span").text()
		var curID = $(this).prop('id').replace(/place-/,'');

		// ids
		var curIDs = window.opener.document.filterForm.placeIDs;
		var curIDsStr = curIDs.value;

		if($(this).is(':checked')){
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('id').replace(/place-/,'');
			curIDs.value = curIDsStr;
		}else{
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}

	});

	$('.bannerType').change(function(){

		// names
		var ob = window.opener.document.getElementById('bannerTypeIDs');
		var text = ob.innerHTML;

		var curName = $(this).parents('tr').find('label[for=' + $(this).prop('name') + ']').text();
		var curID = $(this).prop('name').replace(/item/,'');

		// ids
		var curIDs = window.opener.document.filterForm.bannerTypeIDs;
		var curIDsStr = curIDs.value;

		if($(this).is(':checked')){
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('name').replace(/item/,'');
			curIDs.value = curIDsStr;
		}else{
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}
		
	});

	// countries
	$('.state-0').change(function(){
        console.log($(this).selector);
		// names
		var ob = window.opener.document.getElementById('countriesIDs');
		var text = ob.innerHTML;

        var curID = $(this).prop('name').replace(/item/,'');
		var curName = $(this).parents('tr').find('label[for=' + $(this).prop('name') + ']').text();
		// ids
		var curIDs = window.opener.document.filterForm.countriesIDs;
		var curIDsStr = curIDs.value;

        if ($(this).is(':checked')) {
           if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
                text = curName;
            } else {
                text += '; ' + curName;
            }

            if (curIDsStr == '-1') {
                curIDsStr = '';
            }
            if (curIDsStr != '') {
                curIDsStr += ',';
            }
            curIDsStr += curID;
            curIDs.value = curIDsStr;
        } else {
            var index = 0;
            var spliced = false;
            var curIDsArray = curIDsStr.split(',');
            var namesArray = text.split('; ');

            for (i = 0; i < curIDsArray.length; i++) {
                if (curIDsArray[i] == curID) {
                    index = i;
                    spliced = true;
                    curIDsArray.splice(i,1);
                }
            }
            curIDs.value = curIDsArray.join(',');
            if (spliced) {
                namesArray.splice(index,1);
            }
            var namesStr = namesArray.join('; ');
            if (namesStr == '') {
                namesStr = LOCALE.RU.ALL_VALUES;
                curIDs.value = '-1';
            }
            text = namesStr;
        }
        ob.innerHTML = text;
	});

	// regionsRU
	$('.state-1764410409').change(function(){

		// names
		var ob = window.opener.document.getElementById('regionsRUIDs');
		var text = ob.innerHTML;

		var curName = $(this).parents('tr').find('label[for=' + $(this).prop('name') + ']').text();
		var curID = $(this).prop('name').replace(/item/,'');

		// ids
		var curIDs = window.opener.document.filterForm.regionsRUIDs;
		var curIDsStr = curIDs.value;
        var checkedCount = $(this).parents('table').find('.state-1764410409:checked').length;

		if($(this).is(':checked')){
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('name').replace(/item/,'');
			curIDs.value = curIDsStr;
		}else{
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}

	});

	// regionsUA
	$('.state-1139238260').change(function(){

		// names
		var ob = window.opener.document.getElementById('regionsUAIDs');
		var text = ob.innerHTML;

		var curName = $(this).parents('tr').find('label[for=' + $(this).prop('name') + ']').text();
		var curID = $(this).prop('name').replace(/item/,'');

		// ids
		var curIDs = window.opener.document.filterForm.regionsUAIDs;
		var curIDsStr = curIDs.value;

		if($(this).is(':checked')){
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('name').replace(/item/,'');
			curIDs.value = curIDsStr;
		}else{
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}

	});

	// regionsBY
	$('.state-1217456916').change(function(){

		// names
		var ob = window.opener.document.getElementById('regionsBYIDs');
		var text = ob.innerHTML;

		var curName = $(this).parents('tr').find('label[for=' + $(this).prop('name') + ']').text();
		var curID = $(this).prop('name').replace(/item/,'');

		// ids
		var curIDs = window.opener.document.filterForm.regionsBYIDs;
		var curIDsStr = curIDs.value;

		if($(this).is(':checked')){
			if (text == htmlEscape(LOCALE.RU.ALL_VALUES) || text == '') {
				text = curName;
			} else {
				text += '; ' + curName;
			}
			ob.innerHTML = text;

			if (curIDsStr == '-1') {
				curIDsStr = '';
			}
			if (curIDsStr != '') {
				curIDsStr += ',';
			}
			curIDsStr += $(this).prop('name').replace(/item/,'');
			curIDs.value = curIDsStr;
		}else{
			var index = 0;
			var spliced = false;
			curIDsArray = curIDs.value.split(',');
			for(i = 0; i < curIDsArray.length; i++){
				if(curIDsArray[i] == curID){
					index = i;
					spliced = true;
					curIDsArray.splice(i,1);
				}
			}
			curIDs.value = curIDsArray.join(',');

			namesArray = text.split('; ');
			if(spliced){
				namesArray.splice(index,1);
			}
			var namesStr = namesArray.join('; ');
			if(namesStr == ''){
				namesStr = LOCALE.RU.ALL_VALUES;
			}
			ob.innerHTML = namesStr;
		}

	});

	// User criterias
	for(k=1;k<=dMaxUserCriterias;k++) {
		if($('.userCriteria-'+k).html()==null){
			continue;
		}
		$('.userCriteria-'+k).change(function(){

			var curCriteriaID = $(this).prop('class').replace(/formElement userCriteria-/,'');
			var criteriaIDs = 'userCriteria'+curCriteriaID+'IDs';

			// names
			var ob = window.opener.document.getElementById(criteriaIDs);
			var text = ob.innerHTML;

			var curName = $(this).parents('tr').find('label[for=' + $(this).prop('name') + ']').text();
			var curID = $(this).prop('name').replace(/item/,'');

			// ids
			var curIDs = window.opener.document.filterForm[criteriaIDs];
			var curIDsStr = curIDs.value;

			if($(this).is(':checked')){
				if (text == htmlEscape(LOCALE.RU.NOT_SELECTED) || text == '') {
					text = curName;
				} else {
					text += '; ' + curName;
				}
				ob.innerHTML = text;

				if (curIDsStr == '-1') {
					curIDsStr = '';
				}
				if (curIDsStr != '') {
					curIDsStr += ',';
				}
				curIDsStr += $(this).prop('name').replace(/item/,'');
				curIDs.value = curIDsStr;
			}else{
				var index = 0;
				var spliced = false;
				curIDsArray = curIDs.value.split(',');
				for(i = 0; i < curIDsArray.length; i++){
					if(curIDsArray[i] == curID){
						index = i;
						spliced = true;
						curIDsArray.splice(i,1);
					}
				}
				curIDs.value = curIDsArray.join(',');

				namesArray = text.split('; ');
				if(spliced){
					namesArray.splice(index,1);
				}
				var namesStr = namesArray.join('; ');
				if(namesStr == ''){
					namesStr = LOCALE.RU.NOT_SELECTED;
				}
				ob.innerHTML = namesStr;
			}

		});
	}

	//=====================================================
	// button ON
	$('.btnOn-btn-ssp').click(function(){
		$('.site-checkbox').each(function(){
			if(!($(this).is(':checked'))){				
				$(this).prop('checked',true).change();
			}
		});

		$('.section-checkbox').each(function(){
			if(!($(this).is(':checked'))){				
				$(this).prop('checked',true).change();
			}
		});

		$('.place-checkbox').each(function(){
			if(!($(this).is(':checked'))){
				$(this).prop('checked',true).change();
			}
		});
		location.reload();
	});

	$('.btnOn-btn-bt').click(function(){
		$('.bannerType').each(function(){
			if(!($(this).is(':checked'))){
				$(this).prop('checked',true).change();
			}
		});
		location.reload();
	});

	$('.btnOn-btn-state-0').click(function(){
        var reload = false;
		$('.state-0').each(function(){
			if(!($(this).is(':checked'))){
                reload = true;
				$(this).prop('checked',true).change();
			}
		});
        if (reload) {
            location.reload();
        }
	});

	$('.btnOn-btn-state-1764410409').click(function(){
		$('.state-1764410409').each(function(){
			if(!($(this).is(':checked'))){
				$(this).prop('checked',true).change();
			}
		});
		location.reload();
	});

	$('.btnOn-btn-state-1139238260').click(function(){
		$('.state-1139238260').each(function(){
			if(!($(this).is(':checked'))){
				$(this).prop('checked',true).change();
			}
		});
		location.reload();
	});

	$('.btnOn-btn-state-1217456916').click(function(){
		$('.state-1217456916').each(function(){
			if(!($(this).is(':checked'))){
				$(this).prop('checked',true).change();
			}
		});
		location.reload();
	});

	$('.btnOn-btn-criteria').click(function(){
		for(k=1;k<=dMaxUserCriterias;k++) {
			if($('.userCriteria-'+k).html()==null){
				continue;
			}
			$('.userCriteria-'+k).each(function(){
				if(!($(this).is(':checked'))){					
					$(this).prop('checked',true).change();
				}
			});
			var criteriaIDs = 'userCriteria'+k+'IDs';
		}
		location.reload();
	});

	// button OFF
	$('.btnOff-btn-ssp').click(function(){
		$('.site-checkbox').each(function(){
			$(this).removeProp('checked').click();
		});
		window.opener.document.filterForm.siteIDs.value='-1';
		window.opener.document.getElementById('siteNames').innerHTML=LOCALE.RU.ALL_VALUES;

		$('.section-checkbox').each(function(){
			$(this).removeProp('checked').change();
		});
		window.opener.document.filterForm.sectionIDs.value='-1';
		window.opener.document.getElementById('sectionNames').innerHTML=LOCALE.RU.ALL_VALUES;

		$('.place-checkbox').each(function(){
			$(this).removeProp('checked').change();
		});
		window.opener.document.filterForm.placeIDs.value='-1';
		window.opener.document.getElementById('placeNames').innerHTML=LOCALE.RU.ALL_VALUES;
		location.reload();
	});

	$('.btnOff-btn-bt').click(function(){
		$('.bannerType').each(function(){
			$(this).removeProp('checked').change();
		});
		window.opener.document.filterForm.bannerTypeIDs.value='-1';
		window.opener.document.getElementById('bannerTypeIDs').innerHTML=LOCALE.RU.ALL_VALUES;
		location.reload();
	});

	$('.btnOff-btn-state-0').click(function(){
		$('.state-0').each(function(){
			$(this).removeProp('checked').change();
		});
		//window.opener.document.filterForm.countriesIDs.value='-1';
		//window.opener.document.getElementById('countriesIDs').innerHTML=LOCALE.RU.ALL_VALUES;
		location.reload();
	});

	$('.btnOff-btn-state-1764410409').click(function(){
		$('.state-1764410409').each(function(){
			$(this).removeProp('checked').change();
		});
		window.opener.document.filterForm.regionsRUIDs.value='-1';
		window.opener.document.getElementById('regionsRUIDs').innerHTML=LOCALE.RU.ALL_VALUES;
		location.reload();
	});

	$('.btnOff-btn-state-1139238260').click(function(){
		$('.state-1139238260').each(function(){
			$(this).removeProp('checked').change();
		});
		window.opener.document.filterForm.regionsUAIDs.value='-1';
		window.opener.document.getElementById('regionsUAIDs').innerHTML=LOCALE.RU.ALL_VALUES;
		location.reload();
	});

	$('.btnOff-btn-state-1217456916').click(function(){
		$('.state-1217456916').each(function(){
			$(this).removeProp('checked').change();
		});
		window.opener.document.filterForm.regionsBYIDs.value='-1';
		window.opener.document.getElementById('regionsBYIDs').innerHTML=LOCALE.RU.ALL_VALUES;
		location.reload();
	});

	$('.btnOff-btn-criteria').click(function(){
		for(k=1;k<=dMaxUserCriterias;k++) {
			if($('.userCriteria-'+k).html()==null){
				continue;
			}
			$('.userCriteria-'+k).each(function(){
				$(this).removeProp('checked').change();
			});
			var criteriaIDs = 'userCriteria'+k+'IDs';
		}
		window.opener.document.filterForm[criteriaIDs].value='-1';
		window.opener.document.getElementById(criteriaIDs).innerHTML=LOCALE.RU.NOT_SELECTED;
		location.reload();
	});
});
