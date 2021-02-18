// console.log('sanity :>> ');
const canvas = $('#canvas');
// console.log('canvas :>> ', canvas[0])
var ctx = canvas[0].getContext('2d');

var signing = false;
var x;
var y;

// function for drawing canvas element
const draw = (ctx, startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0b49a1';
    ctx.stroke();
    ctx.closePath();
};

// defining x & y on mosedown event
canvas.on('mousedown', (event) => {
    signing = true;
    x = event.offsetX;
    y = event.offsetY;
});

// drawing on mousemove event
canvas.on('mousemove', (event) => {
    if (signing == true) {
        draw(ctx, x, y, event.offsetX, event.offsetY);
    }
    signing = false;
});

canvas.on('mouseup', (event) => {
    signing = false;
});

// node documentation have sth with randomisation
