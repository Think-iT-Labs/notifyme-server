var phrases = {
  greeting: [
    "🙌 Hi, my name is notifyMe Bot",
    "Hello ✋, is my aide required? if so please type help or aide",
    "🙋 Horraaa, keep calm and get notified!"
  ],
  unreconized: [
    "I am sorry 😕 I can't understand you, would you like some help? if so please type help",
    "🙇 I didn't get it sorry, please check the help by typing help",
    "Please 🙏, type help to display what I can do "
  ],
  maker: [
    "Tunisian guys made me!",
    "Meher Assal and Bechir Nemlaghi",
    "https://web.facebook.com/bash10 & https://web.facebook.com/xGeek"
  ],
  about: [
    "I am 2 days old 🚼, I was born in Tunisia thanks to www.think-it.io",
    "I speak Tunisian too, just kidding :D",
    "It took 12 🚬 and a couple of ☕ to make me!"
  ]
}

module.exports = function(action) {
  if(!phrases[action])
    return "I do not quite understand you 😞";
  return phrases[action][Math.floor(Math.random() * phrases[action].length)];
}