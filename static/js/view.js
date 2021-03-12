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

var three_dim_info = {};

// video読み込み後
$('.video').first().on('loadedmetadata', function(){
    $.each($('.video'), function(index, x){
        if(three_dim_flgs[x.id]){
            var [camera, renderer, scene, mouseDownEvent, video] =  createThreeDimVideo(x, index);
            // Videoに紐づく3D情報、ビデオ要素格納
            three_dim_info[x.id] = {"camera": camera, "renderer": renderer, "scene": scene, "mousedownevent": mouseDownEvent, "video": video};
        }
    });
    $('#time-duration').text(timeFormat($(this)[0].duration));
    $('#frame-total').text(Math.ceil($(this)[0].duration * fps));
    videoClickEvent();
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
        if(three_dim_flgs[$('.video').first().attr('id')]){
            $('#frame-now').text(Math.ceil(three_dim_info[$('.video').first().attr('id')]["video"].currentTime * fps));
            // 現在の再生場所変更
            $('#seekbar-now').css('left', (three_dim_info[$('.video').first().attr('id')]["video"].currentTime / $('.video').first().duration) * 100 + "%");

            $("#time-current").text(timeFormat(three_dim_info[$('.video').first().attr('id')]["video"].currentTime));

            setEndTime(three_dim_info[$('.video').first().attr('id')]["video"].currentTime);
        }
        else
        {
            $('#frame-now').text(Math.ceil($('.video').first().get(0).currentTime * fps));
            // 現在の再生場所変更
            $('#seekbar-now').css('left', ($('.video').first().get(0).currentTime / $('.video').first().get(0).duration) * 100 + "%");

            $("#time-current").text(timeFormat($('.video').first().get(0).currentTime));

            setEndTime($('.video').first().get(0).currentTime);
        }

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

// 動画終了時イベント
videoEndedEvent()
function videoEndedEvent(){
    $('.video').first().on('ended', function() {
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
            if(three_dim_flgs[$(element).attr("id")]){
                three_dim_info[$(element).attr("id")]["video"].pause();
            }
            else
            {
                element.pause();
            }
        });
        path = path.replace('stop_btn.png', 'play_btn.png');
        clearInterval(videoFrameInterval);
    }
    else {
        is_playing = true;
        $('.video').each(function(index, element){
            if(three_dim_flgs[$(element).attr("id")]){
                three_dim_info[$(element).attr("id")]["video"].play();
            }
            else
            {
                element.play();
            }
        });
        path = path.replace('play_btn.png', 'stop_btn.png');
        videoFrameEvent();
    }
    $('.video-btn').attr('src', path);
}

// seekbarドラッグ時イベント
$('.seekbar').on('mousedown', function(e) {
    $('#seekbar-now').css('left', (e.offsetX / $('.seekbar').width()) * 100 + '%');
    $('.video').each(function(index, element){
        if(three_dim_flgs[$(element).attr("id")]){
            three_dim_info[$(element).attr("id")]["video"].currentTime = three_dim_info[$(element).attr("id")]["video"].duration * (e.offsetX / $('.seekbar').width());
        }
        else
        {
            element.currentTime = element.duration * (e.offsetX / $('.seekbar').width());
        }
    });

    $('.seekbar').on('mousemove', function(e) {
        $('#seekbar-now').css('left', (e.offsetX / $('.seekbar').width()) * 100 + '%');
        $('.video').each(function(index, element){
            if(three_dim_flgs[$(element).attr("id")]){
                three_dim_info[$(element).attr("id")]["video"].currentTime = three_dim_info[$(element).attr("id")]["video"].duration * (e.offsetX / $('.seekbar').width());
            }
            else
            {
                element.currentTime = element.duration * (e.offsetX / $('.seekbar').width());
            }
        });
    });

    $('.seekbar').on('mouseup', function(e) {
        $('.seekbar').off('mousemove');
        $('.seekbar').off('mouseup');
    });
});

// サブ動画クリック時のイベント
function videoClickEvent(){
    $('.video-flex-box').children('.video').on("click", function () {
        main_video_id = $('.video').first().attr("id");
        // Ajax通信を開始する
        var action_time = (three_dim_flgs[main_video_id])
            ? three_dim_info[main_video_id]["video"].currentTime
            : $('.video').first().get(0).currentTime;
        data = {
            "action_time": action_time,
            "user_analysis_id": user_analysis_id,
            "action_type": "switch",
            "switch_video_id": $(this).attr('id'),
        };
        ajaxRequest(set_action_analysis, data).done(function(result){
            console.log(result);
        }).fail(function(result){
            console.log(result);
        });
        // 動画の大きさ変更のため、クリックされた動画の大きさ保持しておく
        var video_width = $(this).width();
        var video_height = $(this).height();
        // クリックされた動画の処理
        if(three_dim_flgs[$(this).attr("id")]){
            three_dim_info[$(this).attr("id")]["video"].muted = false;
            // 動画の時間を切り替える
            $('#time-duration').text(timeFormat(three_dim_info[$(this).attr("id")]["video"].duration));
            $('#frame-total').text(Math.ceil(three_dim_info[$(this).attr("id")]["video"].duration * fps));
            this.addEventListener(
                EVENT.TOUCH_START,
                three_dim_info[$(this).attr('id')]["mousedownevent"] = onDocumentMouseDown.bind(this, three_dim_info[$(this).attr('id')]["camera"]),
                false );
            
            // 動画のサイズ、アスペクト比変更
            var camera = three_dim_info[$(this).attr('id')]["camera"];
            var renderer = three_dim_info[$(this).attr('id')]["renderer"];
            // 動画のサイズ、アスペクト比変更
            camera.aspect = $(`#${main_video_id}`).width() / $(`#${main_video_id}`).height();
            camera.updateProjectionMatrix();
            renderer.setSize( $(`#${main_video_id}`).width(), $(`#${main_video_id}`).height() );
        }
        else
        {
            $(this)[0].muted = false;
            // 動画の時間を切り替える
            $('#time-duration').text(timeFormat($(this)[0].duration));
            $('#frame-total').text(Math.ceil($(this)[0].duration * fps));
        }
        // メインで再生している動画の処理
        if(three_dim_flgs[main_video_id]){
            // マウスドラッグイベント削除
            document.getElementById(main_video_id).removeEventListener(
                EVENT.TOUCH_START,
                three_dim_info[main_video_id]["mousedownevent"],
                false );
            three_dim_info[main_video_id]["video"].muted = true;
            $(three_dim_info[main_video_id]["video"]).off("ended");
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
        else
        {
            $('.video').first().get(0).muted = true;
            $('.video').first().off("ended");
        }
        $(this).before($('.video').first());
        $('.main-video-box').prepend($(this));
        $(this).off();
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
        width: $('.video').first().width() * (json_tag['fields']['width'] / 100) + 'px',
        height: $('.video').first().height() * (json_tag['fields']['height'] / 100) + 'px',
        top: $('.video').first().height() * (json_tag['fields']['y_coordinate'] / 100) + 'px',
        left: $('.video').first().width() * (json_tag['fields']['x_coordinate'] / 100) + 'px',
    });
    $(window).resize(function() {
        tag.css({
            'width': $('.video').first().width() * (json_tag["fields"]["width"] / 100) + 'px',
            'height': $('.video').first().height() * (json_tag["fields"]["height"] / 100) + 'px',
            'top': $('.video').first().height() * (json_tag["fields"]["y_coordinate"] / 100) + 'px',
            'left': $('.video').first().width() * (json_tag["fields"]["x_coordinate"] / 100) + 'px',
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
                var action_time = (three_dim_flgs[$('.video').first().attr("id")])
                    ? three_dim_info[$('.video').first().attr("id")]["video"].currentTime
                    : $('.video').first().get(0).currentTime;
                // Ajax通信を開始する
                data = {
                    "action_time": action_time,
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
                var action_time = (three_dim_flgs[$('.video').first().attr("id")])
                    ? three_dim_info[$('.video').first().attr("id")]["video"].currentTime
                    : $('.video').first().get(0).currentTime;
                data = {
                    "action_time": action_time,
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
                if(three_dim_flgs[$('.video').first().attr("id")]){
                    before_video_times.push(three_dim_info[$('.video').first().attr("id")]["video"].currentTime);
                }
                else
                {
                    before_video_times.push($('.video').first().get(0).currentTime);
                }

                // Ajax通信を開始する
                var action_time = (three_dim_flgs[$('.video').first().attr("id")])
                    ? three_dim_info[$('.video').first().attr("id")]["video"].currentTime
                    : $('.video').first().get(0).currentTime;
                data = {
                    "action_time": action_time,
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
                    (three_dim_flgs[$('.video').first().attr("id")])
                        ? three_dim_info[$('.video').first().attr("id")]["video"].duration * (link_tag['fields']['story_start_flame'] / (three_dim_info[$('.video').first().attr("id")]["video"].duration * fps))
                        : $('.video').first().get(0).duration * (link_tag['fields']['story_start_flame'] / ($('.video').first().get(0).duration * fps))
                );
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
    // 戻るボタン押下アクション保存]
    var action_time = (three_dim_flgs[$('.video').first().attr("id")])
            ? three_dim_info[$('.video').first().attr("id")]["video"].currentTime
            : $('.video').first().get(0).currentTime;
    data = {
        "action_time": action_time,
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
            three_dim_info = {};
            three_dim_flgs = {};
            $('.video').off('ended');
            clearInterval(videoFrameInterval);
            $.each(video_datas, function(index, element){
                three_dim_flgs[element.pk] = element.fields.three_dimensional_flg;
                if(index == 0){
                    var video = $('<video></video>', {
                        "id": element.pk,
                        "class": "video",
                    }).append($('<source>', {
                        src: '/' + element["fields"]['video'],
                    }));
                    $('.main-video-box').prepend(video);
                }
                else{
                    $('.video-flex-box').children('video').remove();
                    var video = $('<video></video>', {
                        "id": element.pk,
                        "class": "video"
                    }).append($('<source>', {
                        src: '/' + element["fields"]['video'],
                    }));
                    $('.video-flex-box').append(video);
                }
            });
            
            // 次の時間計算
            // video読み込み後
            $('.video').first().on('loadedmetadata', function(){
                $.each($('.video'), function(index, x){
                    if(three_dim_flgs[x.id]){
                        var [camera, renderer, scene, mouseDownEvent, video] =  createThreeDimVideo(x, index);
                        // Videoに紐づく3D情報、ビデオ要素格納
                        three_dim_info[x.id] = {"camera": camera, "renderer": renderer, "scene": scene, "mousedownevent": mouseDownEvent, "video": video};
                    }
                });
                if(three_dim_flgs[$(this).attr("id")]){
                    $("#time-duration").text(timeFormat(three_dim_info[$(this).attr("id")]["video"].duration));
                    $("#frame-total").text(Math.ceil(three_dim_info[$(this).attr("id")]["video"].duration * fps));
                    three_dim_info[$(this).attr("id")]["video"].currentTime = start_time;
                }
                else
                {
                    $("#time-duration").text(timeFormat($(this).get(0).duration));
                    $("#frame-total").text(Math.ceil($(this).get(0).duration * fps));
                    $(this).get(0).currentTime = start_time;
                }
                is_playing = true;
                if(three_dim_flgs[$(this).attr('id')]){
                    $(three_dim_info[$(this).attr('id')]["video"]).get(0).play();
                }
                else
                {
                    $(this).get(0).play();
                }
            });
            $('.video-btn').attr('src', $('.video-btn').attr('src').replace('play_btn.png', 'stop_btn.png'));

            // サブビデオのクリックイベント付与
            videoClickEvent();

            $('.video').on('timeupdate', function(event) {
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

// Ajax通信関数
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
function setEndTime(time){
    if((is_story_flg == false) && (end_time < time))
    {
        end_time = time;
    }
    else if((is_story_flg == true) && (story_end_time < time))
    {
        story_end_time = time;
    }
}