/**
 * 3-Nodeモデル
 * どうやって計算ルーチンを回すか考える
 * 1. Nodeを主体に計算する。
 * 2. Linkは物性定数値保持
 * 
 * [実際のサンプル - translate() メソッド - Canvasリファレンス - HTML5.JP](http://www.html5.jp/canvas/ref/method/sample/translate.html)
 * 
*/

/**
 * GUI
*/


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
    // ctx.stroke();
    ctx.fill();
}

function drawLine(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.stroke();
}
// 2. Render Nodes
//  - draw link
function drawLink(link) {
    // プロパティ
    ctx.strokeStyle = link.view.strokeStyle;
    ctx.lineWidth = link.view.width;
    // 線を引く
    ctx.beginPath();
    ctx.moveTo(link.node1.p.x, link.node1.p.y);
    ctx.lineTo(link.node2.p.x, link.node2.p.y);
    ctx.closePath();
    ctx.stroke();
}

function drawNode(node) {
    // プロパティ
    ctx.fillStyle = node.view.fillStyle;
    // 線を引く
    ctx.beginPath();
    ctx.arc(node.p.x, node.p.y, node.view.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

/**
 * Node
 */

var Road = function () {
    this.p = { x: 0, y: 0 };
    this.K = 0; // バネ0
    this.D = 100; // フリクションのみ
    this.view = {
        radius: 1
    };
    this.draw = function(){
        ctx.fillStyle = "rgba(100, 100, 0, .8)";
        drawCircle(this.p, this.view.radius);
    }
}


var Node = function () {
    // variable
    this.p = { x: 0, y: 0 };
    this.v = { x: 0, y: 0 };
    this.a = { x: 0, y: 0 };

    this.links = []; // has links

    // 外力
    this.F = { x: 0, y: 0 };

    // Const
    this.M = 10;
    this.radius = 10;

    this.g = 9.8;

    this.view ={
        radius: this.radius,
        fillStyle: "rgba(0, 100, 200, .8)"
    }

    this.draw = function(){
        drawNode(this);
    }

    this.update = function () {
        let dt = 1/30;

        // acc
        this.a.y = this.g + (1 / this.M) * (this.F.y ); // 逆の座標系で定義しておく.
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

console.assert((new Node()).distance({ x: 0, y: 0 }) == 0);
console.assert((new Node()).distance({ x: 10, y: 0 }) == 10);

/**
 * Link
 * @param {Point} n1 
 * @param {Point} n2
 * 定数保持用, メソッドは実装しない。
 */
var Link = function(n1, n2) {
    // ノードを登録
    this.node1 = n1;
    this.node2 = n2;
    n1.links.push(this); // [todo] 重複を避ける
    n2.links.push(this); // [todo] 重複を避ける
    // 定数
    this.K = 600; //300;
    this.D = (0.2) * this.K ;
    this.X0 = 50;
    // 描画設定
    this.view = {
        width: 1,
        strokeStyle: "rgba(0, 200, 0, 0.9)"
    }
    this.draw = function(){
        drawLink(this);
    }
}

/**
 * シーケンス関連
*/

// *********************************************************** \\
// init
// *********************************************************** \\
function init() {
    console.log("init");

    // 1. Road Objects
    let N_ROAD = canvas.width/2;
    roads = new Array(N_ROAD); // global

    for (let i = 0; i < roads.length; i++) {
        let road = new Road();
        let dx = W / roads.length;
        let x = dx * i;
        road.p.x = x;
        // road.p.y = (H / 4) + (H / 2);
        road.p.y = (1 / 2 * x) + (H / 2);
        if(i > roads.length/2) {
            road.p.y = (- 2 / 4 * x) + 2*(H / 2);
        }
        roads[i] = road;
    }

    // 2. Node Object
    //    n1
    //    ^
    //l1 /  \l2
    //  /    \
    // +------+
    //n2  l3  n3

    nodes = new Array();
    let n1 = new Node();
    let n2 = new Node();
    let n3 = new Node();
    nodes.push(n1, n2, n3);
    for(let i=0; i<nodes.length; i++){
        nodes[i].p.x = randomRange(canvas.width / 2 - 250 - 10, canvas.width / 2 - 250 +10);
        nodes[i].p.y = randomRange(canvas.height/2 -10, canvas.height/2 + 10);
    }

    links = new Array();
    let l1 = new Link(n1, n2);
    let l2 = new Link(n2, n3);
    let l3 = new Link(n3, n1);
    links.push(l1, l2, l3);
    
}

// *********************************************************** \\
// render
// *********************************************************** \\
function render() {
    // 0. Overray
    // -----------
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(80, 80, 80, .8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    // 1. Draw
    // --------------

    // Draw Road
    for (let i = 0; i < roads.length; i++) {
        const road = roads[i];
        road.draw();
    }

    // Draw node
    for (let i=0; i<nodes.length; i++) {
        const node = nodes[i];
        node.draw();
    }
    
    // Draw link
    for (let i=0; i<links.length; i++) {
        const link = links[i];
        link.draw();
    }
    
    // 2. Calculate Forces
    // -------------------
    for (let i=0; i<links.length; i++){
        var l1 = links[i];
        var n1 = l1.node1;
        var n2 = l1.node2;
        var L = n1.distance(n2.p);

        // 距離がゼロだとゼロ除算してしまう。
        if(L == 0) L=1;

        // - n1とn2の張力の計算 (link内で計算可能)
        let dl = l1.X0 - L; // 伸:-, 縮:+
        let T = l1.K * dl;
        let dx = n1.p.x - n2.p.x;
        let dy = n1.p.y - n2.p.y;
        let Tx = T * (dx / L);
        let Ty = T * (dy / L);

        //  - n1がlinkから受ける張力の計算
        n1.F.x += Tx;
        n1.F.y += Ty;

        //  - n2がlinkから受ける張力の計算
        n2.F.x += -Tx;
        n2.F.y += -Ty;

        //  - dumping
        let dVx = n1.v.x - n2.v.x;
        let dVy = n1.v.y - n2.v.y;
        n1.F.x += -l1.D * dVx;
        n1.F.y += -l1.D * dVy;

        n2.F.x += l1.D * dVx;
        n2.F.y += l1.D * dVy;

    }

    // 地面との衝突判定
    for (let i=0; i<roads.length; i++) {
        const road = roads[i];

        for (let j=0; j<nodes.length; j++) {
            let node = nodes[j];
            // 地面が近くなると反力(バネ系)を発生させる
            let dist = node.distance(road.p);
            if (dist < node.radius) {
                let dy = node.p.y - road.p.y;
                let dx = node.p.x - road.p.x;

                // Spring
                // node.F.x += road.K * dx;
                node.F.y += road.K * dy ;
                
                // Dumper
                node.F.x -= road.D * node.v.x;
                node.F.y -= road.D * node.v.y;

            }
        }
    }

    // タイヤを回転させる
    // ------------------------------------------
    // 3nodeの重心求める
    let xg=0, yg=0;
    for (let i=0; i<nodes.length; i++){
        xg += nodes[i].p.x / nodes.length;
        yg += nodes[i].p.y / nodes.length;
    }
    drawCircle({x:xg, y:yg}, 3);

    // 中心からのベクトル
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let px = node.p.x;
        let py = node.p.y;

        let vx = px - xg;
        let vy = py - yg;
        // drawLine({x:xg, y:yg}, {x:xg + vx, y:yg + vy});

        let nx = vx / Math.sqrt(vx * vx + vy * vy);
        let ny = vy / Math.sqrt(vx * vx + vy * vy);

        drawLine({ x: xg, y: yg }, { x: xg + 5*nx, y: yg + 5*ny });

        // 右に90度回転
        let tx = nx * Math.cos(Math.PI / 2) - ny * Math.sin(Math.PI / 2);
        let ty = nx * Math.sin(Math.PI / 2) + ny * Math.cos(Math.PI / 2);

        node.F.x += 8000*tx;
        node.F.y += 8000*ty;

        drawLine({x:px, y:py}, {x:px + 10*tx, y: py + 10*ty});
        
    }

    
    // 3. Node Status Update
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.update();
    }

    // 4. 境界処理
    for (let i=0; i<nodes.length; i++) {
        let node = nodes[i];
        if (node.p.y > canvas.height || node.p.y < 0) {
            init();
        }
        if (node.p.x > canvas.width || node.p.x < 0) {
            init();
        }
    }

    return;

    // 3. update

    // // ボールの検査半径以内のroad を検索
    // for (let index = 0; index < roads.length; index++) {
    //     // 地面
    //     let road = roads[index];

    //     // ボールと地面との距離
    //     let dist = ball.distance(road.p);

    //     // 地面が近くなると反力(バネ系)を発生させる
    //     if (dist < ball.radius) {

    //         let dy = ball.p.y - road.p.y;
    //         let dx = ball.p.x - road.p.x;

    //         // Spring & Dumper
    //         ball.F.x += road.K * dx;
    //         ball.F.x -= road.D * ball.v.x;

    //         ball.F.y += road.K * dy;
    //         ball.F.y -= road.D * ball.v.y;
    //     }

    // }

    // // 3. るんげくった
    // ball.update(SIM_DT);

    // // 4. Boundary
    // // ボールが境界からはみ出した時の処理
    // if (ball.p.y > canvas.height || ball.p.y < 0) {
    //     init();
    // }

}

/**
 * エントリポイント
*/
window.onload = function () {

    // 1. Boot
    // -------
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.width;
    // ctx.translate(0, canvas.height * 0.5);

    // 2. Init
    // ----------
    init();

    // 3. rendering loop
    // -----------------
    FPS = 30;
    ANIUM_DT = 1 / FPS;

    SIM_FPS = 30;
    SIM_DT = 1 / SIM_FPS;

    setInterval(render, ANIUM_DT);

}
