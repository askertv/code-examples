/**
 * js class campaignsSearchTargetingHandlerHelper
 */
function campaignsSearchTargetingHandlerHelper(){}

campaignsSearchTargetingHandlerHelper.dUTMinConditions=1;
campaignsSearchTargetingHandlerHelper.dUTMaxConditions=9;

campaignsSearchTargetingHandlerHelper.dAIP_russiaID=1764410409;
campaignsSearchTargetingHandlerHelper.dAIP_ukraineID=1139238260;
campaignsSearchTargetingHandlerHelper.dAIP_USID=977001936;

campaignsSearchTargetingHandlerHelper.hours='';
campaignsSearchTargetingHandlerHelper.days='';

campaignsSearchTargetingHandlerHelper.frequency={
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

for(p in campaignsSearchTargetingHandlerHelper.frequency)
	campaignsSearchTargetingHandlerHelper[p]='';

campaignsSearchTargetingHandlerHelper.UT={};

campaignsSearchTargetingHandlerHelper.UTType={
	'UTNot':'',
	'categoryID':'',
	'visits':'',
	'timeout':'',
};

for(i=campaignsSearchTargetingHandlerHelper.dUTMinConditions;i<=campaignsSearchTargetingHandlerHelper.dUTMaxConditions;i++)
	for(p in campaignsSearchTargetingHandlerHelper.UTType){
		campaignsSearchTargetingHandlerHelper.UT[p+i]='';
		campaignsSearchTargetingHandlerHelper.UT[p+'P'+i]='';
	}

campaignsSearchTargetingHandlerHelper.UTLogic='';
campaignsSearchTargetingHandlerHelper.UTLogicP='';

campaignsSearchTargetingHandlerHelper.countries='';
campaignsSearchTargetingHandlerHelper.countryIsSet='';

campaignsSearchTargetingHandlerHelper.statesRU='';
campaignsSearchTargetingHandlerHelper.statesRUIsSet='';

campaignsSearchTargetingHandlerHelper.statesUA='';
campaignsSearchTargetingHandlerHelper.statesUAIsSet='';

campaignsSearchTargetingHandlerHelper.statesUS='';
campaignsSearchTargetingHandlerHelper.statesUSIsSet='';

campaignsSearchTargetingHandlerHelper.allStatesUS=[
	22825812,48933208,92761409,120943388,149533085,241644024,260339076,293792296,
	329721516,348840629,384773681,454399702,487375978,516574354,533530145,544323248,
	618330705,656393291,731012331,793344766,819776474,872700717,987747103,993826659,
	1047996700,1057210297,1253386128,1279818723,1303068575,1343963711,1358908656,1360791692,
	1397364766,1450298517,1452655194,1504622838,1526486069,1553296509,1569820716,1618685999,
	1621049056,1663724046,1773999856,1805347990,1810411648,1899413467,1963562753,2021868818,
	2067141116,2068172266,2103222102,2103388596,2141019421
];

campaignsSearchTargetingHandlerHelper.cities={}
campaignsSearchTargetingHandlerHelper.citiesIsSet={}

for(var i=0; i<campaignsSearchTargetingHandlerHelper.allStatesUS.length;i++){
	campaignsSearchTargetingHandlerHelper.cities[campaignsSearchTargetingHandlerHelper.allStatesUS[i]]='';
	campaignsSearchTargetingHandlerHelper.citiesIsSet[campaignsSearchTargetingHandlerHelper.allStatesUS[i]]='';
}


campaignsSearchTargetingHandlerHelper.filters=['frequency','behaviour','time','day','geo'];
for(var  i=0;i<campaignsSearchTargetingHandlerHelper.filters.length;i++)
	campaignsSearchTargetingHandlerHelper['is'+campaignsSearchTargetingHandlerHelper.filters[i]+'filter']='';


campaignsSearchTargetingHandlerHelper.execute=function(){
	if (!campaignsSearchTargetingHandlerHelper.getAllIDs()) return;

	var request={
		action:'addCampaignsSearchTargetingRequest',
		hours:campaignsSearchTargetingHandlerHelper.hours,
		days:campaignsSearchTargetingHandlerHelper.days
	};

	for(p in campaignsSearchTargetingHandlerHelper.frequency)
		request[p]=campaignsSearchTargetingHandlerHelper[p];

	for(i=campaignsSearchTargetingHandlerHelper.dUTMinConditions;i<=campaignsSearchTargetingHandlerHelper.dUTMaxConditions;i++)
		for(p in campaignsSearchTargetingHandlerHelper.UTType){
			request[p+i]=campaignsSearchTargetingHandlerHelper.UT[p+i];
			request[p+'P'+i]=campaignsSearchTargetingHandlerHelper.UT[p+'P'+i];
		}

	request['UTLogic']=campaignsSearchTargetingHandlerHelper.UTLogic;
	request['UTLogicP']=campaignsSearchTargetingHandlerHelper.UTLogicP;

	request['countries']=campaignsSearchTargetingHandlerHelper.countries;
	request['countryIsSet']=campaignsSearchTargetingHandlerHelper.countryIsSet;

	request['statesRU']=campaignsSearchTargetingHandlerHelper.statesRU;
	request['statesRUIsSet']=campaignsSearchTargetingHandlerHelper.statesRUIsSet;

	request['statesUA']=campaignsSearchTargetingHandlerHelper.statesUA;
	request['statesUAIsSet']=campaignsSearchTargetingHandlerHelper.statesUAIsSet;

	request['statesUS']=campaignsSearchTargetingHandlerHelper.statesUS;
	request['statesUSIsSet']=campaignsSearchTargetingHandlerHelper.statesUSIsSet;

	for(i=0; i<campaignsSearchTargetingHandlerHelper.allStatesUS.length;i++){
		request['city-'+campaignsSearchTargetingHandlerHelper.allStatesUS[i]]=campaignsSearchTargetingHandlerHelper.cities[campaignsSearchTargetingHandlerHelper.allStatesUS[i]];
		request['city-'+campaignsSearchTargetingHandlerHelper.allStatesUS[i]+'IsSet']=campaignsSearchTargetingHandlerHelper.citiesIsSet[campaignsSearchTargetingHandlerHelper.allStatesUS[i]];
	}

	for(i=0;i<campaignsSearchTargetingHandlerHelper.filters.length;i++)
		request['is'+campaignsSearchTargetingHandlerHelper.ucfirst( campaignsSearchTargetingHandlerHelper.filters[i] )+'Filter']=campaignsSearchTargetingHandlerHelper['is'+campaignsSearchTargetingHandlerHelper.filters[i]+'filter'];

	$.ajax({
		type:'POST',
		url:'requestCampaignsSearchTargetingHelper.php',
		async:false,
		data:request
	})
	.done(
		function(data){
			if (data){
				myData=JSON.parse(data,function(key,value){
					var type;
					if(value&&typeof value==='object'){
						type=value.type;
						if(typeof type==='string'&&typeof window[type]==='function')
							return new (window[type])(value);
					}
					return value;
				});

				for(p in myData){
					if(p=='tmpTRequestID'){
						var tmpTRequestID=myData[p];
						if(document.URL.indexOf('superCampaigns.php')!='-1')
							document.forms['superCampaignsSearch'].elements['tmpTRequestID'].value=tmpTRequestID;
						else
							document.forms['campaignsSearch'].elements['tmpTRequestID'].value=tmpTRequestID;
					}
				}
			}
		}
	);
}

campaignsSearchTargetingHandlerHelper.getAllIDs=function(){
	var ids='';

	ids=$('#profile-resetTargetings-pocket').html();
	if(ids==='1') return false;

	var result=false;

	ids=$('#profile-time-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.hours=ids;
		result=true;
	}

	ids=$('#profile-day-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.days=ids;
		result=true;
	}

	ids=$('#profile-maxUniqueImpressions-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.maxUniqueImpressions=ids;
		result=true;
	}

	ids=$('#profile-maxUniqueClicks-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.maxUniqueClicks=ids;
		result=true;
	}

	for(p in campaignsSearchTargetingHandlerHelper.frequency){
		ids=$('#profile-'+p+'-pocket').html();
		if(ids!='-1'&&ids!=''){
			campaignsSearchTargetingHandlerHelper[p]=ids;
			result=true;
		}
	}

	for(i=campaignsSearchTargetingHandlerHelper.dUTMinConditions;i<=campaignsSearchTargetingHandlerHelper.dUTMaxConditions;i++)
		for(p in campaignsSearchTargetingHandlerHelper.UTType){
			ids=$('#profile-'+p+i+'-pocket').html();
			if(ids!='-1'&&ids!=''){
				campaignsSearchTargetingHandlerHelper.UT[p+i]=ids;
				result=true;
			}

			ids=$('#profile-'+p+'P'+i+'-pocket').html();
			if(ids!='-1'&&ids!=''){
				campaignsSearchTargetingHandlerHelper.UT[p+'P'+i]=ids;
				result=true;
			}
		}

	ids=$('#profile-UTLogic-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.UTLogic=ids;
		result=true;
	}

	ids=$('#profile-UTLogicP-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.UTLogicP=ids;
		result=true;
	}

	ids=$('#profile-countries[]-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.countries=ids;
		result=true;
	}

	ids=$('#profile-countries[]IsSet-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.countryIsSet=ids;
		result=true;
	}

	ids=$('#profile-state-'+campaignsSearchTargetingHandlerHelper.dAIP_russiaID+'-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.statesRU=ids;
		result=true;
	}

	ids=$('#profile-state-'+campaignsSearchTargetingHandlerHelper.dAIP_russiaID+'IsSet-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.statesRUIsSet=ids;
		result=true;
	}

	ids=$('#profile-state-'+campaignsSearchTargetingHandlerHelper.dAIP_ukraineID+'-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.statesUA=ids;
		result=true;
	}

	ids=$('#profile-state-'+campaignsSearchTargetingHandlerHelper.dAIP_ukraineID+'IsSet-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.statesUAIsSet=ids;
		result=true;
	}

	ids=$('#profile-state-'+campaignsSearchTargetingHandlerHelper.dAIP_USID+'-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.statesUS=ids;
		result=true;
	}

	ids=$('#profile-state-'+campaignsSearchTargetingHandlerHelper.dAIP_USID+'IsSet-pocket').html();
	if(ids!='-1'&&ids!=''){
		campaignsSearchTargetingHandlerHelper.statesUSIsSet=ids;
		result=true;
	}

	for(i=0; i<campaignsSearchTargetingHandlerHelper.allStatesUS.length;i++){
		ids=$('#profile-city-'+campaignsSearchTargetingHandlerHelper.allStatesUS[i]+'-pocket').html();
		if(ids!='-1'&&ids!=''){
			campaignsSearchTargetingHandlerHelper.cities[campaignsSearchTargetingHandlerHelper.allStatesUS[i]]=ids;
			result=true;
		}

		ids=$('#profile-city-'+campaignsSearchTargetingHandlerHelper.allStatesUS[i]+'IsSet-pocket').html();
		if(ids!='-1'&&ids!=''){
			campaignsSearchTargetingHandlerHelper.citiesIsSet[campaignsSearchTargetingHandlerHelper.allStatesUS[i]]=ids;
			result=true;
		}
	}

	for(i=0;i<campaignsSearchTargetingHandlerHelper.filters.length;i++){
		ids=$('#profile-is'+campaignsSearchTargetingHandlerHelper.ucfirst( campaignsSearchTargetingHandlerHelper.filters[i] )+'Filter-pocket').html();
		if(ids!='-1'&&ids!=''){
			campaignsSearchTargetingHandlerHelper['is'+campaignsSearchTargetingHandlerHelper.filters[i]+'filter']=ids;
			result=true;
		}
	}

	return result;
}

campaignsSearchTargetingHandlerHelper.ucfirst=function(str){
	//original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	return str.charAt(0).toUpperCase()+str.substr(1,str.length-1);
}
