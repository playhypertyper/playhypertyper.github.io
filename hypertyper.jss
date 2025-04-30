const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "into", "year", "your", "good", "some", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "use",
  "two", "how", "our", "work", "well", "way", "even", "new", "want", "any",
  "give", "day", "most", "us", "was", "were", "been", "had", "has", "did",
  "much", "life", "each", "very", "here", "down", "both", "such", "more", "must",
  "many", "made", "part", "turn", "real", "few", "high", "both", "next", "used",
  "find", "page", "yet", "gave", "set", "own", "once", "open", "next", "city",
  "seem", "less", "got", "need", "try", "kind", "help", "late", "love", "idea",
  "head", "tell", "body", "come", "four", "last", "left", "keep", "fact", "let",
  "door", "sure", "off", "ever", "ago", "knew", "right", "word", "home", "took",
  "side", "same", "those", "hand", "show", "away", "went", "men", "came", "play",
  "take", "seen", "call", "each", "mind", "best", "hope", "mean", "move", "fall",
  "name", "room", "line", "lead", "gave", "live", "home", "may", "old", "end",
  "does", "half", "thus", "face", "fact", "eyes", "easy", "done", "air", "age"
  ];
  
  let sentence = "";
  let currentIndex = 0;
  let startTime;
  let testFinished = false;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let lastSentence = "";
let currentTestLength = 5; // Default test length
let canType = true; // Add flag to control typing
  
  const typeArea = document.getElementById("type-area");
  const textToType = document.getElementById("text-to-type");
  const resultElement = document.getElementById("result");
  const newTestButton = document.getElementById("new-test-button");
const statsNewTestButton = document.getElementById("stats-new-test-button");
const repeatTestButton = document.getElementById("repeat-test-button");
  const homepage = document.getElementById("homepage");
  const typePage = document.getElementById("type-page");
  const statsPage = document.getElementById("stats-page");        
const currentWPM = document.getElementById("current-wpm");
const currentAccuracy = document.getElementById("current-accuracy");
const bestWPMElement = document.getElementById("best-wpm");
const testLengthButtons = document.querySelectorAll('.test-length-btn');
const viewHistoryButton = document.getElementById("view-history-button");
const backToStatsButton = document.getElementById("back-to-stats");
const historyPage = document.getElementById("history-page");
const historyNavButtons = document.querySelectorAll('.history-nav-btn');
const historyData = document.getElementById("history-data");
const avgWPM = document.getElementById("avg-wpm");
const avgAccuracy = document.getElementById("avg-accuracy");
const totalTests = document.getElementById("total-tests");
const liveWPM = document.getElementById("live-wpm");
let lastUpdateTime;
let updateInterval;

let currentHistoryFilter = 'all';

const pages = [homepage, typePage, statsPage, historyPage]
  
  function switchPages(page) {
    pages.forEach((p) => 
      p.style.display = "none"
    );
    page.style.display = "block";
  };
  
  function convertToVisibleHTML(text) {
    return text
      .split("")
      .map(char => (char === " " ? "&nbsp;" : char))
      .join("");
  }
  
  function setCookie(name, value) {
    localStorage.setItem(name, value);
  }
  
  function getCookie(name) {
    const value = localStorage.getItem(name);
    return value !== null ? value : null;
  }
  
function generateRandomSentence() {
  const words = [];
  for (let i = 0; i < currentTestLength; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    words.push(commonWords[randomIndex]);
  }
  return words.join(" ");
}

function getBestWPMForLength(length) {
  return parseInt(getCookie(`bestWPM_${length}`)) || 0;
}

function updateActiveButton() {
  testLengthButtons.forEach(btn => {
    if (parseInt(btn.dataset.length) === currentTestLength) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Add click handlers for test length buttons
testLengthButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentTestLength = parseInt(btn.dataset.length);
    updateActiveButton();
    startTest(false);
    switchPages(typePage);
  });
});

function startTest(useLastSentence = false) {
  canType = false;
  sentence = useLastSentence ? lastSentence : generateRandomSentence();
  if (!useLastSentence) {
    lastSentence = sentence;
  }
    currentIndex = 0;
    startTime = null;
  lastUpdateTime = null;
    testFinished = false;
  totalKeystrokes = 0;
  correctKeystrokes = 0;
    typeArea.innerHTML = "";
    textToType.innerHTML = convertToVisibleHTML(sentence);
  liveWPM.textContent = "0";

  const bestScore = getBestWPMForLength(currentTestLength);
  resultElement.textContent = bestScore ? `Best WPM (${currentTestLength} words): ${bestScore}` : "Start typing to begin!";
  
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  setTimeout(() => {
    canType = true;
  }, 500);
}

function updateLiveWPM() {
  if (!startTime || testFinished) return;
  
  const currentTime = new Date();
  const elapsedMinutes = (currentTime - startTime) / 60000; // Convert to minutes
  
  // Calculate completed words (count spaces typed)
  const completedWords = (typeArea.innerHTML.match(/&nbsp;/g) || []).length;
  
  // Calculate current word progress
  const currentWordLength = sentence.split(' ')[completedWords] ? sentence.split(' ')[completedWords].length : 0;
  const currentWordProgress = currentIndex - sentence.split(' ').slice(0, completedWords).join(' ').length - completedWords;
  const partialWord = currentWordProgress > 0 ? currentWordProgress / currentWordLength : 0;
  
  // Calculate WPM including partial words
  const totalWordsTyped = completedWords + partialWord;
  const currentWPM = Math.round(totalWordsTyped / elapsedMinutes);
  
  // Update display if the value has changed
  if (currentWPM >= 0 && !isNaN(currentWPM)) {
    liveWPM.textContent = currentWPM;
    
    // Update best WPM indicator
    const bestWPM = getBestWPMForLength(currentTestLength);
    const bestIndicator = document.getElementById('best-indicator-value');
    if (bestWPM > 0) {
      bestIndicator.textContent = bestWPM;
      bestIndicator.parentElement.style.display = currentWPM > bestWPM ? 'none' : 'flex';
    } else {
      bestIndicator.parentElement.style.display = 'none';
    }
  }
}
  
  window.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      startTest();
      return;
    }
  
  if (testFinished || !canType) {
    if (testFinished) {
      switchPages(statsPage);
    }
      return;
    }

  if (!startTime) {
    startTime = new Date();
    lastUpdateTime = startTime;
    // Start updating WPM every 500ms
    updateInterval = setInterval(updateLiveWPM, 500);
  }
  
    const key = event.key;
  
    if (key.length === 1) {
    totalKeystrokes++;
      if (key === sentence[currentIndex]) {
      correctKeystrokes++;
        const char = sentence[currentIndex] === " " ? "&nbsp;" : sentence[currentIndex];
        typeArea.innerHTML += char;
        currentIndex++;
        const remaining = sentence.slice(currentIndex);
        textToType.innerHTML = convertToVisibleHTML(remaining);
      updateLiveWPM();
      }
    } else if (key === "Backspace" && currentIndex > 0) {
    totalKeystrokes++;
      currentIndex--;
      const typed = sentence.slice(0, currentIndex);
      const remaining = sentence.slice(currentIndex);
      typeArea.innerHTML = convertToVisibleHTML(typed);
      textToType.innerHTML = convertToVisibleHTML(remaining);
    updateLiveWPM();
    }
  
    if (currentIndex === sentence.length) {
      testFinished = true;
    if (updateInterval) {
      clearInterval(updateInterval);
    }
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 1000;
      const words = sentence.trim().split(/\s+/).length;
      const wpm = Math.round((words / timeTaken) * 60);
    const accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
    const bestWPM = getBestWPMForLength(currentTestLength);

    // Save test result to history
    saveTestToHistory(wpm, accuracy, currentTestLength);

    if (wpm > bestWPM) {
      setCookie(`bestWPM_${currentTestLength}`, wpm);
      resultElement.textContent = `Typing speed: ${wpm} WPM (New ${currentTestLength}-word High Score!) | Accuracy: ${accuracy}%`;
      bestWPMElement.textContent = `Best WPM (${currentTestLength} words): ${wpm}`;
      } else {
      resultElement.textContent = `Typing speed: ${wpm} WPM | Best: ${bestWPM} WPM | Accuracy: ${accuracy}%`;
      bestWPMElement.textContent = `Best WPM (${currentTestLength} words): ${bestWPM}`;
    }
    
    currentWPM.textContent = `WPM: ${wpm}`;
    currentAccuracy.textContent = `Accuracy: ${accuracy}%`;
    
    switchPages(statsPage);
  }
});

// Restart test on button click (main page)
  newTestButton.addEventListener("click", () => {
  startTest(false);
  switchPages(typePage);
});

// Restart test on button click (stats page)
statsNewTestButton.addEventListener("click", () => {
  startTest(false);
  switchPages(typePage);
});

// Repeat the same test
repeatTestButton.addEventListener("click", () => {
  startTest(true);
  switchPages(typePage);
  });
  
  // Start test when the page loads
window.onload = () => {
  updateActiveButton();
  startTest(false);
  const bestWPM = getBestWPMForLength(currentTestLength);
  if (bestWPM) {
    bestWPMElement.textContent = `Best WPM (${currentTestLength} words): ${bestWPM}`;
  }
};

// Function to save test result to history
function saveTestToHistory(wpm, accuracy, wordCount) {
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    const testResult = {
        date: new Date().toISOString(),
        wordCount: wordCount,
        wpm: wpm,
        accuracy: accuracy,
        time: new Date().toLocaleTimeString()
    };
    testHistory.push(testResult);
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
}

// Function to calculate stats for a specific word count
function calculateTestStats(tests, wordCount) {
    const filteredTests = wordCount === 'all' 
        ? tests 
        : tests.filter(test => test.wordCount === parseInt(wordCount));
    
    if (filteredTests.length === 0) {
        return {
            avgWPM: '--',
            avgAccuracy: '--',
            bestWPM: '--',
            totalTests: 0,
            allTests: []
        };
    }

    const avgWPM = Math.round(filteredTests.reduce((acc, test) => acc + test.wpm, 0) / filteredTests.length);
    const avgAccuracy = Math.round(filteredTests.reduce((acc, test) => acc + test.accuracy, 0) / filteredTests.length);
    const bestWPM = Math.max(...filteredTests.map(test => test.wpm));
    
    // Sort all tests by date, most recent first
    const allTests = filteredTests.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        avgWPM,
        avgAccuracy,
        bestWPM,
        totalTests: filteredTests.length,
        allTests
    };
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Function to update history display
function updateHistoryDisplay(filter = 'all') {
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    
    // Get all unique word counts from history
    const wordCounts = ['all', ...new Set(testHistory.map(test => test.wordCount))].sort((a, b) => {
        if (a === 'all') return -1;
        if (b === 'all') return 1;
        return a - b;
    });

    // Update navigation buttons
    const historyNav = document.querySelector('.history-nav');
    historyNav.innerHTML = wordCounts
        .map(count => `
            <button class="history-nav-btn ${count === filter ? 'active' : ''}" 
                    data-length="${count}">
                ${count === 'all' ? 'All Tests' : `${count} Words`}
            </button>
        `)
        .join('');

    // Reattach event listeners
    document.querySelectorAll('.history-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.history-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentHistoryFilter = btn.dataset.length;
            updateHistoryDisplay(currentHistoryFilter);
        });
    });

    // Calculate stats for the selected filter
    const stats = calculateTestStats(testHistory, filter);
    
    // Update summary cards
    avgWPM.textContent = stats.avgWPM;
    avgAccuracy.textContent = stats.avgAccuracy + (stats.avgAccuracy === '--' ? '' : '%');
    totalTests.textContent = stats.totalTests;

    // Update table with ALL tests
    historyData.innerHTML = stats.allTests
        .map(test => `
            <tr>
                <td>${formatDate(test.date)}</td>
                <td>${formatTime(test.date)}</td>
                <td>${test.wordCount}</td>
                <td>${test.wpm}</td>
                <td>${test.accuracy}%</td>
            </tr>
        `)
        .join('');
}

// Add click handlers for history navigation
historyNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        historyNavButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentHistoryFilter = btn.dataset.length;
        updateHistoryDisplay(currentHistoryFilter);
    });
});

// Add click handlers for history navigation
viewHistoryButton.addEventListener('click', () => {
    updateHistoryDisplay(currentHistoryFilter);
    switchPages(historyPage);
});

backToStatsButton.addEventListener('click', () => {
    switchPages(statsPage);
});

// Add reset button handler
const resetBestButton = document.getElementById("reset-best-button");

resetBestButton.addEventListener("click", () => {
    // Reset best WPM for current test length
    localStorage.removeItem(`bestWPM_${currentTestLength}`);
    
    // Remove all tests for current word count from history
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    const filteredHistory = testHistory.filter(test => test.wordCount !== currentTestLength);
    localStorage.setItem('testHistory', JSON.stringify(filteredHistory));
    
    // Update displays
    const bestWPM = getBestWPMForLength(currentTestLength);
    bestWPMElement.textContent = `Best WPM (${currentTestLength} words): 0`;
    resultElement.textContent = "High score and history reset! Start typing to begin.";
    
    // Hide the best indicator if it's showing
    const bestIndicator = document.getElementById('best-indicator-value');
    bestIndicator.parentElement.style.display = 'none';
    
    // Update history display if we're on the history page
    if (historyPage.style.display === 'block') {
        updateHistoryDisplay(currentHistoryFilter);
    }
    
    // Start a new test
    startTest(false);
});

// Add nav history button handler
const navHistoryButton = document.getElementById("nav-history-button");

navHistoryButton.addEventListener("click", () => {
    updateHistoryDisplay('all');
    switchPages(historyPage);
});
