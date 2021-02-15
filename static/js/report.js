// 右のProject一覧作成（ネストしまくりで再起呼び出ししたいけどVideoにタグがついているためできない、なんかやり方あるかも）
ajaxRequest("get_projects", null).done(function(result){
    // プロジェクト一覧ループ
    if(result.length){
        // project親Element作成
        var project_box = createUlElement("project-box");
        result.forEach(project => {
            // projectElement作成
            var project_element = createLiElements("project", project.title);

            if(project.videorelations.length){
                // videorelation親Element作成
                var videorelation_box = createUlElement("videorelation-box");
                project.videorelations.forEach(videorelation => {
                    // videorelationElement作成
                    var videorelation_element = createLiElements("videorelation", videorelation.title);

                    if(videorelation.videos.length){
                        videorelation.videos.forEach(videos => {

                            if(videos.linktags.length){
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

                    $(videorelation_box).append(videorelation_element);
                });
        
                $(project_element).append(videorelation_box);
                videorelation_box.hide();
                project_element.on("click", function(e){
                    $(this).children("ul").toggle(200);
                });
            }

            $(project_box).append(project_element);
        });

        $('.project-list').append(project_box);
    }
}).fail(function(result){
    console.log(result.statusText);
});

// Ajax通信関数
function ajaxRequest(url, data){
    return $.ajax({
        url: url,
        method: "GET",
        data: data,
    })
}

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