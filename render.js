// --- Rendering Functions for News and Events ---

function renderNews(newsArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found for news.`);
    return;
  }

  container.innerHTML = ""; // Clear previous content
  container.dataset.rendered = "false"; // Reset rendered state

  newsArray.forEach(newsItem => {
    const itemBox = document.createElement('div');
    itemBox.className = 'feature-box mb-4';

    let imageHtml = '';
    if (newsItem.imageUrl) {
      imageHtml = `<img src="${newsItem.imageUrl}" alt="${newsItem.title}" class="img-fluid rounded mb-3" style="max-height: 250px; object-fit: cover; width: 100%;">`;
    }

    let buttonHtml = '';
    if (newsItem.buttonText && newsItem.buttonLink) {
      buttonHtml = `<button class="feature-button mt-3" onclick="window.open('${newsItem.buttonLink}', '_blank')">${newsItem.buttonText}</button>`;
    } else if (newsItem.buttonText) {
      buttonHtml = `<button class="feature-button mt-3">${newsItem.buttonText}</button>`;
    }

    itemBox.innerHTML = `
      <h3 class="feature-title">${newsItem.title}</h3>
      <p class="news-date">${newsItem.date}</p>
      ${imageHtml}
      <p>${newsItem.content || ''}</p>
      ${buttonHtml}
    `;
    container.appendChild(itemBox);
  });
  container.dataset.rendered = "true";
}

function renderEvents(eventsArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found for events.`);
    return;
  }
  
  container.innerHTML = ""; // Clear previous content
  container.dataset.rendered = "false"; // Reset rendered state

  eventsArray.forEach(eventItem => {
    const itemBox = document.createElement('div');
    itemBox.className = 'feature-box mb-4';

    let imageCellHtml = '';
    if (eventItem.imageUrl) {
      imageCellHtml = `<div class="col-md-4 event-image-container"><img src="${eventItem.imageUrl}" alt="${eventItem.title}" class="img-fluid rounded"></div>`;
    }

    let progressHtml = '';
    if (eventItem.progress !== undefined && eventItem.progressText) {
      progressHtml = `
        <div class="progress mb-2" style="height: 20px;">
          <div class="progress-bar bg-success" role="progressbar" style="width: ${eventItem.progress}%;" aria-valuenow="${eventItem.progress}" aria-valuemin="0" aria-valuemax="100">${eventItem.progress}%</div>
        </div>
        <p class="mb-2">Progress: ${eventItem.progressText}</p>
      `;
    }
    
    let buttonHtml = '';
    if (eventItem.buttonText && eventItem.buttonLink) {
      buttonHtml = `<button class="feature-button" onclick="window.open('${eventItem.buttonLink}', '_blank')">${eventItem.buttonText}</button>`;
    } else if (eventItem.buttonText) {
      buttonHtml = `<button class="feature-button">${eventItem.buttonText}</button>`;
    }

    itemBox.innerHTML = `
      <div class="row">
        ${imageCellHtml} 
        <div class="${eventItem.imageUrl ? 'col-md-8' : 'col-md-12'}">
          <h3 class="feature-title">${eventItem.title}</h3>
          <p class="news-date">${eventItem.dateRange}</p>
          <p>${eventItem.description || ''}</p>
          ${progressHtml}
          ${buttonHtml}
        </div>
      </div>
    `;
    container.appendChild(itemBox);
  });
  container.dataset.rendered = "true";
}

// --- Unit Tests for Rendering Functions ---
function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`PASS: ${message}`);
    return true;
  } else {
    console.error(`FAIL: ${message}. Expected "${expected}", but got "${actual}".`);
    return false;
  }
}

function assertElementPresent(selector, message) {
  if (document.querySelector(selector)) {
    console.log(`PASS: ${message}`);
    return true;
  } else {
    console.error(`FAIL: ${message}. Element "${selector}" not found.`);
    return false;
  }
}

function assertElementTextContains(selector, text, message) {
  const element = document.querySelector(selector);
  if (element && element.textContent.includes(text)) {
    console.log(`PASS: ${message}`);
    return true;
  } else if (!element) {
    console.error(`FAIL: ${message}. Element "${selector}" not found.`);
    return false;
  } else {
    console.error(`FAIL: ${message}. Element "${selector}" does not contain text "${text}". Actual: "${element.textContent}".`);
    return false;
  }
}

function setupTestContainer(id) {
  // First, remove any existing container
  let container = document.getElementById(id);
  if (container) {
    container.remove();
  }
  
  // Create a new container
  container = document.createElement('div');
  container.id = id;
  container.dataset.rendered = "false"; // Reset rendered state
  document.body.appendChild(container);
  
  return container;
}

function cleanupTestContainer(id) {
  const container = document.getElementById(id);
  if (container) {
    container.remove();
  }
}

function testRenderNews() {
  console.log("--- Testing renderNews ---");
  const containerId = 'testNewsContainer';
  let passCount = 0;
  let failCount = 0;

  // Test 1: Empty array
  setupTestContainer(containerId);
  renderNews([], containerId);
  let newsContainer = document.getElementById(containerId);
  if (assertEqual(newsContainer.children.length, 0, "Test 1: Renders no items for empty array")) {
    passCount++;
  } else {
    failCount++;
  }
  cleanupTestContainer(containerId);

  // Test 2: With sample data
  setupTestContainer(containerId);
  const sampleNews = [
    { title: "News 1", date: "Date 1", content: "Content 1", imageUrl: "img1.jpg", buttonText: "Read More" },
    { title: "News 2", date: "Date 2", content: "Content 2" }
  ];
  renderNews(sampleNews, containerId);
  newsContainer = document.getElementById(containerId);
  if (assertEqual(newsContainer.children.length, 2, "Test 2.1: Renders correct number of news items")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .feature-title`, "News 1", "Test 2.2: Renders correct title for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .news-date`, "Date 1", "Test 2.3: Renders correct date for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child img[src="img1.jpg"]`, "Test 2.4: Renders image for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child button`, "Test 2.5: Renders button for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:last-child .feature-title`, "Test 2.6: Renders title for second item")) {
    passCount++;
  } else {
    failCount++;
  }
  // Check that the second item does *not* have an image or button if not specified
  const secondItemImg = newsContainer.querySelector('.feature-box:last-child img');
  if (assertEqual(secondItemImg, null, "Test 2.7: Second item does not have an image")) {
    passCount++;
  } else {
    failCount++;
  }
  const secondItemButton = newsContainer.querySelector('.feature-box:last-child button');
  if (assertEqual(secondItemButton, null, "Test 2.8: Second item does not have a button")) {
    passCount++;
  } else {
    failCount++;
  }

  cleanupTestContainer(containerId);
  console.log(`renderNews Tests: ${passCount} passed, ${failCount} failed.`);
  return failCount === 0;
}

function testRenderEvents() {
  console.log("--- Testing renderEvents ---");
  const containerId = 'testEventsContainer';
  let passCount = 0;
  let failCount = 0;

  // Test 1: Empty array
  setupTestContainer(containerId);
  renderEvents([], containerId);
  let eventsContainer = document.getElementById(containerId);
  if (assertEqual(eventsContainer.children.length, 0, "Test 1: Renders no items for empty array")) {
    passCount++;
  } else {
    failCount++;
  }
  cleanupTestContainer(containerId);

  // Test 2: With sample data
  setupTestContainer(containerId);
  const sampleEvents = [
    { title: "Event 1", dateRange: "Dates 1", description: "Desc 1", imageUrl: "event1.jpg", progress: 50, progressText: "50/100", buttonText: "Join" },
    { title: "Event 2", dateRange: "Dates 2", description: "Desc 2" }
  ];
  renderEvents(sampleEvents, containerId);
  eventsContainer = document.getElementById(containerId);
  if (assertEqual(eventsContainer.children.length, 2, "Test 2.1: Renders correct number of event items")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .feature-title`, "Event 1", "Test 2.2: Renders correct title for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .news-date`, "Dates 1", "Test 2.3: Renders correct date range for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child .event-image-container img[src="event1.jpg"]`, "Test 2.4: Renders image for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child .progress`, "Test 2.5: Renders progress bar for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child button`, "Test 2.6: Renders button for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  // Check that the second item does *not* have an image, progress or button if not specified
  const secondItemImgContainer = eventsContainer.querySelector('.feature-box:last-child .event-image-container');
  if (assertEqual(secondItemImgContainer, null, "Test 2.7: Second item does not have an image container")) {
    passCount++;
  } else {
    failCount++;
  }
  const secondItemProgress = eventsContainer.querySelector('.feature-box:last-child .progress');
  if (assertEqual(secondItemProgress, null, "Test 2.8: Second item does not have a progress bar")) {
    passCount++;
  } else {
    failCount++;
  }
  const secondItemButton = eventsContainer.querySelector('.feature-box:last-child button');
  if (assertEqual(secondItemButton, null, "Test 2.9: Second item does not have a button")) {
    passCount++;
  } else {
    failCount++;
  }

  cleanupTestContainer(containerId);
  console.log(`renderEvents Tests: ${passCount} passed, ${failCount} failed.`);
  return failCount === 0;
}

function runAllTests() {
  console.log("===== Running All Unit Tests =====");
  let overallSuccess = true;
  
  if (!testRenderNews()) {
    overallSuccess = false;
  }
  if (!testRenderEvents()) {
    overallSuccess = false;
  }

  if (overallSuccess) {
    console.log("===== All tests passed! =====");
  } else {
    console.error("===== Some tests failed. Please check logs. =====");
  }
} 

// Запускаем тесты при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  runAllTests();
}); 