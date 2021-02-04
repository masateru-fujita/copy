var videos = Array.from(document.getElementsByClassName('video'));
var video_btn = document.getElementById('video-btn');
var taginput = document.getElementById("input_wrap");
var parent = document.getElementById("video-field");

var obj_end_tags = JSON.parse(end_tags);
var is_playing = false;

// タグをLISTに追加
// JSONから値取得
var obj_link_tags = JSON.parse(link_tags);