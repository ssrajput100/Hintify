const GEMINI_API_KEY = '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

let currentHintIndex = 0;
let allHints = [];

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function extractProblemFromUrl(url) {
  const match = url.match(/problems\/([^/]+)/);
  return match ? match[1].replace(/-/g, ' ') : null;
}

async function getHints(problemName) {
  const prompt = `Give me 3 step by step hints for solving the LeetCode problem "${problemName}". 
    Make the hints start from basic approach to help me just start thinking how to proceed with the problem, the first hint should ideally just break down the problem in simple words and give me a direction to think in and the second hint should be about the most optimal data structure that i can use to solve this problem with the least time complexity, third hint should be the most optimal solution clue, that will finally help me solve this problem. all these hints should only follow a similar pattern, as in not three different approaches, all should follow the same approach so it is not misleading at all. all problems should give the same approach only !! that has the least time complexity. 
    Format them as simple numbered points.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get hints');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text
      .split('\n')
      .filter(hint => hint.trim())
      .map(hint => hint.replace(/^[•\-*\d.]\s*/, ''));
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function displayCurrentHint() {
  const hintsContainer = document.getElementById('hintsContainer');
  const nextHintBtn = document.getElementById('nextHintBtn');
  
  if (currentHintIndex < allHints.length) {
    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint';
    
    const hintNumber = document.createElement('div');
    hintNumber.className = 'hint-number';
    hintNumber.textContent = `Hint ${currentHintIndex + 1}:`;
    
    const hintText = document.createElement('div');
    hintText.textContent = allHints[currentHintIndex];
    
    hintDiv.appendChild(hintNumber);
    hintDiv.appendChild(hintText);
    hintsContainer.appendChild(hintDiv);
    
    currentHintIndex++;
    
    if (currentHintIndex === allHints.length) {
      nextHintBtn.disabled = true;
      nextHintBtn.textContent = 'No More Hints';
    }
  }
}

async function init() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const problemName = document.getElementById('problemName');
  const nextHintBtn = document.getElementById('nextHintBtn');

  try {
    loading.style.display = 'block';
    nextHintBtn.style.display = 'none';
    error.textContent = '';

    const tab = await getCurrentTab();
    if (!tab.url.includes('leetcode.com/problems')) {
      throw new Error('Please open a LeetCode problem first!');
    }

    const detectedProblem = extractProblemFromUrl(tab.url);
    problemName.textContent = detectedProblem;

    allHints = await getHints(detectedProblem);
    displayCurrentHint(); // Display first hint automatically
    
    nextHintBtn.style.display = 'block';
    nextHintBtn.addEventListener('click', displayCurrentHint);

  } catch (err) {
    error.textContent = err.message;
  } finally {
    loading.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', init);
