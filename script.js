// Optional: Add typing effect for text
const texts = [
  "Sathika Hettiarachchi - Portfolio",
  "Welcome to my digital domain",
  "Access granted...",
]; // Add more messages
let index = 0;
let charIndex = 0;
const typingSpeed = 50; // Adjust for desired speed

function type() {
  const h1 = document.querySelector("header h1");
  if (charIndex < texts[index].length) {
    h1.textContent += texts[index].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(() => {
      h1.textContent = "";
      charIndex = 0;
      index = (index + 1) % texts.length; // Cycle through messages
      type();
    }, 1000); // Pause between messages
  }
}

type(); // Start the typing effect
