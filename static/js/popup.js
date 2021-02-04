$('.popup-type-general').change(function () {
    if($(this).val() == 'default'){
        $('.popup-content').css('display', 'flex');
        $('.popup-img-field').css('display', 'block');
    }
    else if($(this).val() == 'vertical'){
        $('.popup-content').css('display', 'block');
        $('.popup-img-field').css('display', 'block');
    }
    else if($(this).val() == 'text'){
        $('.popup-img-field').css('display', 'none');
    }
    $('#popup-field-wrap').css('display', 'block');
    setPopupImgFromGeneral($(this).parent().parent());
    setPopupTextFromGeneral($(this).parent().parent());
});

$('.popup-preview-btn').on('click', function(e) {
    $('#popup-field-wrap').css('display', 'block');
});

// popup閉じるボタン
$('#popup-close-btn').on('click', function(e) {
    $('#popup-field-wrap').css('display', 'none');
});