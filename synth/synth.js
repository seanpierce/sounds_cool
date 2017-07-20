const KEYS = {
  "c_major_garbage": [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66],
  "dj_barakas": [],
  "depressed_daikon": [],
  "polka_savage": [],
  "teachers_making_weed_jokes": [61.74, 69.30, 82.41, 92.50, 123.47, 138.59, 164.81, 185.00, 220.00, 246.94, 277.18, 329.63, 369.99, 440.00, 493.88, 587.33],
  "mc_commune": []
}

class Oscillator {
  constructor(pitch, context, masterVolume, parentSequencer) {
    // parameter assignment
    this.context = context;
    this.parentSequencer = parentSequencer;

    // creation
    this.vco = context.createOscillator();
    this.vca = context.createGain();
    this.lfo = context.createOscillator();
    this.lfoGain = context.createGain();

    // connection
    this.vca.connect(masterVolume);
    this.vco.connect(this.vca);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.vco.frequency);

    // configuration
    this.vco.type = "square";
    this.vco.frequency.value = pitch;
    this.vca.gain.value = 0;
    this.lfo.type = "sine";
    this.lfo.frequency.value = 0;
    this.lfoGain.gain.value = 0;

    // initialization
    this.vco.start();
    this.lfo.start();
  }

  // envelope generator
  trigger() {
    this.vca.gain.setTargetAtTime(1, this.context.currentTime, this.parentSequencer.attack);
    this.vca.gain.setTargetAtTime(0, this.context.currentTime + this.parentSequencer.attack, this.parentSequencer.release);
  }
}

class Sequencer {
  constructor(vcoCount, key, sequenceData) {
    // parameter assignment
    this.vcoCount = vcoCount;
    this.key = key;
    this.sequenceData = sequenceData;
    this.oscillators = [];
    // context initialization
    this.context = new window.AudioContext();
    // static initialization
    this.currentStep = 0;
    this.attack = 0.01;
    this.release = 0.15;
    this.speed = 200;
    this.key = 'teachers_making_weed_jokes';

    // creation
    this.masterVolume = this.context.createGain();
    this.filter = this.context.createBiquadFilter();
    this.lfoGain = this.context.createGain();
    this.lfo = this.context.createOscillator();
    this.analyser = this.context.createAnalyser();

    // connection
    this.lfoGain.connect(this.filter.detune);
    this.lfo.connect(this.lfoGain);
    this.masterVolume.connect(this.filter);
    this.filter.connect(this.analyser);
    this.filter.connect(this.context.destination);

    // configuration
    this.lfo.type = "sine";
    this.lfoGain.gain.value = 0;
    this.lfo.frequency.value = 0;
    this.masterVolume.gain.value = 0.5;
    this.filter.type  = "lowpass";
    this.filter.frequency.value = 10000;
    this.filter.Q.value = 1;
    this.oscillatorCoarseTune = 0;
    this.oscillatorFineTune = 0;

    // initialization
    this.lfo.start();
    this.generateOscillators();
  }

  generateOscillators() {
    for(let i = 0; i < this.vcoCount; i++) {
      let pitch = KEYS[this.key][i];
      let osc = new Oscillator(pitch, this.context, this.masterVolume, this);
      this.oscillators.push(osc);
    }
  }

  toggle(id) {
    let str = this.sequenceData.split("");
    str[id] = str[id] === "1" ? "0" : "1";
    this.sequenceData = str.join("");
  }

  // TODO: call method on save click
  // updates sequence in API
  updateSequence() {
    $.ajax({
      url: `http://localhost:3000/sequences/${this.sequenceId}`,
      type: "PUT",
      data: {
        title: this.sequenceTitle,
        data: this.sequenceData,
        speed: 200,
        width: 300
      }
    });
  }

  // plays oscillators at indeces in osillatorArray
  // corresponding to indeces in current step sequence data where digit is 1
  step() {
    let stepDads = this.sequenceData.substr(this.currentStep * this.vcoCount, this.vcoCount);
    this.getIndeces(stepDads).forEach(index => {
      this.oscillators[index].trigger();
    });

    highlightRow(this.currentStep)

    this.currentStep = this.currentStep < 15 ? this.currentStep + 1 : 0;

    this.timeoutId = setTimeout(function(scope){ scope.step()}, this.speed, this);
  }

  getIndeces(stepDads) {
    let indeces = [];
    for(let i = 0; i < stepDads.length; i++){
      if(stepDads[i] === "1"){ indeces.push(i)}
    }
    return indeces;
  }

  start() {
    this.timeoutId = setTimeout(function(scope){ scope.step() }, this.speed, this);
  }

  stop() {
    clearTimeout(this.timeoutId);
  }

  changeOscillatorCoarseTune(value) {
    this.oscillatorCoarseTune += value;
    this.oscillators.forEach(oscillator => {
      oscillator.vco.frequency.value += 100 * value;
    });
  }

  setOscillatorFineTune(value) {
    this.oscillators.forEach(oscillator => {
      oscillator.vco.detune.value = value * 10;
    });
  }

  setOscillatorWaveShape(shape) {
    this.oscillators.forEach(oscillator => {
      oscillator.vco.type = shape
    });
  }

  setLfoOscillatorGain(value) {
    this.oscillators.forEach(oscillator => {
      oscillator.lfoGain.gain.value = value;
    });
  }

  setLfoOscillatorFrequency(value) {
    this.oscillators.forEach(oscillator => {
      oscillator.lfo.frequency.value = value;
    });
  }

}

class Controller {
  constructor() {
    this.sequencer = new Sequencer(16, 'c_major',"0000000000000001000000000000000000000000000010000000000000010000000000000010000000000000010000000000000010000000000000000000000100000010010000000000010000000000000010000000000000010000000000000000000000000000000010000000000010000000000000000000001000000001");
  }

  setSequencerMasterVolume(value) {
    this.sequencer.masterVolume.gain.value = value;
  }

  setSequencerFilterCutoff(value) {
    this.sequencer.filter.frequency.value = value;
  }

  setSequencerFilterResonance(value) {
    this.sequencer.filter.Q.value = value;
  }

  setSequencerFilterType(type) {
    this.sequencer.filter.type = type;
  }

  setSequencerSpeed(value) {
    this.sequencer.speed = value;
  }

  setSequencerAttack(value) {
    this.sequencer.attack = value;
  }

  setSequencerRelease(value) {
    this.sequencer.release = value;
  }

  setSequencerFilterLfoGain(value) {
    this.sequencer.lfoGain.gain.value = value;
  }

  setSequencerFilterLfoFrequency(value) {
    this.sequencer.lfo.frequency.value = value;
  }

  startSequencer() {
    this.sequencer.start()
  }

  stopSequencer() {
    this.sequencer.stop()
  }
}

const CONTROLLER = new Controller();

function toggleMarked(element){
  element.hasClass("marked") ? element.removeClass("marked") : element.addClass("marked");
}

function generateGrid(){
  for(let i = 0; i < CONTROLLER.sequencer.vcoCount; i++){
    $("#grid").append(`<div class="col" id="col-${i}"></div>`)
    for(let n = 0; n < CONTROLLER.sequencer.vcoCount; n++){
      $(`#col-${i}`).append(`<div class="square" id="square-${(i*16)+n}"></div>`);
      $(`#square-${(i*16)+n}`).click(function(){
        let id = $(this).attr("id").match(/[0-9]+/)[0];
        CONTROLLER.sequencer.toggle(id);
        toggleMarked($(this));
      })
    }
  }
  placeMarkers();
}

function placeMarkers(){
  for(let i = 0; i < 16; i++){
    let rowData = CONTROLLER.sequencer.sequenceData.substr(i*16, 16);
    for(let n = 0; n < 16; n++){
      $(`#col-${i} #square-${(i*16)+n}`).removeClass("marked")
      if(rowData.charAt(n) === "1"){
        $(`#col-${i} #square-${(i*16)+n}`).addClass("marked")
      }
    }
  }
}

// TODO: resolve sequence highlight animation
function highlightRow(colId){
  let prev = colId === 0 ? 15 : colId - 1;

  for(let i = 0; i < 16; i++){
    $(`#col-${prev}`).removeClass("active")
    $(`#col-${colId}`).addClass("active")
  }
}

function getPattern(id){
  $.get(`http://localhost:3000/sequences/${id}`).done(sequence => {
    CONTROLLER.sequencer.sequenceTitle = sequence.title;
    CONTROLLER.sequencer.sequenceData = sequence.data;
    CONTROLLER.sequencer.sequenceId = sequence.id;
    placeMarkers();
  });
}

function placePreviewMarkers(sequence){
  for(let i = 0; i < 16; i++){
    let rowData = sequence.data.substr(i*16, 16);
    for(let n = 0; n < 16; n++){
      $(`#preview-${sequence.id} #p-col-${i} #p-square-${(i*16)+n}`).removeClass("p-marked")
      if(rowData.charAt(n) === "1"){
        $(`#preview-${sequence.id} #p-col-${i} #p-square-${(i*16)+n}`).addClass("p-marked")
      }
    }
  }
}

function generatePreview(sequence){
  $('#grids').append(`<div class="preview" id="preview-${sequence.id}"></div>`)
  $(`#preview-${sequence.id}`).css("background-color",`rgb(${Math.floor(Math.random()*(255+1))},${Math.floor(Math.random()*(255+1))},${Math.floor(Math.random()*(255+1))})`)
  for(let i = 0; i < CONTROLLER.sequencer.vcoCount; i++){
    $(`#preview-${sequence.id}`).append(`<div class="p-col" id="p-col-${i}"></div>`)
    for(let n = 0; n < CONTROLLER.sequencer.vcoCount; n++){
      $(`#preview-${sequence.id} #p-col-${i}`).append(`<div class="p-square" id="p-square-${(i*16)+n}"></div>`)
    }
  }
  $(`#preview-${sequence.id}`).click(function(){
    getPattern(sequence.id);
  });
  placePreviewMarkers(sequence);
}

// ----------------------------------------- UI
$(document).ready(function(){

  var canvasContext = document.getElementById('oscilloscope').getContext('2d');

  function draw() {
    drawScope(CONTROLLER.sequencer.analyser, canvasContext);
    requestAnimationFrame(draw);
  }

  function drawScope(analyser, ctx) {
    let width = ctx.canvas.width,
        height = ctx.canvas.height,
        timeData = new Uint8Array(analyser.frequencyBinCount),
        scaling = height / 256,
        risingEdge = 0,
        edgeThreshold = 0;

    analyser.getByteTimeDomainData(timeData);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9';
    ctx.fillRect(0, 0, 1000, 1000);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();

    // No buffer overrun protection
    while (timeData[risingEdge++] - 100 > 0 && risingEdge <= width);
    if (risingEdge >= width) risingEdge = 0;

    while (timeData[risingEdge++] - 100 < edgeThreshold && risingEdge <= width);
    if (risingEdge >= width) risingEdge = 0;

    for (let x = risingEdge; x < timeData.length && x - risingEdge < width; x++)
      ctx.lineTo(x - risingEdge, height - timeData[x] * scaling);

    ctx.stroke();
  }

  draw();

  // request all sequences form API
  $.get("http://localhost:3000/sequences").done(sequences => {
    sequences.forEach(sequence => {
      generatePreview(sequence)
      $('#patterns').append(
        `<button class="pattern-button" data-id="${sequence.id}" >${sequence.title}</button>`
      );
    });
    $('.pattern-button').click(function(){
      let id = $(this).attr('data-id');
      getPattern(id);
    });
  });

  generateGrid();

  // new sequence
  // save sequence
  document.getElementById('save-sequence').addEventListener('click', function(){
    CONTROLLER.sequencer.updateSequence();
  });

  // master volume
  document.getElementById('master-volume').addEventListener('input', function() {
    CONTROLLER.setSequencerMasterVolume(this.value);
    $('#current-master-volume').text(this.value);
  });

  // filter
  document.getElementById('filter').addEventListener('input', function() {
    CONTROLLER.setSequencerFilterCutoff(this.value);
    $('#current-filter-cutoff').text(this.value);
  });

  // filter resonance
  document.getElementById('reso').addEventListener('input', function() {
    CONTROLLER.setSequencerFilterResonance(this.value);
    $('#current-filter-reso').text(this.value);
  });

  // filter type
  document.getElementById('filter-type').addEventListener('change', function() {
    let type = $("input[name=filter]:checked").val();
    CONTROLLER.setSequencerFilterType(type);
  });

  // sequence speed
  document.getElementById('speed').addEventListener('input', function() {
    CONTROLLER.setSequencerSpeed(this.value);
    $('#current-speed').text(this.value);
  });

  // attack
  // NOTE: why why why does to precision get funky?
  document.getElementById('attack').addEventListener('input', function() {
    let value = Number.parseFloat(this.value);
    CONTROLLER.setSequencerAttack(value);
    $('#current-attack').text(value);
  });

  // release
  document.getElementById('release').addEventListener('input', function() {
    CONTROLLER.setSequencerRelease(this.value);
    $('#current-release').text(this.value);
  });

  // TODO: separate back/front concerns
  // vco coarse tune
  document.getElementById('tune-up').addEventListener('click', function() {
    CONTROLLER.sequencer.changeOscillatorCoarseTune(1);
    let val = Number.parseInt($('#current-tuning').text());
    $('#current-tuning').text(val + 1);
  });
  document.getElementById('tune-down').addEventListener('click', function() {
    CONTROLLER.sequencer.changeOscillatorCoarseTune(-1);
    let val = Number.parseInt($('#current-tuning').text());
    $('#current-tuning').text(val - 1);
  });

  // vco fine tune
  document.getElementById('fine-tune').addEventListener('input', function() {
    let value = Number.parseInt(this.value);
    CONTROLLER.sequencer.setOscillatorFineTune(value);
    $('#current-fine-tune').text(value);
  });

  // vco waveshape
  document.getElementById('vco-waveshape').addEventListener('change', function() {
    let shape = $("input[name=waveshape]:checked").val();
    CONTROLLER.sequencer.setOscillatorWaveShape(shape);
  });

  // lfo-vco-gain
  document.getElementById('lfo-gain').addEventListener('input', function() {
    let value = Number.parseInt(this.value);
    CONTROLLER.sequencer.setLfoOscillatorGain(value);
    $('#current-lfo-gain').text(value);
  });

  // lfo-vco-frequency
  document.getElementById('lfo-frequency').addEventListener('input', function() {
    let value = Number.parseInt(this.value);
    CONTROLLER.sequencer.setLfoOscillatorFrequency(value);
    $('#current-lfo-frequency').text(this.value);
  });

  // lfo-filter-gain
  document.getElementById('lfo-filter-gain').addEventListener('input', function() {
    CONTROLLER.setSequencerFilterLfoGain(this.value);
    $('#current-lfo-filter-gain').text(this.value);
  });

  // lfo-filter-frequency
  document.getElementById('lfo-filter-frequency').addEventListener('input', function() {
    CONTROLLER.setSequencerFilterLfoFrequency(this.value);
    $('#current-lfo-filter-frequency').text(this.value);
  });


  $('#start-sequencer').click(function(){
    CONTROLLER.startSequencer();
  });

  $('#stop-sequencer').click(function(){
    CONTROLLER.stopSequencer();
  });
});
