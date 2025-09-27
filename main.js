const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("playBtn");

let posts = ["post-1.html","imagepost.html","post27sep.html","post26sep.html","post25sep.html","postdatalink.html","postlink.html","post9.html","post1.html","post2.html","post3.html","post4.html","post5.html","post6.html"];
let currentIndex = 0;
const PAGE_SIZE = 3;

let selectedPostContent = "";
let currentSpeech = null;
let isPlaying = false;

function loadPosts() {
  let nextIndex = Math.min(currentIndex + PAGE_SIZE, posts.length);
  const postsToLoad = posts.slice(currentIndex, nextIndex);
  
  const fetchPromises = postsToLoad.map(postUrl => fetch(postUrl).then(res => res.text()));

  Promise.all(fetchPromises)
    .then(postContents => {
      postContents.forEach((data, i) => {
        let div = document.createElement("div");
        div.className = "post";

        let tempEl = document.createElement("div");
        tempEl.innerHTML = data;
        let plainText = tempEl.innerText.substring(0, 150) + "...";

        // Share button aur uska event listener hata diya gaya hai.
        // Post preview mein sirf content aur Read More button rakha gaya hai.
        div.innerHTML = `
          <h2>Top Headline</h2> 
          <p class="content">${plainText}</p>
          <span class="read-more" data-index="${currentIndex + i}">Read More</span>
        `;

        postsList.appendChild(div);
      });
      
      currentIndex = nextIndex;
      if (currentIndex >= posts.length) showMoreBtn.style.display = "none";
    })
    .catch(error => console.error("Error loading posts:", error));
}
/*
function openPost(index, element) {
  fetch(posts[index])
    .then(res => res.text())
    .then(data => {
      document.querySelectorAll(".post").forEach(p => {
        p.classList.remove("active");
        let content = p.querySelector(".content");
        let readMore = p.querySelector(".read-more");
        if (readMore) readMore.style.display = "inline";
        if (content && content.textContent.length > 200) {
          content.innerHTML = content.textContent.substring(0, 150) + "...";
        }
      });

      let tempEl = document.createElement("div");
      tempEl.innerHTML = data;

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

      selectedPostContent = tempEl.innerText;

      if (isPlaying) {
        stopAudio();
        startReading(selectedPostContent);
      }
    });
}
*/
  function openPost(index, element) {
  fetch(posts[index])
    .then(res => res.text())
    .then(data => {
      // Reset all posts (unchanged)
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
      let allowedTags = ["P","H1","H2","H3","H4","H5","H6","IMG","UL","OL","LI","BUTTON"];
      let displayContent = document.createElement("div");

      // Content filtering (unchanged)
      tempEl.childNodes.forEach(node => {
        if (node.nodeType === 1 && allowedTags.includes(node.tagName)) {
          // IMG tags ko padhne se bachne ke liye thoda aur fine-tuning kiya ja sakta hai,
          // lekin abhi ye theek hai
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

      // ************************************************************
      // FIX HERE: TTS के लिए केवल फ़िल्टर्ड कंटेंट का टेक्स्ट लें
      // ************************************************************
      selectedPostContent = displayContent.innerText;

      // Auto play if mic already running (unchanged)
      if (isPlaying) {
        stopAudio();
        startReading(selectedPostContent);
      }
    });
  }

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

function stopAudio() {
  if (speechSynthesis.speaking) speechSynthesis.cancel();
  isPlaying = false;
  playBtn.textContent = "🎤 Play";
}

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

showMoreBtn.addEventListener("click", loadPosts);

postsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more")) {
    let index = e.target.getAttribute("data-index");
    let parent = e.target.closest(".post");
    openPost(index, parent);
  }

  let allowedTags = ["H1","H2","H3","H4","H5","H6","P","LI"];
  if (allowedTags.includes(e.target.tagName)) {
    startReadingFromElement(e.target);
  }
});

postsList.addEventListener("click", (e) => {
  const target = e.target;

  if ((target.tagName === "LI" || target.tagName.startsWith("H")) && target.dataset.text) {
    startReading(target.dataset.text);
    e.preventDefault();
  }
});

postsList.addEventListener("contextmenu", (e) => {
  const target = e.target;
  if ((target.tagName === "LI" || target.tagName.startsWith("H")) && target.dataset.url) {
    window.open(target.dataset.url, "_blank");
  }
});

loadPosts();

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
