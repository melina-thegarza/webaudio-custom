var audioCtx  = new (window.AudioContext || window.webkitAudioContext);
function initAudio() {

    // create AM/FM synthesis objects
    var am = new AMSynthesis(audioCtx);
    var fm = new FMSynthesis(audioCtx);
    
     // connections
     var finalGain = new GainNode(audioCtx);
     finalGain.gain.value = 0;
    //  connect carrier osc to modulator gain
     fm.connect(am.modulatorGain);
     am.connect(finalGain);
     finalGain.connect(audioCtx.destination)



    // create envelopes for freqeuency and gain
     //  (audioCtx, parameter, attack, decay, max_value)
    finalEnvelope = new ADSREnvelope(audioCtx, finalGain.gain, 0.5, .2);
    fmFreqEnvelope = new ADSREnvelope(audioCtx, fm.modulatorOsc.frequency, 0, 0.5 , 215);
    fmGainEnvelope = new ADSREnvelope(audioCtx, fm.modulationIndex.gain,0.75,0.6,0.2);
    amFreqEnvelope = new ADSREnvelope(audioCtx, am.modulatorOsc.frequency,0.2,0.4,850);
    amGainEnvelope = new ADSREnvelope(audioCtx, am.oscGain.gain,0.4,0.1 , -0.7);
    

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
    constructor(audioCtx){
        // oscillator
        this.modulatorOsc = audioCtx.createOscillator();
        this.carrier = audioCtx.createOscillator();
        // gain nodes
        this.oscGain = audioCtx.createGain();
        this.modulatorGain = audioCtx.createGain();
        // connect them
        this.modulatorOsc.connect(this.oscGain).connect(this.modulatorGain.gain);
        this.carrier.connect(this.modulatorGain);

        this.carrier.frequency.value = 440;
        
    }
    start(time){
        this.modulatorOsc.start(time)
    }
    // connect to final gain node
    connect(destination){
        this.modulatorGain.connect(destination);
    }
    
}

class FMSynthesis{
    constructor(audioCtx){
         // oscillators
         this.carrierOsc = audioCtx.createOscillator();
         this.modulatorOsc = audioCtx.createOscillator();
         // gain nodes
         this.modulationIndex = audioCtx.createGain();
         this.carrierGain = audioCtx.createGain();
         // connect them
         this.modulatorOsc.connect(this.modulationIndex);
         this.modulationIndex.connect(this.carrierGain);
         this.carrierGain.connect(this.carrierOsc.frequency);

         this.carrierGain.gain.value = 100;

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
    constructor(audioCtx, parameter, attack = 0.7, decay = 0.7, max=.4){
        this.audioCtx = audioCtx;
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
    
        initAudio()
        

    });
  })

