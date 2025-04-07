$(document).ready(function() {
    var currentCampaignKindID = function(){};

    if ($('#kindID').length) {
        currentCampaignKindID[0] = {
            'value': $('#kindID').val(),
            'title': $('#kindID').find(":selected").text()
        };
    }

    // Обработчик элемента select "Тип сессии", на форме редактирования кампании
    function handleSessionType() {
        var sessionTypeElement = $('#sessionType');
        var kindIDElement = $('#kindID');
        var sessionType = parseInt(sessionTypeElement.val());

        if (
            sessionType === sessionTypeOnPeriod
            ||
            sessionType === sessionTypeOnPage
        ) {
            kindIDElement.val(campaignKindFirstLook);
            kindIDElement.change();
        }
    }

    if ($('#sessionType').length) {
        $('#sessionType').change(function() {
            handleSessionType();
        });
    }

    // Обработчик элемента select "Уровень", на страницах Монетизации
    function handleLevel(campaignID = 0) {
        if (campaignID === 0) {
            var priorityElement = $('#priority');
            var tmpPriorityElement = $('#tmpPriority');
            var levelElement = $('#level');
        } else {
            var priorityElement = $('#campaign' + campaignID + '_priority');
            var tmpPriorityElement = $('#' + campaignID + '_tmpPriority');
            var levelElement = $('#campaign' + campaignID + '_level');
        }

        if (parseInt(priorityElement.val())) {
            tmpPriorityElement.html(priorityElement.val());
        }

        if (checkOwnerLevelIsAuto(levelElement.val())) {
            priorityElement.prop('disabled', true);
            priorityElement.val(autoPriorityText);
        } else {
            priorityElement.prop('disabled', false);
            priorityElement.val(tmpPriorityElement.html());
        }
    }

    if ($('#tmpPriority').length) {
        $('#level').change(function(){
            handleLevel();
        });
    }

    var isChangeColors = $('#dynamicAllocation').length || $('[id^="campaign"]').length;

    if ($('#ignoredCpm').length) {
        $('#ignoredCpm').prop('disabled', true);
    }

    // Восстановление названия опции, которое было изменено включенным чекбоксом "Динамическая монетизация", 
    // либо, выставление вида "Динамическая монетизация"
    function changeLevel(campaignID = 0) {
        if (campaignID === 0) {
            var kindIDElement = $('#kindID');
            var levelElement = $('#level');
        } else {
            var kindIDElement = $('#campaign' + campaignID + '_kindID');
            var levelElement = $('#campaign' + campaignID + '_level');
        }

        var kindID = parseInt(kindIDElement.val());
        var levelValue = minCampaignLevel;
        var levelTitle = minCampaignLevelTitle;

        if (kindID === campaignKindPromotional) {
            levelValue = promotionalCampaignMinLevelValue;
            levelTitle = levelValue + 1;
        }

        levelTitle = '<' + levelTitle + '>';

        levelElement.val(levelValue);
        levelElement.find(":selected").text(levelTitle);

        $.each(levelElement.prop('options'), function(){
            if ($(this).text() === commercialCampaignLevelTitle) {
                var value = parseInt($(this).val());
                var title = value + 1;

                if (value === minCampaignLevel) {
                    title = minCampaignLevelTitle;
                }

                title = '<' + title + '>';

                $(this).text(title);
            }
        });
    }

    // Обработчик элемента select "Вид кампании"
    function handleKindIDSelect(campaignID = 0, changeSelectedLevel = false) {
        let extMonetizers = $('#extMonetizers');
        if (campaignID === 0) {
            var dynamicAllocationElement = $('#dynamicAllocation');
            var kindIDElement = $('#kindID');
            var levelElement = $('#level');
            var cpmElement = $('#cpm');
            var priorityElement = $('#priority');
            var tmpPriorityElement = $('#tmpPriority');
            var rotationMethodIDElement = $('#rotationMethodID');
            var sessionTypeElement = $('#sessionType');
        } else {
            var dynamicAllocationElement = $('#campaign' + campaignID + '_dynamicAllocation');
            var kindIDElement = $('#campaign' + campaignID + '_kindID');
            var levelElement = $('#campaign' + campaignID + '_level');
            var cpmElement = $('#campaign' + campaignID + '_cpm');
            var priorityElement = $('#campaign' + campaignID + '_priority');
            var tmpPriorityElement = $('#' + campaignID + '_tmpPriority');
            var rotationMethodIDElement = $('#campaign' + campaignID + '_rotationMethodID');
            var sessionTypeElement = $('#campaign' + campaignID + '_sessionType');
        }

        var idPrefix = '[id^="campaign' + campaignID + '"]';

        var kindID = parseInt(kindIDElement.val());

        if (dynamicAllocationElement.length && dynamicAllocationElement.prop('checked')) {
            kindID = campaignKindCommercial;
        }

        rotationMethodIDElement.removeAttr('disabled');

        switch (kindID) {
            case campaignKindCommercial:
                if (!dynamicAllocationElement.length) {
                    levelElement.find(":selected").text(commercialCampaignLevelTitle);
                    levelElement.prop('disabled', true);
                }

                if (cpmElement.length) {
                    cpmElement.removeProp('disabled');
                }

                if (rotationMethodIDElement.length) {
                    rotationMethodIDElement.val(rotationMethodPriority);
                    rotationMethodIDElement.change();
                    rotationMethodIDElement.prop('disabled', true);
                }

                if (sessionTypeElement.length) {
                    sessionTypeElement.val(sessionTypeDisabled);
                }

                priorityElement.prop('disabled', true);

                if (tmpPriorityElement.length) {
                    priorityElement.val(tmpPriorityElement.html());
                }

                if (isChangeColors) {
                    if (campaignID === 0) {
                        $('.tableData,.tableDataLeft,.tableData2,.tableDataLeft2').
                            css('background-color', campaignKindCommercialColor);
                    } else {
                        $(idPrefix).parent().css('background-color', campaignKindCommercialColor);
                    }
                }

                extMonetizers.removeProp('disabled');
                extMonetizers.change();
                break;

            case campaignKindPromotional:
                if (!dynamicAllocationElement.length) {
                    levelElement.prop('disabled', false);
                }

                if (cpmElement.length) {
                    cpmElement.prop('disabled', true);
                }

                if (rotationMethodIDElement.length) {
                    rotationMethodIDElement.val(rotationMethodPriority);
                    rotationMethodIDElement.change();
                }

                if (sessionTypeElement.length) {
                    sessionTypeElement.val(sessionTypeDisabled);
                }

                priorityElement.prop('disabled', false);

                if (tmpPriorityElement.length) {
                    priorityElement.val(tmpPriorityElement.html());
                }

                if (isChangeColors) {
                    if (campaignID === 0) {
                        $('.tableData,.tableDataLeft,.tableData2,.tableDataLeft2').
                            css('background-color', campaignKindPromotionalColor);
                    } else {
                        $(idPrefix).parent().css('background-color', campaignKindPromotionalColor);
                    }
                }

                // Динамическая замена названий и значений уровней для "Промо"
                $.each(levelElement.prop('options'), function(){
                    var value = parseInt($(this).val());
                    var title = '';

                    if (value < commercialCampaignLevel) {
                        value += campaignLevelsOffset;

                        title = value + 1;
                        title = '<' + title + '>';

                        $(this).val(value);
                        $(this).text(title);
                    }
                });

                if (changeSelectedLevel) {
                    levelElement.val(promotionalCampaignMinLevelValue);

                    if (!dynamicAllocationElement.length) {
                        changeLevel(campaignID);
                    }
                }
                extMonetizers.val(0);
                extMonetizers.attr('disabled', true);

                break;

            default:
                extMonetizers.val(0);
                extMonetizers.attr('disabled', true);

                if (!dynamicAllocationElement.length) {
                    levelElement.prop('disabled', false);
                }

                if (cpmElement.length) {
                    cpmElement.prop('disabled', true);
                }

                priorityElement.prop('disabled', false);

                if (isChangeColors) {
                    if (campaignID === 0) {
                        $('.tableData,.tableDataLeft').
                            css('background-color', colorGrey);

                        $('.tableData2,.tableDataLeft2').
                            css('background-color', colorWhite);
                    } else {
                        $('.tableData,.tableDataLeft').
                            find(idPrefix).parent().
                            css('background-color', colorGrey);

                        $('.tableData2,.tableDataLeft2').
                            find(idPrefix).parent().
                            css('background-color', colorWhite);
                    }
                }

                // Динамическая замена названий и значений уровней для "Гарантии"
                $.each(levelElement.prop('options'), function(){
                    var value = parseInt($(this).val());
                    var title = '';

                    if (value > maxCampaignLevel) {
                        value -= campaignLevelsOffset;

                        title = value + 1;

                        if (value === minCampaignLevel) {
                            title = minCampaignLevelTitle;
                        }

                        title = '<' + title + '>';

                        $(this).val(value);
                        $(this).text(title);
                    }
                });

                if (changeSelectedLevel) {
                    levelElement.val(minCampaignLevel);

                    if (!dynamicAllocationElement.length) {
                        changeLevel(campaignID);
                    }
                }

                if (tmpPriorityElement.length) {
                    if (priorityElement.val()) {
                        tmpPriorityElement.html(priorityElement.val());
                    }

                    if (checkOwnerLevelIsAuto(levelElement.val())) {
                        priorityElement.prop('disabled', true);
                        priorityElement.val(autoPriorityText);
                    } else {
                        priorityElement.prop('disabled', false);
                        priorityElement.val(tmpPriorityElement.html());
                    }
                }
                break
        }
    }

    // Обработчик чекбокса "Динамическая монетизация"
    function handleDynamicAllocationCheckBox(campaignID = 0, changeSelectedLevel = false) {
        if (campaignID === 0) {
            var dynamicAllocationElement = $('#dynamicAllocation');
            var kindIDElement = $('#kindID');
            var levelElement = $('#level');
        } else {
            var dynamicAllocationElement = $('#campaign' + campaignID + '_dynamicAllocation');
            var kindIDElement = $('#campaign' + campaignID + '_kindID');
            var levelElement = $('#campaign' + campaignID + '_level');
        }

        if (dynamicAllocationElement.prop('checked')) {
            currentCampaignKindID[campaignID].value = kindIDElement.val();
            currentCampaignKindID[campaignID].title = kindIDElement.find(":selected").text();

            kindIDElement.find(":selected").text(commercialCampaignKindIDTitle);
            kindIDElement.prop('disabled', true);

            levelElement.find(":selected").text(commercialCampaignLevelTitle);
            levelElement.prop('disabled', true);
        } else {
            kindIDElement.val(currentCampaignKindID[campaignID].value);
            kindIDElement.find(":selected").text(currentCampaignKindID[campaignID].title);
            kindIDElement.prop('disabled', false);

            levelElement.prop('disabled', false);

            if (changeSelectedLevel) {
                changeLevel(campaignID);
            }
        }

        handleKindIDSelect(campaignID, changeSelectedLevel);
    }

    // Для баннерной и мобильной рекламы
    if ($('#dynamicAllocation').length) {
        $('#dynamicAllocation').click(function(){
            handleDynamicAllocationCheckBox(0, true);
        });

        handleDynamicAllocationCheckBox();
    }

    if ($('#kindID').length) {
        $('#kindID').change(function(){
            handleKindIDSelect(0, true);
        });

        if (!$('#dynamicAllocation').length) {
            handleKindIDSelect();
        }
    }

    // Для видео рекламы
    $.each($('[id^="campaign"]'), function(){
        var ID = $(this).prop('id');

        var regExp = /campaign(\d+)_(\w+)/ig;
        var result = regExp.exec(ID);

        if (result === null) {
            return;
        }

        var campaignID = result[1];
        var parameter = result[2];

        currentCampaignKindID[campaignID] = {
            'value': $('#campaign' + campaignID + '_kindID').val(),
            'title': $('#campaign' + campaignID + '_kindID').find(":selected").text()
        };

        if (parameter === 'dynamicAllocation') {
            $(this).click(function(){
                handleDynamicAllocationCheckBox(campaignID, true);
            });
        }

        if (parameter === 'kindID') {
            $(this).change(function(){
                handleKindIDSelect(campaignID, true);
            });
        }

        if (parameter === 'level') {
            $(this).change(function(){
                handleLevel(campaignID);
            });
        }

        // Вызываем для каждой кампании, только один раз,
        // после прохода по всем элементам текущего ряда
        // ("Приоритет" - последний элемент ряда)
        if (parameter === 'priority') {
            handleDynamicAllocationCheckBox(campaignID);
        }
    });

    let extMonetizers = $('#extMonetizers');

    if (extMonetizers.length) {
        extMonetizers.change(extMonetizerHandler);
    }
});

let extMonetizerHandler = function() {
    let minCpm = $('#minCpm');
    let cpmTypeValue = $('#cpmTypeValue');
    let cpmType = $('input[name=cpmType]');
    let monetizer = $('input[name=extMonetizer]');
    let cpm = $('input[name=cpm]');
    let kindIdElement = $('#kindID');
    const monetizerHashId = $('#extMonetizers').val();

    if (kindIdElement.val() == campaignKindCommercial) {

        minCpm.html('');
        cpmTypeValue.html('');
        cpm.removeAttr('disabled');

        if (parseInt(monetizerHashId) === 0) {
            cpmType.val('normal');
            cpmTypeValue.html('');
            monetizer.val(0);
            kindIdElement.removeAttr('disabled');

        } else {

            kindIdElement.attr('disabled', true);
            const cpmTypeAndId = monetizerHashId.split(':');

            // валидируем разобранный хэш, который должен состоять из id монетизатора и его тип cpm через ":"
            if (cpmTypeAndId.length === 2) {

                const monetizerId = parseInt(cpmTypeAndId[0]);
                const currentCpmType = cpmTypeAndId[1];
                const disabledCpmList = JSON.parse(decodeURIComponent($('input[name=disabledCpmList]').val()));

                monetizer.val(monetizerId);
                cpmType.val(currentCpmType);
                cpmTypeValue.html(currentCpmType);

                if (disabledCpmList.length && disabledCpmList.indexOf(monetizerId) > -1) {
                    cpm.attr('disabled', true);
                }

                const monetizationSettingsElement = $('input[name=monetizationSettings]');

                if (monetizerId > 0 && monetizationSettingsElement.length && currentCpmType === 'header_bidding') {

                    const settings = JSON.parse(decodeURIComponent(monetizationSettingsElement.val()));
                    const monetizerSettings = settings.find((monetizer) => monetizer.id === monetizerId);

                    if (monetizerSettings && monetizerSettings.minCpm > 0) {
                        minCpm.html(monetizerSettings.minCpm);
                    }
                }
            } else {

            }
        }
    }
};
