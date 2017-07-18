window.onload = function() {
  var context = new window.AudioContext(),
      osc = context.createOscillator(),
      vol = context.createGain(),
      freqGain = context.createGain(),
      lfo = context.createOscillator(),
      lfoRate = document.getElementById('lfo-rate'),
      volControl = document.getElementById('volume'),
      pitchControl = document.getElementById('pitch');

  vol.gain.value = volControl.value;
  vol.connect(context.destination);

  osc.frequency.value = 440;
  osc.type = "square";
  osc.connect(vol);

  freqGain.gain.value = 100;
  freqGain.connect(osc.frequency);

  lfo.frequency.value = 1;
  lfo.connect(freqGain);

  volControl.addEventListener('input', function() {
    vol.gain.value = this.value;
    $('#current-volume').text(this.value);
  });

  pitchControl.addEventListener('input', function() {
    osc.frequency.value = this.value;
    $('#current-pitch').text(this.value);
  });

  lfoRate.addEventListener('input', function() {
    lfo.frequency.value = this.value;
    $('#current-lfo-rate').text(this.value);
  });

  $('#synth-on').click(function() {
    osc.start();
    lfo.start();
  });
  $('#synth-off').click(function() {
    osc.stop();
    lfo.stop();
  });
};
