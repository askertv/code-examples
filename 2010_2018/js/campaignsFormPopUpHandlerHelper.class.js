/**
 * js class campaignsFormPopUpHandlerHelper
 */
function campaignsFormPopUpHandlerHelper(){}

campaignsFormPopUpHandlerHelper.isHideMacro=false;
campaignsFormPopUpHandlerHelper.isHideOnOff=false;

campaignsFormPopUpHandlerHelper.dUTMinConditions=1;
campaignsFormPopUpHandlerHelper.dUTMaxConditions=9;

campaignsFormPopUpHandlerHelper.dAIP_russiaID=1764410409;
campaignsFormPopUpHandlerHelper.dAIP_ukraineID=1139238260;
campaignsFormPopUpHandlerHelper.dAIP_USID=977001936;

campaignsFormPopUpHandlerHelper.offStr='<выключено>';
campaignsFormPopUpHandlerHelper.undefinedStr='<не&nbsp;задано>';
campaignsFormPopUpHandlerHelper.undefinedLTStr='&lt;не&nbsp;задано&gt;';
campaignsFormPopUpHandlerHelper.weekday=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];

campaignsFormPopUpHandlerHelper.hour=new Array();
for(i=0;i<=23;i++)campaignsFormPopUpHandlerHelper.hour[i]=(i>9?i:'0'+i)+':00-'+(i>9?i:'0'+i)+':59';

campaignsFormPopUpHandlerHelper.monthDay=new Array();
for(i=1;i<=31;i++)campaignsFormPopUpHandlerHelper.monthDay[i]=''+(i>9?i:'0'+i);

campaignsFormPopUpHandlerHelper.frequency={
	'maxUniqueImpressions':'Максимальное количество показов посетителю',
	'maxUniqueClicks':'Максимальное количество переходов для посетителя',
	'datePeriod':'Дата начала периода',
	'frequencyTypeImpressions':'Период частоты показов',
	'uniquePeriodImpressions':'Специальный период показов (часы:минуты)',
	'impressionsPerPeriod':'Количество показов за период',
	'minimalPeriodImpressions':'Минимальный период между показами (часы:минуты:секунды)',
	'frequencyTypeClicks':'Период частоты переходов',
	'uniquePeriodClicks':'Специальный период переходов (часы:минунты)',
	'clicksPerPeriod':'Количество переходов за период',
	'minimalPeriodClicks':'Минимальный период между переходами (часы:минуты:секунды)'
};

campaignsFormPopUpHandlerHelper.frequencyTypes={
	'0':'notDefined',
	'1':'hour',
	'2':'4Hours',
	'3':'6Hours',
	'4':'12Hours',
	'5':'day',
	'6':'weekDay',
	'9':'2WeekDays',
	'7':'month',
	'8':'other'
}

campaignsFormPopUpHandlerHelper.frequencyTypesTitles={
	'notDefined':campaignsFormPopUpHandlerHelper.undefinedStr,
	'hour':'<час>',
	'4Hours':'<4&nbsp;часа>',
	'6Hours':'<6&nbsp;часов>',
	'12Hours':'<12&nbsp;часов>',
	'day':'<сутки>',
	'weekDay':'<неделя>',
	'2WeekDays':'<14&nbsp;дней>',
	'month':'<месяц>',
	'other':'<другой&nbsp;период>'
}

campaignsFormPopUpHandlerHelper.UT={};

for(i=campaignsFormPopUpHandlerHelper.dUTMinConditions;i<=campaignsFormPopUpHandlerHelper.dUTMaxConditions;i++){
	campaignsFormPopUpHandlerHelper.UT['UTNot'+i]='';
	campaignsFormPopUpHandlerHelper.UT['categoryID'+i]='';
	campaignsFormPopUpHandlerHelper.UT['visits'+i]='';
	campaignsFormPopUpHandlerHelper.UT['timeout'+i]='';
}

campaignsFormPopUpHandlerHelper.UTNots={
	'0':'<условие&nbsp;не&nbsp;задано>',
	'1':'<посещали&nbsp;страницы&nbsp;категории>',
	'2':'<не&nbsp;посещали&nbsp;страницы&nbsp;категории>',
}

campaignsFormPopUpHandlerHelper.UTNotsP={
	'0':'<условие&nbsp;не&nbsp;задано>',
	'1':'<посещали&nbsp;страницы&nbsp;временной&nbsp;категории>',
	'2':'<не&nbsp;посещали&nbsp;страницы&nbsp;временной&nbsp;категории>',
}

campaignsFormPopUpHandlerHelper.addSearchHelper=function(){
	var openerLinkContainer=window.opener.document.querySelectorAll('a[href*="submit()"]');
	if(openerLinkContainer.length=1){
		var origHref=openerLinkContainer.item(0).href;
		if(origHref.indexOf('campagnsSearchHelper')==-1)
			openerLinkContainer.item(0).href='javascript:campagnsSearchHelper.execute();'+origHref.replace(/javascript:/,'');
	}
}

campaignsFormPopUpHandlerHelper.updateCheckboxes=function(item,thisObject){
	var idsStr=window.opener.$('#'+item+'-ids-pocket').html();
	var idsArray=new Array();
	if(idsStr!='') idsArray=idsStr.split(',');

	var patt=new RegExp(item+'-');
	var ID=thisObject.prop('id').replace(patt,'');
	for(i=0;i<idsArray.length;i++)
		if(idsArray[i]==ID) thisObject.prop('checked',true);
}

campaignsFormPopUpHandlerHelper.handleClick=function(item,thisObject){
	// Init ids
	var patt = new RegExp(item+'-');
	var curID=thisObject.prop('id').replace(patt,'');
	var curIDs=window.opener.$('#'+item+'-ids-pocket');
	var curIDsStr=curIDs.html();
	var curIDsArray=curIDs.html().split(',');

	// Init names
	var ob=window.opener.$('#'+item+'Names');
	var text=ob.html();
	var curName=thisObject.next('span').html();

	// Some vars
	var index=0;
	var spliced=false;

	if(thisObject.is(':checked')){
		// Handle checked

		// ..change ids
		if(curIDsStr=='-1') curIDsStr='';
		if(curIDsStr!='') curIDsStr+=',';
		curIDsStr+=thisObject.prop('id').replace(patt,'');
		curIDs.html(curIDsStr);

		// ..change names
		if(text=='&lt;все&gt;'||text=='') text=curName;
		else text+=','+curName;
		ob.html(text);
	}else{
		// Handle unchecked

		// ..change ids
		for(i=0;i<curIDsArray.length;i++){
			if(curIDsArray[i]==curID){
				index=i;
				spliced=true;
				curIDsArray.splice(i,1);
			}
		}
		curIDs.html(curIDsArray.join(','));

		// ..change names
		var namesArray = '';
		if(text) {
			namesArray = text.split(',');
			if (spliced) namesArray.splice(index, 1);
		}
		var namesStr = namesArray.join(',');
		if(namesStr=='') namesStr='<все>';
		ob.html(namesStr);
	}

	campaignsFormPopUpHandlerHelper.resetTmpRequestID(window.opener.document);
}

campaignsFormPopUpHandlerHelper.resetTmpRequestID=function(openerDocument){
	if (openerDocument.URL.indexOf('superCampaigns.php')!='-1')
		openerDocument.superCampaignsSearch.tmpRequestID.value=0;
	else
		openerDocument.campaignsSearch.tmpRequestID.value=0;
}


/* Search by targeting handlers */

campaignsFormPopUpHandlerHelper.addSearchTargetingHelper=function(){
	var openerLinkContainer=window.opener.document.querySelectorAll('a[href*="submit()"]');
	if(openerLinkContainer.length=1){
		var origHref=openerLinkContainer.item(0).href;
		if(origHref.indexOf('campaignsSearchTargetingHandlerHelper')==-1)
			openerLinkContainer.item(0).href='javascript:campaignsSearchTargetingHandlerHelper.execute();'+origHref.replace(/javascript:/,'');
	}
}

campaignsFormPopUpHandlerHelper.updateTCheckboxes=function(item,thisObject,IDpfx){
	var ID=thisObject.prop('name');

	if(typeof (IDpfx)!=='undefined'){
		var patt=new RegExp(IDpfx);
		ID=ID.replace(patt,'');
	}

	var itemID=item;

	if(document.location.pathname.indexOf('profileAIPStatesForm')!==-1&&item!=='subRegions'){
		var re=/countryID=(\d+)/ig;
		var matches=re.exec(document.location.search);
		itemID+='-'+matches[1];

		if( parseInt(matches[1])===campaignsFormPopUpHandlerHelper.dAIP_russiaID )
				campaignsFormPopUpHandlerHelper.hideMacro();

		if( window.opener.$('#profile-country-pocket').html().indexOf(matches[1])===-1 ){
			thisObject.prop('disabled',true);
			campaignsFormPopUpHandlerHelper.hideOnOffLinks();
			//if( parseInt(matches[1])===campaignsFormPopUpHandlerHelper.dAIP_russiaID )
				//campaignsFormPopUpHandlerHelper.hideMacro();
			return;
		}
	}else if(document.location.pathname.indexOf('profileMaxmindCitiesForm')!==-1){
		var re=/stateID=(\d+)/ig;
		var matches=re.exec(document.location.search);
		itemID+='-'+matches[1];
		if( window.opener.$('#profile-state-'+campaignsFormPopUpHandlerHelper.dAIP_USID+'-pocket').html().indexOf(matches[1])===-1 ){
			thisObject.prop('disabled',true);
			campaignsFormPopUpHandlerHelper.hideOnOffLinks();
			return;
		}
	}

	var idsStr=window.opener.$('#profile-'+itemID+'-pocket').html();

	var idsArray=new Array();
	if(idsStr!='') idsArray=idsStr.split(',');

	for(i=0;i<idsArray.length;i++)
		if(idsArray[i]==ID) thisObject.prop('checked',true);
}

campaignsFormPopUpHandlerHelper.hideMacro=function(){
	if( campaignsFormPopUpHandlerHelper.isHideMacro ) return;
	$('#macroInfo').remove();
	campaignsFormPopUpHandlerHelper.isHideMacro=true;
}

campaignsFormPopUpHandlerHelper.hideOnOffLinks=function(){
	if( campaignsFormPopUpHandlerHelper.isHideOnOff ) return;
	$('a[href="checkAll"]').remove();
	$('a[href="uncheckAll"]').remove();
	campaignsFormPopUpHandlerHelper.isHideOnOff=true;
}

campaignsFormPopUpHandlerHelper.updateUTDisabled=function(item,isTmpCategories){
	if(item.indexOf('UTNot')!==-1){
		var value;
		var positionIndex=parseInt(item.replace(/UTNotP?/,''));
		if(isTmpCategories==1)
			value=parseInt(window.opener.$('#profile-'+'UTNotP'+positionIndex+'-pocket').html());
		else
			value=parseInt(window.opener.$('#profile-'+'UTNot'+positionIndex+'-pocket').html());

		if(value===0){
			$('#categoryID'+positionIndex).prop('value',0);
			$('#categoryID'+positionIndex).prop('disabled', true);
			window.opener.$('#profile-'+'categoryID'+(isTmpCategories==1?'P':'')+positionIndex+'-pocket').html('0');
			$('#visits'+positionIndex).prop('value','');
			$('#visits'+positionIndex).prop('disabled',true);
			window.opener.$('#profile-'+'visits'+(isTmpCategories==1?'P':'')+positionIndex+'-pocket').html('');
			$('#timeout'+positionIndex).prop('value','');
			$('#timeout'+positionIndex).prop('disabled',true);
			window.opener.$('#profile-'+'timeout'+(isTmpCategories==1?'P':'')+positionIndex+'-pocket').html('');
		}else if(value===1){
			$('#categoryID'+positionIndex).removeProp('disabled');
			$('#visits'+positionIndex).removeProp('disabled');
			$('#timeout'+positionIndex).removeProp('disabled');
			$('#visits'+positionIndex).prop('value',1);
			window.opener.$('#profile-'+'visits'+(isTmpCategories==1?'P':'')+positionIndex+'-pocket').html('1');
		}else{
			$('#categoryID'+positionIndex).removeProp('disabled');
			$('#visits'+positionIndex).prop('value','');
			$('#visits'+positionIndex).prop('disabled',true);
			window.opener.$('#profile-'+'visits'+(isTmpCategories==1?'P':'')+positionIndex+'-pocket').html('');
			$('#timeout'+positionIndex).prop('value','');
			$('#timeout'+positionIndex).prop('disabled',true);
			window.opener.$('#profile-'+'timeout'+(isTmpCategories==1?'P':'')+positionIndex+'-pocket').html('');
		}
	}
}

campaignsFormPopUpHandlerHelper.updateInputValue=function(item,thisObject){
	var value=window.opener.$('#profile-'+item+'-pocket').html();
	if((item.indexOf('visits')!==-1||item.indexOf('timeout')!==-1)&&value=='0') value='';
	thisObject.prop('value',value);
	campaignsFormPopUpHandlerHelper.updateUTDisabled(item,campaignsFormPopUpHandlerHelper.isUTTmpCategories());
}

campaignsFormPopUpHandlerHelper.handleTClick=function(item, thisObject){
	var isChecked=thisObject.prop('checked');
	if(typeof(isChecked)==='undefined') isChecked=thisObject.is(':checked');
	// Init element name properties
	var curID=thisObject.prop('name');
	var curIDs=window.opener.$('#profile-'+item+'-pocket');
	var curIDsStr=curIDs.html();
	var curIDsArray=curIDs.html().split(',');

	// Handle checked for change titles
	var profileTitle=campaignsFormPopUpHandlerHelper.getProfileTitleInfo(item,curIDsArray,curID,thisObject.is(':checked'));
	var ob=window.opener.profileSummary.$('#profile-'+item+'-title');
	ob.html(profileTitle);

	// Handle checked for change ids
	if(isChecked){
		if(curIDsStr=='-1') curIDsStr='';
		if(curIDsStr!='') curIDsStr+=',';

		var inArray=false;
		for(i=0;i<curIDsArray.length;i++)
			if(curIDsArray[i]==curID)
				inArray=true;

		if(!inArray){
			curIDsStr+=thisObject.prop('name');
			curIDs.html(curIDsStr);
		}
	}else{
		for(i=0;i<curIDsArray.length;i++)
			if(curIDsArray[i]==curID)
				curIDsArray.splice(i,1);

		curIDs.html(curIDsArray.join(','));
	}

	campaignsFormPopUpHandlerHelper.resetTmpTargetingRequestID(window.opener.document);
	campaignsFormPopUpHandlerHelper.checkFilter(item);
}

campaignsFormPopUpHandlerHelper.getProfileTitleTime=function(data,id,isChecked){
	var hd=id.replace(/hour/,'').split('day');
	var inArray=false;
	var hoursByWeekday=[];
	var hWDIndex=[];
	var periods=[];
	var wdHours=[];
	var hoursSorted=[];
	var hTxt=[];

	for(i=0;i<=6;i++){
		hoursByWeekday[i]=[];
		hWDIndex[i]=0;
		periods[i]='';
		hTxt[i]='';
	}

	if(data.length&&data[0]!='')
		for(i=0;i<data.length;i++){
			curHD=data[i].replace(/hour/,'').split('day');
			if (curHD[0]==hd[0]&&curHD[1]==hd[1])
				inArray=true;

			hoursByWeekday[ curHD[1] ][ hWDIndex[ curHD[1] ] ]=curHD[0];
			hWDIndex[ curHD[1] ]++;
		}

	if(isChecked){
		if(!inArray) {
			hoursByWeekday[ hd[1] ][ hWDIndex[ hd[1] ] ]=hd[0];
			hWDIndex[ hd[1] ]++;
		}
	}else if(inArray){
		var rI=0;
		for(x=0;x<hoursByWeekday[ hd[1] ].length;x++) {
			if(hoursByWeekday[ hd[1] ][ x ]==hd[0]){
				rI=x;
				break;
			}
		}
		hoursByWeekday[ hd[1] ].splice(rI,1);
		hWDIndex[ hd[1] ]--;
	}

	for(i=0;i<campaignsFormPopUpHandlerHelper.weekday.length;i++){
			wdHours=hoursByWeekday[i];

			if(wdHours.length==0){
				periods[i]='Выключено';
			}else{
				hoursSorted=wdHours.sort(campaignsFormPopUpHandlerHelper.sortInt);

				for(k=0;k<hoursSorted.length;k++){
					if(hTxt[i]==''&&parseInt(hoursSorted[k])!=NaN)
						hTxt[i]=campaignsFormPopUpHandlerHelper.hour[ hoursSorted[k] ];

					if(k>0)
						if(
							hoursSorted[k-1]!=''
							&&
							parseInt(hoursSorted[k-1])!=NaN
							&&
							parseInt(hoursSorted[k-1])!=parseInt(hoursSorted[k])
							&&
							(parseInt(hoursSorted[k-1])+1)!=parseInt(hoursSorted[k])
						)
							hTxt[i]+=', '+campaignsFormPopUpHandlerHelper.hour[hoursSorted[k]];
						else if(
							(parseInt(hoursSorted[k-1])+1)==parseInt(hoursSorted[k])
							&&
							(
								k<(hoursSorted.length-1)
								&&
								parseInt(hoursSorted[k])!=(parseInt(hoursSorted[k+1])-1)
								||
								k==(hoursSorted.length-1)
							)
						)
							hTxt[i]=hTxt[i].substr(0,hTxt[i].length-11)+hTxt[i].substr(-11,5)+'-'+campaignsFormPopUpHandlerHelper.hour[ hoursSorted[k] ].substr(-5,5);
				}
				periods[i]=hTxt[i];
			}
	}

	var result='';
	for(i=1;i<periods.length;i++)
		result+=campaignsFormPopUpHandlerHelper.getWeekdayInfo(periods,i);

	result+=campaignsFormPopUpHandlerHelper.getWeekdayInfo(periods,0);

	if(result=='') result='выключено';

	return result;
}

campaignsFormPopUpHandlerHelper.getWeekdayInfo=function(data,index){
	var result=campaignsFormPopUpHandlerHelper.weekday[index]+': ';
	if(data[index]!=''){
		if(data[index]==='00:00-23:59')
			result+=campaignsFormPopUpHandlerHelper.undefinedStr;
		else
			result+=data[index];
	}else
		result+='Выключено';
	result+='<br>';
	return result;
}

campaignsFormPopUpHandlerHelper.getProfileTitleDay=function(data,id,isChecked){
	id=id.replace(/day/,'');
	var txt='';
	var curDay='';
	var days=new Array();
	var inArray=false;
	var inArrayIndex=0;

	if(data.length)
		for(i=0;i<data.length;i++){
			curDay=data[i].replace(/day/,'');
			if (curDay==id) {
				inArray=true;
				inArrayIndex=i;
			}

			days[i]=curDay;
		}

	if(isChecked){
		if(!inArray) days.push(id);
	}else if(inArray){
		days.splice(inArrayIndex,1);
	}

	if(days.length){
		var daysSorted=days.sort(campaignsFormPopUpHandlerHelper.sortInt);

		for(i=0;i<daysSorted.length;i++){
			if(txt==''&&parseInt(daysSorted[i])!=NaN)
				txt=daysSorted[i];

			if(i>0)
				if(
					daysSorted[i-1]!=''
					&&
					parseInt(daysSorted[i-1])!=NaN
					&&
					parseInt(daysSorted[i-1])!=parseInt(daysSorted[i])
					&&
					(parseInt(daysSorted[i-1])+1)!=parseInt(daysSorted[i])
				){
					txt+=', '+daysSorted[i];
				}else if(
					(parseInt(daysSorted[i-1])+1)==parseInt(daysSorted[i])
					&&
					(
						i<(daysSorted.length-1)
						&&
						parseInt(daysSorted[i])!=(parseInt(daysSorted[i+1])-1)
						||
						i==(daysSorted.length-1)
					)
				){
					txt+='-'+daysSorted[i];
				}
		}
	}

	if(txt==='')
		txt=campaignsFormPopUpHandlerHelper.offStr;
	else if(txt==='1-31')
		txt=campaignsFormPopUpHandlerHelper.undefinedStr;

	return txt;
}

campaignsFormPopUpHandlerHelper.checkSubParameter=function(item){
	if(typeof campaignsFormPopUpHandlerHelper.frequency[item]!=='undefined')
		return 'frequency';

	if(typeof campaignsFormPopUpHandlerHelper.UT[item]!=='undefined')
		return 'behaviour';

	return item;
}

campaignsFormPopUpHandlerHelper.getProfileTitleFrequency=function(item,data,id){
	var result='';
	var curValue='';

	// update date period
	window.opener.$('#profile-datePeriod-pocket').html($('#datePeriod').prop('value'));

	if(item==='frequencyTypeImpressions'||item==='frequencyTypeClicks'){
		if(
			campaignsFormPopUpHandlerHelper.frequencyTypes[id]==='2WeekDays'
			||
			campaignsFormPopUpHandlerHelper.frequencyTypes[id]==='month'
			||
			campaignsFormPopUpHandlerHelper.frequencyTypes[id]==='other'
		){
			$('#datePeriod').removeProp('disabled');
		}else{
			$('#datePeriod').prop('disabled', true);
			$('#datePeriod').prop('value', '');
			window.opener.$('#profile-datePeriod-pocket').html('');
		}

		if(item==='frequencyTypeImpressions') {
			if(campaignsFormPopUpHandlerHelper.frequencyTypes[id]==='other'){
				$('#uniquePeriodImpressions').removeProp('disabled');
			}else{
				$('#uniquePeriodImpressions').prop('disabled', true);
				$('#uniquePeriodImpressions').prop('value', '');
				window.opener.$('#profile-uniquePeriodImpressions-pocket').html('');
			}
		}else if(item==='frequencyTypeClicks'){
			if(campaignsFormPopUpHandlerHelper.frequencyTypes[id]==='other'){
				$('#uniquePeriodClicks').removeProp('disabled');
			}else{
				$('#uniquePeriodClicks').prop('disabled', true);
				$('#uniquePeriodClicks').prop('value', '');
				window.opener.$('#profile-uniquePeriodClicks-pocket').html('');
			}
		}
	}

	for(p in campaignsFormPopUpHandlerHelper.frequency){
		curValue=window.opener.$('#profile-'+p+'-pocket').html();

		if(p==='frequencyTypeImpressions'||p==='frequencyTypeClicks')
			curValue=campaignsFormPopUpHandlerHelper.frequencyTypesTitles[campaignsFormPopUpHandlerHelper.frequencyTypes[curValue]];

		if(curValue){
			if(result) result+='<br>';
			result+=campaignsFormPopUpHandlerHelper.frequency[p]+': '+curValue;
		}
	}

	if(result=='') result=campaignsFormPopUpHandlerHelper.undefinedStr;
	return result;
}

campaignsFormPopUpHandlerHelper.isUTTmpCategories=function(){
	var qParams=campaignsFormPopUpHandlerHelper.getQueryParams(document.location.search);
	return typeof qParams.mode==='undefined'?0:parseInt(qParams.mode);
}

campaignsFormPopUpHandlerHelper.handleUTBlock=function(index,isTmp,forTmp,infObj){
	var res=infObj.result;
	var orderN=infObj.orderNum;
	var options='';
	var title='';
	var sfx=forTmp?'P':'';
	var curValue=parseInt(window.opener.$('#profile-'+'UTNot'+sfx+index+'-pocket').html());
	var categoryID=parseInt(window.opener.$('#profile-'+'categoryID'+sfx+index+'-pocket').html());
	var visits=parseInt(window.opener.$('#profile-'+'visits'+sfx+index+'-pocket').html());
	var timeout=parseInt(window.opener.$('#profile-'+'timeout'+sfx+index+'-pocket').html());

	if(curValue&&categoryID){
		orderN++;
		if(res) res+='<br>';

		if(isTmp===forTmp){
			options=$('#categoryID'+index).prop('options');
			title=options[$('#categoryID'+index).prop('selectedIndex')].text;
		}else
			title=categoriesOther[categoryID];

		if(!visits) visits=1;

		res+=orderN+'. ';

		if(forTmp)
			res+=campaignsFormPopUpHandlerHelper.UTNotsP[curValue];
		else
			res+=campaignsFormPopUpHandlerHelper.UTNots[curValue];

		res+=' "'+title+'"';

		if(curValue===1){
			res+=' не менее '+visits+' раз';
			if(timeout) res+=', последнее посещение было не позднее '+timeout+' дней назад';
		}
	}

	infObj.result=res;
	infObj.orderNum=orderN;
}

campaignsFormPopUpHandlerHelper.getProfileTitleUT=function(item,data,id){
	var orderNumID='profile-UT-orderNum-pocket';
	var orderNumIDP='profile-UTTmp-orderNum-pocket';
	var isTmpCategories=campaignsFormPopUpHandlerHelper.isUTTmpCategories();
	var processInfo={'result':'','orderNum':0};

	if(window.opener.$('#'+orderNumID).html()===null)
		window.opener.$('#profile-time-pocket').after('<span style="dislay:none" id="'+orderNumID+'">0</span>');

	if(window.opener.$('#'+orderNumIDP).html()===null)
		window.opener.$('#profile-time-pocket').after('<span style="dislay:none" id="'+orderNumIDP+'">0</span>');

	campaignsFormPopUpHandlerHelper.updateUTDisabled(item,isTmpCategories);

	// Постоянные категории
	for(i=campaignsFormPopUpHandlerHelper.dUTMinConditions;i<=campaignsFormPopUpHandlerHelper.dUTMaxConditions;i++)
		campaignsFormPopUpHandlerHelper.handleUTBlock(i,isTmpCategories,0,processInfo);

	// Временные категории
	for(i=campaignsFormPopUpHandlerHelper.dUTMinConditions;i<=campaignsFormPopUpHandlerHelper.dUTMaxConditions;i++)
		campaignsFormPopUpHandlerHelper.handleUTBlock(i,isTmpCategories,1,processInfo);

	if(isTmpCategories)
		window.opener.$('#'+orderNumIDP).html(processInfo.orderNum);
	else
		window.opener.$('#'+orderNumID).html(processInfo.orderNum);

	if(processInfo.result)
		processInfo.result='Показывать баннеры рекламной кампании только пользователям, которые:<br>'+processInfo.result;
	else
		processInfo.result=campaignsFormPopUpHandlerHelper.undefinedStr;

	return processInfo.result;
}

campaignsFormPopUpHandlerHelper.getProfileTitleInfo=function(item,data,id,isChecked){
	if(typeof isChecked==='undefined') isChecked=false;

	if(item=='day')
		return campaignsFormPopUpHandlerHelper.getProfileTitleDay(data,id,isChecked);
	else if(item=='time')
		return campaignsFormPopUpHandlerHelper.getProfileTitleTime(data,id,isChecked);
	else if(typeof campaignsFormPopUpHandlerHelper.frequency[item]!=='undefined')
		return campaignsFormPopUpHandlerHelper.getProfileTitleFrequency(item,data,id);
	else if(typeof campaignsFormPopUpHandlerHelper.UT[item]!=='undefined')
		return campaignsFormPopUpHandlerHelper.getProfileTitleUT(item,data,id);

	return campaignsFormPopUpHandlerHelper.undefinedStr;
}

campaignsFormPopUpHandlerHelper.sortInt=function(a,b){
	if(parseInt(a)<parseInt(b)) return -1
	if(parseInt(a)>parseInt(b)) return 1
	return 0
}

// http://stackoverflow.com/a/1099670
campaignsFormPopUpHandlerHelper.getQueryParams=function(qs){
	qs=qs.split("+").join(" ");
	var
		params={},
		tokens,
		re=/[?&]?([^=]+)=([^&]*)/g;

	while(tokens=re.exec(qs))
		params[decodeURIComponent(tokens[1])]=decodeURIComponent(tokens[2]);

	return params;
}

campaignsFormPopUpHandlerHelper.resetTmpTargetingRequestID=function(openerDocument){
	if(openerDocument.URL.indexOf('superCampaigns.php')!='-1')
		openerDocument.superCampaignsSearch.tmpTRequestID.value=0;
	else
		openerDocument.campaignsSearch.tmpTRequestID.value=0;
}

campaignsFormPopUpHandlerHelper.handleInputKeyUp=function(item,thisObject){
	var curValue=thisObject.prop('value');
	var isUTTmpCategories=0;
	if(document.location.pathname.indexOf('profileUTForm')!==-1)
		isUTTmpCategories=campaignsFormPopUpHandlerHelper.isUTTmpCategories();
	var storedElement;
	var storedElementID='profile-'+item+'-pocket';
	if(isUTTmpCategories==1)
		if(item==='UTLogic')
			storedElementID='profile-'+item+'P'+'-pocket';
		else
			storedElementID='profile-'+item.replace(/(\d+)/,"P$1")+'-pocket';
	storedElement=window.opener.$('#'+storedElementID);
	var storedValue=storedElement.html();
	storedElement.html(curValue);
	var profileTitle=campaignsFormPopUpHandlerHelper.getProfileTitleInfo(item,storedValue,curValue);
	item=campaignsFormPopUpHandlerHelper.checkSubParameter(item);
	window.opener.profileSummary.$('#profile-'+item+'-title').html(profileTitle);
	campaignsFormPopUpHandlerHelper.resetTmpTargetingRequestID(window.opener.document);
	campaignsFormPopUpHandlerHelper.checkFilter(item);
}

campaignsFormPopUpHandlerHelper.handleT2Click=function(item,thisObject,IDpfx){
	// Init ids
	if(typeof (IDpfx)==='undefined') IDpfx='item';
	var patt=new RegExp(IDpfx);
	var curID=$(thisObject).val();
	var curIDs='';
	var itemID=item;

	if(document.location.pathname.indexOf('profileAIPStatesForm')!==-1){
		var re=/countryID=(\d+)/ig;
		var matches=re.exec(document.location.search);
		itemID+='-'+matches[1];
	}else if(document.location.pathname.indexOf('profileMaxmindCitiesForm')!==-1){
		var re=/stateID=(\d+)/ig;
		var matches=re.exec(document.location.search);
		itemID+='-'+matches[1];
	}

	curIDs=window.opener.$('#profile-'+itemID+'-pocket');

	var curIDsStr=curIDs.html();
	var curIDsArray=curIDs.html().split(',');

	// Init names
	if(IDpfx!=='macro'){
		var ob=window.opener.profileSummary.$('#profile-'+itemID+'-title');
		var text=ob.html();
		var curName=thisObject.next('span').html().replace(/,/,'');
	}

	// Some vars
	var index=0;
	var spliced=false;

	if(thisObject.is(':checked')){
		// Handle checked

		// ..change ids
		if(curIDsStr=='-1') curIDsStr='';
		if(curIDsStr!='') curIDsStr+=',';
		curIDsStr+=thisObject.val().replace(patt,'');
		curIDs.html(curIDsStr);

		// ..change names
		if(IDpfx!=='macro'){
			if(text==campaignsFormPopUpHandlerHelper.undefinedLTStr||text=='') text=curName;
			else text+=','+curName;
			ob.html(text);
		}
	}else{
		// Handle unchecked

		// ..change ids
		for(i=0;i<curIDsArray.length;i++){
			if(curIDsArray[i]==curID){
				index=i;
				spliced=true;
				curIDsArray.splice(i,1);
			}
		}
		curIDs.html(curIDsArray.join(','));

		// ..change names
		if(IDpfx!=='macro'){
			var namesArray = '';
			if (text) {
				namesArray = text.split(',');
				if (spliced) namesArray.splice(index, 1);
				var namesStr = namesArray.join(',');
			}
			if(namesStr==''&&itemID===item) namesStr=campaignsFormPopUpHandlerHelper.undefinedLTStr;
			ob.html(namesStr);
		}
	}

	if(IDpfx==='macro') return;

	var updateFlag=window.opener.$('#profile-'+itemID+'IsSet'+'-pocket');
	if(updateFlag.html()!==null) updateFlag.html('1');

	campaignsFormPopUpHandlerHelper.resetTmpTargetingRequestID(window.opener.document);
	campaignsFormPopUpHandlerHelper.checkFilter('geo');
}

campaignsFormPopUpHandlerHelper.checkFilter=function(item){
	if(item!=='time'&&item!=='day'&&item!=='frequency'&&item!=='behaviour'&&item!=='geo') return;
	window.opener.profileSummary.$('#'+item+'-filter').prop('checked',true);
	window.opener.$('#profile-is'+campaignsFormPopUpHandlerHelper.ucfirst(item)+'Filter-pocket').html('1');
	window.opener.$('#profile-resetTargetings-pocket').html('');
}

campaignsFormPopUpHandlerHelper.ucfirst=function(str){
	//original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	return str.charAt(0).toUpperCase()+str.substr(1,str.length-1);
}
