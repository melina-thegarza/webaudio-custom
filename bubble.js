
var audioCtx;

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    // brown noise
    var bufferSize = 10 * audioCtx.sampleRate,
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    brownNoise.start(0);
 

    //first low pass filter
    let filter1 = audioCtx.createBiquadFilter()
    filter1.type = "lowpass"
    filter1.frequency.value = 400
    brownNoise.connect(filter1);

     //second low pass filter
     let filter2 = audioCtx.createBiquadFilter()
     filter2.type = "lowpass"
     filter2.frequency.value= 14
     brownNoise.connect(filter2);

    // Create a resonant high-pass filter
    var highfilter = audioCtx.createBiquadFilter();
    highfilter.type = 'highpass';
    highfilter.Q.value = 33.33; // Set resonance quality factor

    // 0.1 gain
    var finalgainNode = audioCtx.createGain();
    finalgainNode.gain.value = .1;

    // *400
    var gain400Node = audioCtx.createGain();
    gain400Node.gain.value = 400;
    // + 500
    var modulator = audioCtx.createOscillator();
    modulator.frequency.value = 500; 
    modulator.start(0);

    var offsetNode = audioCtx.createGain()
    offsetNode.gain.value = 5;

    filter1.connect(highfilter);
    filter2.connect(gain400Node);
    gain400Node.connect(offsetNode);
    modulator.connect(offsetNode);
    offsetNode.connect(highfilter.frequency)
    highfilter.connect(finalgainNode);
    finalgainNode.connect(audioCtx.destination)

   

}

window.addEventListener('load', () => {
    document.getElementById("bubble-sound").addEventListener("click", () => {
        console.log("HELO")
    
        if (!audioCtx) {
            initAudio();
            return;
        }
        else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        else if (audioCtx.state === 'running') {
            audioCtx.suspend();
        }
        

    });
  })
