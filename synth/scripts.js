window.onload = function() {
  var context = new window.AudioContext(),
      osc = context.createOscillator(),
      vol = context.createGain(),
      volControl = document.getElementById('volume'),
      pitchControl = document.getElementById('pitch');

  vol.gain.value = volControl.value;
  vol.connect(context.destination);

  osc.frequency.value = 80;
  osc.type = "square";
  osc.connect(vol);

  volControl.addEventListener('input', function() {
    vol.gain.value = this.value;
    $('#current-volume').text(this.value);
  });

  pitchControl.addEventListener('input', function() {
    osc.frequency.value = this.value;
    $('#current-pitch').text(this.value);
  });

  $('#synth-on').click(function() {
    osc.start();
  });
  $('#synth-off').click(function() {
    osc.stop();
  });
};
