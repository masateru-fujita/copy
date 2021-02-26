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

var mouseDownEvent
var mouseMoveEvent;

function createThreeDimVideo(elem, index){
	var camera, scene, renderer, video, texture, container;

	init();
	tick();
	return [camera, renderer, scene, mouseDownEvent];

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
		camera = new THREE.PerspectiveCamera( 75, elem.clientWidth / elem.clientHeight, 1, 2000 );
		// カメラ初期位置設定
		lat = Math.max( - 85, Math.min( 85, lat ) );
		phi = THREE.Math.degToRad( 90 - lat );
		theta = THREE.Math.degToRad( lon );
		camera.position.x = 100 * Math.sin( phi ) * Math.cos( theta );
		camera.position.y = 100 * Math.cos( phi );
		camera.position.z = 100 * Math.sin( phi ) * Math.sin( theta );

		// シーンを生成
		scene = new THREE.Scene();

		// 座標作成----------------------------------------------------------------------------------------------------------テスト用
		var axes = new THREE.AxisHelper(25);
		scene.add(axes);
		
		// 球体を作成し、テクスチャに video を元にして生成したテクスチャを設定します
		var geometry = new THREE.SphereBufferGeometry( 500, 30, 30 );
		geometry.scale( - 1, 1, 1 );
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
			renderer.domElement.addEventListener( EVENT.TOUCH_START, mouseDownEvent = onDocumentMouseDown.bind(renderer.domElement, camera), false );
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

function onDocumentMouseDown( camera, event ) {
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
	document.addEventListener( EVENT.TOUCH_MOVE, mouseMoveEvent = onDocumentMouseMove.bind(document, camera), false );
	document.addEventListener( EVENT.TOUCH_END, onDocumentMouseUp, false );
}
function onDocumentMouseMove( camera, event ) {
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
	lon = ( touchClientX - onMouseDownMouseX ) * -0.3 + onMouseDownLon;
	lat = ( touchClientY - onMouseDownMouseY ) * -0.3 + onMouseDownLat;

	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );
	camera.position.x = 100 * Math.sin( phi ) * Math.cos( theta );
	camera.position.y = 100 * Math.cos( phi );
	camera.position.z = 100 * Math.sin( phi ) * Math.sin( theta );
	camera.lookAt( 0, 0, 0 );
}
function onDocumentMouseUp( event ) {
	document.removeEventListener( EVENT.TOUCH_MOVE, mouseMoveEvent, false );
	document.removeEventListener( EVENT.TOUCH_END, onDocumentMouseUp, false );
}