// Initialize a DJ. This should incorporate generative text, eventually
let inputForm = document.querySelector('form');
let inputTxt = document.querySelector('.txt');
inputForm.onsubmit = function(event) {
  event.preventDefault();
  responsiveVoice.speak(inputTxt.value, "Korean Female");
  inputTxt.blur();
}

// Instantiate the model by specifying the desired checkpoint.
const model = new mm.MusicVAE(
  'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_vae/trio_4bar_lokl_small_q1');

const startHTML = "<div id='start'>CLICK TO TRIO ENDLESSLY</div>";
const player = new mm.Player();

let stopSignal = false;
let count = 0;
let tempo = 60;

const sampleAndPlayForever = () => {
  player.stop();
  count += 1;
  document.getElementById('count').innerHTML = `${count} trios`;
 
  // Speak before moving on to next loop
  responsiveVoice.speak(inputTxt.value, "Korean Female", {onend: () => {
    return model.sample(1)
      .then((samples) => player.start(samples[0], tempo))
      .then(stopSignal ? undefined : sampleAndPlayForever)
    }
  });
};

const changeTempo = (delta) => {
  tempo = Math.max(Math.min(tempo + delta * 10, 120), 40);
  const tempoCounter = document.getElementById('tempo');
  tempoCounter.setAttribute('scrollamount', tempo / 10);
  tempoCounter.innerHTML = `${tempo} bpm`;
}

const start = () =>  {
  mm.Player.tone.context.resume();  // Required on mobile.
  document.getElementById('main').innerHTML = 
    "<marquee scrollamount=14>ENDLESS TRIOS</marquee>" +
    "<marquee scrollamount=14 direction=right >ENDLESS TRIOS</marquee>" +
    "<marquee behavior=alternate class='button' id='next'>Next Trios</marquee>" + 
    "<marquee behavior=alternate id='count' direction=right>0 TRIOS</marquee>" +
    "<marquee behavior=alternate class='button' id='stop'>END TRIOS</marquee>" + 
    "<marquee scrollamount=14>ENDLESS TRIOS</marquee>" +
    "<marquee scrollamount=14 direction=right>ENDLESS TRIOS</marquee>" +
    "<marquee direction=right behavior=alternate class='button' id='faster'>Faster Trios</marquee>" + 
    `<marquee behavior=alternate id='tempo'>${tempo} bpm</marquee>` +
    "<marquee direction=right behavior=alternate class='button' id='slower'>Slower Trios</marquee>" +
    "<marquee scrollamount=14>ENDLESS TRIOS</marquee>" +
    "<marquee scrollamount=14 direction=right>ENDLESS TRIOS</marquee>";

  stopSignal = false;
  sampleAndPlayForever();
  document.getElementById('stop').addEventListener('click', stop);
  document.getElementById('next').addEventListener('click', sampleAndPlayForever);
  document.getElementById('slower').addEventListener('click', () => changeTempo(-1));
  document.getElementById('faster').addEventListener('click', () => changeTempo(1));
};

const stop = () => {
  stopSignal = true;
  player.stop();
  document.getElementById('main').innerHTML = startHTML;
  document.getElementById('start').addEventListener('click', start);
};

model.initialize().then(stop);