/**
 * 3-Nodeモデル
 * どうやって計算ルーチンを回すか考える
 * 1. Nodeを主体に計算する。
 * 2. Linkは物性定数値保持
 * 
 * [実際のサンプル - translate() メソッド - Canvasリファレンス - HTML5.JP](http://www.html5.jp/canvas/ref/method/sample/translate.html)
 * 
 * 2019/07/14: タイヤが転がるまで実装。
 * 
 * 2019 T.Nohara
*/

/**
 * Global
*/
M_ = 10;
K_ = 10;
D_ = K_*0.2;

/**
 * 共用関数
 */

function randomRange(min, max) {
    return (Math.random() * (max - min)) + min;
}
console.assert(0 <= randomRange(0, 3) && randomRange(0, 3) <= 3);
console.assert(10 <= randomRange(10, 20) && randomRange(10, 20) <= 20);

function vecAdd(p1, p2){
    return {
        x: p1.x+p2.x, 
        y: p1.y+p2.y
    };
}
// 方向ベクトル
function vectorDirect(p1, p2) {
    let p = {x:0, y:0};
    p.x = p2.x - p1.x;
    p.y = p2.y - p1.y;
    return p;
}
// 法線ベクター
function rotateVector(p1, theta) {
    let nv = {x:0, y:0};
    nv.x = p1.x * Math.cos(theta) - p1.y * Math.sin(theta);
    nv.y = p1.x * Math.sin(theta) + p1.y * Math.cos(theta);
    return nv;
}

console.assert(rotateVector({x:0, y:1}, Math.PI/2) == {x:-1, y:0});
// ベクトル長さ
function normLength(p1) {
    return Math.sqrt(p1.x*p1.x + p1.y*p1.y);
}
// ノーマライズ
function normalizedVector(p){
    let nv = { x: 0, y: 0 };
    nv.x = p.x / normLength(p);
    nv.y = p.y / normLength(p);
    return nv;
}

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

function drawRoads(roads){
    ctx.strokeStyle = "rgba(0, 200, 0, 0.2)";
    ctx.lineWidth = 1;

    for(let i=0; i<roads.length-1; i++ ){
        let p1 = roads[i].p;
        let p2 = roads[i+1].p;
        drawLine(p1, p2);

    }
}
/**
 * Node
 */

var Road = function () {
    this.p = { x: 0, y: 0 };
    this.K = 150; // バネ0
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
    this.M = 20;
    this.radius = 3;

    this.g = 9.8;

    this.view ={
        radius: this.radius,
        fillStyle: "rgba(0, 100, 200, .8)"
    }

    this.draw = function(){
        drawNode(this);
    }

    this.update = function () {
        let dt = 1/SIM_FPS;

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
 * タイヤ
*/
var Tire = function(parent_node) {
    this.parent = parent_node;
    this.radius = 10;
    this.divide_n = 6;

    this.Torq = 3000;

    // ノードを作成
    this.nodes = new Array();
    for(let i=0; i<this.divide_n; i++){
        let n1 = new TireNode();
        n1.M = 10;
        this.nodes.push(n1);

        let cx = this.parent.p.x;
        let cy = this.parent.p.y;
        
        let Vsp0 = {x:0, y: -this.radius};
        let theta = i * (2 * Math.PI / this.divide_n);
        let Vsp_x = Vsp0.x * Math.cos(theta) - Vsp0.y * Math.sin(theta) - Math.random()*0;
        let Vsp_y = Vsp0.x * Math.sin(theta) + Vsp0.y * Math.cos(theta) - Math.random() *0;

        n1.p = {x: cx+Vsp_x, y: cy+Vsp_y}; // 初喜一
    }

    // スポークを作成
    this.spokes = new Array();
    for(let i=0; i<this.divide_n; i++){
        let n1 = this.nodes[i];
        let sp = new Link(this.parent, n1);
        sp.X0 = this.radius; // タイヤ半径
        sp.K = 610;
        sp.D = 100;
        this.spokes.push(sp);
    }

    // リムを作成
    this.rims = new Array();
    for(let i=0; i<this.divide_n; i++) {
        let n1 = this.nodes[i];
        let n2;
        if(i == this.divide_n-1 ) {
            n2 = this.nodes[0]
        }else{
            n2 = this.nodes[i + 1]
        }

        let rim = new Link(n1, n2);

        let dtheta = (2 * Math.PI / this.divide_n);
        let x0 = 2 * this.radius * Math.sin(dtheta/2); // リム長さ
        rim.X0 = x0;
        rim.K = 510;
        rim.D = 100;

        this.rims.push(rim);
    }



    this.draw = function () {
        // ノードを表示
        for(let i=0; i<this.divide_n; i++){
            let n = this.nodes[i];
            drawNode(n);
        }
        // スポークを表示
        for(let i=0; i<this.divide_n; i++) {
            let sp = this.spokes[i];
            drawLink(sp);
        }
        for (let i = 0; i < this.divide_n; i++) {
            let rim = this.rims[i];
            drawLink(rim);
        }
    }

}

var TireNode = function () {
    // Const
    this.M = 1;
    this.radius = 3; // [todo]削除予定
    this.g = 9.8;
    // variable
    this.links = []; // has links
    this.p = { x: 0, y: 0 };
    this.v = { x: 0, y: 0 };
    this.a = { x: 0, y: 0 };
    this.F = { x: 0, y: 0 };

    this.view = {
        radius: this.radius,
        fillStyle: "rgba(0, 100, 200, .8)"
    }

    this.draw = function () {
        drawNode(this);
    }

    this.update = function () {
        let dt = 1/SIM_FPS;

        // acc
        this.a.y = this.g + (1 / this.M) * (this.F.y); // 逆の座標系で定義しておく.
        this.a.x =          (1 / this.M) * (this.F.x);
        // velocity
        this.v.y += this.a.y * dt;
        this.v.x += this.a.x * dt;
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

/**
 * Link
 * 定数保持用, メソッドは実装しない。
 */
var Link = function(n1, n2) {
    // ノードを登録
    this.node1 = n1;
    this.node2 = n2;
    this.nodes = [n1, n2];
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

    this.get_dl = function() {
        // 伸び:+, 縮み:-
        let n1 = this.node1;
        let n2 = this.node2;
        let dist = n1.distance(n2.p);
        return (dist - this.X0);

    }

    this.get_dV = function() {
        let n1 = this.node1;
        let n2 = this.node2;
        let dVx = n1.v.x - n2.v.x;
        let dVy = n1.v.y - n2.v.y;
        return { x: dVx, y:dVy };
    }

    this.get_other_node = function (your_node) {
        if (this.node1 === your_node) {
            return this.node2;
        } else {
            return this.node1;
        }
    }

    /**
     * 方向ベクトル
     * node: 始点ノード
     * n1------>n2
     */
    this.get_direction_vector = function(start_node) {
        let n1 = start_node;
        let n2;
        if(this.node1 === start_node) {
            n2 = this.node2;
        }else{
            n2 = this.node1;
        }
        let dr_x = n2.p.x - n1.p.x;
        let dr_y = n2.p.y - n1.p.y;
        let dist = Math.sqrt(dr_x*dr_x + dr_y*dr_y);

        let nr_x = dr_x/dist;
        let nr_y = dr_y/dist;

        console.assert( Math.abs(Math.sqrt(nr_x*nr_x + nr_y*nr_y) - 1 ) < 0.001);

        return {x: nr_x, y: nr_y};

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

    counter = 0;

    // 1. Road 
    let N_ROAD = 25;
    roads = new Array(N_ROAD);

    for (let i = 0; i < roads.length; i++) {
        let road = new Road();
        let dx = canvas.width / (roads.length-1);
        let x = dx * i;
        road.p.x = x;
        road.p.y =(H / 2);
        road.p.y += Math.random() * 50;
        // road.p.y = (1 / 2 * x) + (H / 2);
        // if(i > roads.length/2) {
        //     road.p.y = (- 2 / 4 * x) + 2*(H / 2);
        // }
        roads[i] = road;
    }


    // 2. Tire Object
    parent = new Node();
    parent.p.x = canvas.width / 8 ;
    parent.p.y = canvas.height / 2;
    // parent.g = 0;

    tire1 = new Tire(parent);

    nodes = tire1.nodes;
    nodes.push(parent);

    
}

// *********************************************************** \\
// render
// *********************************************************** \\
function render() {
    counter += 1;
    if(counter > 1000) {
        init()
    };

    // debug

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

    // tire力
    for (let i=0; i<nodes.length; i++){
        let node = nodes[i];
        // nodeがlinksから受ける力の総和を計算
        let links = node.links;
        for(let j=0; j<links.length; j++ ){
            // linkのひずみを算出
            let link = links[j];
            let dl = link.get_dl();
            // ひずみから張力を算出
            let T = link.K * dl;
            // 自分からlink先ノードへの方向ベクトルを算出
            let dir = link.get_direction_vector(node);

            let Fx = T * dir.x;
            let Fy = T * dir.y;

            node.F.x += Fx;
            node.F.y += Fy;
            
            // dumping
            let dV = link.get_dV();
            node.F.x += link.D * dV.x;
            node.F.y += link.D * dV.y;

        }
    }
    
    // Tire以外のノードの、合力計算
    // ※ なぜかDummpingの符号が異なる. 速度の方向の問題.
    {
        let node = parent;
        // nodeがlinksから受ける力の総和を計算
        let links = node.links;
        for (let j = 0; j < links.length; j++) {
            // linkのひずみを算出
            let link = links[j];
            let dl = link.get_dl();
            // ひずみから張力を算出
            let T = link.K * dl;
            // 自分からlink先ノードへの方向ベクトルを算出
            let dir = link.get_direction_vector(node);

            let Fx = T * dir.x;
            let Fy = T * dir.y;

            node.F.x += Fx;
            node.F.y += Fy;

            // dumping
            let dV = link.get_dV();
            node.F.x -= link.D * dV.x;
            node.F.y -= link.D * dV.y;

        }
    }


    // 地面との衝突判定
    // --
    for (let i = 1; i < roads.length-1; i++) {
        const road = roads[i];
        let r1 = roads[i];
        let r2 = roads[i+1];
        // 方向ベクタ
        let r12_p = vectorDirect(r1.p, r2.p);

        // 法線ベクトル
        let nr12_p = rotateVector(r12_p, -Math.PI*0.5);

        
        for(let j=0; j<nodes.length; j++) {
            let n1 = nodes[j];

            if( (r1.p.x < n1.p.x) && (n1.p.x <= r2.p.x) ) {
            }else{
                // Xが範囲外の場合は終了
                continue;
            }

            if( r1.p.y < n1.p.y || r2.p.y < n1.p.y) {
            }else{
                console.log("skip");
                continue;
            }

            // 方向ベクトル
            let a1 = (r2.p.x - r1.p.x); // V1.x
            let a2 = (r2.p.y - r1.p.y); // V1.y
            let La = Math.sqrt(a1*a1 + a2*a2); // |V1|
            // 対象ノードベクトル
            let b1 = (n1.p.x - r1.p.x); // V2.x
            let b2 = (n1.p.y - r1.p.y); // V2.y
            let Lb = Math.sqrt(b1*b1 + b2*b2); // |V2|
            // 面積ベクトル
            let z = a1*b2 - a2*b1;

            // 裏表
            if(z < 0) {
                continue;
            }else{
            }
            
            // 反力発生
            // --
            let theta = (a1*b1 + a2*b2) / (La * Lb);
            // console.log(z, theta);

            // めり込み長さの算出
            let r1n1 = {
                x: n1.p.x - r1.p.x,
                y: n1.p.y - r1.p.y
            }
            let L_r1n1 = Math.sqrt(r1n1.x*r1n1.x + r1n1.y*r1n1.y);
            let dr = L_r1n1 * Math.sin(theta);
            
            drawLine(r1.p, n1.p);

            // 反力計算
            let Fr = road.K * dr;

            // 反力の方向ベクトル
            let Dx = nr12_p.x / normLength(nr12_p);
            let Dy = nr12_p.y / normLength(nr12_p);

            // 反力反映
            n1.F.x += Fr * Dx;
            n1.F.y += Fr * Dy;

            n1.F.x -= road.D * n1.v.x;
            n1.F.y -= road.D * n1.v.y;
        }

    }


    // タイヤを回転させる
    // ------------------------------------------
    // tire-nodeの重心求める
    let xg = 0, yg = 0;
    for (let i = 0; i < tire1.nodes.length; i++) {
        xg += tire1.nodes[i].p.x / tire1.nodes.length;
        yg += tire1.nodes[i].p.y / tire1.nodes.length;
    }
    drawCircle({ x: xg, y: yg }, 3);
    for(let i=0; i< tire1.nodes.length; i++) {
        // 中心からのベクトル求める
        let node = tire1.nodes[i];
        let p1 = tire1.nodes[i].p;
        let cg = {x: xg, y:yg};
        let dir = vectorDirect(p1, cg);
        let Fv = rotateVector(dir, -Math.PI/2);
        
        drawLine(p1, vecAdd(p1, Fv));

        let F = tire1.Torq / tire1.radius;

        node.F.x += F * Fv.x;
        node.F.y += F * Fv.y;

    }

    // update
    // =-----------------------------------
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();
    }

    // Draw
    // ------------------------------------
    tire1.draw();
    drawRoads(roads);


    // 境界判定
    // =-----------------------------------
    for (let i = 0; i < tire1.nodes.length; i++) {
        const node = tire1.nodes[i];
        if (node.p.x < 0 || canvas.width < node.p.x) {
            init();
            return;
        }
    }

}

/**
 * エントリポイント
*/
window.onload = function () {
    counter = 0;

    // 1. Boot
    // -------
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.width;
    // ctx.translate(180, 0);

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
