window.onload = function() {

  // variable declarations
  var context = new window.AudioContext(),
      vco = context.createOscillator(),
      vca = context.createGain(),
      panner = context.createStereoPanner(),
      freqGain = context.createGain(),
      lfo = context.createOscillator(),
      panControl = document.getElementById('panner'),
      lfoRate = document.getElementById('lfo-rate'),
      vcaControl = document.getElementById('volume'),
      pitchControl = document.getElementById('pitch');

  // panner node
  panner.connect(context.destination);

  // volume node
  vca.gain.value = vcaControl.value;
  vca.connect(panner);

  // vco node
  vco.frequency.value = 80;
  vco.type = "square";
  vco.connect(vca);

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
    $('#current-pan-position').text(this.value);
  });

  // turn vco on, off
  $('#synth-on').click(function() {
    vco.start();
    lfo.start();
  });
  $('#synth-off').click(function() {
    vco.stop();
    lfo.stop();
  });
};
