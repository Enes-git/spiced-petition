// console.log('sanity :>> ');
const canvas = $('#canvas');
// console.log('canvas :>> ', canvas[0])
var ctx = canvas[0].getContext('2d');

var canvasUrl = $('#canvas-url');
var signing = false;
var x, y, canvasUrlVal;

// function for drawing canvas element
const draw = (ctx, startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0b49a1';
    ctx.stroke();
    ctx.closePath();
    x = endX;
    y = endY;
};

// defining x & y on mosedown event
canvas.on('mousedown', (event) => {
    signing = true;
    x = event.offsetX;
    y = event.offsetY;
});

// drawing on mousemove event
canvas.on('mousemove', (event) => {
    //starting to draw a bit farther - return it after css - may try counting the canvas position with curser's on browser!!
    if (signing == true) {
        draw(ctx, x, y, event.offsetX, event.offsetY);
    }
});

canvas.on('mouseup', () => {
    signing = false;
    canvasUrl.val(canvas[0].toDataURL());
    canvasUrlVal = canvasUrl[0].value;
    console.log('canvasUrlVal :>> ', canvasUrlVal);
});

// converting the
// node documentation have sth with randomisation
