var frame = document.getElementById("frame-now");
var seekbar = document.getElementById("seekbar");
var seekbar_now = document.getElementById("seekbar-now");

var footer_event;

var fps = 30;
var cameras = [];
var renderers = [];
var scenes = [];

// video読み込み後
videos[0].onloadedmetadata = function(){
	document.getElementById("time-duration").innerHTML = timeFormat(videos[0].duration);
	document.getElementById("frame-total").innerHTML = Math.ceil(videos[0].duration * fps);

	var elems = Array.from(document.getElementsByTagName('video'));
	elems.forEach(function(x, index){
		if(three_dim_flgs[x.id]){
			var [cameraaaa, rendereraaa, sceneaaa] = createThreeDimVideo(x, index);
			cameras.push(cameraaaa);
			renderers.push(rendereraaa);
			scenes.push(sceneaaa);
		}
	});
	videoClickEvent();
};

// プレイボタン押下イベント
video_btn.addEventListener('click', () => {
	if (!is_playing) {
		document.getElementById("popup-field-wrap").style.display = "none";
		videos.forEach(video => {
			video.play();
		});
		switchPlayFlg();

		footer_event = setInterval(function(){
			// frame上昇
			frame.innerHTML = Math.ceil(videos[0].currentTime * fps);

			// seekbar
			seekbar_now.style.left = ((videos[0].currentTime / videos[0].duration) * 100) + "%";

			// タグ表示非表示切り替え
			obj_link_tags.forEach(function(tag, index){
				if(getComputedStyle(tag_elements[index]).getPropertyValue("visibility") == "hidden"
					&& tag["fields"]['display_frame'] <= Math.ceil(videos[0].currentTime * fps)
					&& tag["fields"]['hide_frame'] >= Math.ceil(videos[0].currentTime * fps)){
						tag_elements[index].style.visibility = "visible";
				}
				else if(getComputedStyle(tag_elements[index]).getPropertyValue("visibility") == "visible"
					&& (tag["fields"]['display_frame'] > Math.ceil(videos[0].currentTime * fps)
					|| tag["fields"]['hide_frame'] < Math.ceil(videos[0].currentTime * fps))) {
						tag_elements[index].style.visibility = "hidden";
				}
			});
		}, fps);

	// 終了タグ削除
	$('#endtag-field-wrap').css('display', 'none');

	} else {
		videos.forEach(video => {
		video.pause();
		});
		switchPlayFlg();

		// frame上昇止める
		clearInterval(footer_event);
	}
});

// 動画終了時イベント
videos[0].addEventListener('ended', (event) => {
	document.getElementById("popup-field-wrap").style.display = "none";
	switchPlayFlg();

	// frame上昇止める
	clearInterval(footer_event);

	// 終了タグ作成
	if (obj_end_tags.length != 0) {
		$('.endtag-title').text(obj_end_tags[0]['fields']['title']);
		$('.endtag-content').text(obj_end_tags[0]['fields']['content']);
		$('#endtag-field-wrap').css('display', 'block');
	}
});

// 現在の再生時間取得
videos[0].addEventListener('timeupdate', (event) => {
	document.getElementById("time-current").innerHTML = timeFormat(videos[0].currentTime);
});

// 時間フォーマット化
function timeFormat(time){
	time = Math.floor(time);
	var minute = (Math.floor(time / 60));
	var seconds = (time - (minute * 60));
	return ("0" + minute).slice(-2) + ":" + ("0" + seconds).slice(-2);
};

$('#seekbar').on('mousedown', function(e) {
	var barlength = $('#seekbar').width();
	seekbar_now.style.left = (e.offsetX / barlength) * 100 + '%';
	videos[0].currentTime = videos[0].duration * (e.offsetX / barlength);

	$('#seekbar').on('mousemove', function(e) {
		seekbar_now.style.left = (e.offsetX / barlength) * 100 + '%';
		videos[0].currentTime = videos[0].duration * (e.offsetX / barlength);
		// タグ表示非表示切り替え
		obj_link_tags.forEach(function(tag, index){
			if(tag["fields"]['display_frame'] <= Math.ceil(videos[0].currentTime * fps)
				|| tag["fields"]['hide_frame'] >= Math.ceil(videos[0].currentTime * fps)){
					tag_elements[index].style.visibility = "visible";
			}
			else {
				tag_elements[index].style.visibility = "hidden";
			}
		});
	});

	$('#seekbar').on('mouseup', function(e) {
		$('#seekbar').off('mousemove');
		$('#seekbar').off('mouseup');
	});
});

function switchPlayFlg(){
	var path = $('.video-btn').attr('src');
	if(is_playing) {
		is_playing = false;
		path = path.replace('stop_btn.png', 'play_btn.png');
	}
	else {
		is_playing = true;
		path = path.replace('play_btn.png', 'stop_btn.png');
	}
	$('.video-btn').attr('src', path);
}