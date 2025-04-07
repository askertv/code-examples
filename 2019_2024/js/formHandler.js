$(document).ready(function() {

    var id = {
        "date": 0,
        "power_of_attorney_date": 0,
        "bank_account_opening_date": 0,
        "contact_phone": 0,
        "phone": 0,
        "visit_purpose_empty": 0,
        "visit_purpose_give_docs": 0,
        "visit_purpose_get_docs": 0,
        "visit_purpose_bill_open": 0,
        "visit_purpose_get_report": 0,
        "visit_purpose_give_and_get_docs": 0,
        "visit_purpose_eurobonds": 0,
        "give_payment_order_empty": 0,
        "give_payment_order_yes": 0,
        "give_payment_order_no": 0,
        "email": 0,
        "person_type_empty": 0,
        "person_type_jur": 0,
        "person_type_fiz": 0,
        "office_empty": 0,
        "office_spart": 0,
        "office_kisl": 0,
        "org_name": 0,
        "fio_org": 0,
        "fio": 0,
        "short_official_org_name": 0,
        "power_of_attorney_number": 0,
        "representative_identification": 0
    };

    $toggler = '';
    var givePaymentOrderBlocked = false;
    
    var curDate = new Date();
    var curHour = curDate.getHours();
    var numberOfDaysFromToday = 1;

    var disabledDays = [
        "1.5.2023",
        "8.5.2023",
        "9.5.2023",
        "12.6.2023",
        "6.11.2023",
        "1.1.2024",
        "2.1.2024",
        "3.1.2024",
        "4.1.2024",
        "5.1.2024",
        "8.1.2024",
        "23.2.2024",
        "8.3.2024",
        "29.4.2024",
        "30.4.2024",
        "1.5.2024",
        "9.5.2024",
        "10.5.2024",
        "12.6.2024",
        "4.11.2024",
        "30.12.2024",
        "31.12.2024"
    ];

    var disabledDaysKisl = [...disabledDays];

    // ===================== Init =====================
    $.ajax({
        url: 'valueids.php',
        success: function (data) {
            $('input[name="value-ids"]').val(data);
        },
        async: false
    });

    var formElementValueIdsJson = $('input[name="value-ids"]').val();

    if (formElementValueIdsJson) {
        id = JSON.parse(formElementValueIdsJson);
    }

    $.ajax({
        url: 'checkdays.php',
        success: function (data) {
            $('input[name="filled-days"]').val(data);
        },
        async: false
    });

    var filledDays = $('input[name="filled-days"]').val();

    if (filledDays) {
        var daysArr = JSON.parse(filledDays);

        for (i in daysArr.Spartakovskaya) {
            disabledDays.push( daysArr.Spartakovskaya[i] );
        }

        for (i in daysArr.Kislovskiy) {
            disabledDaysKisl.push( daysArr.Kislovskiy[i] );
        }
    }

    //if (curHour < 17) {
    //    numberOfDaysFromToday = 0;  // Возможность записи на сегодня
    //}

    $('input[name="form_text_' + id.contact_phone + '"], input[name="form_text_' + id.phone + '"]').attr('placeholder','89001234567');
    $('select.inputselect').attr("disabled", "disabled");
    $('#form_dropdown_visit_purpose').removeAttr('disabled');
    $('#form_field_office').css('display', 'none');
    $('#form_field_time').css('display', 'none');

    // ===================== Handlers =====================
    function disableAllTheseDays(date) {
        var m = date.getMonth(), d = date.getDate(), y = date.getFullYear();
        var dayOfWeek = date.getDay();

        var sourceData = [];

        var officeId = $('#form_dropdown_office').val();

        if (officeId == id.office_spart) {
            sourceData = disabledDays;
        }
        if (officeId == id.office_kisl) {
            sourceData = disabledDaysKisl;
        }

        for (i = 0; i < sourceData.length; i++) {
            if( ($.inArray( d + '.' + (m+1) + '.' + y,sourceData) != -1) || (dayOfWeek == 0 || dayOfWeek == 6)) {
                return [false];
            }
        }

        return [true];
    }

    $( "body input[name='form_date_" + id.date + "']" ).datepicker({
        dateFormat: 'dd.mm.yy',
        minDate: numberOfDaysFromToday,
        beforeShowDay: disableAllTheseDays
    });

    $("input[name='form_date_" + id.power_of_attorney_date + "']").datepicker({
        dateFormat: 'dd.mm.yy',

        beforeShowDay: function(date){
            var dayOfWeek = date.getDay();

            if (dayOfWeek == 0 || dayOfWeek == 6){
                return [false];
            } else {
                return [true];
            }
        }
    });

    $("input[name='form_date_" + id.bank_account_opening_date + "']").datepicker({
        dateFormat: 'dd.mm.yy',

        beforeShowDay: function(date){
            var dayOfWeek = date.getDay();

            if (dayOfWeek == 0 || dayOfWeek == 6){
                return [false];
            } else {
                return [true];
            }
        }
    });

    $('#form_dropdown_office').change(function() {
        if ($(this).val() == id.office_empty) {
            dateFieldHide();
            timeFieldHide();
            $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
        } else {
            dateFieldShow();
        }
    });

    $("input[name='form_date_" + id.date + "']").on('change', function() {
        $date = $(this).val();

        $time = '';

        if ($date!="") {
            $('select.inputselect').removeAttr("disabled");

            $('select[name="form_dropdown_time"]').parent().parent().parent().css('display', 'block');
            $('select[name="form_dropdown_time"]').css('display', 'block');

            $officeId = $('select[name="form_dropdown_office"]').val();
            $visitPurpose = $('select[name="form_dropdown_visit_purpose"]').val();

            $.ajax({
                type: 'POST',
                url: 'request.php',
                data: 'date=' + $date + '&officeId=' + $officeId + '&visitPurpose=' + $visitPurpose,
                success: function(data) {
                    $('select#form_dropdown_time').replaceWith(data);
                    $('select[name="form_dropdown_time"]').css('display', 'block');

                    $time = $.parseHTML(data)[0].children[0].text;

                    $('select[name="form_dropdown_visit_purpose"]').parent().parent().css('display', 'block');
                    $('select[name="form_dropdown_visit_purpose"]').css('display', 'block');
                    $('#form_field_visit_purpose').css('display', 'block');
                    $('#agreement-block').css('display', 'block');
                },
                error: function(data) {
                }
            });
        }
    });

    function dateFieldShow() {
        $('#form_field_date').css('display', 'block');
    }

    function dateFieldHide() {
        $('#form_field_date').css('display', 'none');
    }

    function timeFieldShow() {
        $('#form_dropdown_time').css('display', 'block');
    }

    function timeFieldHide() {
        $('#form_dropdown_time').css('display', 'none');
    }

    $('#form_dropdown_office').change(function() {
        if ($(this).val() == id.office_empty) {
            $('#form_field_date').css('display', 'none');
            $('#form_dropdown_time').css('display', 'none');
            $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');

            givePaymentOrderSetEmpty();
        } else {
            $('#form_field_date').css('display', 'block');

            if ($(this).val() == id.office_kisl) {    
                givePaymentOrderSetNo()
            } else {
                givePaymentOrderSetEmpty();
            }
        }
    });
    
    $('#form_dropdown_givePaymentOrder').change(function() {
        if ($('#form_dropdown_office').val() == id.office_kisl) {
            if ($(this).val() == id.give_payment_order_yes) {
                $('#form_field_givePaymentOrder').append('<span id="gpo_title" style="color:#ce1126">Расчетный документ возможно передать только на Спартаковскую</span>');
                givePaymentOrderBlocked = true;
            } else {
                $('#gpo_title').remove();
                givePaymentOrderBlocked = false;
            }
        }
    });
    
    function givePaymentOrderHide() {
        $('select[name="form_dropdown_givePaymentOrder"]').parent().parent().css('display', 'none');
    }

    function givePaymentOrderShow() {
        $('select[name="form_dropdown_givePaymentOrder"]').parent().parent().css('display', 'block');
        $('#form_field_givePaymentOrder').css('display', 'block');
    }

    function givePaymentOrderFilled() {
        var givePaymentOrder = $('#form_dropdown_givePaymentOrder').val();
        return givePaymentOrder == id.give_payment_order_yes || givePaymentOrder == id.give_payment_order_no;
    }

    function givePaymentOrderSetNo() {
        $('#form_dropdown_givePaymentOrder').val(id.give_payment_order_no);
        $('#gpo_title').remove();
        givePaymentOrderBlocked = true;
    }

    function givePaymentOrderSetEmpty() {
        $('#form_dropdown_givePaymentOrder').val(id.give_payment_order_empty);
        $('#gpo_title').remove();
        givePaymentOrderBlocked = false;
    }

    function giveAndGetDocsFilled() {
        return giveDocsFilled() && getDocsFilled();
    }

    function emailHide() {
        $('input[name="form_email_' + id.email + '"]').parent().parent().css('display', 'none');
    }

    function emailShow() {
        $('input[name="form_email_' + id.email + '"]').parent().parent().css('display', 'block');
        $('#form_field_email').css('display', 'block');
    }

    function jurFizHide() {
        $('select[name="form_dropdown_person_type"]').parent().parent().css('display', 'none');
    }

    function jurFizShow() {
        $('select[name="form_dropdown_person_type"]').parent().parent().css('display', 'block');
        $('#form_field_person_type').css('display', 'block');
    }

    function jurInfoHide() {
        $('input[name="form_text_' + id.org_name + '"]').parent().parent().css('display', 'none');
        $('input[name="form_text_' + id.fio_org + '"]').parent().parent().css('display', 'none');
    }

    function jurInfoShow() {
        $('input[name="form_text_' + id.org_name + '"]').parent().parent().css('display', 'block');
        $('input[name="form_text_' + id.fio_org + '"]').parent().parent().css('display', 'block');
        $('#form_field_org_name').css('display', 'block');
        $('#form_field_fio_org').css('display', 'block');
    }

    function fizInfoHide() {
        $('input[name="form_text_' + id.fio + '"]').parent().parent().css('display', 'none');
    }

    function fizInfoShow() {
        $('input[name="form_text_' + id.fio + '"]').parent().parent().css('display', 'block');
        $('#form_field_fio').css('display', 'block');
    }

    function giveDocsFilled() {
        return $('input[name="form_text_' + id.org_name + '"]').val() != '' && $('input[name="form_text_' + id.fio_org + '"]').val() != ''
            || $('input[name="form_text_' + id.fio + '"]').val() != '';
    }

    function getDocsHide() {
        $('input[name="form_text_' + id.short_official_org_name + '"]').parent().parent().css('display', 'none');
        $('input[name="form_text_' + id.power_of_attorney_number + '"]').parent().parent().css('display', 'none');
        $('input[name="form_date_' + id.power_of_attorney_date + '"]').parent().parent().css('display', 'none');
        $('input[name="form_text_' + id.contact_phone + '"]').parent().parent().css('display', 'none');
    }

    function getDocsShow() {
        $('input[name="form_text_' + id.short_official_org_name + '"]').parent().parent().css('display', 'block');
        $('input[name="form_text_' + id.power_of_attorney_number + '"]').parent().parent().css('display', 'block');
        $('input[name="form_date_' + id.power_of_attorney_date + '"]').parent().parent().css('display', 'block');
        $('input[name="form_text_' + id.contact_phone + '"]').parent().parent().css('display', 'block');
        $('#form_field_short_official_org_name').css('display', 'block');
        $('#form_field_power_of_attorney_number').css('display', 'block');
        $('#form_field_power_of_attorney_date').css('display', 'block');
        $('#form_field_contact_phone').css('display', 'block');
    }

    function getDocsFilled() {
        return $('input[name="form_text_' + id.short_official_org_name + '"]').val() != ''
            && $('input[name="form_text_' + id.power_of_attorney_number + '"]').val() != ''
            && $('input[name="form_date_' + id.power_of_attorney_date + '"]').val() != ''
            && $('input[name="form_text_' + id.contact_phone + '"]').val() != '';
    }

    function billOpenHide() {
        $('input[name="form_text_' + id.representative_identification + '"]').parent().parent().css('display', 'none');
        $('input[name="form_date_' + id.bank_account_opening_date + '"]').parent().parent().css('display', 'none');
        $('input[name="form_text_' + id.phone + '"]').parent().parent().css('display', 'none');
    }

    function billOpenShow() {
        $('input[name="form_text_' + id.representative_identification + '"]').parent().parent().css('display', 'block');
        $('input[name="form_date_' + id.bank_account_opening_date + '"]').parent().parent().css('display', 'block');
        $('input[name="form_text_' + id.phone + '"]').parent().parent().css('display', 'block');
        $('#form_field_representative_identification').css('display', 'block');
        $('#form_field_bank_account_opening_date').css('display', 'block');
        $('#form_field_phone').css('display', 'block');
    }

    function billOpenFilled() {
        return $('input[name="form_text_' + id.representative_identification + '"]').val() != ''
            && $('input[name="form_date_' + id.bank_account_opening_date + '"]').val() != ''
            && $('input[name="form_text_' + id.phone + '"]').val() != '';
    }

    function officeShowFixed(officeId) {
        $('#form_field_office').css('display', 'block');
        $('input[name="form_dropdown_office"]').parent().parent().css('display', 'block');
        $('#form_dropdown_office').css('display', 'block');
        $('#form_dropdown_office').val(officeId);
        $('#form_dropdown_office').attr("disabled", "disabled");
        $('#office-title').html('Адрес офиса');
    }

    function officesShow() {
        $('#form_field_office').removeAttr("disabled");
        $('#form_field_office').css('display', 'block');
        $('input[name="form_dropdown_office"]').parent().parent().css('display', 'block');
        $('#form_dropdown_office').css('display', 'block');
        $('#form_dropdown_office').removeAttr("disabled");
        $('#form_dropdown_office').val(id.office_empty);
        $('#office-title').html('Выбор офиса');
    }

    function officesHide() {
        $('input[name="form_dropdown_office"]').parent().parent().css('display', 'none');
        $('#form_dropdown_office').css('display', 'none');
    }

    // ============== Handlers: visit purpose switcher ===============
    $('#form_dropdown_visit_purpose').change(function() {
        $item = $(this).val();

        if ($item == 'getReport' || $item == id.visit_purpose_get_report) {
            $toggler = 'getReport';

            officeShowFixed(id.office_spart);
            dateFieldShow();
            getDocsHide();
            billOpenHide();
            jurFizShow();
            jurInfoHide();
            fizInfoHide();
            emailHide();
            givePaymentOrderHide();
        } else if($item == 'giveDocs' || $item == id.visit_purpose_give_docs) {
            $toggler = 'giveDocs';

            officesShow();
            getDocsHide();
            billOpenHide();
            jurFizShow();
            jurInfoHide();
            fizInfoHide();
            emailHide();
            givePaymentOrderShow();
        } else if($item == 'getDocs' || $item == id.visit_purpose_get_docs) {
            $toggler = 'getDocs';

            officeShowFixed(id.office_spart);
            dateFieldShow();
            getDocsShow();
            billOpenHide();
            jurFizHide();
            jurInfoHide();
            fizInfoShow();
            emailShow();
            givePaymentOrderHide();
        } else if($item == 'billOpen' || $item == id.visit_purpose_bill_open) {
            $toggler = 'billOpen';

            //officesShow();
            officeShowFixed(id.office_spart);
            getDocsHide();
            billOpenShow();
            jurFizHide();
            jurInfoHide();
            fizInfoShow();
            emailShow();
            givePaymentOrderHide();
        } else if($item == 'giveAndGetDocs' || $item == id.visit_purpose_give_and_get_docs ) {
            $toggler = 'giveAndGetDocs';

            officeShowFixed(id.office_spart);
            dateFieldShow();
            billOpenHide();
            jurFizShow();
            getDocsShow();
            billOpenHide();
            fizInfoShow();
            emailShow();
            givePaymentOrderShow();
        } else if($item == 'eurobonds' || $item == id.visit_purpose_eurobonds ) {
            $toggler = 'eurobonds';

            officeShowFixed(id.office_spart);
            dateFieldShow();
            billOpenHide();
            jurFizShow();
            getDocsShow();
            billOpenHide();
            fizInfoShow();
            emailShow();
            givePaymentOrderShow();
        } else if ($item == id.visit_purpose_empty) {
            // Hide all elements
            dateFieldHide();
            givePaymentOrderHide();
            emailHide();
            jurFizHide();
            jurInfoHide();
            fizInfoHide();
            getDocsHide();
            billOpenHide();
            officesHide();
        }
    });

    // ================ Handlers: person type switcher =================
    $('body').on('change', '#form_dropdown_person_type', function() {
        $item = $(this).val();

        $visitPurpose = $('#form_dropdown_visit_purpose').val();

        if ($item == id.person_type_empty) {
            jurInfoHide();
            fizInfoHide();
            emailHide();
            givePaymentOrderHide();
        } else if($item == id.person_type_jur) {
            jurInfoShow();
            fizInfoHide();
            emailShow();

            if ($visitPurpose == id.visit_purpose_get_report) {
                givePaymentOrderHide();
            } else {
                givePaymentOrderShow();
            }
        } else if($item == id.person_type_fiz) {
            jurInfoHide();
            fizInfoShow();
            emailShow();

            if ($visitPurpose == id.visit_purpose_get_report) {
                givePaymentOrderHide();
            } else {
                givePaymentOrderShow();
            }
        }
    });

    // =================== Block or ublock submit button ===================
    $('body').on('input', '.form__field_zapis input[type="text"]', function() {
        if ($('#form_dropdown_office').val() == id.office_kisl) {
            if ($('#form_dropdown_givePaymentOrder').val() == id.give_payment_order_yes) {
                $('#form_field_givePaymentOrder').append('<span id="gpo_title" style="color:#ce1126">Расчетный документ возможно передать только на Спартаковскую</span>');
                givePaymentOrderBlocked = true;
            } else {
                $('#gpo_title').remove();
                givePaymentOrderBlocked = false;
            }
        }

        if ($toggler=='giveDocs' || $toggler=='getReport') {
            if (
                !givePaymentOrderBlocked
                &&
                giveDocsFilled()
                &&
                ($toggler=='getReport' || givePaymentOrderFilled())
                &&
                $('input[name="agreement"]')[1].checked
            ) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }

        if ($toggler=='getDocs') {
            if (!givePaymentOrderBlocked && getDocsFilled() && $('input.toggle__input')[0].checked) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }

        if ($toggler=='billOpen') {
            if (!givePaymentOrderBlocked && billOpenFilled() && $('input.toggle__input')[0].checked) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }

        if ($toggler=='giveAndGetDocs' || $toggler=='eurobonds') {
            if (!givePaymentOrderBlocked && giveAndGetDocsFilled() && givePaymentOrderFilled() && $('input[name="agreement"]')[1].checked) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }
    });

    $('body').on('input', 'select[name="form_dropdown_givePaymentOrder"]', function() {
        if ($('#form_dropdown_office').val() == id.office_kisl) {
            if ($('#form_dropdown_givePaymentOrder').val() == id.give_payment_order_yes) {
                givePaymentOrderBlocked = true;
            } else {
                givePaymentOrderBlocked = false;
            }
        }

        if (!givePaymentOrderBlocked && givePaymentOrderFilled() && $('input[name="agreement"]')[1].checked) {
            $('.buttons-block input[type="submit"]').removeAttr('disabled');
        } else {
            $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
        }
    });

    $('input.toggle__input').on('click', function() {
        if ($('#form_dropdown_office').val() == id.office_kisl) {
            if ($('#form_dropdown_givePaymentOrder').val() == id.give_payment_order_yes) {
                givePaymentOrderBlocked = true;
            } else {
                givePaymentOrderBlocked = false;
            }
        }

        if ($toggler=='giveDocs' || $toggler=='getReport') {
            if (
                !givePaymentOrderBlocked
                &&
                giveDocsFilled()
                &&
                ($toggler=='getReport' || givePaymentOrderFilled())
                &&
                $('input[name="agreement"]')[1].checked
            ) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }

        if ($toggler=='getDocs') {
            if (!givePaymentOrderBlocked && getDocsFilled() && $(this)[0].checked) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }

        if ($toggler=='billOpen') {
            if (!givePaymentOrderBlocked && billOpenFilled() && $(this)[0].checked) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }

        if ($toggler=='giveAndGetDocs' || $toggler=='eurobonds') {
            if (!givePaymentOrderBlocked && giveAndGetDocsFilled() && givePaymentOrderFilled() && $(this)[0].checked) {
                $('.buttons-block input[type="submit"]').removeAttr('disabled');
            } else {
                $('.buttons-block input[type="submit"]').attr('disabled', 'disabled');
            }
        }
    });

    // ==================== Show or hide form ====================
    $('button[js-open-layer="zapis-form"]').on('click', function() {
        $('.body__overlay').addClass('is-complete');
    });

    $('body').on('click','.body__overlay' ,function() {
        $(this).removeClass('is-complete');
        $(this).removeClass('is-opened');
    });

    $('.layer-close').on('click', function() {
        $('.body__overlay').removeClass('is-complete');
        $('.body__overlay').removeClass('is-opened');
    });
});
