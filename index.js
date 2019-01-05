window.onload = function () {
    var video = document.querySelector("#videoElement");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
    }
}
const BG_COLOR = "#bbb";
const N_GRID_PIXELS = 20;

const N_GRIDS_WIDE = 8;
const GRID_GAP_PIXELS = 10;

let gridWidth;

let prevFrame;

let ndiffs = 0;
let diffArray;
const DIFF_ARRAY_LENGTH = 100;

const ARRAY_WHITE = [255, 255, 255, 255];
const ARRAY_TRANSPARENT = [0, 0, 0, 0];
//const ARRAY_TRANSPARENT = [0, 0, 0, 0];

var capture;
function setup() {
    createCanvas(windowWidth, windowHeight);
    background(BG_COLOR);

    gridWidth = (windowWidth - (N_GRIDS_WIDE - 1) * GRID_GAP_PIXELS) / N_GRIDS_WIDE;

    const constraints = {
        video: {
            // mandatory: {
            //     width: N_GRID_PIXELS,
            //     height: N_GRID_PIXELS,
            //     resizeMode: 'crop-and-scale',
            // },


        },
        audio: false,

    }
    capture = createCapture(constraints, VIDEO);
    //capture.size(10, 10);
    //capture.hide();

    prevFrame = createNewGrid(createBlankImage());
    diffArray = createNewGrid(createBlankImage());
}

function drawImage(img, n, target = this) {
    target.image(
        img,
        (n % N_GRIDS_WIDE) * (GRID_GAP_PIXELS + gridWidth),
        (Math.floor(n / N_GRIDS_WIDE)) * (GRID_GAP_PIXELS + gridWidth),
        gridWidth,
        gridWidth
    );

}

function createImageFromGrid(grid) {

}

function testCreateImage(image) {

}

function createBlankImage(c = ARRAY_TRANSPARENT) {
    const src = createImage(N_GRID_PIXELS, N_GRID_PIXELS);
    src.loadPixels();
    for (let i = 0; i < src.width; i++) {
        for (let j = 0; j < src.height; j++) {
            src.set(i, j, color(...c));
        }
    }
    src.updatePixels();

    return src;
}

function createNewGrid(src) {
    const grid = createGraphics(N_GRID_PIXELS, N_GRID_PIXELS);
    grid.image(src, 0, 0, N_GRID_PIXELS, N_GRID_PIXELS);
    //grid.pixelDensity(1);
    //grid.resizeCanvas(N_GRID_PIXELS, N_GRID_PIXELS);
    return grid;
}

/**
 * 
 * @param {The p5 pixels array} pxls 
 * @param {A function returns a length 4 array, that will set those pixels } pixelFn 
 * @param {A function that will transform the whole array}
 */
function loopPixels(pxls, pixelFn) {
    for (var i = 0; i < pxls.length; i = i + 4) {

        // loop over
        const ca = pxls.slice(i, i + 4);
        typedArrayOverwrite(pxls, i, ...pixelFn(ca, i));
    }
}


function typedArrayOverwrite(ta, i, ...arr) {
    for (let j = 0; j < arr.length; j++) {
        ta[i + j] = arr[j];
    }
};

function diffGrid(pxlsA, pxlsB, diffFn, transformFn) {

    if (pxlsA.length !== pxlsB.length) {
        throw new Error("Pixel arrays must be the same length.");
    }

    for (var i = 0; i < pxlsA.length; i = i + 4) {

        // loop over
        const a1 = pxlsA.slice(i, i + 4);
        const a2 = pxlsB.slice(i, i + 4);

        if (diffFn(a1, a2)) {
            typedArrayOverwrite(pxlsA, i, ...transformFn(a1, a2));
        }
        else {
            typedArrayOverwrite(pxlsA, i, ...ARRAY_TRANSPARENT);
        }



    }
}

function buildDiffArray(prevDiff) {

    if (ndiffs < DIFF_ARRAY_LENGTH) {
        ndiffs++;
    }


    //diffArray.tint(255, 55);
    diffArray.image(
        createBlankImage([0, 0, 0, Math.floor(255 / ndiffs)]),
        0, 0, N_GRID_PIXELS, N_GRID_PIXELS);
    diffArray.image(
        prevDiff,
        0, 0, N_GRID_PIXELS, N_GRID_PIXELS);


}

function draw() {
    background(BG_COLOR);
    drawImage(capture, 0);

    const g1 = createNewGrid(capture);

    drawImage(g1, 1);
    const g2 = createNewGrid(g1);
    g1.remove();


    g2.loadPixels();
    loopPixels(g2.pixels, (ca) => {

        const c = color(...ca);
        if (brightness(c) > 50) {
            return ARRAY_WHITE
        }
        else {
            return ARRAY_TRANSPARENT
        }
    });
    g2.updatePixels();

    const g3 = createNewGrid(g2);
    drawImage(g2, 2);


    g3.loadPixels();
    prevFrame.loadPixels();
    diffGrid(g3.pixels, prevFrame.pixels, (a, b) => {
        return a.some((v, i) => v !== b[i])
    }, (a, b) => {
        return ARRAY_WHITE
    });

    g3.updatePixels();
    //drawImage(g3, 3); //Disable this one, coz it's way to flashy

    prevFrame.remove();

    prevFrame = createNewGrid(g2);
    g2.remove();



    buildDiffArray(g3);

    g3.remove();
    drawImage(diffArray, 4);








}