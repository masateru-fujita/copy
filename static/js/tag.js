var start_x;
var start_y;
var end_x;
var end_y;
var height;
var page_x;
var page_y;

var is_drawing = false;

var canvas;

// タグ格納用
var tag_elements = [];

// タグ作成
$('.video').first().on('loadedmetadata', function() {
    createTags(JSON.parse(link_tags));
    $('input[name="video-width"]').val($('.video').first().width());
    $('input[name="video-height"]').val($('.video').first().height());
});

createLinkTagArea($('#add-tag-area-btn'));

// タグ作成関数
function createTags(link_tags){
    link_tags.forEach(function(link_tag){
        changeTagCol(link_tag["fields"]["action_type"], $('#tag-per-form-' + link_tag['pk']));
        createHiddenField($('#tag-per-form-' + link_tag['pk']), link_tag);
        // リンクタグ時の処理
        if(link_tag["fields"]["action_type"] == "link"){
            tag = createLinkTag(link_tag);
        } 
        // ポップアップタグ時の処理
        else if (link_tag["fields"]["action_type"] == "popup") {
            tag = createPopupTag(link_tag);
        }
        // ストーリータグ時の処理
        else if (link_tag["fields"]["action_type"] == "story") {
            tag = createStoryTag(link_tag);
        }
        $('#video-field').append(tag);
        tag_elements.push(tag)

        // サイドメニュータグごとタグタイトル押下時
        createSideTagEvent(link_tag);

        // 領域指定ボタンイベント作成
        createLinkTagArea($('#add-tag-area-btn-' + link_tag['pk']));
    });

    // ウィンドウサイズ変更時にタグごとの大きさを変更する
    $(window).resize(function() {
        link_tags.forEach(function(json_tag){
            $('#link-tag-' + json_tag['pk']).css({
                'width': $('.video').first().width() * (json_tag["fields"]["width"] / 100) + 'px',
                'height': $('.video').first().height() * (json_tag["fields"]["height"] / 100) + 'px',
                'top': $('.video').first().height() * (json_tag["fields"]["y_coordinate"] / 100) + 'px',
                'left': $('.video').first().width() * (json_tag["fields"]["x_coordinate"] / 100) + 'px',
            })
        });
    });
};

function createLinkTagArea(element){
    element.on('click', function(e) {
        $('.video').first().off('mousedown');
        $('.video').first().off('mousemove');
        $('.video').first().off('mouseup');

        // 新しいタグ作成時
        if(element.attr('id') == 'add-tag-area-btn'){
            if(document.getElementById('canvas') != undefined){
                document.getElementById('canvas').remove();
                $(this).parent().parent().parent().find('input[name="width"]').remove();
                $(this).parent().parent().parent().find('input[name="height"]').remove();
                $(this).parent().parent().parent().find('input[name="y_coordinate"]').remove();
                $(this).parent().parent().parent().find('input[name="x_coordinate"]').remove();
            };
        }
        // 既存タグ変更時
        else{
            $('#link-tag-' + getElementId(element)).remove();
            $(this).parent().parent().parent().find('input[name="width"]').remove();
            $(this).parent().parent().parent().find('input[name="height"]').remove();
            $(this).parent().parent().parent().find('input[name="y_coordinate"]').remove();
            $(this).parent().parent().parent().find('input[name="x_coordinate"]').remove();
        }

        $('.video').first().one('mousedown', function(e) {
            is_drawing = true;
    
            start_x = e.offsetX;
            start_y = e.offsetY;
    
            canvas = document.createElement('div');
            if(element.attr('id') == 'add-tag-area-btn'){
                canvas.id = 'canvas';
            }
            else{
                canvas.id = 'link-tag-' + getElementId(element);
            }
            canvas.style.left = start_x + 'px';
            canvas.style.top = start_y + 'px';
            canvas.style.backgroundColor = '#CCC';
            canvas.style.display = 'block';
            canvas.style.opacity = '0.8';
            canvas.target = "_brank";
            canvas.rel = "noopener noreferrer"
        });

        $('.video').first().on('mousemove', function(e) {
            e.stopPropagation();
            if(is_drawing){
                canvas.style.width = (e.offsetX - start_x) + 'px';
                canvas.style.height = (e.offsetY - start_y) + 'px';
            }
        });

        $('.video').first().one('mouseup', function(e) {
            is_drawing = false;
            
            end_x = e.offsetX;
            end_y = e.offsetY;
    
            canvas.style.width = (e.offsetX - start_x) + 'px';
            canvas.style.height = (e.offsetY - start_y) + 'px';
            canvas.style.position = "absolute";
    
            $('#video-field').append(canvas);
    
            // 座標hf作成
            var width = document.createElement("input");
            width.id = width.name = 'width';
            width.type = "hidden";
            var width_value = ((e.offsetX - start_x) / $('.video').first().width()) * 100;
            width.value = Math.floor(width_value * 100) / 100;
    
            var height = document.createElement("input");
            height.id = height.name = 'height';
            height.type = "hidden";
            var height_value = ((e.offsetY - start_y) / $('.video').first().height()) * 100;
            height.value = Math.floor(height_value * 100) / 100;
    
            var top = document.createElement("input")
            top.id = top.name = 'y_coordinate';
            top.type = "hidden";
    
            var left = document.createElement("input");
            left.id = left.name = 'x_coordinate';
            left.type = "hidden";

            var main_video_id = $('#video-field').children('.video').attr('id');
            
            if(three_dim_flags[main_video_id] == 'True'){
                // 定位置を0とする 実際に見えているのは -37.5° ~ 37.5°
                var top_value = (phi * 180 / Math.PI) + (75 * (start_y / $('.video').first().height()));
                top.value = Math.floor(top_value * 100) / 100;
                var left_value = ((theta % (Math.PI * 2)) * 180 / Math.PI) + (37.5 * ((start_x / $('.video').first().width()) - 0.5));
                left.value = Math.floor(left_value * 100) / 100;
            }
            else
            {
                var top_value = (start_y / $('.video').first().height()) * 100;
                top.value = Math.floor(top_value * 100) / 100;
                var left_value = (start_x / $('.video').first().width()) * 100;
                left.value = Math.floor(left_value * 100) / 100;
            }

            if(element.attr('id') == 'add-tag-area-btn'){
                $('#input_wrap').append(width, height, top, left);
            }
            else{
                $('#tag-per-form-' + getElementId(element)).append(width);
                $('#tag-per-form-' + getElementId(element)).append(height);
                $('#tag-per-form-' + getElementId(element)).append(top);
                $('#tag-per-form-' + getElementId(element)).append(left);
            }
    
            $(window).resize(function() {
                canvas.style.left = $('.video').first().width() * (left.value / 100) + 'px';
                canvas.style.top = $('.video').first().height() * (top.value / 100) + 'px';
                canvas.style.width = $('.video').first().width() * (width.value / 100) + 'px';
                canvas.style.height = $('.video').first().height() * (height.value / 100) + 'px';
            });
        });
    });
};

// リンクタグ作成関数
function createLinkTag(link_tag) {
    tag = document.createElement('a');
    tag.href = link_tag["fields"]["link_url"];
    tag.innerHTML = link_tag["fields"]["title"];
    tag.id = "link-tag-" + link_tag["pk"];
    tag.className = "link-tag";
    tag.target = "_brank";
    tag.rel = "noopener noreferrer";
    tag.style.position = "absolute";
    tag.style.backgroundColor = "rgba(120,120,120,0.5)";
    tag.style.display = "block";
    if(three_dim_flags[$('.video').first().attr('id')] == 'True'){
        tag.style.left = ($('.video').first().width() / 2) + (500 * THREE.Math.degToRad(link_tag["fields"]['x_coordinate'])) + 'px';
        tag.style.top = 500 * THREE.Math.degToRad(link_tag["fields"]['y_coordinate']) * -1 + 'px';
    }
    else
    {
        tag.style.left = $('.video').first().width() * (link_tag["fields"]['x_coordinate'] / 100) + 'px';
        tag.style.top = $('.video').first().height() * (link_tag["fields"]['y_coordinate'] / 100) + 'px';
    }
    tag.style.width = $('.video').first().width() * (link_tag["fields"]['width'] / 100) + 'px';
    tag.style.height = $('.video').first().height() * (link_tag["fields"]['height'] / 100) + 'px';

    tag.addEventListener('click', () => {
        videos.forEach(video => {
            video.pause(); 
        });
        switchPlayFlg();
    });

    return tag;
}

// ポップアップタグ作成関数
function createPopupTag(link_tag) {
    tag = document.createElement('div');
    tag.id = "link-tag-" + link_tag['pk'];
    tag.style.cursor = "pointer";
    tag.innerHTML = link_tag["fields"]["title"];
    tag.className = "link-tag";
    tag.rel = "noopener noreferrer";
    tag.style.position = "absolute";
    tag.style.backgroundColor = "rgba(120,120,120,0.5)";
    tag.style.display = "block";
    if(three_dim_flags[$('.video').first().attr('id')] == 'True'){
        tag.style.left = ($('.video').first().width() / 2) + (500 * THREE.Math.degToRad(link_tag["fields"]['x_coordinate'])) + 'px';
        tag.style.top = 500 * THREE.Math.degToRad(link_tag["fields"]['y_coordinate']) + 'px';
    }
    else
    {
        tag.style.left = $('.video').first().width() * (link_tag["fields"]['x_coordinate'] / 100) + 'px';
        tag.style.top = $('.video').first().height() * (link_tag["fields"]['y_coordinate'] / 100) + 'px';
    }
    tag.style.width = $('.video').first().width() * (link_tag["fields"]['width'] / 100) + 'px';
    tag.style.height = $('.video').first().height() * (link_tag["fields"]['height'] / 100) + 'px';

    tag.addEventListener('click', () => {
        // 画像設定
        if($('#popup-img-' + link_tag['pk']).val() == ''){
            $('.popup-img-field').attr('src', '/' + link_tag['fields']['popup_img']);
        }
        else
        {
            var reader = new FileReader();
            var img = $('#popup-img-' + link_tag['pk']).prop('files')[0];
            reader.onload = function (e) {
                $('.popup-img-field').attr('src', reader.result);
            }
            reader.readAsDataURL(img);
        }

        // テキスト設定
        if($('#popup-text-' + link_tag['pk']).val() == ''){
            $('.popup-text-field').text(link_tag['fields']['popup_text']);
        }
        else
        {
            $('.popup-text-field').text($('#popup-text-' + link_tag['pk']).val());
        }

        // テキスト設定
        if($('#popup-btn-text-' + link_tag['pk']).val() == ''){
            $('.popup-btn-field').text(link_tag['fields']['popup_text']);
            $('.popup-btn-field').css('display', 'block');
        }
        else
        {
            $('.popup-btn-field').text($('#popup-btn-text-' + link_tag['pk']).val());
            $('.popup-btn-field').css('display', 'block');
        }
        setPopupBtnEventFromLinkTag(link_tag, $('#popup-btn-text-' + link_tag['pk']));

        var popup_field_wrap = document.getElementById('popup-field-wrap');
        popup_field_wrap.style.display = "block";

        videos.forEach(video => {
            video.pause(); 
        });
        // frame上昇止める
        clearInterval(footer_event);
        switchPlayFlg();
    });
    return tag;
}

// ストーリータグ作成関数
function createStoryTag(link_tag){
    tag = document.createElement('div');
    tag.style.cursor = "pointer";
    tag.innerHTML = link_tag["fields"]["title"];
    tag.id = "link-tag-" + link_tag['pk'];
    tag.className = "link-tag";
    tag.rel = "noopener noreferrer";
    tag.style.position = "absolute";
    tag.style.backgroundColor = "rgba(120,120,120,0.5)";
    tag.style.display = "block";
    if(three_dim_flags[$('.video').first().attr('id')] == 'True'){
        tag.style.left = ($('.video').first().width() / 2) + (500 * THREE.Math.degToRad(link_tag["fields"]['x_coordinate'])) + 'px';
        tag.style.top = 500 * THREE.Math.degToRad(link_tag["fields"]['y_coordinate']) + 'px';
    }
    else
    {
        tag.style.left = $('.video').first().width() * (link_tag["fields"]['x_coordinate'] / 100) + 'px';
        tag.style.top = $('.video').first().height() * (link_tag["fields"]['y_coordinate'] / 100) + 'px';
    }
    tag.style.width = $('.video').first().width() * (link_tag["fields"]['width'] / 100) + 'px';
    tag.style.height = $('.video').first().height() * (link_tag["fields"]['height'] / 100) + 'px';

    tag.addEventListener('click', () => {

        $('#story-tag-area').css('display', 'block');
        $('.next-video-title').text(link_tag["fields"]['story_next_video']);
        $('.next-video-start-flame').text(link_tag["fields"]['story_start_flame']);

        videos.forEach(video => {
            video.pause();
        });
        switchPlayFlg();
    });

    return tag;
}

function createHiddenField(form, link_tag){
    // 座標hf作成
    var width = document.createElement("input");
    width.name = 'width';
    width.type = "hidden";
    width.value = link_tag["fields"]["width"];
    form.append(width);

    var height = document.createElement("input");
    height.name = 'height';
    height.type = "hidden";
    height.value = link_tag["fields"]["height"];
    form.append(height);

    var top = document.createElement("input")
    top.name = 'y_coordinate';
    top.type = "hidden";
    top.value = link_tag["fields"]["y_coordinate"];
    form.append(top);

    var left = document.createElement("input");
    left.name = 'x_coordinate';
    left.type = "hidden";
    left.value = link_tag["fields"]["x_coordinate"];
    form.append(left);
}

// ボタン押下時のアニメーション
$('.general-tag-btn').on('click', function(e) {
    $('.general-tag-form').stop(true).animate({'height': 'toggle'});
})

$('.end-tag-btn').on('click', function(e) {
    $('.end-tag-form').animate({'height': 'toggle'});
})

// 画面サイズ変更時タグの大きさを変更
$(window).resize(function() {
    $('input[name="video-width"]').val($('.video').first().width());
    $('input[name="video-height"]').val($('.video').first().height());
});

// 作成フォーム初期値設定
changeTagCol('link', $('.general-tag-form'));

// タグ要素変更
function changeTagCol(action_type, form){
    if(action_type == 'link'){
        form.find('input[name=action_type]:eq(0)').prop('checked', true);
        form.find('.link-tag-col').css('display', 'block');
        form.find('.popup-tag-col').css('display', 'none');
        form.find('.story-tag-col').css('display', 'none');
    }
    else if(action_type == 'popup'){
        form.find('input[name=action_type]:eq(1)').prop('checked', true);
        form.find('.link-tag-col').css('display', 'none');
        form.find('.popup-tag-col').css('display', 'block');
        form.find('.story-tag-col').css('display', 'none');
    }
    else if(action_type == 'story'){
        form.find('input[name=action_type]:eq(2)').prop('checked', true);
        form.find('.link-tag-col').css('display', 'none');
        form.find('.popup-tag-col').css('display', 'none');
        form.find('.story-tag-col').css('display', 'block');
    }
    changeActionTypeEvent(form)
};

// タグアクションラジオボタン
function changeActionTypeEvent(form) {
    form.find('input[name="action_type"]').change(function () {
        val = $(this).val();
        if(val == 'link'){
            form.find('.link-tag-col').css('display', 'block');
            form.find('input[name="link_url"]').prop('disabled', false);
            form.find('.popup-tag-col').css('display', 'none');
            form.find('select[name="popup_content"]').prop('disabled', true);
            form.find('.story-tag-col').css('display', 'none');
            form.find('input[name="story_next_video"]').prop('disabled', true);
            form.find('input[name="story_start_flame"]').prop('disabled', true);
        };
        if(val == 'popup'){
            form.find('.link-tag-col').css('display', 'none');
            form.find('input[name="link_url"]').prop('disabled', true);
            form.find('.popup-tag-col').css('display', 'block');
            form.find('select[name="popup_content"]').prop('disabled', false);
            form.find('.story-tag-col').css('display', 'none');
            form.find('select[name="story_next_video"]').prop('disabled', true);
            form.find('input[name="story_start_flame"]').prop('disabled', true);
        };
        if(val == 'story'){
            form.find('.link-tag-col').css('display', 'none');
            form.find('input[name="link_url"]').prop('disabled', true);
            form.find('.popup-tag-col').css('display', 'none');
            form.find('select[name="popup_content"]').prop('disabled', true);
            form.find('.story-tag-col').css('display', 'block');
            form.find('select[name="story_next_video"]').prop('disabled', false);
            form.find('input[name="story_start_flame"]').prop('disabled', false);
        };
    });
};

// サイドメニュータグごとタイトル押下時イベント関数
function createSideTagEvent(link_tag){
    // サイドメニュータグごとタイトル押下時
    $('#tag-per-btn-' + link_tag['pk']).on('click', function(e) {
        if($('.video').first().attr('id') != link_tag['fields']['video'])
        {
            changeMainVideo(document.getElementById(link_tag['fields']['video']));
        }
        // formアニメーション設定
        tag_form_id = '#' + $('#tag-per-btn-' + link_tag['pk']).attr('id').replace('tag-per-btn', 'tag-per-form');
        $(tag_form_id).stop(true).animate({'height': 'toggle'});
        // tagに設定されているフレームまで動画進める
        seekbar_now.style.left = (link_tag['fields']['display_frame'] / Math.ceil(videos[0].duration * fps)) * 100 + '%';
        videos[0].currentTime = videos[0].duration * (link_tag['fields']['display_frame'] / Math.ceil(videos[0].duration * fps));
        $("#time-current").html(timeFormat(videos[0].currentTime));
        $("#frame-now").html(link_tag['fields']['display_frame']);
        $('#link-tag-' + link_tag['pk']).css({
            'border': 'solid 2px',
            'visibility': 'visible',
        });
        if(link_tag['fields']['popup_type'] == 'default'){
            $('.popup-switch-field').css('display', 'flex');
            $('#tag-per-form-' + link_tag['pk']).find('input[name=popup_type]:eq(0)').prop('checked', true);
        }
        else if(link_tag['fields']['popup_type'] == 'vertical'){
            $('.popup-switch-field').css('display', 'block');
            $('#tag-per-form-' + link_tag['pk']).find('input[name=popup_type]:eq(1)').prop('checked', true);
        }
        else if(link_tag['fields']['popup_type'] == 'text'){
            $('.popup-switch-field').css('display', 'block');
            $('.popup-img-field').css('display', 'none');
            $('#tag-per-form-' + link_tag['pk']).find('input[name=popup_type]:eq(2)').prop('checked', true);
        }
    });

    $(".popup-type-" + link_tag['pk']).change(function () {
        setPopupImgFromLinkTag(link_tag, $(this).parent().parent());
        setPopupTextFromLinkTag(link_tag, $(this).parent().parent());
        setPopupBtnEventFromLinkTag(link_tag, $(this));
        if($(this).val() == 'default'){
            $('.popup-switch-field').css('display', 'flex');
        }
        else if($(this).val() == 'vertical'){
            $('.popup-switch-field').css('display', 'block');
        }
        else if($(this).val() == 'text'){
            $('.popup-img-field').css('display', 'none');
        }
        $('#popup-field-wrap').css('display', 'block');
    });

    $('#popup-img-' + link_tag['pk']).on('change', function (e) {
        setPopupTextFromLinkTag(link_tag, $(this));
        setPopupBtnEventFromLinkTag(link_tag, $(this));
        var reader = new FileReader();
        var img = $(this).parent().find('input[name="popup_img"]').prop('files')[0];
        reader.onload = function (e) {
            $('.popup-img-field').attr('src', reader.result);
        }
        reader.readAsDataURL(img);
        var file = $(this).prop('files')[0];
        $(this).parent().parent().children('.file-name').text(file.name)
        $('#popup-field-wrap').css('display', 'block');
    });

    $('#popup-text-' + link_tag['pk']).on('change', function (e) {
        setPopupImgFromLinkTag(link_tag, $(this));
        setPopupBtnEventFromLinkTag(link_tag, $(this));
        $('.popup-text-field').text($(this).val())
        $('#popup-field-wrap').css('display', 'block');
    });

    $('#popup-btn-text-' + link_tag['pk']).on('change', function (e) {
        setPopupImgFromLinkTag(link_tag, $(this));
        setPopupTextFromLinkTag(link_tag, $(this));
        setPopupBtnEventFromLinkTag(link_tag, $(this));
        $('.popup-btn-field').text($(this).val())
        $('.popup-btn-field').css('display', 'block');
        $('#popup-field-wrap').css('display', 'block');
    });

    $('#popup-preview-btn-' + link_tag['pk']).on('click', function(e) {
        // 画像設定
        setPopupImgFromLinkTag(link_tag, $(this));
        setPopupTextFromLinkTag(link_tag, $(this));
        setPopupBtnEventFromLinkTag(link_tag, $(this));
    });
};

// プレビューボタン押下時
$('#popup-preview-btn-general').on('click', function(e) {
    if($(this).parent().find('input[name="popup_img"]').val() == ''){
        $('.popup-img-field').attr('src', '/static/images/video/noimage.png');
    }
    else
    {
        var reader = new FileReader();
        var img = $(this).parent().find('input[name="popup_img"]').prop('files')[0];
        reader.onload = function (e) {
            $('.popup-img-field').attr('src', reader.result);
        }
        reader.readAsDataURL(img);
    }
    // テキスト設定
    $('.popup-text-field').text($(this).parent().find('input[name="popup_text"]').val());
    // POPUPボタン押下イベント
    setPopupBtnEventFromGeneral();
});

// 画像変更時
$('#popup-img-general').on('change', function (e) {
    var reader = new FileReader();
    var img = $('.popup-img-field');
    reader.onload = function (e) {
        img.attr('src', e.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
    var file = $(this).prop('files')[0];
    $(this).parent().parent().children('.file-name').text(file.name)
    $('#popup-field-wrap').css('display', 'block');
    // テキスト設定
    setPopupTextFromGeneral($(this));
});

// テキスト変更時
$('#popup-text-general').on('change', function (e) {
    $('.popup-text-field').text($(this).val())
    $('#popup-field-wrap').css('display', 'block');
    // 画像設定
    setPopupImgFromGeneral($(this));
});

// ボタン文字変更時
$('#popup-btn-text-general').on('change', function (e) {
    $('.popup-btn-field').text($(this).val())
    if ($(this).val() != ""){
        $('.popup-btn-field').css('display', 'block');
    }
    else {
        $('.popup-btn-field').css('display', 'none');
    }
    $('#popup-field-wrap').css('display', 'block');
    // 画像設定
    setPopupImgFromGeneral($(this));
    // テキスト設定
    setPopupTextFromGeneral($(this));
    // ボタンクリックイベント設定
    setPopupBtnEventFromGeneral();
});

// idから要素ID取得
function getElementId(element){
    var idList = element.attr('id').match(/([0-9]+-[0-9]+)|[0-9]/g);
    elementId = "";
    if(idList == null){
        return null;
    }
    idList.forEach(id => {
        elementId = elementId + id;
    });
    return elementId;
}

function setPopupImgFromLinkTag(link_tag, element){
    // 画像設定
    if(link_tag['fields']['popup_img'] == ''){
        $('.popup-img-field').attr('src', '/static/images/video/noimage.png');
    }
    else if(element.parent().find('input[name="popup_img"]').val() == ''){
        $('.popup-img-field').attr('src', '/' + link_tag['fields']['popup_img']);
    }
    else
    {
        var reader = new FileReader();
        var img = element.parent().find('input[name="popup_img"]').prop('files')[0];
        reader.onload = function (e) {
            $('.popup-img-field').attr('src', reader.result);
        }
        reader.readAsDataURL(img);
    }
}

function setPopupTextFromLinkTag(link_tag, element){
    // テキスト設定
    if(element.parent().find('input[name="popup_text"]').val() == ''){
        $('.popup-text-field').text(link_tag['fields']['popup_text']);
    }
    else
    {
        $('.popup-text-field').text(element.parent().find('input[name="popup_text"]').val());
    }
};

function setPopupImgFromGeneral(element){
    // 画像設定
    if(element.parent().find('input[name="popup_img"]').val() == ''){
        $('.popup-img-field').attr('src', '/static/images/video/noimage.png');
    }
    else
    {
        var reader = new FileReader();
        var img = element.parent().find('input[name="popup_img"]').prop('files')[0];
        reader.onload = function (e) {
            $('.popup-img-field').attr('src', reader.result);
        }
        reader.readAsDataURL(img);
    }
}

function setPopupTextFromGeneral(element){
    // テキスト設定
    $('.popup-text-field').text(element.parent().find('input[name="popup_text"]').val());
}

// タグ追加時ポップアップボタンクリックイベント
function setPopupBtnEventFromGeneral(){
    if($('#popup-btn-text-general').val() != ''){
        $('.popup-btn-field').css('display', 'block');
        $('.popup-btn-field').text($('#popup-btn-text-general').val());
    }
    $('.popup-btn-field').off('click');
    $('.popup-btn-field').on("click", function () {
        window.open($('#popup-btn-url-general').val(), '_blank');
    });
}

// タグ編集時ポップアップボタンクリックイベント
function setPopupBtnEventFromLinkTag(link_tag, element){
    if($('#popup-btn-text-' + link_tag['pk']).val() != ''
        || link_tag['fields']['popup_text'] != ''){
            $('.popup-btn-field').css('display', 'block');
            if($('#popup-btn-text-' + link_tag['pk']).val() != ''){
                $('.popup-btn-field').text($('#popup-btn-text-' + link_tag['pk']).val());
            }
            else if(link_tag['fields']['popup_text'] != ''){
                $('.popup-btn-field').text(link_tag['fields']['popup_text'].val());
            }
    }
    $('.popup-btn-field').off('click');
    $('.popup-btn-field').on("click", function () {
        if(element.parent().find('input[name="popup_btn_url"]').val() == ''){
            $('.popup-text-field').text(link_tag['fields']['popup_text']);
            window.open(link_tag['fields']['popup_btn_url'], '_blank');
        }
        else
        {
            window.open($(element.parent().find('input[name="popup_btn_url"]')).val(), '_blank');
        }
    });
}

// サブビデオクリック時
function videoClickEvent(){
    $('#video-field').children('.video').prop('muted', false);
    $('.video-flex-box').children('.video').on("click", function () {
        changeMainVideo(this);
    });
}

// メインvideo切り替え関数
function changeMainVideo(element){
    var main_video_id = $('#video-field').children('.video').attr('id');
    // クリックされた動画が360度動画ならマウスドラッグイベント付与
    var video_width = $(element).width();
    var video_height = $(element).height();
    if(three_dim_flags[$(element).attr('id')] == 'True'){
        // 変数初期化
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;
        console.log(element)
        
        element.addEventListener(
            EVENT.TOUCH_START,
            three_dim_info[$(element).attr('id')]["mousedownevent"] = onDocumentMouseDown.bind(element, three_dim_info[$(element).attr('id')]["camera"], tag_tops, tag_lefts),
            false );
        
        // 動画のサイズ、アスペクト比変更
        var camera = three_dim_info[$(element).attr('id')]["camera"];
        var renderer = three_dim_info[$(element).attr('id')]["renderer"];
        // 動画のサイズ、アスペクト比変更
        camera.aspect = $(`#${main_video_id}`).width() / $(`#${main_video_id}`).height();
        camera.updateProjectionMatrix();
        renderer.setSize( $(`#${main_video_id}`).width(), $(`#${main_video_id}`).height() );
    }
    // メインの動画が360度動画か
    if(three_dim_flags[main_video_id] == 'True'){
        // マウスドラッグイベント削除
        document.getElementById(main_video_id).removeEventListener(
            EVENT.TOUCH_START,
            three_dim_info[main_video_id]["mousedownevent"],
            false );
        // カメラのポジションを初期値に設定
        var camera = three_dim_info[main_video_id]["camera"];
        var renderer = three_dim_info[main_video_id]["renderer"];
        var scene = three_dim_info[main_video_id]["scene"];
        phi = THREE.Math.degToRad( 90 - 0 );
        theta = THREE.Math.degToRad( 0 );
        camera.position.x = 100 * Math.sin( phi ) * Math.cos( theta );
        camera.position.y = 100 * Math.cos( phi );
        camera.position.z = 100 * Math.sin( phi ) * Math.sin( theta );
        camera.lookAt( 0, 0, 0 );
        renderer.render( scene, camera );
        // 動画のサイズ、アスペクト比変更
        camera.aspect = video_width / video_height;
        camera.updateProjectionMatrix();
        renderer.setSize( video_width, video_height );
    }
    $('#video-field').children('.video').prop('muted', true);
    $(element).before($('#video-field').children('.video'));
    $('#video-field').prepend($(element));
    $(element).off();
    $('input[name="video"]').val($(element).attr('id'));
    videoClickEvent();
    // 別ビデオに紐づくタグを非表示にする
    obj_link_tags.forEach(function(tag, index){
        if($('.video').first().attr('id') != tag["fields"]["video"]) {
                tag_elements[index].style.visibility = "hidden";
        }
    });
}

// story閉じるボタン
$('#story-close-btn').on('click', function(e) {
    $('#story-tag-area').css('display', 'none');
});

// 終了タグ閉じるボタン
$('#endtag-close-btn').on('click', function(e) {
    $('#endtag-field-wrap').css('display', 'none');
});