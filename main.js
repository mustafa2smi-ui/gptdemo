const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("playBtn");

let posts = ["post9.html","post1.html","post2.html","post3.html","post4.html","post5.html","post6.html"];
let currentIndex = 0;
const PAGE_SIZE = 3;

let selectedPostContent = ""; // Full text of current post
let currentSpeech = null;
let isPlaying = false;

// -------------------- Load posts preview --------------------

function loadPosts() {
  let nextIndex = Math.min(currentIndex + PAGE_SIZE, posts.length);
  for (let i = currentIndex; i < nextIndex; i++) {
    fetch(posts[i])
      .then(res => res.text())
      .then(data => {
        let div = document.createElement("div");
        div.className = "post";

        let tempEl = document.createElement("div");
        tempEl.innerHTML = data;
        let plainText = tempEl.innerText.substring(0, 150) + "...";

        div.innerHTML = `
          <h2>Post ${i+1}</h2>
          <p class="content">${plainText}</p>
          <span class="read-more" data-index="${i}">Read More</span>
          <button class="shareBtn">📤 Share</button>
        `;

        // Share button
        div.querySelector(".shareBtn").addEventListener("click", () => {
          if (navigator.share) {
            navigator.share({
              title: `Post ${i+1}`,
              text: plainText,
              url: window.location.origin + "/" + posts[i]
            });
          } else {
            alert("Sharing not supported on this browser");
          }
        });

        postsList.appendChild(div);
      });
  }
  currentIndex = nextIndex;
  if (currentIndex >= posts.length) showMoreBtn.style.display = "none";
}

// -------------------- Expand full post --------------------
function openPost(index, element) {
  fetch(posts[index])
    .then(res => res.text())
    .then(data => {
      // Reset all posts
      document.querySelectorAll(".post").forEach(p => {
        p.classList.remove("active");
        let content = p.querySelector(".content");
        let readMore = p.querySelector(".read-more");
        if (readMore) readMore.style.display = "inline";
        if (content && content.textContent.length > 200) {
          content.innerHTML = content.textContent.substring(0, 150) + "...";
        }
      });

      // Parse HTML
      let tempEl = document.createElement("div");
      tempEl.innerHTML = data;

      // Allowed tags
      let allowedTags = ["P","H1","H2","H3","H4","H5","H6","IMG","UL","OL","LI"];
      let displayContent = document.createElement("div");

      tempEl.childNodes.forEach(node => {
        if (node.nodeType === 1 && allowedTags.includes(node.tagName)) {
          displayContent.appendChild(node.cloneNode(true));
        } else if (node.nodeType === 3 && node.textContent.trim() !== "") {
          let p = document.createElement("p");
          p.textContent = node.textContent;
          displayContent.appendChild(p);
        }
      });

      let contentEl = element.querySelector(".content");
      contentEl.innerHTML = "";
      contentEl.appendChild(displayContent);

      element.querySelector(".read-more").style.display = "none";
      element.classList.add("active");

      // Save full text for mic
      selectedPostContent = tempEl.innerText;

      // Auto play if mic already running
      if (isPlaying) {
        stopAudio();
        startReading(selectedPostContent);
      }
    });
}

// -------------------- Start reading from clicked element till end --------------------
function startReadingFromElement(element) {
  if (!("speechSynthesis" in window)) {
    alert("माफ़ करें, आपका डिवाइस ऑडियो सपोर्ट नहीं करता।");
    return;
  }
  if (!element) return;

  if (isPlaying) stopAudio();

  let text = "";
  let node = element;
  let contentContainer = element.closest(".post .content");

  while (node) {
    text += node.innerText + "\n";
    node = node.nextElementSibling;
  }

  startReading(text);
}

// -------------------- Start reading normal --------------------
function startReading(text) {
  if (!("speechSynthesis" in window)) {
    alert("माफ़ करें, आपका डिवाइस ऑडियो सपोर्ट नहीं करता।");
    return;
  }

  if (isPlaying) stopAudio();

  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "hi-IN";

  currentSpeech.onend = () => {
    isPlaying = false;
    playBtn.textContent = "🎤 Play";
  };

  speechSynthesis.speak(currentSpeech);
  isPlaying = true;
  playBtn.textContent = "⏹ Stop";
}

// -------------------- Stop audio --------------------
function stopAudio() {
  if (speechSynthesis.speaking) speechSynthesis.cancel();
  isPlaying = false;
  playBtn.textContent = "🎤 Play";
}

// -------------------- Floating mic button --------------------
playBtn.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    alert("माफ़ करें, आपका डिवाइस ऑडियो सपोर्ट नहीं करता।");
    return;
  }
  if (!selectedPostContent) {
    alert("पहले कोई पोस्ट खोलें जिसे आप सुनना चाहते हैं");
    return;
  }
  if (isPlaying) {
    stopAudio();
  } else {
    startReading(selectedPostContent);
  }
});

// -------------------- Show More --------------------
showMoreBtn.addEventListener("click", loadPosts);

// -------------------- Event delegation: Read More & click headings/paragraphs/lists --------------------
postsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more")) {
    let index = e.target.getAttribute("data-index");
    let parent = e.target.closest(".post");
    openPost(index, parent);
  }

  // Click on H1-H6, P, LI → read from there
  let allowedTags = ["H1","H2","H3","H4","H5","H6","P","LI"];
  if (allowedTags.includes(e.target.tagName)) {
    startReadingFromElement(e.target);
  }
});

// -------------------- Initial load --------------------
loadPosts();

// -------------------- Homepage share --------------------
function shareHomepage() {
  if (navigator.share) {
    navigator.share({
      title: "My News Site",
      text: "MicNews123 पर पढ़ें ताज़ा खबरें और सुनें हिंदी ऑडियो न्यूज़।",
      url: window.location.href
    });
  } else {
    alert("Sharing not supported on this browser");
  }
}
