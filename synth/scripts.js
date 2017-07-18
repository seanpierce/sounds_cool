window.onload = function() {

  // variable declarations
  var context = new window.AudioContext(),
      vco = context.createOscillator(),
      vca = context.createGain(),
      panner = context.createStereoPanner(),
      freqGain = context.createGain(),
      lfo = context.createOscillator(),
      filter = context.createBiquadFilter(),
      filterCutoffControl = document.getElementById('filter'),
      repeaterSpeed = document.getElementById('speed'),
      filterResoControl = document.getElementById('reso'),
      panControl = document.getElementById('panner'),
      lfoRate = document.getElementById('lfo-rate'),
      vcaControl = document.getElementById('volume'),
      pitchControl = document.getElementById('pitch');


      // repeater function
      var intervalId;
      function repeater(time) {
        var intervalId = setInterval(function(){
          vca.gain.value = 1;
          setTimeout(function() {
            vca.gain.value = 0;
          }, (time / 2));
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

  // vco node
  vco.frequency.value = 80;
  vco.type = "square";
  vco.connect(vca);

  // start oscillators
  vco.start();
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
  });

  // turn vco on, off
  $('#synth-on').click(function() {
    intervalId = repeater(repeaterSpeed.value);
  });
  $('#synth-off').click(function() {
    clearInterval(intervalId);
  });
};
