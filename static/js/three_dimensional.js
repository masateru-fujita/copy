"use strict";

//イベントの振り分け
var EVENT = {};
if ('ontouchstart' in window) {
	EVENT.TOUCH_START = 'touchstart';
	EVENT.TOUCH_MOVE = 'touchmove';
	EVENT.TOUCH_END = 'touchend';
} else {
	EVENT.TOUCH_START = 'mousedown';
	EVENT.TOUCH_MOVE = 'mousemove';
	EVENT.TOUCH_END = 'mouseup';
}

// 変数の初期化
var onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

var mouseDownEvent;
var mouseMoveEvent;

const ANGLE = 75;

var tag_tops = [];
var tag_lefts = [];

function createThreeDimVideo(elem, index){
	var camera, scene, renderer, video, texture, container;

	init();
	tick();
	return [camera, renderer, scene, mouseDownEvent, video];

	function init(){

		// コンテナの準備
		container = elem.parentNode;
		
		// video 要素を生成
		video = elem;
		video.crossOrigin = 'anonymous';
		video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );

		// video からテクスチャを生成
		texture = new THREE.Texture( video );
		texture.generateMipmaps = false;
		texture.minFilter = THREE.NearestFilter;
		texture.maxFilter = THREE.NearestFilter;
		texture.format = THREE.RGBFormat;
		// 動画に合わせてテクスチャを更新
		setInterval( function () {
			if ( video.readyState >= video.HAVE_CURRENT_DATA ) {
				texture.needsUpdate = true;
			}
		}, 30 );

		// カメラを生成
		camera = new THREE.PerspectiveCamera( ANGLE, elem.clientWidth / elem.clientHeight, 1, 5000 );
		// カメラ初期位置設定
		lat = Math.max( - 90, Math.min( 90, lat ) );
		phi = THREE.Math.degToRad( 90 - lat );
		theta = THREE.Math.degToRad( lon );
		camera.position.x = Math.sin( phi ) * Math.cos( theta ) / 10000;
		camera.position.y = Math.cos( phi ) / 10000;
		camera.position.z = Math.sin( phi ) * Math.sin( theta ) / 10000;

		// シーンを生成
		scene = new THREE.Scene();

		// 座標作成----------------------------------------------------------------------------------------------------------テスト用
		var axes = new THREE.AxisHelper(2000);
		scene.add(axes);
		
		// 球体を作成し、テクスチャに video を元にして生成したテクスチャを設定します
		var geometry = new THREE.SphereBufferGeometry( 1000, 30, 30 );
		geometry.scale( -1, 1, 1 );

		var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		scene.add( mesh );

		camera.lookAt( scene.position );

		// レンダラーを生成
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( video.clientWidth, video.clientHeight );
		renderer.domElement.setAttribute('id', elem.getAttribute('id'));
		renderer.domElement.classList.add('video');
		container.prepend( renderer.domElement );

		elem.remove();

		// 最初の要素にドラッグ・スワイプ操作を設定
		if(index == 0){
			$('.link-tag').each(function (index, element){
				tag_tops.push($(element).position().top / 500);
				tag_lefts.push(THREE.Math.degToRad(75 * (($(element).position().left / $('.video').first().width()) - 0.5)));
			});
			renderer.domElement.addEventListener( EVENT.TOUCH_START, mouseDownEvent = onDocumentMouseDown.bind(renderer.domElement, camera, tag_tops, tag_lefts), false );
		}

		// 画面のリサイズに対応
		window.addEventListener( 'resize', onWindowResize, false );
		onWindowResize( null );
	}
	function onWindowResize () {
		camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( renderer.domElement.clientWidth, renderer.domElement.clientHeight );
	}
	function tick() {
		renderer.render( scene, camera );
		renderer.setAnimationLoop( tick );
	}
};

function onDocumentMouseDown( camera, tag_tops, tag_lefts, event ) {
	event.preventDefault();
	if(event.clientX) {
		onMouseDownMouseX = event.clientX;
		onMouseDownMouseY = event.clientY;
	} else if(event.touches) {
		onMouseDownMouseX = event.touches[0].clientX
		onMouseDownMouseY = event.touches[0].clientY;
	} else {
		onMouseDownMouseX = event.changedTouches[0].clientX
		onMouseDownMouseY = event.changedTouches[0].clientY
	}
	onMouseDownLon = lon;
	onMouseDownLat = lat;
	document.addEventListener( EVENT.TOUCH_MOVE, mouseMoveEvent = onDocumentMouseMove.bind(document, camera, tag_tops, tag_lefts), false );
	document.addEventListener( EVENT.TOUCH_END, onDocumentMouseUp, false );
}
function onDocumentMouseMove( camera, tag_tops, tag_lefts, event ) {
	event.preventDefault();
	if(event.clientX) {
		var touchClientX = event.clientX;
		var touchClientY = event.clientY;
	} else if(event.touches) {
		var touchClientX = event.touches[0].clientX
		var touchClientY = event.touches[0].clientY;
	} else {
		var touchClientX = event.changedTouches[0].clientX
		var touchClientY = event.changedTouches[0].clientY
	}
	// マウスの動いたピクセル 逆方向に回転させるため *-1 /4px移動で1度とするため*0.25
	lon = ( touchClientX - onMouseDownMouseX ) * -0.25 + onMouseDownLon;
	lat = ( touchClientY - onMouseDownMouseY ) * -0.25 + onMouseDownLat;

	// 動いたピクセルが90以上なら90を、-90以下なら-90を(Y軸縦軸)
	lat = Math.max( - 52.5, Math.min( 52.5, lat ) );
	// 起点を中央とするため90から角度を引く
	phi = THREE.Math.degToRad( lat );
	var aa = (phi > 0) ? -1 : 1;
	theta = THREE.Math.degToRad( lon );
	camera.position.x = Math.cos( theta ) * Math.cos( phi ) / 10000;
	camera.position.y = Math.sin( phi ) / 10000;
	camera.position.z = Math.sin( theta ) * Math.cos( phi ) / 10000;
	camera.lookAt( 0, 0, 0 );

	// 360度で割った値が180度以上ならマイナス
	// 180度以下ならプラス
	$('.link-tag').each(function (index, element){
		var left;
		var multiple = (theta > 0) ? -1 : 1;
		// tagの度数と今の度数を360度で割り、180度以下ならそのままの方向へ動かす
		// 180度以上なら逆から動かす
		// theta * -1 タグを画面の逆回転にするため
		if(Math.abs((tag_lefts[index] + (theta * -1)) % (Math.PI * 2)) < Math.PI){
			left = ($('.video').first().width() / 2) + (500 * ((tag_lefts[index] + (theta * -1)) % (Math.PI * 2) * (1 - Math.abs(tag_tops[index]))));
		}
		else {
			left = ($('.video').first().width() / 2) + (500 * (((tag_lefts[index] + (theta * -1)) % Math.PI) - (multiple * Math.PI)) * (1 - Math.abs(tag_tops[index])));
		}
		// if(Math.cos((theta * -1) + tag_lefts[index]) > 0){
		// 	left = ($('.video').first().width() / 2) + (500 * (Math.sin((theta) + tag_lefts[index]))) * (1 - Math.abs(tag_tops[index])) * -1;
		// }
		// else {
		// 	left = ($('.video').first().width() / 2) + (500 * ((1 + (Math.cos((theta * -1) + tag_lefts[index]) * multiple)))) * Math.sin(phi);
		// }
		// console.log(
		// 	(Math.cos(theta)) + '\n' +
		// 	'theta:' + (theta) + '\n' + 
		// 	'tag_lefts[index]:' + tag_lefts[index] + '\n' + 
		// 	'(theta + tag_lefts[index]):' + (theta + tag_lefts[index]) + '\n' + 
		// 	'Math.sin(theta):' + Math.sin(theta) + '\n' + 
		// 	'(Math.sin(theta + tag_lefts[index]):' + (Math.sin(theta + tag_lefts[index])) + '\n' + 
		// 	'Math.cos(theta):' + (Math.cos(theta)) + '\n' + 
		// 	'phi:' + phi + '\n' + 
		// 	'Math.sin(phi):' + (Math.sin(phi))
		// );
		$(element).css({
			'top': 500 * (tag_tops[index] + (phi * -1)),
			'left': left,
			'display': 'block',
		});
	});

	// console.log(
	// 	'theta：' + theta + '\n' + 
	// 	'phi：' + phi + '\n' + 
	// 	'Math.cos(phi)：' + Math.cos(phi) + '\n' +
	// 	'Math.sin(theta)：' + Math.sin(theta) + '\n' +
	// 	'Math.cos(theta)：' + Math.cos(theta) + '\n' +
	// 	'Math.tan(theta)：' + Math.tan(theta) + '\n' +
	// 	'Math.atan(theta)：' + Math.atan(theta) + '\n' +
	// 	'lon：' + lon + '\n' + 
	// 	'lat：' + lat + '\n' +
	// 	'$(".video").first().height()：' + $('.video').first().height() + '\n' +
	// 	'$(".video").first().width()：' + $('.video').first().width() + '\n' +
	// 	"camera.position.x：" + camera.position.x + '\n' +
	// 	"camera.position.y：" + camera.position.y + '\n' +
	// 	"camera.position.z：" + camera.position.z + '\n' +
	// 	"(1 - Math.abs(phi))：" + (1 - Math.abs(phi)) + '\n'
	// );
}
function onDocumentMouseUp( event ) {
	document.removeEventListener( EVENT.TOUCH_MOVE, mouseMoveEvent, false );
	document.removeEventListener( EVENT.TOUCH_END, onDocumentMouseUp, false );
}