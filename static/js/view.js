// --------------------------------アクセス情報DB保存-------------------------------------
var user_analysis_id;
var is_first_play_flg = true;
var end_time = 0;
var is_story_flg = false;
var story_end_time = 0;

// csrf_tokenの取得
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// Ajax通信を開始する
var data = {
    "video_relation_id": location.pathname.replace(/[^0-9]/g, ''),
};
ajaxRequest(set_user_analysis, data).done(function(result) {
    user_analysis_id = result;
}).fail(function(result){
    console.log(result);
});

function dateFormat(date){
    return date.getFullYear() + '-' + date.getMonth() + 1 + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

// -----------------------------------------------------------------------------------------

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
    // var vid = document.getElementById("main-video");
    // vid.playbackRate = 2.0;
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
    if(is_first_play_flg){
        // Ajax通信を開始する
        data = {
            "user_analysis_id": user_analysis_id,
        };
        ajaxRequest(set_start_time, data).done(function(result){
            console.log(result);
        }).fail(function(result){
            console.log(result);
        });
    }
    switchPlayFlg();
});

function videoFrameEvent(){
    videoFrameInterval = setInterval(function(){
        $('#frame-now').text(Math.ceil($('#main-video')[0].currentTime * fps));
        // 現在の再生場所変更
        $('#seekbar-now').css('left', ($('#main-video')[0].currentTime / $('#main-video')[0].duration) * 100 + "%");

        $("#time-current").text(timeFormat($('#main-video')[0].currentTime));

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
    setEndTime();
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
        // Ajax通信を開始する
        splitUrl = $(this).children('source').attr('src').split('/');
        data = {
            "action_time": $('#main-video')[0].currentTime,
            "user_analysis_id": user_analysis_id,
            "action_type": "switch",
            "switch_video_id": splitUrl[splitUrl.length - 1].split('.')[0],
        };
        ajaxRequest(set_action_analysis, data).done(function(result){
            console.log(result);
        }).fail(function(result){
            console.log(result);
        });
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
            var tag = createLinkTag(json_tag);
            break;
        case 'popup':
            var tag = createPopupTag(json_tag);
            break;
        case 'story':
            var tag = createStoryTag(json_tag);
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
function createLinkTag(link_tag){
    var tag = $('<div></div>', {
        on: {
            click: function(event){
                window.open(link_tag['fields']['link_url'], '_blank');
                if(is_playing){
                    switchPlayFlg();
                }
                // Ajax通信を開始する
                data = {
                    "action_time": $('#main-video')[0].currentTime,
                    "user_analysis_id": user_analysis_id,
                    "tag_id": link_tag['pk'],
                    "action_type": "link",
                };
                ajaxRequest(set_action_analysis, data).done(function(result){
                    console.log(result);
                }).fail(function(result){
                    console.log(result);
                });
            }
        }
    });
    return tag;
};

// ポップアップタグ作成関数
var popup_analysis_id;
function createPopupTag(link_tag){
    var tag = $('<div></div>', {
        on: {
            click: function(event){
                // Ajax通信を開始する
                data = {
                    "action_time": $('#main-video')[0].currentTime,
                    "user_analysis_id": user_analysis_id,
                    "tag_id": link_tag['pk'],
                    "action_type": "popup",
                };
                ajaxRequest(set_action_analysis, data).done(function(result){
                    popup_analysis_id = result;
                }).fail(function(result){
                    console.log(result);
                });
                $('.popup-img-field').attr('src', '/' + link_tag['fields']['popup_img']);
                $('.popup-text-field').text(link_tag['fields']['popup_text']);
                switch (link_tag['fields']['popup_type']){
                    case 'default':
                        $('.popup-img-field').css('display', 'block');
                        $('.popup-switch-field').css('display', 'flex');
                        break;
                    case 'vertical':
                        $('.popup-img-field').css('display', 'block');
                        $('.popup-switch-field').css('display', 'block');
                        break;
                    case 'text':
                        $('.popup-img-field').css('display', 'none');
                        $('.popup-switch-field').css('display', 'block');
                        break;
                }
                // POPUPボタンがあれば削除する
                if($('.popup-btn-field').length){
                    $('.popup-btn-field').remove();
                }
                if((link_tag['fields']['popup_btn_text'] != '') && (link_tag['fields']['popup_btn_url'] != '')){
                    var popup_btn = $('<div></div>', {
                        class: "popup-btn-field",
                        text: link_tag['fields']['popup_btn_text'],
                        on: {
                            click: function(event){
                                window.open(link_tag['fields']['popup_btn_url'], '_blank');
                                // Ajax通信を開始する
                                data = {
                                    "popup_analysis_id": popup_analysis_id,
                                };
                                ajaxRequest(set_popup_flg, data).done(function(result){
                                    popup_analysis_id = result;
                                }).fail(function(result){
                                    console.log(result);
                                });
                            },
                        }
                    });
                    $('.popup-field').append(popup_btn);
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
var before_video_times = [];
var story_analysis_id;
function createStoryTag(link_tag){
    var tag = $('<div></div>', {
        on: {
            click: function(event){
                // すでにstoryだった際にstory_end_time格納
                if(is_story_flg)
                {
                    data = {
                        "story_analysis_id": story_analysis_id,
                        "story_end_time": story_end_time,
                    };
                    ajaxRequest(set_story_end_time, data).done(function(result){
                        console.log(result);
                    }).fail(function(result){
                        console.log(result);
                    });
                }
                is_story_flg = true;

                // 前のVideoに戻れるよう情報を保持しておく
                before_video_times.push($('#main-video')[0].currentTime);

                // Ajax通信を開始する
                data = {
                    "action_time": $('#main-video')[0].currentTime,
                    "user_analysis_id": user_analysis_id,
                    "tag_id": link_tag['pk'],
                    "action_type": "story",
                };
                ajaxRequest(set_action_analysis, data).done(function(result){
                    story_analysis_id = result;
                }).fail(function(result){
                    console.log(result);
                });

                createVideoForStory(
                    link_tag['fields']["story_next_video"],
                    $('#main-video')[0].duration * (link_tag['fields']['story_start_flame'] / ($('#main-video')[0].duration * fps)));
            }
        }
    });
    return tag;
};

$('#story-back-btn').on('click', function(e) {
    // story_end_time格納
    data = {
        "story_analysis_id": story_analysis_id,
        "story_end_time": story_end_time,
    };
    ajaxRequest(set_story_end_time, data).done(function(result){
        console.log(result);
    }).fail(function(result){
        console.log(result);
    });
    // 戻るボタン押下アクション保存
    data = {
        "action_time": $('#main-video')[0].currentTime,
        "user_analysis_id": user_analysis_id,
        "action_type": "story_back",
    };
    ajaxRequest(set_action_analysis, data).done(function(result){
        story_analysis_id = result;
    }).fail(function(result){
        console.log(result);
    });
    createVideoForStory(
        before_video_ids[before_video_ids.length - 2], 
        before_video_times[before_video_times.length - 1],
        true);
    before_video_ids.pop();
    before_video_times.pop();
});

// ストーリー用動画作成関数
function createVideoForStory(video_id, start_time, before_flg = false){
    // Ajax通信を開始する
    $.ajax({
        url: next_video_url,
        method: "GET",
        data: {"next_video": video_id}
    })
    .then(
        // 1つめは通信成功時のコールバック
        function (data) {
            // JSONデータ解析
            var all_data = JSON.parse(data)[0];
            
            // videoデータ解析
            var video_datas = JSON.parse(all_data["video"]);

            if(!before_flg){
                before_video_ids.push(video_datas[0]["fields"]["video_relation"]);
            }

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
                $('#main-video')[0].currentTime = start_time;
            };
            is_playing = true;
            $('.video').each(function(index, element){
                element.play();
            });
            $('.video-btn').attr('src', $('.video-btn').attr('src').replace('play_btn.png', 'stop_btn.png'));

            $('#main-video').on('timeupdate', function(event) {
                setEndTime();
            });

            // 動画タグ情報を削除する
            $('.tag').remove();
            // link_tagデータ解析
            json_tags = all_data["link_tag"];

            end_tag = all_data["end_tag"];
            
            videoEndedEvent();

            if(1 < before_video_ids.length){
                $("#story-back-btn").css('display', 'block');
                is_story_flg = true;
            }
            else {
                $("#story-back-btn").css('display', 'none');
                is_story_flg = false;
            }
        },
        // 2つめは通信失敗時のコールバック
        function () {
            console.log("読み込み失敗");
        }
    );
}

function ajaxRequest(url, data){
    // Ajax通信を開始する
    return $.ajax({
        url: url,
        method: "POST",
        data: data,
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
            }
        },
    })
}

// 画面離脱時DBLeaveTime格納(choromeでunloadに同期XHRできないためSendBeacon利用)
$(window).on("beforeunload", function() {
    // leave_time、end_time格納
    var data = new FormData();
    data.append("user_analysis_id", user_analysis_id);
    data.append("end_time", end_time);
    data.append("csrfmiddlewaretoken", getCookie("csrftoken"));
    navigator.sendBeacon(set_leave_time, data);

    // story_end_time格納
    if(story_analysis_id != undefined){
        data = new FormData();
        data.append("story_analysis_id", story_analysis_id);
        data.append("story_end_time", end_time);
        data.append("csrfmiddlewaretoken", getCookie("csrftoken"));
        navigator.sendBeacon(set_story_end_time, data);
    }
});


// 動画視聴時間設定関数
function setEndTime(){
    if((is_story_flg == false) && (end_time < $('#main-video')[0].currentTime))
    {
        end_time = $('#main-video')[0].currentTime;
    }
    else if((is_story_flg == true) && (story_end_time < $('#main-video')[0].currentTime))
    {
        story_end_time = $('#main-video')[0].currentTime;
    }
}