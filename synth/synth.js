const KEYS = {
  "c_major_garbage": [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66],
  "dj_barakas": [],
  "depressed_daikon": []
}

class Oscillator {
  constructor(pitch, context, masterVolume) {
    this.context = context;
    this.vco = context.createOscillator();
    this.vco.frequency.value = pitch;
    this.vca = context.createGain();
    this.vco.connect(this.vca);
    console.log(masterVolume);
    this.vca.connect(masterVolume);
    this.vco.type = "square";
    this.vco.start();
    this.vca.gain.value = 0;
  }

  trigger(){
    console.log('TRIGGER ALERT!');
    // this.vca.gain.value = 1;
    this.vca.gain.setTargetAtTime(1, this.context.currentTime, 0.01);
    this.vca.gain.setTargetAtTime(0, this.context.currentTime + 0.01, 0.35);
  }
}

class Sequencer {
  constructor(vcoCount, key, sequenceData) {
    this.vcoCount = vcoCount;
    this.oscillators = [];
    this.key = key;
    this.sequenceData = sequenceData;
    this.currentStep = 0;
    this.context = new window.AudioContext();
    this.masterVolume = this.context.createGain();
    // this.panner = this.context.createStereoPanner();
    // this.lfoFreqGain = this.context.createGain();
    // this.lfo = this.context.createOscillator();
    this.filter = this.context.createBiquadFilter();
    this.genVCOs();
    this.masterVolume.connect(this.context.destination)
  }
  genVCOs() {
    for(var i=1; i <= this.vcoCount; i++) {
      var pitch = KEYS['c_major_garbage'][i-1];
      var osc = new Oscillator(pitch, this.context, this.masterVolume)
      // var vco = context.createOscillator(pitch, context);
      // vco.frequency.value = KEYS['c_major'][i-1]; // key value
      // vco.type = "square";
      // vco.connect(vca);
      // vco.start();
      this.oscillators.push(osc);
    }
  }

  // step {
  //   // triggered by interval
  //   // reads sequence data
  //   // plays oscillators at indeces in osillatorArray
  //   // corresponding to indeces in sequence data where digit is 1
  // }
  //
  // startSequencer {
  //   // starts interval
  //   // saves intervalID as instance variable
  //   // interval triggers step method, every speed milliseconds
  // }

}

var sequencer = new Sequencer(16, 'c_major', "00100101011100000010100101001");



// ----------------------------------------- UI test
$(document).ready(function(){
  sequencer.oscillators.forEach((osc, index) => {
      $(".triggers").append(`<button class="button" id="${index}">${index+1}</button>`);
  });

  $(".button").click(function(){
    var index = parseInt($(this).attr('id'), 10);
    sequencer.oscillators[index].trigger();

  });

  // master volume
  document.getElementById('master-volume').addEventListener('input', function() {
    sequencer.masterVolume.gain.value = this.value;
    $('#current-master-volume').text(this.value);
  });


});
