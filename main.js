var audioCtx; // Global AudioContext variable for brown noise

function initBubbleNoise() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    // Brown noise generation and processing code here
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
        console.log("BUBBLE");
        if (!audioCtx) {
            initBubbleNoise();
            return;
        }
        else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        else if (audioCtx.state === 'running') {
            audioCtx.suspend();
        }
    });
});

// ###############################


var customAudioCtx; // Global AudioContext variable for custom sound

function initCustomSound() {
    customAudioCtx = new (window.AudioContext || window.webkitAudioContext);
    // Custom sound synthesis code here
     // create AM/FM synthesis objects
    var am = new AMSynthesis(customAudioCtx);
    var fm = new FMSynthesis(customAudioCtx);
    
     // connections
     var finalGain = new GainNode(customAudioCtx);
     finalGain.gain.value = 0;
    //  connect carrier osc to modulator gain
     fm.connect(am.modulatorGain);
     am.connect(finalGain);
     finalGain.connect(customAudioCtx.destination)



    // create envelopes for freqeuency and gain
     //  (audioCtx, parameter, attack, decay, max_value)
    finalEnvelope = new ADSREnvelope(customAudioCtx, finalGain.gain, 0.5, .2);
    fmFreqEnvelope = new ADSREnvelope(customAudioCtx, fm.modulatorOsc.frequency, 0, 0.5 , 215);
    fmGainEnvelope = new ADSREnvelope(customAudioCtx, fm.modulationIndex.gain,0.75,0.6,0.2);
    amFreqEnvelope = new ADSREnvelope(customAudioCtx, am.modulatorOsc.frequency,0.2,0.4,850);
    amGainEnvelope = new ADSREnvelope(customAudioCtx, am.oscGain.gain,0.4,0.1 , -0.7);
    

    // set frequency
    fm.carrierOsc.frequency.value = 2400;

    // start oscillators
    am.start(0);
    fm.start(0);

    // trigger the envelopes
    finalEnvelope.start()
    fmFreqEnvelope.start()
    amFreqEnvelope.start()
    fmGainEnvelope.start()
    amGainEnvelope.start()

}
class AMSynthesis{
    constructor(customAudioCtx){
        // oscillator
        this.modulatorOsc = customAudioCtx.createOscillator();
        // gain nodes
        this.oscGain = customAudioCtx.createGain();
        this.modulatorGain = customAudioCtx.createGain();
        // connect them
        this.modulatorOsc.connect(this.oscGain).connect(this.modulatorGain.gain);

        
    }
    start(time){
        this.modulatorOsc.start(time);
    }
    // connect to final gain node
    connect(destination){
        this.modulatorGain.connect(destination);
    }
    
}

class FMSynthesis{
    constructor(customAudioCtx){
         // oscillators
         this.carrierOsc = customAudioCtx.createOscillator();
         this.modulatorOsc = customAudioCtx.createOscillator();
         // gain nodes
         this.modulationIndex = customAudioCtx.createGain();
         // connect them
         this.modulatorOsc.connect(this.modulationIndex);
         this.modulationIndex.connect(this.carrierOsc.frequency);

    }
    start(time){
        this.carrierOsc.start(time);
        this.modulatorOsc.start(time);

    }
    connect(destination){
        this.carrierOsc.connect(destination);
    }
}

class ADSREnvelope{
    constructor(customAudioCtx, parameter, attack = 0.7, decay = 0.7, max=.4){
        this.audioCtx = customAudioCtx;
        this.parameter = parameter;
        this.attack = attack;
        this.decay = decay;
        this.max = max;
        this.sampleRate = 1/44100

    }
    start(){
        var startTime = this.audioCtx.currentTime;
        this.parameter.cancelScheduledValues(startTime);
        this.parameter.setValueAtTime(0, startTime);
        this.parameter.setTargetAtTime(this.max, startTime, this.attack/7);
        this.parameter.setTargetAtTime(0, startTime + this.attack +this.sampleRate, this.decay/7)
    }
}

window.addEventListener('load', () => {
    document.getElementById("bird-sound").addEventListener("click", () => {
        console.log("BIRD SOUND CLICKED");
        initCustomSound();
    });
});