/**
 * TriangleRacer
 * 
 * [yoppa org – HTML 5 canvas要素 + Javascriptで作る、動的コンテンツ](https://yoppa.org/taumedia10/2065.html)
 */


function drawTriangle(ctx, p1, p2, p3) {
    //ランダムな色を生成
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    // ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.strokeStyle = "rgb(250,200,200)";

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.stroke();
}


function drawCircle(ctx, p1, r) {
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2, false);
    ctx.stroke();
}


step = 0;
function render(){

    // init

    // Overray
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(8,8,12,.2)";
    ctx.fillRect(0, 0, 400, 300);
    ctx.globalCompositeOperation = "lighter";

    // update
    var p1 = { x: 50 + step, y: 50 };
    var p2 = { x: 360, y: 200 };
    var p3 = { x: 140, y: 250 };

    drawTriangle(ctx, p1, p2, p3);

    var r = 10;
    drawCircle(ctx, p1, r);
    drawCircle(ctx, p2, r);
    drawCircle(ctx, p3, r);

    step += 1;
}

/**
 * endpoint
 */
window.onload = function(){
    // CANVAS Setup
    const canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        // loop start
        setInterval(render, 1/30);
    }
}


/**
 * Mobility
 */
var Mobility = function() {
    this.nodes = []; // has node
    this.links = []; // has link
    this.tires = []; // has node
}

/**
 * Node
 */
var Node = function(){
    this.p = { x: 0, y: 0 };
    this.v = { x: 0, y: 0 };
    this.a = { x: 0, y: 0 };
    this.links = []; // hoas links
}

/**
 * links
 */
var Link = function(K, D, X0) {
    this.nodes = []; // has node
    this.K = K;
    this.D = D;
    this.X0 = X0;
}
