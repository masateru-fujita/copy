// サイドフォーム表示イベント
$(".display-form-btn").click(function(){
　　if($(".add-form").css("right") == "-400px"){
        $(".add-form").animate({"right":"0"});
        $(".display-form-btn").animate({"right":"400px"});
        $(".display-form-btn").text("閉じる");
　　}else{
        $(".add-form").animate({"right":"-400px"});
        $(".display-form-btn").animate({"right":"0"});
        $(".display-form-btn").text("追加");
　　}
});

// ファイル編集時イベント
$('.file').on('change', function () {
    var file = $(this).prop('files')[0];
    $(this).parent().parent().children('.file-name').text(file.name)
});

// 動画タイプ変更時イベント
changeThreeDimensionalFlg();
function changeThreeDimensionalFlg(){
    $('input[name="three_dimensional_flg"]').change(function() {
        if ($(this).prop('checked')){
            $(this).parent().parent().find('input[name="three_dimensional_flg"]').prop('checked', false);
            $(this).prop('checked', true);
        }
        else {
            $(this).prop('checked', true);
        }
    });
};

// スイッチング動画追加ボタンイベント
$('.add-switching-video').on('click', function () {
    var index = $('.file-col').length;
    var file_col = $('.file-col').last().clone();
    file_col.find('.file').val(null);
    file_col.find('.file').attr("id", 'sub-video' + index);
    file_col.find('label').attr("for", 'sub-video' + index);
    file_col.children('.file-name').text('選択されていません');
    file_col.find('.file').on('change', function () {
        var file = $(this).prop('files')[0];
        $(this).parent().parent().children('p').text(file.name)
    });
    var three_dimensional_ele = $('.check-col').first().clone();
    three_dimensional_ele.find('input[name="three_dimensional_flg"]').prop('checked', false);
    three_dimensional_ele.find('input[name="three_dimensional_flg"]').first().prop('checked', true);
    
    $('.file-col').parent().append(file_col, three_dimensional_ele);
    changeThreeDimensionalFlg();
});

addTransitionEvent();
addEditEvent();
addDeleteEvent();

// Div要素ページ遷移イベント
function addTransitionEvent(){
    $(".video-box").each(function(index, element) {
        $(element).on("click", function () {
            window.location.href = '/video_detail/' + videoIds[index];
        });
    });
};

// 編集ボタンイベント
function addEditEvent(){
    $(".edit-btn").each(function(index, element) {
        $(element).on("click", function (e) {
            // pタグを入力フォームに置き換える
            var title_input = $(this).parent().parent().find('p');
            var title_val = title_input.text();
            title_input.replaceWith('<input type="text" name="title" class="edit-title" value="'
                + title_input.text()
                + '">');
    
            // プロジェクトのclickイベント削除
            $('.video-box, .edit-btn, .delete-btn').css('cursor', 'default').off();
            $('.edit-title').focus();
            // focusが外れた時(.blur)にAjax通信でDBに保存
            $('.edit-title').blur(function(e){
                // 値が変更されていればAjax通信
                if($('.edit-title').val() != title_val){
                    // Ajax通信を開始する
                    $.ajax({
                        url: editUrl,
                        method: "GET",
                        data: {"id": videoIds[index], "title": $('.edit-title').val()}
                    })
                    .then(
                        // 1つめは通信成功時のコールバック
                        function (data) {
                            title_input.text(data);
                            console.log("読み込み成功");
                        },
                        // 2つめは通信失敗時のコールバック
                        function () {
                            console.log("読み込み失敗");
                        }
                    );
                }
                // pタグに置換
                $('.edit-title').replaceWith(title_input);
                // タグにclickイベント付与(外れた時に要素クリックしているとクリックイベントが発火してしまうため遅らせる)
                title_input.delay(500).queue(function(){
                    addTransitionEvent();
                    addEditEvent();
                    addDeleteEvent();
                    $('.video-box, .edit-btn, .delete-btn').css('cursor', 'pointer');
                });
            });
        });
    });
};

// 削除ボタンイベント
function addDeleteEvent(){
    $(".delete-btn").each(function(index, element) {
        $(element).on("click", function (e) {
            if (confirm('紐づく動画やタグも削除されます\n削除しますか？')) {
                window.location.href = '/delete_video/' + videoIds[index];
            }
            e.stopPropagation();
        });
    });
};