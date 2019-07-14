/**
 * 多質点系で、落下/バウンス
 * 多質点系で、坂道落下
 * 
 * [実際のサンプル - translate() メソッド - Canvasリファレンス - HTML5.JP](http://www.html5.jp/canvas/ref/method/sample/translate.html)
 * 
*/

/**
 * GUI
*/
function debug(text) {

    let e = document.getElementById("debug");

    if (text == false) {
        e.innerHTML = "";
        return;
    }
    if (e.innerHTML.length > 200) {
        e.innerHTML = "";
    }
    e.innerHTML += text + "<br>";
}

/**
 * 共用関数
 */


function randomRange(min, max) {
    return (Math.random() * (max - min)) + min;
}
console.assert(0 <= randomRange(0, 3) && randomRange(0, 3) <= 3);
console.assert(10 <= randomRange(10, 20) && randomRange(10, 20) <= 20);

/**
 * 描画関数
 * 
*/
function drawCircle(p1, r) {
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

/**
 * Node
 */
// var Node = function () {
//     this.p = { x: 0, y: 0 };
//     this.v = { x: 0, y: 0 };
//     this.a = { x: 0, y: 0 };
//     this.links = []; // has links
// }

var Road = function () {
    this.p = { x: 0, y: 0 };
    this.K = 9;
    this.D = 5.0;
    this.view = {
        radius: 1
    };
}


var Ball = function () {
    // variable
    this.p = { x: 0, y: 0 };
    this.v = { x: 0, y: 0 };
    this.a = { x: 0, y: 0 };
    this.links = []; // has links

    // 外力
    this.F = { x: 0, y: 0 };

    // Const
    this.M = 1;
    this.radius = 10;

    this.view ={
        radius: 20
    }

    this.update = function (dt) {

        let g = 9.8;
        // acc
        this.a.y = g + (1 / this.M) * (this.F.y ); // 逆の座標系で定義しておく.
        this.a.x = (1 / this.M) * ( this.F.x );
        // velocity
        this.v.y +=  this.a.y * dt;
        this.v.x +=  this.a.x * dt;
        // position
        this.p.x += this.v.x * dt;
        this.p.y += this.v.y * dt;

        this.F = { x: 0, y: 0 }; // init
    };


    this.distance = function (p) {
        let a = this.p.x - p.x;
        let b = this.p.y - p.y;
        let dist = Math.sqrt((a * a) + (b * b));
        console.assert(isNaN(dist) == false);
        return dist;
    }
}

console.assert((new Ball()).distance({ x: 0, y: 0 }) == 0);
console.assert((new Ball()).distance({ x: 10, y: 0 }) == 10);


/**
 * シーケンス関連
*/

// *********************************************************** \\
// init
// *********************************************************** \\
function init() {
    console.log("init");
    // 1. create & init road
    let N_ROAD = 300;
    g_road_nodes = new Array(N_ROAD); // global

    for (let index = 0; index < g_road_nodes.length; index++) {
        let road = new Road();
        let dx = W / g_road_nodes.length;
        let x = dx * index;
        road.p.x = x;
        // road.p.y = (H / 4) + (H / 2);
        road.p.y = (1 / 2 * x) + (H / 2);
        if(index > g_road_nodes.length/2) {
            road.p.y = (- 2 / 4 * x) + 2*(H / 2);
        }
        g_road_nodes[index] = road;
    }

    // 2. Create Ball Object
    ball = new Ball();
    ball.p.x = W / 2;
    ball.p.y = H / 2;
}

// *********************************************************** \\
// render
// *********************************************************** \\
function render() {
    // Overray
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(80, 80, 80, .8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    // 1. Render Road Nodes
    for (let index = 0; index < g_road_nodes.length; index++) {
        const road = g_road_nodes[index];
        ROAD_FILL_STYLE = "rgba(100, 100, 0, .8)";
        ROAD_RADIUS_STYLE = 3;
        ctx.fillStyle = ROAD_FILL_STYLE;
        drawCircle(road.p, road.view.radius);
    }

    // 2. Render Ball
    BOAL_FILL_STYLE = "rgba(0, 100, 200, .8)";
    ctx.fillStyle = BOAL_FILL_STYLE;
    drawCircle(ball.p, ball.view.radius);
    ctx.fillStyle = "rgba(100, 10, 0, 1.0)";
    drawCircle(ball.p, ball.radius);

    // 3. update

    // ボールの検査半径以内のroad を検索
    for (let index = 0; index < g_road_nodes.length; index++) {
        // 地面
        let road = g_road_nodes[index];

        // ボールと地面との距離
        let dist = ball.distance(road.p);

        // 地面が近くなると反力(バネ系)を発生させる
        if (dist < ball.radius) {

            let dy = ball.p.y - road.p.y;
            let dx = ball.p.x - road.p.x;

            // Spring & Dumper
            ball.F.x += road.K * dx;
            ball.F.x -= road.D * ball.v.x;

            ball.F.y += road.K * dy;
            ball.F.y -= road.D * ball.v.y;
        }

    }

    // 3. るんげくった
    ball.update(SIM_DT);

    // 4. Boundary
    // ボールが境界からはみ出した時の処理
    if (ball.p.y > canvas.height || ball.p.y < 0) {
        init();
    }

}

/**
 * エントリポイント
*/
var ctx;
window.onload = function () {

    // 1. Boot
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.width;
    // ctx.translate(0, canvas.height * 0.5);

    // 2. Init
    init();

    // 3. rendering loop
    FPS = 30;
    ANIUM_DT = 1 / FPS;

    SIM_FPS = 30;
    SIM_DT = 1 / SIM_FPS;

    // Start Render Loop
    setInterval(render, ANIUM_DT);

}
