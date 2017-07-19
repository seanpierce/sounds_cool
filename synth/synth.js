const KEYS = {
  "c_major_garbage": [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66],
  "dj_barakas": [],
  "depressed_daikon": []
}

var release = 0.15;
var speed = 200;

class Oscillator {
  constructor(pitch, context, masterVolume) {
    this.context = context;
    this.vco = context.createOscillator();
    this.vco.frequency.value = pitch;
    this.vca = context.createGain();
    this.vco.connect(this.vca);
    this.vca.connect(masterVolume);
    this.vco.type = "square";
    this.vco.start();
    this.vca.gain.value = 0;
  }

  trigger(){
    // this.vca.gain.value = 1;
    this.vca.gain.setTargetAtTime(1, this.context.currentTime, 0.01);
    this.vca.gain.setTargetAtTime(0, this.context.currentTime + 0.01, release);
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
    this.filter.frequency.value = 10000;
    this.genVCOs();
    this.masterVolume.gain.value = 0;
    this.masterVolume.connect(this.filter);
    this.filter.connect(this.context.destination);
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


  // plays oscillators at indeces in osillatorArray
  // corresponding to indeces in current step sequence data where digit is 1
  step() {
    var stepDads = this.sequenceData.substr(this.currentStep * this.vcoCount, this.vcoCount)
    var indeces = this.getIndeces(stepDads)
    indeces.forEach(index => {
      this.oscillators[index].trigger();
    });
    if(this.currentStep < 15) {
      this.currentStep += 1;
    } else {
      this.currentStep = 0;
    }
  }

  getIndeces(stepDads){
    var indeces = [];
    var index = 0;
    while(index <= stepDads.length){
      index = stepDads.indexOf(1, index+1)
      if(index === -1){ return indeces; }
      indeces.push(index)
    }
  }

  startSequencer() {
    // starts interval
    // saves intervalID as instance variable
    // interval triggers step method, every speed milliseconds
    this.intervalId = setInterval(function(scope){ scope.step()}, 200, this)
  }

  stopSequencer() {
    clearInterval(this.intervalId);
  }

}

var sequencer = new Sequencer(16, 'c_major',"0000000000000001000000000000000000000000000010000000000000010000000000000010000000000000010000000000000010000000000000000000000100000010010000000000010000000000000010000000000000010000000000000000000000000000000010000000000010000000000000000000001000000001" );

// ----------------------------------------- UI
$(document).ready(function(){

  // request all sequences form API
  $.get("http://localhost:3000/sequences").done(sequences => {
    sequences.forEach(sequence => {
      $('#patterns').append(
        `<button class="pattern-button" data-pattern="${sequence.data}">${sequence.title}</button>`
      );
      // set sequence data onclick
    });
    $('.pattern-button').click(function() {
      sequencer.sequenceData = $(this).attr('data-pattern');
      console.log('dang');
    });
  });



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

  // filter
  document.getElementById('filter').addEventListener('input', function() {
    sequencer.filter.frequency.value = this.value;
    $('#current-filter-cutoff').text(this.value);
  });

  // filter resonance
  document.getElementById('reso').addEventListener('input', function() {
    sequencer.filter.Q.value = this.value;
    $('#current-filter-reso').text(this.value);
  });

  // release
  document.getElementById('release').addEventListener('input', function() {
    release = this.value;
    $('#current-release').text(this.value);
  });

  $('#start-sequencer').click(function(){
    sequencer.startSequencer()
  });

  $('#stop-sequencer').click(function(){
    sequencer.stopSequencer()
  });
});
