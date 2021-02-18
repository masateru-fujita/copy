// -------------------------------------------Chart.js-----------------------------------------------------

// チャートに表示するラベル名定義
const access_label = "アクセス回数";
const action_label = "アクション回数";
const link_label = "リンクタグクリック回数";
const popup_label = "ポップアップクリック回数";
const popup_btn_label = "ポップアップボタンクリック回数";
const story_label = "ストーリー遷移回数";
const story_back_label = "ストーリー戻り回数";
const switch_label = "スイッチ回数";

var analysis_data = null;
// ラベル作成（一旦一日）
var label_data = [];
var base_date = new Date();
// 一週間は6で
base_date.setDate(base_date.getDate() - 6);
for (let index = 0; index <= 6; index++) {
    for (let time_index = 0; time_index <= 23; time_index++) {
        var time_label = new Date(base_date.getFullYear(), base_date.getMonth(), base_date.getDate(), time_index, 0, 0);
        label_data.push(time_label);
    }
    base_date.setDate(base_date.getDate() + 1);
}

// チャート作成
var main_chart = new Chart($('#main-chart'), {
    data: {
        labels: label_data,
        datasets: [
            // チェックされているものを追加していく
        ]
    },
    options: {
        tooltips: {
            mode: 'index',
            axis: 'y',
            callbacks : {
                title: function(tooltipItems) {
                    var date = new Date(tooltipItems[0].label);
                    return date.getFullYear() + '年' + date.getMonth() + '月' + date.getDate() + '日' + date.getHours() + '時';
                }
            }
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                },
                ticks: {
                    autoSkip: false,
                    callback: function(value) {
                        return (value.getHours() == 0 || value.getHours() == 12)
                            ? (value.getHours() == 12)
                                ? value.getHours() + '時'
                                : [value.getHours() + '時', formatDate(value)]
                            : '';
                    },
                    maxRotation: 0,
                    minRotation: 0,
                },
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                    stepSize: 1,
                },
            }],
        },
    },
});

// ----------------------------------チェックボックス変更時関数
// chartに設定するデータ作成関数
function createChartData(func){
    var data = [];
    for (let label_index = 0; label_index < label_data.length - 1; label_index++) {
        // 比較する最初の要素作成
        start_datetime = label_data[label_index];
        // 比較する2番目の要素作成
        second_datetime = label_data[label_index + 1];
        
        // analysisのカウント追加
        data.push(func(start_datetime, second_datetime));
    }
    return data;
}

// チャートに追加関数
function addChart(data){
    main_chart.data.datasets.push(data);
    main_chart.update();
}

// チャートデータ削除関数
function deleteChart(label){
    main_chart.data.datasets.forEach(function(data, index){
        if(data.label == label){
            main_chart.data.datasets.splice(index, 1);
            main_chart.update();
        }
    });
}

// アクセス回数チェックボックス変更時
$('#chart-access-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(accessChartFunc);
        var chart_data = {
            type: 'bar',
            data: data,
            label: access_label,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(access_label);
    }
});

// アクセス回数計算関数
function accessChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            count = count + 1;
        }
    });
    return count;
}

// アクション回数チェックボックス変更時
$('#chart-action-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(actionChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: action_label,
            borderColor : "rgba(254,97,132,0.8)",
            pointBackgroundColor : "rgba(254,97,132,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(action_label);
    }
});

function actionChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            count = count + target.actionAnalysis.length;
        }
    });
    return count;
}

// リンクタグクリック回数チェックボックス変更時
$('#chart-link-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(linkChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: link_label,
            borderColor : "rgba(255,255,0,0.8)",
            pointBackgroundColor : "rgba(255,255,0,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(link_label);
    }
});

function linkChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        // アクセス回数分ループ
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            // アクションが行われているか判定
            if(target.actionAnalysis.length){
                target.actionAnalysis.forEach(action => {
                    if(action.action_type == 'link'){
                        count = count + 1;
                    }
                })
            }
        }
    });
    return count;
}

// ポップアップタグクリック回数チェックボックス変更時
$('#chart-popup-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(popupChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: popup_label,
            borderColor : "rgba(255,0,255,0.8)",
            pointBackgroundColor : "rgba(255,0,255,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(popup_label);
    }
});

function popupChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        // アクセス回数分ループ
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            // アクションが行われているか判定
            if(target.actionAnalysis.length){
                target.actionAnalysis.forEach(action => {
                    if(action.action_type == 'popup'){
                        count = count + 1;
                    }
                })
            }
        }
    });
    return count;
}

// ポップアップボタンクリック回数チェックボックス変更時
$('#chart-popup-btn-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(popupbtnChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: popup_btn_label,
            borderColor : "rgba(126,255,43,0.8)",
            pointBackgroundColor : "rgba(0,255,255,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(popup_btn_label);
    }
});

function popupbtnChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        // アクセス回数分ループ
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            // アクションが行われているか判定
            if(target.actionAnalysis.length){
                target.actionAnalysis.forEach(action => {
                    if(action.popup_btn_flg == true){
                        count = count + 1;
                    }
                })
            }
        }
    });
    return count;
}

// ストーリータグクリック回数チェックボックス変更時
$('#chart-story-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(storyChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: story_label,
            borderColor : "rgba(0,255,255,0.8)",
            pointBackgroundColor : "rgba(0,255,255,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(story_label);
    }
});

function storyChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        // アクセス回数分ループ
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            // アクションが行われているか判定
            if(target.actionAnalysis.length){
                target.actionAnalysis.forEach(action => {
                    if(action.action_type == 'story'){
                        count = count + 1;
                    }
                })
            }
        }
    });
    return count;
}

// ストーリー戻り回数チェックボックス変更時
$('#chart-storyback-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(storybackChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: story_back_label,
            borderColor : "rgba(56,43,76,0.8)",
            pointBackgroundColor : "rgba(56,43,76,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(story_back_label);
    }
});

function storybackChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        // アクセス回数分ループ
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            // アクションが行われているか判定
            if(target.actionAnalysis.length){
                target.actionAnalysis.forEach(action => {
                    if(action.action_type == 'story_back'){
                        count = count + 1;
                    }
                })
            }
        }
    });
    return count;
}

// スイッチング回数チェックボックス変更時
$('#chart-switch-count').change(function() {
    if($(this).prop('checked')){
        var data = createChartData(switchChartFunc);
        var chart_data = {
            type: 'line',
            data: data,
            label: switch_label,
            borderColor : "rgba(121,8,216,0.8)",
            pointBackgroundColor : "rgba(56,43,76,0.8)",
            fill: false,
            pointRadius: 0.1,
            borderWidth: 1.5,
            lineTension: 0,
            pointHitRadius: 15,
        };
        addChart(chart_data);
    }
    else{
        deleteChart(switch_label);
    }
});

function switchChartFunc(start_datetime, second_datetime){
    var count = 0;
    analysis_data.forEach(target => {
        // アクセス回数分ループ
        if(start_datetime < new Date(target.access_time) && new Date(target.access_time) <= second_datetime){
            // アクションが行われているか判定
            if(target.actionAnalysis.length){
                target.actionAnalysis.forEach(action => {
                    if(action.action_type == 'switch'){
                        count = count + 1;
                    }
                })
            }
        }
    });
    return count;
}

// ----------------------------------------------------------★★★ドーナツテストだよユーザえーじぇんと★★★---------------------------------------------------------
function createPieChart(labels, data, colors, element){
    var myPieChart = new Chart(element,{
        type: 'pie',
        data: {
            labels: labels,
            datasets:[{
                backgroundColor: colors,
                data: data,
                borderWidth: 0,
            }],
        },
    });
}

// 端末データ作成関数
function createTerminalData(analysis){
    var sp_count = 0;
    var tablet_count = 0;
    var pc_count = 0;
    analysis.forEach(target => {
        var ua = target.user_agent;
        if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
            // スマートフォン用コード
            sp_count = sp_count + 1;
        } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
            // タブレット用コード
            tablet_count = tablet_count + 1;
        } else {
            // PC用コード
            pc_count = pc_count + 1;
        }
    });
    return [["スマートフォン", "パソコン", "タブレット"], [sp_count, pc_count, tablet_count]];
}

// ブラウザデータ作成関数(ChoromeとFireFox以外でデータ取れませんでした。)
function createBrowserData(analysis){
    var ie_count = 0;
    var edge_count = 0;
    var gc_count = 0;
    var safari_count = 0;
    var firefox_count = 0;
    var other = 0;
    analysis.forEach(target => {
        var ua = target.user_agent;
        if(ua.indexOf('msie') != -1 ||
            ua.indexOf('trident') != -1) {
                ie_count = ie_count + 1;
        } else if(ua.indexOf('Edge') != -1) {
            edge_count = edge_count + 1;
        } else if(ua.indexOf('Chrome') != -1) {
            gc_count = gc_count + 1;
        } else if(ua.indexOf('safari') != -1) {
            safari_count = safari_count + 1;
        } else if(ua.indexOf('Firefox') != -1) {
            firefox_count = firefox_count + 1;
        } else {
            other = other + 1;
        }
    });
    return [["Internet Exprorer", "Edge", "Google Chrome", "Safari", "FireFox", "その他"],
        [ie_count, edge_count, gc_count, safari_count, firefox_count, other]];
}
// ------------------------------------------------------★★★ドーナツテストだよユーザえーじぇんと★★---------------------------------------------------------

// ------------------------------------------------------------------------------------------------

// 何秒以上再生したらViewとみなすか（5秒）
var view_rate = 5;

// 分析データ取得
ajaxRequest("get_analysis_all", null).done(function(result){
    // 総表示回数設定
    $('.display-count').text(result.length);

    var view_count = 0;

    var all_time = 0;

    var action_count = 0;

    var total_time = 0;

    // storyを含めた秒数計算
    result.forEach(userAnalysis => {
        total_time = total_time + TimeToNumber(userAnalysis.end_time);
        userAnalysis.actionAnalysis.forEach(action => {
            if(action.story_play_time != null){
                total_time = total_time + TimeToNumber(action.story_play_time);
            }
        });
        action_count = action_count + userAnalysis.actionAnalysis.length;
        // view_rateと比較し、超えていたら視聴回数+1
        if(view_rate < total_time){
            view_count = view_count + 1;
        }

        // 総再生時間計算
        all_time = all_time + total_time;
    });

    $('.view-count').text(view_count);
    $('.play-time').text(NumberToTime(all_time));
    $('.view-rate').text((view_count != 0) ? Math.floor((view_count / result.length) * 100) + '%': 0);
    $('.play-avg').text((all_time != 0) ? NumberToTime(all_time / view_count) : 0);
    $('.action-count').text(action_count);
    
    analysis_data = result;

    // ---------------★★★ドーナツテストだよユーザえーじぇんと★★-----------------
    var color = [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)"
    ];
    var [terminal_label, terminal_data] = createTerminalData(result);
    createPieChart(terminal_label, terminal_data, color, $('#terminal-chart'));

    color = [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)",
        "rgb(255, 255, 0)",
        "rgb(0, 255, 255)",
        "rgb(255, 0, 255)"
    ];
    var [browser_label, browser_data] = createBrowserData(result);
    createPieChart(browser_label, browser_data, color, $('#browser-chart'));
    // ---------------★★★ドーナツテストだよユーザえーじぇんと★★-----------------

}).fail(function(result){
    console.log(result.statusText);
});

// 時:分:秒.ミリ秒を秒数に変更
function TimeToNumber(time){
    console.log(time);
    var time_list = time.split(":");
    var total = (Number(time_list[0]) * 360) + (Number(time_list[1]) * 60) + Number(time_list[2]);
    return total;
}

// 秒数を時:分:秒.ミリ秒に変換
function NumberToTime(number){
    var h = Math.floor(number % (24 * 60 * 60) / (60 * 60));
    var m = Math.floor(number % (24 * 60 * 60) % (60 * 60) / 60);
    var s = Math.floor(number % (24 * 60 * 60) % (60 * 60) % 60);
    h = ("00" + h).slice(-2);
    m = ("00" + m).slice(-2);
    s = ("00" + s).slice(-2)
    return h + ":" + m + ":" + s;
}

// 時間を時、分、秒にformat
function formatDate(date){
    // var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return m + '月' + d + '日';
}

// Ajax通信関数
function ajaxRequest(url, data){
    return $.ajax({
        url: url,
        method: "GET",
        data: data,
    })
}

// トータル、ユニークチェックボックス
$('input:checkbox').click(function() {
    $(this).closest('.display_type').find('input:checkbox').not(this).prop('checked', false);
});

// ----------------------サイドバープロジェクト一覧作成-----------------------------
$('.all-project').on("click", function(e){
    setFilterAnalysis();
});

// 右のProject一覧作成（ネストしまくりで再起呼び出ししたいけどVideoにタグがついているためできない、なんかやり方あるかも）
ajaxRequest("get_project_list", null).done(function(result){
    // プロジェクト一覧ループ
    if(result.length){
        // project親Element作成
        var project_box = createUlElement("project-box");
        result.forEach(project => {
            // projectElement作成
            var project_element = createLiElements("project", project.title);

            if(project.videorelations.length){
                project_element.addClass('tri');
                // videorelation親Element作成
                var videorelation_box = createUlElement("videorelation-box");
                project.videorelations.forEach(videorelation => {
                    // videorelationElement作成
                    var videorelation_element = createLiElements("videorelation", videorelation.title);

                    if(videorelation.videos.length){
                        videorelation.videos.forEach(videos => {

                            if(videos.linktags.length){
                                videorelation_element.addClass('tri');
                                // tag親element作成
                                var tag_box = createUlElement("tag-box");
                                videos.linktags.forEach(tag => {
                                    // tagElement作成
                                    var tag_element = createLiElements("tag", tag.title);
                                    $(tag_box).append(tag_element);
                                    tag_element.on("click", function(e){
                                        e.stopPropagation();
                                    });
                                });
                                $(videorelation_element).append(tag_box);
                                tag_box.hide();
                            }
                            
                        });
                        videorelation_element.on("click", function(e){
                            $(this).children("ul").toggle(200);
                            e.stopPropagation();
                        });
                    }
                    videorelation_element.on("click", function(e){
                        setFilterAnalysis('videorelation', videorelation.id);
                    });

                    $(videorelation_box).append(videorelation_element);
                });
        
                $(project_element).append(videorelation_box);
                videorelation_box.hide();
                // ビデオリレーション表示イベント付与
                project_element.on("click", function(e){
                    $(this).children("ul").toggle(200);
                });
            }

            // Analysisデータ取得
            project_element.on("click", function(e){
                setFilterAnalysis('project', project.id);
            });
            $(project_box).append(project_element);
        });

        $('.project-list').append(project_box);
    }
    // 子要素のあるリストにクリックイベント付与
    $('.tri').on("click", function(e){
        $(this).toggleClass('tri-clicked');
    });
}).fail(function(result){
    console.log(result.statusText);
});

// 右のプロジェクト一覧ul作成関数
function createUlElement(className){
    return $('<ul></ul>', {
        "class": className,
    });
}
// 右のプロジェクト一覧li作成関数
function createLiElements(className, text){
    return $('<li></li>', {
        "class": className,
        "text": text,
    });
}

// サイドバークリック時紐づくanalysis取得
function setFilterAnalysis(section = null, id = null){
    var url = "";
    switch (section) {
        case 'project':
            url = "get_project_analysis/" + id;
            break;
    
        case 'videorelation':
            url = "get_videorelation_analysis/" + id;
            break;
        
        default:
            url = "get_analysis_all";
            break;
    }
    if(url != ""){
        ajaxRequest(url, null).done(function(result){
            analysis_data = result;
            if($('#chart-access-count').prop('checked')){
                changeChartData(access_label, createChartData(accessChartFunc));
            }
            if($('#chart-action-count').prop('checked')){
                changeChartData(action_label, createChartData(actionChartFunc));
            }
            if($('#chart-link-count').prop('checked')){
                changeChartData(link_label, createChartData(linkChartFunc));
            }
            if($('#chart-popup-count').prop('checked')){
                changeChartData(popup_label, createChartData(popupChartFunc));
            }
            if($('#chart-popup-btn-count').prop('checked')){
                changeChartData(popup_btn_label, createChartData(popupbtnChartFunc));
            }
            if($('#chart-story-count').prop('checked')){
                changeChartData(story_label, createChartData(storyChartFunc));
            }
            if($('#chart-storyback-count').prop('checked')){
                changeChartData(story_back_label, createChartData(storybackChartFunc));
            }
            if($('#chart-switch-count').prop('checked')){
                changeChartData(switch_label, createChartData(switchChartFunc));
            }
            main_chart.update();
        }).fail(function(result){
            console.log(result.statusText);
        });
    }
}

// ラベル名が一致するデータ変更
function changeChartData(label_name, target_data){
    main_chart.data.datasets.forEach(function(data, index){
        if(data.label == label_name){
            main_chart.data.datasets[index].data = target_data;
        }
    });
}
// ---------------------------------------------------