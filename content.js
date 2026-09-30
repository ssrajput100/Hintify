chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProblemDetails") {
      // Wait for the content to load
      setTimeout(() => {
        // Get problem title
        const titleElement = document.querySelector('[data-cy="question-title"]');
        
        // Get problem description - using the markdown content which is more reliable
        const descriptionElement = document.querySelector('[data-cy="question-content"] > div');
        
        // Get problem constraints and examples
        const examplesElements = Array.from(document.querySelectorAll('[data-key="example-"]'));
        const examples = examplesElements.map(el => el.textContent).join('\n');
        
        // Get difficulty
        const difficultyElement = document.querySelector('[data-cypress="QuestionInfo"] > div:first-child');
        
        const problemDetails = {
          title: titleElement ? titleElement.textContent.trim() : '',
          description: descriptionElement ? descriptionElement.textContent.trim() : '',
          examples: examples,
          difficulty: difficultyElement ? difficultyElement.textContent.trim() : '',
          url: window.location.href
        };
  
        console.log("Extracted problem details:", problemDetails);  // Debug log
        sendResponse(problemDetails);
      }, 1000); // Give page time to load
      
      return true; // Required for async sendResponse
    }
  });
