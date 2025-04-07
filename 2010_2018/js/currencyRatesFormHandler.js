function warningAlert() {
	alert('Разница курсов превышает 10%. Данные настройки не могут быть сохранены.');
}

function noticeConfirm() {
	var confirmResult = confirm('Разница курсов превышает 5%. Всё равно сохранить?');
	if (confirmResult) document.forms['form'].submit();
}

function jsPopUp(url, width, height, content) {
	var left = Math.abs(Math.ceil((screen.width - width)/2));
	var top = Math.abs(Math.ceil((screen.height - height)/2));
	var str = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,'+'width='+width+',height='+height+',left='+left+',top='+top;
	var win = window.open(url, "_blank", str);
	if (win != null && win.opener == null) {
		win.opener = window;
	}
}

$(document).ready(function() {
	var oldRate = parseFloat( $('#oldRate').html().replace(/,/,'.') );
	var raiffeisenRate = parseFloat( $('#raiffeisenRate').html().replace(/,/,'.') );
	var linkContainer=document.querySelectorAll('a[href*="submit()"]');

	function disableSubmit() {
		var origHref=linkContainer.item(0).href;
		if(origHref.indexOf('submit')!=-1)
			linkContainer.item(0).href=origHref.replace(/document\.forms\['form'\]\.submit\(\);/,'');
	}

	function enableSubmit() {
		var origHref=linkContainer.item(0).href;
		if(origHref.indexOf('submit')==-1)
			linkContainer.item(0).href+="document.forms['form'].submit();";
	}

	function addWarningAlert() {
		var origHref=linkContainer.item(0).href;
		if(origHref.indexOf('warningAlert')==-1)
			linkContainer.item(0).href='javascript:warningAlert();';
	}

	function deleteWarningAlert() {
		var origHref=linkContainer.item(0).href;
		if(origHref.indexOf('warningAlert')!=-1)
			linkContainer.item(0).href=origHref.replace(/warningAlert\(\);/,'');
	}

	function addNoticeConfirm() {
		var origHref=linkContainer.item(0).href;
		if(origHref.indexOf('noticeConfirm')==-1)
			linkContainer.item(0).href='javascript:noticeConfirm();';
	}

	function deleteNoticeConfirm() {
		var origHref=linkContainer.item(0).href;
		if(origHref.indexOf('noticeConfirm')!=-1)
			linkContainer.item(0).href=origHref.replace(/noticeConfirm\(\);/,'');
	}

	function isNewRateTooDiffer(rate) {
		return rate >= oldRate * 1.10 || rate <= oldRate * 0.90;
	}

	function isNewRateDiffer(rate) {
		return rate >= oldRate * 1.05 || rate <= oldRate * 0.95;
	}

	function checkErrors() {
		var mode = '';
		var comment = '';

		$('input[name="mode"]').each(function(){
			if ($(this).prop('checked')) mode = $(this).val();
		});

		if ($('#rateBeforeChange').html() === '')
			$('#rateBeforeChange').html('[до изменения: '+oldRate+']');


		if (mode === 'auto') {
			var relativeDeviation = $('select[name="relativeDeviation"]').val();
			var fixedDeviation = parseFloat( $('#fixedDeviation').val().replace(/,/,'.') );
			var newRate = raiffeisenRate * relativeDeviation + fixedDeviation;

			comment = 'автоматический режим: y = '+relativeDeviation+' * '+raiffeisenRate+(fixedDeviation < 0 ? ' - ' : ' + ')+Math.abs(fixedDeviation);

			if (isNewRateTooDiffer(newRate)) {
				deleteNoticeConfirm();
				addWarningAlert();
			} else if (isNewRateDiffer(newRate)) {
				deleteWarningAlert();
				addNoticeConfirm();
			} else {
				deleteWarningAlert();
				deleteNoticeConfirm();
				enableSubmit();
			}

			$('#currentRate').html(newRate.toFixed(2));
		}

		if (mode === 'manual') {
			comment = 'ручной режим';
			var manualRate = parseFloat( $('#manualRate').val().replace(/,/,'.') );

			if (isNewRateTooDiffer(manualRate)) {
				deleteNoticeConfirm();
				addWarningAlert();
			} else if (isNewRateDiffer(manualRate)) {
				deleteWarningAlert();
				addNoticeConfirm();
			} else {
				deleteWarningAlert();
				deleteNoticeConfirm();
				enableSubmit();
			}

			$('#currentRate').html(manualRate);
		}

		$('#currentRateComment').html(comment);
	}

	$('select[name="currency"]').change(function(){
		var hrefTo = '';

		if(location.href.indexOf('?currency=')!=-1)
			hrefTo = location.href.replace(/.php\?currency=.{3}/,'.php?currency='+$(this).val());
		else
			hrefTo = location.href.replace(/.php/,'.php?currency='+$(this).val());

		location.replace(hrefTo);
	});

	$('input[name="mode"]').change(function(){
		checkErrors();
	});

	$('select[name="relativeDeviation"]').change(function(){
		checkErrors();
	});

	$('input[name="fixedDeviation"]').keyup(function(){
		checkErrors();
	});

	$('#manualRate').keyup(function(){
		checkErrors();
	});

	$('#raiffeisenRateLog').click(function(){
		var url='currencyRateLog.php?currency='+$('select[name="currency"]').val();
		jsPopUp(url,800,800);
	});

	$('#adfoxRateLog').click(function(){
		var url='currencyRateLog.php?sourceID=1&currency='+$('select[name="currency"]').val();
		jsPopUp(url,800,800);
	});
});
