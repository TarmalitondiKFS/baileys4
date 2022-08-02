// Note: Require the cpu and webgl backend and add them to package.json as peer dependencies.
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

const tf = require('@tensorflow/tfjs-node')
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');


async function predict(image) {
    // const img = document.getElementById('img');
    // var b = Buffer.from(image, 'base64')
    var tensor = tf.node.decodeImage(image)
    console.log(tensor);
    // Load the model.
    const model = await cocoSsd.load();

    // Classify the image.
    const predictions = await model.detect(tensor);

    console.log('Predictions: ');
    console.log(predictions);
    return predictions;
}

async function getImage(image) {
    var img = await predict(image);
    var canvas = createCanvas(200, 200)
    var ctx = canvas.getContext('2d')
    var list = []
    await loadImage(image).then(async(gambar) => {
        canvas = createCanvas(gambar.width, gambar.height)
        ctx = canvas.getContext('2d')

        ctx.drawImage(gambar, 0, 0, gambar.width, gambar.height)
        img.forEach(prediksi => {
            console.log(prediksi, gambar);
            const text = prediksi.class + ': ' + prediksi.score.toFixed(4) * 100 + '%';
            const [x, y, w, h] = prediksi.bbox
            const size = h / 10;
            ctx.font = 'bold ' + size + 'px Nunito'
            ctx.textBaseline = 'top'
            ctx.strokeStyle = "#009900";
            const textWidth = ctx.measureText(text).width
            ctx.fillStyle = '#009900'
            ctx.fillRect(x, y, textWidth + 20, size + 20)
            ctx.fillStyle = '#fff'
            ctx.fillText(text, x + 10, y)
                // ctx.fillText(x.class + ': ' + x.score, x.bbox[0], x.bbox[1])

            ctx.strokeStyle = "#008800";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.stroke();
        })
        const buf3 = await canvas.toBuffer('image/jpeg', { quality: 1 })
        list.push(buf3);
    })
    console.log(list)
    return list[0]

}

module.exports = { predict, getImage }