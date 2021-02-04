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

addTransitionEvent();
addEditTitleEvent();
addEditDescEvent();
addDeleteEvent();

// Div要素ページ遷移イベント
function addTransitionEvent(){
    $(".project-info").each(function(index, element) {
        $(element).on("click", function () {
            window.location.href = '/video_list/' + projectIds[index];
        });
    });
}

// タイトル編集ボタンイベント
function addEditTitleEvent(){
    $(".edit-title-btn").each(function(index, element) {
        $(element).on("click", function () {
            // pタグを入力フォームに置き換える
            var title_input = $(this).parent().parent().find('.title');
            var title_val = title_input.text();
            title_input.replaceWith('<input type="text" name="title" class="edit-title" value="'
                + title_input.text()
                + '">');
    
            // プロジェクトのclickイベント削除
            $('.edit-title-btn, .edit-description-btn, .delete-btn, .project-info').css('cursor', 'default').off();
            $('.edit-title').focus();
            // focusが外れた時(.blur)にAjax通信でDBに保存
            $('.edit-title').blur(function(){
                // 値が変更されていればAjax通信
                if($('.edit-title').val() != title_val){
                    // Ajax通信を開始する
                    $.ajax({
                        url: editUrl,
                        method: "GET",
                        data: {"id": projectIds[index], "title": $('.edit-title').val()}
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
                    addEditTitleEvent();
                    addEditDescEvent();
                    addDeleteEvent();
                    $('.edit-title-btn, .edit-description-btn, .delete-btn, .project-info').css('cursor', 'pointer');
                });
            });
        });
    });
}

// 詳細変更ボタンイベント
function addEditDescEvent(){
    $(".edit-description-btn").each(function(index, element) {
        $(element).on("click", function () {
            // pタグを入力フォームに置き換える
            var desc_input = $(this).parent().parent().find('.description');
            var desc_val = desc_input.text();
            desc_input.replaceWith('<textarea name="description" class="edit-description">'
                + desc_input.text()
                + '</textarea>');
    
            // プロジェクトのclickイベント削除
            $('.edit-title-btn, .edit-description-btn, .delete-btn, .project-info').css('cursor', 'default').off();
            $('.edit-description').focus();
            // focusが外れた時(.blur)にAjax通信でDBに保存
            $('.edit-description').blur(function(){
                console.log($('.edit-description').val());
                // 値が変更されていればAjax通信
                if($('.edit-description').val() != desc_val){
                    // Ajax通信を開始する
                    $.ajax({
                        url: editUrl,
                        method: "GET",
                        data: {"id": projectIds[index], "description": $('.edit-description').val()}
                    })
                    .then(
                        // 1つめは通信成功時のコールバック
                        function (data) {
                            desc_input.text(data);
                            console.log("読み込み成功");
                        },
                        // 2つめは通信失敗時のコールバック
                        function () {
                            console.log("読み込み失敗");
                        }
                    );
                }
                // pタグに置換
                $('.edit-description').replaceWith(desc_input);
                // タグにclickイベント付与(外れた時に要素クリックしているとクリックイベントが発火してしまうため遅らせる)
                desc_input.delay(500).queue(function(){
                    addTransitionEvent();
                    addEditTitleEvent();
                    addEditDescEvent();
                    addDeleteEvent();
                    $('.edit-title-btn, .edit-description-btn, .delete-btn, .project-info').css('cursor', 'pointer');
                });
            });
        });
    });
}

// 削除ボタンイベント
function addDeleteEvent(){
    $(".delete-btn").each(function(index, element) {
        $(element).on("click", function () {
            if (confirm('紐づく動画やタグも削除されます\n削除しますか？')) {
                    window.location.href = '/delete_project/' + projectIds[index];
            }
        });
    });
}