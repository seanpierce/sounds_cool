window.onload = function() {

  // variable declarations
  var context = new window.AudioContext(), // moved into sequencer initialize
      releaseTime = 0.15,
      intervalId,
      // vco = context.createOscillator(),
      // vco2 = context.createOscillator(),
      vca = context.createGain(), // moved into sequencer initialize
      panner = context.createStereoPanner(), // moved into sequencer initialize
      freqGain = context.createGain(), // moved into sequencer initialize
      lfo = context.createOscillator(), // moved into sequencer initialize
      filter = context.createBiquadFilter(), // moved into sequencer initialize
      releaseControl = document.getElementById('release'),
      filterCutoffControl = document.getElementById('filter'),
      repeaterSpeed = document.getElementById('speed'),
      filterResoControl = document.getElementById('reso'),
      panControl = document.getElementById('panner'),
      lfoRate = document.getElementById('lfo-rate'),
      vcaControl = document.getElementById('volume'),
      pitchControl = document.getElementById('pitch');


      // trigger
      function trigger(release) {
        vca.gain.setTargetAtTime(1, context.currentTime, 0.01);
        vca.gain.setTargetAtTime(0, context.currentTime + 0.01, release);
        // filter.frequency.setTargetAtTime(1000, context.currentTime, 0.01);
        // filter.frequency.setTargetAtTime(0, context.currentTime + 0.01, release);
      }

      // repeater function
      function repeater(time) {
        var intervalId = setInterval(function(){
          trigger(releaseTime);
        }, time);
        return intervalId;
      }


  // lowpass filter
  filter.type = "lowpass";
  filter.frequency.value = 10000;
  filter.Q.value = 5;
  filter.connect(context.destination);

  // panner node
  panner.connect(filter);

  // volume node
  vca.gain.value = vcaControl.value;
  vca.connect(panner);

  // vco nodes
  var num_of_vcos = 1;
  var vco_arr = [];
  for(var i = 1; i <= num_of_vcos; i++) {
    var vco = context.createOscillator();
    vco.frequency.value = 80;
    vco.type = "square";
    vco.connect(vca);
    vco_arr.push(vco);
  }

  // start oscillators
  vco_arr.forEach(vco => {
    vco.start();
  })
  lfo.start();

  // lfo node
  freqGain.gain.value = 100;
  freqGain.connect(vco.frequency);
  lfo.frequency.value = 0;
  lfo.connect(freqGain);

  // event listeners
  vcaControl.addEventListener('input', function() {
    vca.gain.value = this.value;
    $('#current-volume').text(this.value);
  });

  pitchControl.addEventListener('input', function() {
    vco.frequency.value = this.value;
    $('#current-pitch').text(this.value);
  });

  lfoRate.addEventListener('input', function() {
    lfo.frequency.value = this.value;
    $('#current-lfo-rate').text(this.value);
  });

  panControl.addEventListener('input', function() {
    panner.pan.value = this.value;
    $('#current-pan-left').text((this.value * -1)*10);
    $('#current-pan-right').text((this.value)*10);
  });

  filterCutoffControl.addEventListener('input', function() {
    filter.frequency.value = this.value;
    $('#current-filter-cutoff').text(this.value);
  });

  filterResoControl.addEventListener('input', function() {
    filter.Q.value = this.value;
    $('#current-filter-reso').text(this.value);
    if (this.value >= 30 && this.value <= 50) {
      $('#current-filter-reso').css('color', 'orange');
    } else if (this.value > 50) {
      $('#current-filter-reso').css('color', 'red');
    } else {
      $('#current-filter-reso').css('color', 'blue');
    }
  });

  releaseControl.addEventListener('input', function() {
    // now what?
    releaseTime = this.value;
    $('#current-release').text(this.value);
  });

  // User Interactions
  // repeater / arpeggiation
  $('#repeater-on').click(function() {
    intervalId = repeater(repeaterSpeed.value);
  });
  $('#repeater-off').click(function() {
    clearInterval(intervalId);
  });

  $('#trigger-once').click(function() {
    trigger(releaseTime);
  });
};
