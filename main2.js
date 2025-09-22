const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("audio-player-btn"); // Floating mic button

let posts = ["post9.html","post1.html", "post2.html", "post3.html","post4.html","post5.html","post6.html"];
let currentIndex = 0;
const PAGE_SIZE = 3;

let selectedPostContent = ""; // visible post content
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

        // Extract plain text for preview
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
      // Reset previous active posts
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

      // Allowed tags for homepage
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

      // Save plain text for mic
      selectedPostContent = tempEl.innerText;

      // -------------------- Auto play if another post already playing --------------------
      if (isPlaying) {
        stopAudio();
        startReading(selectedPostContent);
      }

      // Add click listeners on individual li[data-text] inside this post
      tempEl.querySelectorAll("li[data-text]").forEach(li => {
        li.addEventListener("click", () => {
          startReading(li.dataset.text);
        });
      });
    });
}

// -------------------- Start reading (mic) --------------------
function startReading(text) {
  if (!('speechSynthesis' in window)) {
    alert("माफ़ करें, आपका डिवाइस ऑडियो सपोर्ट नहीं करता।");
    return;
  }

  // Stop previous if running
  if (isPlaying) stopAudio();

  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "hi-IN";

  currentSpeech.onend = () => {
    playBtn.textContent = "🎤 Play";
    isPlaying = false;
  };

  speechSynthesis.speak(currentSpeech);
  playBtn.textContent = "⏹ Stop";
  isPlaying = true;
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

// -------------------- Stop Audio --------------------
function stopAudio() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  isPlaying = false;
  playBtn.textContent = "🎤 Play";
}

// -------------------- Show More --------------------
showMoreBtn.addEventListener("click", loadPosts);

// -------------------- Read More click --------------------
postsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more")) {
    let index = e.target.getAttribute("data-index");
    let parent = e.target.closest(".post");
    openPost(index, parent);
  }
});

// -------------------- Initial load --------------------
loadPosts();

// -------------------- Homepage share button --------------------
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
// Event delegation for headline clicks inside expanded post
postsList.addEventListener("click", (e) => {
  // Read More
  if (e.target.classList.contains("read-more")) {
    let index = e.target.getAttribute("data-index");
    let parent = e.target.closest(".post");
    openPost(index, parent);
  }

  // Play specific headline from li[data-text]
  if (e.target.tagName === "LI" && e.target.dataset.text) {
    startReading(e.target.dataset.text);
  }
});
