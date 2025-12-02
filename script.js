// CLI TERMINAL INTERFACE - PURE JAVASCRIPT
// No frameworks. Maximum performance. Zero bloat.

document.addEventListener('DOMContentLoaded', function() {
  // Initialize performance metrics
  calculatePerformanceMetrics();

  // Initialize command input
  initCommandInput();

  // Initialize smooth scrolling
  initSmoothScroll();
});

// ═══════════════════════════════════════════════════════════════════
// PERFORMANCE METRICS CALCULATION
// ═══════════════════════════════════════════════════════════════════

function calculatePerformanceMetrics() {
  window.addEventListener('load', function() {
    // Calculate render time
    let renderTime = 0;
    const navigationEntry = window.performance.getEntriesByType('navigation')[0];

    if (navigationEntry) {
      renderTime = (navigationEntry.loadEventEnd / 1000).toFixed(2);
    }

    // Calculate payload size
    let totalSize = 0;

    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');

      resources.forEach(function(resource) {
        if (resource.transferSize) {
          totalSize += resource.transferSize;
        }
      });

      if (navigationEntry && navigationEntry.transferSize) {
        totalSize += navigationEntry.transferSize;
      }
    }

    const payloadSizeKB = (totalSize / 1024).toFixed(2);

    // Update DOM
    const renderTimeElement = document.getElementById('render-time');
    const payloadSizeElement = document.getElementById('payload-size');

    if (renderTimeElement) {
      renderTimeElement.textContent = 'Render: ' + renderTime + 's';
    }

    if (payloadSizeElement) {
      payloadSizeElement.textContent = 'Payload: ' + payloadSizeKB + 'KB';
    }

    // Console log
    console.log('═══════════════════════════════════════════════════════');
    console.log('CLI TERMINAL - PERFORMANCE DIAGNOSTICS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Render Time: ' + renderTime + 's');
    console.log('Payload Size: ' + payloadSizeKB + 'KB');
    console.log('Status: READY TO DEPLOY');
    console.log('Packet Loss: 0%');
    console.log('═══════════════════════════════════════════════════════');
  });
}

// ═══════════════════════════════════════════════════════════════════
// COMMAND INPUT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════

function initCommandInput() {
  const commandInput = document.getElementById('commandInput');

  if (commandInput) {
    // Handle enter key
    commandInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const command = this.value.trim().toLowerCase();
        processCommand(command);
        this.value = '';
      }
    });

    // Handle command suggestions from dropdown
    const commandOptions = document.querySelectorAll('.command-option');
    commandOptions.forEach(function(option) {
      option.addEventListener('click', function() {
        const command = this.textContent.trim();
        commandInput.value = command;
      });
    });
  }
}

// Process typed commands
function processCommand(command) {
  // Parse command
  if (command.includes('mailto')) {
    executeCommand('mailto');
  } else if (command.includes('linkedin')) {
    executeCommand('linkedin');
  } else if (command.includes('github')) {
    executeCommand('github');
  } else if (command.includes('instagram')) {
    executeCommand('instagram');
  } else if (command.includes('facebook')) {
    executeCommand('facebook');
  } else if (command.includes('twitter') || command.includes('x.com')) {
    executeCommand('twitter');
  } else if (command.includes('discord')) {
    executeCommand('discord');
  } else if (command.includes('status')) {
    scrollToSection('status');
  } else if (command.includes('config')) {
    scrollToSection('config');
  } else if (command.includes('logs')) {
    scrollToSection('logs');
  } else if (command.includes('contact') || command.includes('connect')) {
    scrollToSection('contact');
  } else if (command.includes('help')) {
    showHelp();
  } else if (command === '') {
    // Empty command, do nothing
  } else {
    console.log('Command not recognized: ' + command);
    console.log('Type "help" for available commands');
  }
}

// Show help in console
function showHelp() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('AVAILABLE COMMANDS:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('./status --show        Navigate to system status');
  console.log('./config --list        Navigate to configuration');
  console.log('./logs --display       Navigate to deployment logs');
  console.log('./connect --init       Navigate to contact section');
  console.log('mailto:                Open email client');
  console.log('connect: linkedin      Open LinkedIn profile');
  console.log('connect: github        Open GitHub profile');
  console.log('connect: instagram     Open Instagram profile');
  console.log('connect: facebook      Open Facebook profile');
  console.log('connect: twitter       Open Twitter profile');
  console.log('connect: discord       Open Discord server');
  console.log('═══════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════
// EXECUTE COMMAND (FOR CONTACT LINKS)
// ═══════════════════════════════════════════════════════════════════

function executeCommand(type) {
  const links = {
    'mailto': 'mailto:sathikahettiarachchi219@gmail.com',
    'linkedin': 'https://www.linkedin.com/in/sathika-hettiarachchi-516112303',
    'github': 'https://github.com/Hetti219',
    'instagram': 'https://www.instagram.com/ssh_219?igsh=MWhkczh1N3htNHQ0ag==',
    'facebook': 'https://www.facebook.com/profile.php?id=61556023235648',
    'twitter': 'https://x.com/SathikaH219?t=OpVTI-J7xY2ZS4iAPP74AQ&s=09',
    'discord': 'https://discord.com/invite/nrhgUBNd'
  };

  if (links[type]) {
    console.log('Executing command: ' + type);
    console.log('Opening: ' + links[type]);
    window.open(links[type], '_blank');
  }
}

// ═══════════════════════════════════════════════════════════════════
// SMOOTH SCROLL NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    console.log('Navigating to: ' + sectionId);
  }
}

function initSmoothScroll() {
  // Handle navigation links
  const commandList = document.querySelectorAll('.command-list li');

  commandList.forEach(function(item) {
    item.addEventListener('click', function() {
      const command = this.textContent.trim();
      console.log('Command executed: ' + command);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// TERMINAL TYPING EFFECT (OPTIONAL ENHANCEMENT)
// ═══════════════════════════════════════════════════════════════════

// Log system boot message
console.log('═══════════════════════════════════════════════════════');
console.log('SYSTEM BOOT COMPLETE');
console.log('═══════════════════════════════════════════════════════');
console.log('User: root@sathika');
console.log('Path: ~/portfolio');
console.log('Status: ONLINE');
console.log('Type "help" for available commands');
console.log('═══════════════════════════════════════════════════════');

// ═══════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('keydown', function(e) {
  // Focus command input on "/" key
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    const commandInput = document.getElementById('commandInput');
    if (commandInput) {
      commandInput.focus();
    }
  }

  // Show help on "?" key
  if (e.key === '?' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    showHelp();
  }
});

// ═══════════════════════════════════════════════════════════════════
// ADDITIONAL DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════');
console.log('SYSTEM INFORMATION');
console.log('═══════════════════════════════════════════════════════');
console.log('User Agent: ' + navigator.userAgent);
console.log('Language: ' + navigator.language);
console.log('Screen Resolution: ' + screen.width + 'x' + screen.height);
console.log('Viewport: ' + window.innerWidth + 'x' + window.innerHeight);
console.log('═══════════════════════════════════════════════════════');
