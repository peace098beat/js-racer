/**
 * 
 * ドロネー三角分割
 * 
 * [canvasでドロネー三角形分割を描く - to-R](https://blog.webcreativepark.net/2015/10/22-060729.html)
 * 
 * 2019 T.Nohara
 */


; (() => {

    "use strict";

    const POINT_NUM = 20;
    const FILL_COLORS = ["#8AB3BB", "#82A5AD", "#8AB4BD"];

    /**
     * キャンバスオブジェクト
     */
    class Canvas {
        constructor(canvas_id) {
            let canvas = document.getElementById(canvas_id);
            this.ctx = canvas.getContext("2d");
            this.width = canvas.width;
            this.height = canvas.height;
        }

        overray() {
            let ctx = this.ctx;
            // Overray
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "rgba(0, 0, 8, .9)";
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.globalCompositeOperation = "lighter";
        }
    }

    class Point {
        constructor(x=0, y=0){
            this.x = x;
            this.y = y;
        }
    }

    class Node {
        constructor(mx = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    }
    /**
     * 共用関数
     */


    function randomRange(min, max) {
        return (Math.random() * (max-min)) + min;
    }
    console.assert(0 <= randomRange(0, 3) && randomRange(0, 3) <= 3);
    console.assert(10 <= randomRange(10, 20) && randomRange(10, 20) <= 20);


    /**
     * グローバル変数
     */
    let gNodes;


    function init(){
        // ノードを生成
        let n1 = new Node( new Point(), new Point(), new Point() );
    }

    function render(){
        // ノードの現在地を表示
        gNodes=[];
    }
    function update(){
        // 現在値をルンゲクッタで更新
        gNodes=[];

    }


    window.onload = function () {

        init();

        setInterval(() => {
            update();
        }, 1/30);

        setInterval(() => {
            render();
            
        }, 1/30);


        let c = new Canvas("canvas");
        let ctx = c.ctx;

        // Overray
        c.overray();

        // ctx.globalCompositeOperation = "source-over";
        // ctx.fillStyle = "rgba(8,8,12,.2)";
        // ctx.fillRect(0, 0, 700, 700);
        // ctx.globalCompositeOperation = "lighter";

        ctx.beginPath();
        ctx.arc(c.width/2, c.height/2, 30, 0, Math.PI * 2, false);
        ctx.stroke();

        console.log("print");


    }




})();
