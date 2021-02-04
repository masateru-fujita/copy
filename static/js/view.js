// 動画サイズ変更
$(document).ready(function () {
    hsize = $(window).height();
    $(".video-wrap").css("height", hsize + "px");
});
$(window).resize(function () {
    hsize = $(window).height();
    $(".video-wrap").css("height", hsize + "px");
});

var fps = 30;

// video読み込み後
$('.main-video-box').children('.video').on('loadedmetadata', function(){
    $('#time-duration').text(timeFormat($(this)[0].duration));
    $('#frame-total').text(Math.ceil($(this)[0].duration * fps));
});

// 時間フォーマット化
function timeFormat(time){
    time = Math.floor(time);
    var minute = (Math.floor(time / 60));
    var seconds = (time - (minute * 60));
    return ("0" + minute).slice(-2) + ":" + ("0" + seconds).slice(-2);
};

// 再生フラグ
var is_playing = false;
// 動画再生ボタンクリックイベント
$('#video-btn').on('click', function(e) {
    switchPlayFlg();
});

function videoFrameEvent(){
    videoFrameInterval = setInterval(function(){
        $('#frame-now').text(Math.ceil($('#main-video')[0].currentTime * fps));
        // 現在の再生場所変更
        $('#seekbar-now').css('left', ($('#main-video')[0].currentTime / $('#main-video')[0].duration) * 100 + "%");

        // タグ作成
        JSON.parse(json_tags).forEach(json_tag => {
            if(!$('#' + json_tag['pk']).length
                && json_tag['fields']['display_frame'] <= $('#frame-now').text()
                && json_tag['fields']['hide_frame'] > $('#frame-now').text()){
                createTags(json_tag);
            }
            else if(json_tag['fields']['display_frame'] >= $('#frame-now').text()
                || json_tag['fields']['hide_frame'] < $('#frame-now').text()){
                $('#' + json_tag['pk']).remove();
            }
        });
    }, fps);
}

// 現在の再生時間取得
$('#main-video').on('timeupdate', function(event) {
    $("#time-current").text(timeFormat($('#main-video')[0].currentTime));
});

// 動画終了時イベント
videoEndedEvent()
function videoEndedEvent(){
    $(".video-flex-box").children('.video').off("ended");
    $('#main-video').on('ended', function() {
        switchPlayFlg();

        // 終了タグ作成
        end_tag_json = JSON.parse(end_tag);
        if (end_tag_json.length != 0) {
            $('.endtag-title').text(end_tag_json[0]['fields']['title']);
            $('.endtag-content').text(end_tag_json[0]['fields']['content']);
            $('.endtag-field').css('display', 'block');
        }
    });
}

// 動画再生フラグ変更　アイコン変更
function switchPlayFlg(){
    var path = $('.video-btn').attr('src');
    if(is_playing) {
        is_playing = false;
        $('.video').each(function(index, element){
            element.pause();
        });
        path = path.replace('stop_btn.png', 'play_btn.png');
        clearInterval(videoFrameInterval);
    }
    else {
        is_playing = true;
        $('.video').each(function(index, element){
            element.play();
        });
        path = path.replace('play_btn.png', 'stop_btn.png');
        videoFrameEvent();
    }
    $('.video-btn').attr('src', path);
}

// seekbarドラッグ時イベント
$('.seekbar').on('mousedown', function(e) {
    $('#seekbar-now').css('left', (e.offsetX / $('.seekbar').width()) * 100 + '%');
    $('#main-video')[0].currentTime = $('#main-video')[0].duration * (e.offsetX / $('.seekbar').width());

    $('.seekbar').on('mousemove', function(e) {
        $('#seekbar-now').css('left', (e.offsetX / $('.seekbar').width()) * 100 + '%');
        $('#main-video')[0].currentTime = $('#main-video')[0].duration * (e.offsetX / $('.seekbar').width());
    });

    $('.seekbar').on('mouseup', function(e) {
        $('.seekbar').off('mousemove');
        $('.seekbar').off('mouseup');
    });
});

// サブビデオクリックイベント
videoClickEvent();

function videoClickEvent(){
    $('.video-flex-box').children('.video').on("click", function () {
        $(this)[0].muted = false;
        $('#main-video')[0].muted = true;
        $(this).before($('#main-video'));
        $('.main-video-box').prepend($(this));
        $('#main-video').removeAttr('id');
        $(this).attr('id', 'main-video');
        $(this).off();
        // 動画の時間を切り替える
        $('#time-duration').text(timeFormat($(this)[0].duration));
        $('#frame-total').text(Math.ceil($(this)[0].duration * fps));  
        videoEndedEvent();
        videoClickEvent();
    });
}


// -----------------------------タグ作成-----------------------------
function createTags(json_tag){
    switch (json_tag['fields']['action_type']){
        case 'link':
            var tag = createLinkTag(json_tag['fields']);
            break;
        case 'popup':
            var tag = createPopupTag(json_tag['fields']);
            break;
        case 'story':
            var tag = createStoryTag(json_tag['fields']);
            break;
    }
    tag.attr('id', json_tag['pk']);
    tag.addClass('tag');
    tag.css({
        display: 'block',
        position: 'absolute',
        'background-color': 'rgba(120,120,120,0.9)',
        'opacity': '0.5',
        'cursor': 'pointer',
        width: $('#main-video').width() * (json_tag['fields']['width'] / 100) + 'px',
        height: $('#main-video').height() * (json_tag['fields']['height'] / 100) + 'px',
        top: $('#main-video').height() * (json_tag['fields']['x_coordinate'] / 100) + 'px',
        left: $('#main-video').width() * (json_tag['fields']['y_coordinate'] / 100) + 'px',
    });
    $(window).resize(function() {
        tag.css({
            'width': $('.video').first().width() * (json_tag["fields"]["width"] / 100) + 'px',
            'height': $('.video').first().height() * (json_tag["fields"]["height"] / 100) + 'px',
            'top': $('.video').first().height() * (json_tag["fields"]["x_coordinate"] / 100) + 'px',
            'left': $('.video').first().width() * (json_tag["fields"]["y_coordinate"] / 100) + 'px',
        });
    });
    $('.main-video-box').append(tag);
};

// リンクタグ作成関数
function createLinkTag(link_tag_fields){
    var tag = $('<div></div>', {
        on: {
            click: function(event){
                window.open(link_tag_fields['link_url'], '_blank');
                if(is_playing){
                    switchPlayFlg();
                }
            }
        }
    });
    return tag;
};

// ポップアップタグ作成関数
function createPopupTag(link_tag_fields){
    var tag = $('<div></div>', {
        on: {
            click: function(event){
                $('.popup-img-field').attr('src', '/' + link_tag_fields['popup_img']);
                $('.popup-text-field').text(link_tag_fields['popup_text']);
                switch (link_tag_fields['popup_type']){
                    case 'default':
                        $('.popup-img-field').css('display', 'block');
                        $('.popup-field').css('display', 'flex');
                        break;
                    case 'vertical':
                        $('.popup-img-field').css('display', 'block');
                        $('.popup-field').css('display', 'block');
                        break;
                    case 'text':
                        $('.popup-img-field').css('display', 'none');
                        $('.popup-field').css('display', 'block');
                        break;
                }
                $('.popup-field').css('display', 'block')
                if(is_playing){
                    switchPlayFlg();
                }
            }
        }
    });
    return tag;
};

// ポップアップ閉じるボタン押下時イベント
$('#popup-close-btn').on('click', function(e) {
    $('.popup-field').css('display', 'none');
});

$('#endtag-close-btn').on('click', function(e) {
    $('.endtag-field').css('display', 'none');
});

// storyタグ作成関数
function createStoryTag(link_tag_fields){
    var tag = $('<div></div>', {
        on: {
            click: function(event){
                // Ajax通信を開始する
                $.ajax({
                    url: next_video_url,
                    method: "GET",
                    data: {"next_video": link_tag_fields["story_next_video"]}
                })
                .then(
                    // 1つめは通信成功時のコールバック
                    function (data) {
                        // JSONデータ解析
                        var all_data = JSON.parse(data)[0];
                        
                        // videoデータ解析
                        var video_datas = JSON.parse(all_data["video"]);

                        // ビデオ削除後データ作成しなおす
                        $('.video').remove();
                        $.each(video_datas, function(index, element){
                            if(index == 0){
                                var video = $('<video></video>', {
                                    "id": "main-video",
                                    "class": "video",
                                }).append($('<source>', {
                                    src: '/' + element["fields"]['video'],
                                }));
                                $('.main-video-box').prepend(video);
                            }
                            else{
                                $('.video-flex-box').children('video').remove();
                                var video = $('<video></video>', {
                                    "class": "video"
                                }).append($('<source>', {
                                    src: '/' + element["fields"]['video'],
                                }));
                                $('.video-flex-box').append(video);
                            }
                        });
                        // サブビデオのクリックイベント付与
                        videoClickEvent();
                        
                        // 次の時間計算
                        // video読み込み後
                        $('#main-video').onloadedmetadata = function(){
                            $("#time-duration").text(timeFormat($('#main-video')[0].duration));
                            $("#frame-total").text(Math.ceil($('#main-video')[0].duration * fps));
                            $('#main-video')[0].currentTime = $('#main-video')[0].duration * (link_tag_fields['story_start_flame'] / ($('#main-video')[0].duration * fps));
                        };
                        is_playing = true;
                        $('.video').each(function(index, element){
                            element.play();
                        });
                        $('.video-btn').attr('src', $('.video-btn').attr('src').replace('play_btn.png', 'stop_btn.png'));

                        // 動画タグ情報を削除する
                        $('.tag').remove();
                        // link_tagデータ解析
                        json_tags = all_data["link_tag"];

                        end_tag = all_data["end_tag"];
                        videoEndedEvent();
                    },
                    // 2つめは通信失敗時のコールバック
                    function () {
                        console.log("読み込み失敗");
                    }
                );
            }
        }
    });
    return tag;
};