let bttn; // the button to start voice recognition
let filterEnabled = false;
let bttnStop; // the button to stop voice recognition and additional effects
//let bttnRecord; //the button to record 
let userText = ""; // a global variable to save what the user says
let botText = ""; // a global variable to save what the bot sayd
let indiText = "Click the button to start"; // text indicating whether the program is listening
let bot = new RiveScript(); // a new rivescript bot
let voice = new p5.Speech("Google UK English Male"); // speech synthesis object set to the voice "Bad News"
let rec = new p5.SpeechRec("en-US"); // speech recognition object set to recognize US English
let capture; //for capturing the webcam of the user 
let backimg;
let captureGraphics;
let sound;
let isRecording = false;
let song;


//CREATE A GLOBAL VARIABLE OF DISPLAY TEXT SO THAT TEXT CHANGES -> IF STATEMENTS IN BOT REPLY -> BUT TEXT WILL CHANGE IN DRAW

let speaking = false;

//I also need to include "oldy" orangey filter in the video for capture upon pressing the start button!!!!

function preload() {
  // load the bot's brain
  bot.loadFile("bot.txt").then(loaded).catch(error); //this syntax here is called a “promise”
  backimg = loadImage('background.webp');
}

function loaded() {
  console.log("yay it's loaded!");
  bot.sortReplies(); // sort replies after the rivescript "brain" is loaded
}

function error(err) {
  console.log(err); // for console logging any rivescript error
}

function setup() {
  ///////here you can also set up your customized bot voice design/////////
  voice.setVoice("Google UK English Male"); //the bot's voice selection
  voice.setRate(1.1); //how fast it speaks
  voice.setPitch(0.95); //how high its pitch is
  song = loadSound('sound.mp3');
  song.setVolume(0.1);

  noCanvas();

  const gotItBtn = select('#gotItButton');
  gotItBtn.mousePressed(hideInstructions);

  createCanvas(windowWidth, windowHeight).parent('mainContent');

  p = createVector(random(width), 200) //for rain effect 
  // make a button for the user to click to start speech recognition
  bttn = createButton("START");
  //bttnRecord = createButton("RECORD");
  bttnStop = createButton("STOP");

  bttn.position(width / 5, height / 2 + height / 5);
  bttnStop.position(width / 5+100, height/2+height/5);
  //bttnRecord.position(width / 5+192, height / 2 + height / 5);
  //when the button is pressed, start speech recognition, change the indicator text to tell the user the program is listening

  bttn.mousePressed(startListening);
  bttnStop.mousePressed(stopListening); //when button is pressed, voice recognition and effects stop 

  ///Integrating the webcam feature 
  capture = createCapture(VIDEO);
  capture.size(400, 300);
  capture.hide(); // This hides the HTML video element
  //capture.position(width/5, height/4);
  captureGraphics = createGraphics(400, 300);
}

function hideInstructions() {
  // Hide the instruction box
  select('#instructionBox').hide(); // Hide the instruction box
  select('#mainContent').style('filter', 'none'); // Remove blur from the main content
}


function startListening() {
  rec.start();
  indiText = "Listening in progress";
  // when the speech rec object gets result (hears an utterance from the user), go to the chat function
  rec.onResult = chat;
  // when the speech recognition ends, change the indicator text back
  rec.onEnd = function ended() {indiText="Darcy speaking"; 
  if (speaking==false){startListening();}}; 
  filterEnabled = true;
  isRecording = true; // Start the blinking effect
  song.play();
}

function stopListening() {
  rec.stop(); // Stops the speech recognition service
  voice.cancel(); // Stops any ongoing speech synthesis
  indiText = "Click the button to start"; // Update the indicator text to show that everything has stopped
  filterEnabled = false;
  isRecording = false;
  // Resetting other components if necessary
  drops = [];
  if (sound && sound.isPlaying()) {
    sound.stop(); // Assuming you have a method to stop sound playback
  }
  // Removing any automatic restart of listening
  if (rec.onEnd) {
    rec.onEnd = null;
  }
  song.stop();
}

function chat() {
  // save what the program hears into the global variable userText
  userText = rec.resultString;
  // let the RiveScript bot respond to what the user says
  bot.reply("local-user", userText).then(respond); //this is again in the form of a “promise”
  //.reply is a RiveScript function to respond to the user
}

function respond(reply) {
  console.log(reply); //send the response to the console
  botText = reply;
  if (botText !== "no reply"){
    voice.speak(botText); // ask the program to speak the bot response
    voice.onStart = function voiceStarted(){speaking=true;}
  }

  //indiText = "Alex speaking";
 // voice.speak(botText); // ask the program to speak the bot response
  voice.onEnd = function speechEnded() {
    speaking=false; 
    setTimeout(startListening, 200);
  }
}

function draw() {
  background(backimg);
  textSize(15);

  if (filterEnabled) {
    // Add new drops only if there are less than a certain amount
    while (drops.length < 50) {
      drops.push(new Drop(random(width), 0));
    }
    for (let i = 0; i < 5; i++){
      drops.push(new Drop(random(width), 0, 0))
    }

    for (let d of drops) {
      d.show();
      d.update();
    }
  } else {
    // Clear all drops when filter is not enabled
    drops = [];
  }

  fill(120, 120, 120, 120);
  noStroke(); // No border for the rectangle
  rect(100, 100, windowWidth - 200, windowHeight - 150);

  captureGraphics.image(capture, 0, 0);

  console.log('Filter Enabled:', filterEnabled); // Debugging to check if filter is correctly enabled

  if (filterEnabled) {
    captureGraphics.tint(200, 220, 225); // Apply a blueish tint
    console.log('Tint applied');
  } else {
    captureGraphics.noTint(); // Remove any tint effect
  }

  image(captureGraphics, width / 5, height / 4, 400, 300);

  if (isRecording) {
    let elapsed = millis() % 1000;
    if (elapsed < 500) { // Blink every half second
      fill(178,34,34);
      ellipse(width / 6+100, height / 4+40, 12, 12); // Draw a red circle
    }
  }

  fill(255);
  text(indiText, width / 5, height / 2 + height / 6);

  //image(capture, width/2, height/4, 400, 300);

}

class Drop{
  constructor(x, y){
    this.pos = createVector(x, y)
    this.vel = createVector(0, random(12, 16))
    this.length = random(20, 40)
    this.strength = random(255)
  }
  show(){
    stroke(255, this.strength)
    line(this.pos.x, this.pos.y, this.pos.x, this.pos.y-this.length)
  }
  
  update(){
    this.pos.add(this.vel)
    if (this.pos.y > height + 100){
      drops.shift()
    }
  }
  
}
  
