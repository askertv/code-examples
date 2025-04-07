var campaignIDs = [];
var priorityValues = {};

$.each($('[id^="kindID"]'), function(){
    var ID = $(this).prop('id');
    var campaignID = ID.replace(/kindID/, '');
    campaignIDs[campaignIDs.length] = campaignID;
    priorityValues[campaignID] = $('#memPr' + campaignID).html();
});

// Восстановление названия опции, которое было изменено включенным чекбоксом "Динамическая монетизация", 
// либо, выставлением вида "Динамическая монетизация"
function changeLevel(campaignID = 0) {
    var kindIDElement = $('#kindID' + campaignID);
    var levelElement = $('#level' + campaignID);

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

function disableSubmitLink() {
    $.each($('a[href*="submit"]'), function(){
        var link = $(this);
        link.prop('href', '#');
        link.click(function(){
            return false;
        });
        link.css('background-color', '#dddddd');
    });
}

function enableSubmitLink() {
    $.each($('a[href*="#"]'), function(){
        var link = $(this);
        link.prop('href', 'javascript: submitCampaigns();');
        link.click(function(){
            submitCampaigns();
        });
        link.css('background-color', '#ffffff');
    });
}

function validateParameters() {
    var isSubmitEnable = true;

    for (i = 0;i < campaignIDs.length; i++) {
        var kindIDElement = $('#kindID' + campaignIDs[i]);
        var cpmElement = $('#cpm' + campaignIDs[i]);
        var kindID = parseInt(kindIDElement.val());

        if (cpmElement.length) {
            if (
                kindID === campaignKindCommercial
                &&
                cpmElement.val() == 0
            ) {
                isSubmitEnable = false;
            }
        }
    }

    if (isSubmitEnable) {
        enableSubmitLink();
    } else {
        disableSubmitLink();
    }
}

// Обработчик элемента input "CPM"
function handleCPMInput(campaignID = 0, changeCPMInput = false) {
    var kindIDElement = $('#kindID' + campaignID);
    var cpmElement = $('#cpm' + campaignID);
    var kindID = parseInt(kindIDElement.val());

    if (cpmElement.length) {
        if (
            kindID === campaignKindCommercial
            &&
            cpmElement.val() == 0
        ) {
            if (!cpmElement.hasClass('mark-red')) {
                cpmElement.addClass('mark-red');
            }
        } else {
            if (cpmElement.hasClass('mark-red')) {
                cpmElement.removeClass('mark-red');
            }
        }

        if (changeCPMInput) {
            validateParameters();
        }
    }
}

// Обработчик элемента select "Вид кампании"
function handleKindIDSelect(campaignID = 0, changeSelectedLevel = false) {
    var kindIDElement = $('#kindID' + campaignID);
    var levelElement = $('#level' + campaignID);
    var cpmElement = $('#cpm' + campaignID);
    var ignoredCpmElement = $('#ignoredCpm' + campaignID);
    var priorityElement = $('#priority' + campaignID);

    var idPrefix = '#campaignID' + campaignID;

    if (ignoredCpmElement.length) {
        ignoredCpmElement.prop('disabled', true);
    }

    var kindID = parseInt(kindIDElement.val());

    switch (kindID) {
        case campaignKindCommercial:
            levelElement.find(":selected").text(commercialCampaignLevelTitle);
            levelElement.prop('disabled', true);
            priorityElement.prop('disabled', true);

            if (campaignID in priorityValues) {
                priorityElement.val(priorityValues[campaignID]);
            }

            cpmElement.prop('disabled', false);

            if (cpmElement.val() == 0) {
                if (!cpmElement.hasClass('mark-red')) {
                    cpmElement.addClass('mark-red');
                }
            } else {
                if (cpmElement.hasClass('mark-red')) {
                    cpmElement.removeClass('mark-red');
                }
            }

            $(idPrefix).parents('tr:first').find('td').each(function(){
                var currentEl = $(this);
                if (
                    !currentEl.hasClass('tableDataError')
                    &&
                    !currentEl.hasClass('tableDataError2')
                    &&
                    !currentEl.hasClass('formError1')
                    &&
                    !currentEl.hasClass('formError2')
                ) {
                    currentEl.css('background-color', campaignKindCommercialColor);
                }
            });
            break;

        case campaignKindPromotional:
            levelElement.prop('disabled', false);

            priorityElement.prop('disabled', false);

            if (campaignID in priorityValues) {
                priorityElement.val(priorityValues[campaignID]);
            }

            cpmElement.prop('disabled', true);

            if (cpmElement.hasClass('mark-red')) {
                cpmElement.removeClass('mark-red');
            }

            $(idPrefix).parents('tr:first').find('td').css('background-color', campaignKindPromotionalColor);

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
                changeLevel(campaignID);
            }
            break;

        default:
            levelElement.prop('disabled', false);
            if (typeof campaigns!=='undefined') {
                if (campaigns[campaignID].frozenDeal) {
                    cpmElement.prop('disabled', true);
                }
            } else {
                cpmElement.prop('disabled', true);
            }

            if (cpmElement.hasClass('mark-red')) {
                cpmElement.removeClass('mark-red');
            }

            $('.tableData,.tableDataLeft').
                find(idPrefix).parent().
                css('background-color', colorGrey);

            $('.tableData2,.tableDataLeft2').
                find(idPrefix).parent().
                css('background-color', colorWhite);


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
                changeLevel(campaignID);
            }

            if (priorityElement.val() !== autoPriorityText) {
                priorityValues[campaignID] = priorityElement.val();
            }

            if (checkOwnerLevelIsAuto(levelElement.val())) {
                priorityElement.prop('disabled', true);
                priorityElement.val(autoPriorityText);
            } else {
                priorityElement.prop('disabled', false);
                priorityElement.val(priorityValues[campaignID]);
            }
            break
    }

    if (changeSelectedLevel) {
        validateParameters();
    }
}

for (i = 0;i < campaignIDs.length; i++) {
    $('#kindID' + campaignIDs[i]).change(function(){
        var ID = $(this).prop('id');
        var campaignID = ID.replace(/kindID/, '');

        handleKindIDSelect(campaignID, true);
    });

    handleKindIDSelect(campaignIDs[i]);

    $('#cpm' + campaignIDs[i]).keyup(function(){
        var ID = $(this).prop('id');
        var campaignID = ID.replace(/cpm/, '');

        handleCPMInput(campaignID, true);
    });

    handleCPMInput(campaignIDs[i]);
}
