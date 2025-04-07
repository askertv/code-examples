$(document).ready(function(){
	// ADVERTISERS
	// Init
	var allAdvCnt=0;
	if($('#advertiserID').html()!=null){
		if($('#advertiserID').val()==0){
			allAdvCnt=$('#advertiserID').prop('options').length-2;
		}else{
			allAdvCnt=$('#advertiserID').prop('options').length-1;
		}
	}
	var additionalAdvertisersInForm=$('form').prop('elements').additionalAdvertiserIDs.value;
	$('#selected-advertisers').html(additionalAdvertisersInForm);
	var mainAdvSelected=$('#advertiserID').val();
	if(mainAdvSelected!=0){
		$('.additional-advertisers-block').show();
		$('.additional-advertiser-addlink').show();
	}else{
		$('.additional-advertisers-block').hide();
		$('.additional-advertiser-addlink').hide();
	}
	// Static elements
	$('.additional-advertiser-element-delete').click(function(){
		var delElSelect=$(this).prev().find('select');
		var delElOptions=delElSelect.prop('options');
		var delElValue = delElSelect.val();
		var delElText=delElSelect.find('option:selected').text();
		var advSelected=$('#selected-advertisers').html();

		if(advSelected!=''){
			var advSelectedArray=advSelected.split(',');
			for(i=0;i<advSelectedArray.length;i++){
				if(advSelectedArray[i]==delElValue){
					advSelectedArray.splice(i,1);
				}
			}
			$('#selected-advertisers').html(advSelectedArray.join(','));
			$('form').prop('elements').additionalAdvertiserIDs.value=advSelectedArray.join(',');
		}
		var addAdvCnt2=$('#selected-advertisers-count').html();
		if(addAdvCnt2==''){
			addAdvCnt2=0;
		}
		var addAdvCnt2=parseInt(addAdvCnt2);
		addAdvCnt2--;
		//$('#selected-advertisers-count').html(addAdvCnt2);
		//$(this).parent().html('<span>' + delElText + ' [сотрудник удалён]</span>');
		$(this).parent().remove();

	});
	$('.additional-advertiser-element').find('span').find('select').mousedown(function(){
		if ($('#changed-advertiser').html()==''){
			$('#changed-advertiser').html($(this).val());
		}
	});
	$('.additional-advertiser-element').find('span').find('select').change(function(){
		var advSelected=$('#selected-advertisers').html();
		var nextAdvSelected=$(this).val();
		var options=$(this).prop('options');
		var advOldValue=$('#changed-advertiser').html();
		var newAdvSelected='';
		var tail1='';
		var tail2='';
		var yetIsSelected=false;
		if(advSelected!=''){
			var advSelectedArray=advSelected.split(',');
			var advSelectedArray1=advSelectedArray;
			var advSelectedArray2=advSelectedArray;
			for(i=0;i<advSelectedArray.length;i++){
				if(advSelectedArray[i]==nextAdvSelected){
					var yetIsSelected=true;
					advSelectedArray2.splice(i,1);
					tail1=advSelectedArray[i];
				}
				if(advSelectedArray[i]==advOldValue){
					advSelectedArray1.splice(i,1);
					tail2=advSelectedArray[i];
				}
			}
			newAdvSelected=advSelectedArray1.join(',');
		}
		if(yetIsSelected){
			var advReplaced=advSelectedArray2.join(',');
			if(advReplaced==''){
				//advReplaced=tail2;
			}
			$('#selected-advertisers').html(advReplaced);
			$('form').prop('elements').additionalAdvertiserIDs.value=advReplaced;
		}else{
			if(newAdvSelected!=''){
				newAdvSelected+=',';
			}
			newAdvSelected+=nextAdvSelected;
			$('#selected-advertisers').html(newAdvSelected);
			$('form').prop('elements').additionalAdvertiserIDs.value=newAdvSelected;
		}
		$('#changed-advertiser').html('');
	});
	// Dynamic elements
	$('.additional-advertiser-addlink').click(function(){
		var addAdvCnt=$('#selected-advertisers-count').html();
		if(addAdvCnt==''){
			addAdvCnt=0;
		}
		var addAdvCnt=parseInt(addAdvCnt);
		if(allAdvCnt==addAdvCnt){
			return;
		}
		var newEl=$('#additional-advertiser').clone();
		newEl.addClass('new-element');
		newEl.prop('id','additional-advertiser-element-' + addAdvCnt/*'addAdv'+addAdvCnt*/);
		// newEl: onDelete
		newEl.find('.additional-advertiser-element-delete').click(function(){
			var delElOptions=$(this).prev().find('select').prop('options');
			var delElValue=$(this).prev().find('select').val();
			var advSelected=$('#selected-advertisers').html();
			if(advSelected!=''){
				var advSelectedArray=advSelected.split(',');
				for(i=0;i<advSelectedArray.length;i++){
					if(advSelectedArray[i]==delElValue){
						advSelectedArray.splice(i,1);
					}
				}
				$('#selected-advertisers').html(advSelectedArray.join(','));
				$('form').prop('elements').additionalAdvertiserIDs.value=advSelectedArray.join(',');
			}
			var addAdvCnt2=$('#selected-advertisers-count').html();
			if(addAdvCnt2==''){
				addAdvCnt2=0;
			}
			var addAdvCnt2=parseInt(addAdvCnt2);
			addAdvCnt2--;
			$('#selected-advertisers-count').html(addAdvCnt2);
			$(this).parent().remove();
		});
		// newEl: BeforeOnChange
		newEl.find('span').find('select').mousedown(function(){
			if ($('#changed-advertiser').html()==''){
				$('#changed-advertiser').html($(this).val());
			}
		});
		// newEl: onChange
		newEl.find('span').find('select').change(function(){
			var advSelected=$('#selected-advertisers').html();
			var nextAdvSelected=newEl.find('span').find('select').val();
			var options=newEl.find('span').find('select').prop('options');
			var advOldValue=$('#changed-advertiser').html();
			var newAdvSelected='';
			var tail1='';
			var tail2='';
			var yetIsSelected=false;
			if(advSelected!=''){
				var advSelectedArray=advSelected.split(',');
				var advSelectedArray1=advSelectedArray;
				var advSelectedArray2=advSelectedArray;
				for(i=0;i<advSelectedArray.length;i++){
					if(advSelectedArray[i]==nextAdvSelected){
						var yetIsSelected=true;
						advSelectedArray2.splice(i,1);
						tail1=advSelectedArray[i];
					}
					if(advSelectedArray[i]==advOldValue){
						advSelectedArray1.splice(i,1);
						tail2=advSelectedArray[i];
					}
				}
				newAdvSelected=advSelectedArray1.join(',');
			}
			if(yetIsSelected){
				var advReplaced=advSelectedArray2.join(',');
				if(advReplaced==''){
					//advReplaced=tail2;
				}
				$('#selected-advertisers').html(advReplaced);
				$('form').prop('elements').additionalAdvertiserIDs.value=advReplaced;
			}else{
				if(newAdvSelected!=''){
					newAdvSelected+=',';
				}
				newAdvSelected+=nextAdvSelected;
				$('#selected-advertisers').html(newAdvSelected);
				$('form').prop('elements').additionalAdvertiserIDs.value=newAdvSelected;
			}
		});
		// newEl: Selected index
		var advSelected=$('#selected-advertisers').html();
		var advSelectedArray=advSelected.split(',');
		var newElOptions=newEl.find('span').find('select').prop('options');
		var indexes=new Array();
		for(i=0;i<newElOptions.length;i++){
			indexes[i]=0;
			for(j=0;j<advSelectedArray.length;j++){
				if(advSelectedArray[j]==newElOptions[i].value){
					indexes[i]=1;
				}
			}
			if($('#advertiserID').val()==newElOptions[i].value){
				indexes[i]=1;
			}
		}
		var selectedIndex=0;
		for(i=0;i<indexes.length;i++){
			if(indexes[i]==0){
				selectedIndex=i;
				break;
			}
		}
		newElOptions.selectedIndex=selectedIndex;
		if(advSelected!=''){
			advSelected+=',';
		}
		advSelected+=newElOptions[selectedIndex].value;
		$('#selected-advertisers').html(advSelected);
		$('form').prop('elements').additionalAdvertiserIDs.value=advSelected;
		// newEl: Show
		$('.additional-advertisers-title').show(200);
		$('.additional-advertisers-block').append(newEl);
		$('.new-element').show(200);
		addAdvCnt++;
		$('#selected-advertisers-count').html(addAdvCnt);
	});
	// Change main advertiser
	$('#advertiserID').change(function(){
		$('.new-element').each(function(){
			$(this).find('span').removeClass('selected-1');
		});
		var val=$(this).val();
		if(val!=0){
			$('.new-element').each(function(){
				var selectElement=$(this).find('span').find('select');
				var currentOptions=selectElement.prop('options');
				for(i=0;i<currentOptions.length;i++){
					if(currentOptions[i].value==val){
						if(currentOptions[i].selected){
							selectElement.parent().addClass('selected-1');
						}else{
							currentOptions[i].parentNode.removeChild(currentOptions[i]);
						}
					}
				}
			});
			$('.additional-advertisers-block').show(300);
			$('.additional-advertiser-addlink').show(300);
		}else{
			$('.additional-advertisers-block').hide(300);
			$('.additional-advertiser-addlink').hide(300);
		}
	});

	//--------------------------------------------------------------------------

	// ASSISTANTS
	// Init
	var allAstCnt=0;
	if($('#assistantID').html()!=null){
		allAstCnt=$('#assistantID').prop('options').length-2;
	}
	var additionalAssistantsInForm=$('form').prop('elements').additionalAssistantIDs.value;
	$('#selected-assistants').html(additionalAssistantsInForm);
	var mainAstSelected=$('#assistantID').val();
    var additionalAssistants = $('.additional-assistant-element');
    //если нет допов и не выбран основной - скрываем селект для добавления допов
	if(mainAstSelected!=0 || additionalAssistants.length > 0){
		$('.additional-assistants-block').show();
		$('.additional-assistant-addlink').show();
	}else{
		$('.additional-assistants-block').hide();
		$('.additional-assistant-addlink').hide();
	}
	// Static elements
	$('.additional-assistant-element-delete').click(function(){
		var delElSelect=$(this).prev().find('select');
		var delElOptions=delElSelect.prop('options');
		var delElValue=delElSelect.val();
		var delElText=delElSelect.find('option:selected').text();
		var astSelected=$('#selected-assistants').html();
		if(astSelected!=''){
			var astSelectedArray=astSelected.split(',');
			for(i=0;i<astSelectedArray.length;i++){
				if(astSelectedArray[i]==delElValue){
					astSelectedArray.splice(i,1);
				}
			}
			$('#selected-assistants').html(astSelectedArray.join(','));
			$('form').prop('elements').additionalAssistantIDs.value=astSelectedArray.join(',');
		}
		var addAstCnt2=$('#selected-assistants-count').html();
		if(addAstCnt2==''){
			addAstCnt2=0;
		}
		var addAstCnt2=parseInt(addAstCnt2);
		addAstCnt2--;
		//$('#selected-assistants-count').html(addAstCnt2);
		//$(this).parent().html('<span>' + delElText + ' [сотрудник удалён]</span>');
		$(this).parent().remove();
	});
	$('.additional-assistant-element').find('span').find('select').mousedown(function(){
		if ($('#changed-assistant').html()==''){
			$('#changed-assistant').html($(this).val());
		}
	});
	$('.additional-assistant-element').find('span').find('select').change(function(){
		var astSelected=$('#selected-assistants').html();
		var nextAstSelected=$(this).val();
		var options=$(this).prop('options');
		var astOldValue=$('#changed-assistant').html();
		var newAstSelected='';
		var tail1='';
		var tail2='';
		var yetIsSelected=false;
		if(astSelected!=''){
			var astSelectedArray=astSelected.split(',');
			var astSelectedArray1=astSelectedArray;
			var astSelectedArray2=astSelectedArray;
			for(i=0;i<astSelectedArray.length;i++){
				if(astSelectedArray[i]==nextAstSelected){
					var yetIsSelected=true;
					astSelectedArray2.splice(i,1);
					tail1=astSelectedArray[i];
				}
				if(astSelectedArray[i]==astOldValue){
					astSelectedArray1.splice(i,1);
					tail2=astSelectedArray[i];
				}
			}
			newAstSelected=astSelectedArray1.join(',');
		}
		if(yetIsSelected){
			var astReplaced=astSelectedArray2.join(',');
			if(astReplaced==''){
				//astReplaced=tail2;
			}
			$('#selected-assistants').html(astReplaced);
			$('form').prop('elements').additionalAssistantIDs.value=astReplaced;
		}else{
			if(newAstSelected!=''){
				newAstSelected+=',';
			}
			newAstSelected+=nextAstSelected;
			$('#selected-assistants').html(newAstSelected);
			$('form').prop('elements').additionalAssistantIDs.value=newAstSelected;
		}
		$('#changed-assistant').html('');
	});
	// Dynamic elements
	$('.additional-assistant-addlink').click(function(){
		var addAstCnt=$('#selected-assistants-count').html();
		if(addAstCnt==''){
			addAstCnt=0;
		}
		var addAstCnt=parseInt(addAstCnt);
		if(allAstCnt==addAstCnt){
			return;
		}
		var newEl=$('#additional-assistant').clone();
		newEl.addClass('new-element-2');
		newEl.prop('id',' '/*'addAdv'+addAdvCnt*/);
		// newEl: onDelete
		newEl.find('.additional-assistant-element-delete').click(function(){
			var delElOptions=$(this).prev().find('select').prop('options');
			var delElValue=$(this).prev().find('select').val();
			var astSelected=$('#selected-assistants').html();
			if(astSelected!=''){
				var astSelectedArray=astSelected.split(',');
				for(i=0;i<astSelectedArray.length;i++){
					if(astSelectedArray[i]==delElValue){
						astSelectedArray.splice(i,1);
					}
				}
				$('#selected-assistants').html(astSelectedArray.join(','));
				$('form').prop('elements').additionalAssistantIDs.value=astSelectedArray.join(',');
			}
			var addAstCnt2=$('#selected-assistants-count').html();
			if(addAstCnt2==''){
				addAstCnt2=0;
			}
			var addAstCnt2=parseInt(addAstCnt2);
			addAstCnt2--;
			$('#selected-assistants-count').html(addAstCnt2);
			$(this).parent().remove();
		});
		// newEl: BeforeOnChange
		newEl.find('span').find('select').mousedown(function(){
			if ($('#changed-assistant').html()==''){
				$('#changed-assistant').html($(this).val());
			}
		});
		// newEl: onChange
		newEl.find('span').find('select').change(function(){
			var astSelected=$('#selected-assistants').html();
			var nextAstSelected=newEl.find('span').find('select').val();
			var options=newEl.find('span').find('select').prop('options');
			var astOldValue=$('#changed-assistant').html();
			var newAstSelected='';
			var tail1='';
			var tail2='';
			var yetIsSelected=false;
			if(astSelected!=''){
				var astSelectedArray=astSelected.split(',');
				var astSelectedArray1=astSelectedArray;
				var astSelectedArray2=astSelectedArray;
				for(i=0;i<astSelectedArray.length;i++){
					if(astSelectedArray[i]==nextAstSelected){
						var yetIsSelected=true;
						astSelectedArray2.splice(i,1);
						tail1=astSelectedArray[i];
					}
					if(astSelectedArray[i]==astOldValue){
						astSelectedArray1.splice(i,1);
						tail2=astSelectedArray[i];
					}
				}
				newAstSelected=astSelectedArray1.join(',');
			}
			if(yetIsSelected){
				var astReplaced=astSelectedArray2.join(',');
				if(astReplaced==''){
					//astReplaced=tail2;
				}
				$('#selected-assistants').html(astReplaced);
				$('form').prop('elements').additionalAssistantIDs.value=astReplaced;
			}else{
				if(newAstSelected!=''){
					newAstSelected+=',';
				}
				newAstSelected+=nextAstSelected;
				$('#selected-assistants').html(newAstSelected);
				$('form').prop('elements').additionalAssistantIDs.value=newAstSelected;
			}
		});
		// newEl: Selected index
		var astSelected=$('#selected-assistants').html();
		var astSelectedArray=astSelected.split(',');
		var newElOptions=newEl.find('span').find('select').prop('options');
		var indexes=new Array();
		for(i=0;i<newElOptions.length;i++){
			indexes[i]=0;
			for(j=0;j<astSelectedArray.length;j++){
				if(astSelectedArray[j]==newElOptions[i].value){
					indexes[i]=1;
				}
			}
			if($('#assistantID').val()==newElOptions[i].value){
				indexes[i]=1;
			}
		}
		var selectedIndex=0;
		for(i=0;i<indexes.length;i++){
			if(indexes[i]==0){
				selectedIndex=i;
				break;
			}
		}
		newElOptions.selectedIndex=selectedIndex;
		if(astSelected!=''){
			astSelected+=',';
		}
		astSelected+=newElOptions[selectedIndex].value;
		$('#selected-assistants').html(astSelected);
		$('form').prop('elements').additionalAssistantIDs.value=astSelected;
		// newEl: Show
		$('.additional-assistants-title').show(200);
		$('.additional-assistants-block').append(newEl);
		$('.new-element-2').show(200);
		addAstCnt++;
		$('#selected-assistants-count').html(addAstCnt);
	});

	// Change main assistant
	$('#assistantID').change(function(){
		$('.new-element-2').each(function(){
			$(this).find('span').removeClass('selected-1');
		});
		var val=$(this).val();
        var additionalAssistants = $('.additional-assistant-element');
		if(val!=0 || additionalAssistants.length > 0){
			$('.new-element-2').each(function(){
				var selectElement=$(this).find('span').find('select');
				var currentOptions=selectElement.prop('options');
				for(i=0;i<currentOptions.length;i++){
					if(currentOptions[i].value==val){
						if(currentOptions[i].selected){
							selectElement.parent().addClass('selected-1');
						}else{
							currentOptions[i].parentNode.removeChild(currentOptions[i]);
						}
					}
				}
			});
			$('.additional-assistants-block').show(300);
			$('.additional-assistant-addlink').show(300);
		}else{
			$('.additional-assistants-block').hide(300);
			$('.additional-assistant-addlink').hide(300);
		}
	});
});
