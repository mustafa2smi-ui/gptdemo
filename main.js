const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("playBtn"); // Floating mic button

let posts = ["post1.html", "post2.html", "post3.html","post4.html","post5.html","post6.html"];
let currentIndex = 0;
const PAGE_SIZE = 3;

let selectedPostContent = ""; // visible post content
let currentSpeech = null;
let isPlaying = false;

// Load posts preview
function loadPosts() {
  let nextIndex = Math.min(currentIndex + PAGE_SIZE, posts.length);
  for (let i = currentIndex; i < nextIndex; i++) {
    fetch(posts[i])
      .then(res => res.text())
      .then(data => {
        let div = document.createElement("div");
        div.className = "post";

        // Extract plain text from HTML for preview
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
  if (currentIndex >= posts.length) {
    showMoreBtn.style.display = "none";
  }
}

// Expand full post
/*
function openPost(index, element) {
  fetch(posts[index])
    .then(res => res.text())
    .then(data => {
      // Reset previous active
      document.querySelectorAll(".post").forEach(p => {
        p.classList.remove("active");
        let content = p.querySelector(".content");
        let readMore = p.querySelector(".read-more");
        if (readMore) readMore.style.display = "inline";
        if (content && content.textContent.length > 200) {
          content.innerHTML = content.textContent.substring(0, 150) + "...";
        }
      });
/*
      let tempEl = document.createElement("div");
      tempEl.innerHTML = data;
      let plainText = tempEl.innerText; // 👈 Only plain text for reading

      element.querySelector(".content").innerText = data;
      element.querySelector(".read-more").style.display = "none";
      element.classList.add("active");

      selectedPostContent = plainText; // 👈 save visible content
      // window.scrollTo({ top: 0, behavior: "smooth" }); // Removed for no auto scroll
   
      // Parse HTML
let tempEl = document.createElement("div");
tempEl.innerHTML = data;

// For audio: only text
let plainText = tempEl.innerText; 
selectedPostContent = plainText; // mic will read this

// For homepage display: only inner content (image + text), but no raw tags visible
let displayEl = document.createElement("div");
displayEl.append(...tempEl.childNodes); // preserves HTML elements properly

// Clear previous content and append
element.querySelector(".content").innerHTML = "";
element.querySelector(".content").appendChild(displayEl);
    });
}
*/

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

      // Create temp container
      let tempEl = document.createElement("div");
      tempEl.innerHTML = data;

      // Extract only valid tags for homepage
      let allowedTags = ["P","H1","H2","H3","H4","H5","H6","IMG","UL","OL","LI"];
      let displayContent = document.createElement("div");

      tempEl.childNodes.forEach(node => {
        if (node.nodeType === 1 && allowedTags.includes(node.tagName)) {
          displayContent.appendChild(node.cloneNode(true));
        } else if (node.nodeType === 3 && node.textContent.trim() !== "") {
          // text node
          let p = document.createElement("p");
          p.textContent = node.textContent;
          displayContent.appendChild(p);
        }
      });

      // Append cleaned content
      let contentEl = element.querySelector(".content");
      contentEl.innerHTML = "";
      contentEl.appendChild(displayContent);

      // For audio
      selectedPostContent = tempEl.innerText;

      element.querySelector(".read-more").style.display = "none";
      element.classList.add("active");
    });
}
// Floating Mic Play/Stop
playBtn.addEventListener("click", () => {
  if (!selectedPostContent) {
    alert("पहले कोई पोस्ट खोलें जिसे आप सुनना चाहते हैं");
    return;
  }

  if (!isPlaying) {
    stopAudio();

    currentSpeech = new SpeechSynthesisUtterance(selectedPostContent);
    currentSpeech.lang = "hi-IN";
    speechSynthesis.speak(currentSpeech);

    isPlaying = true;
    playBtn.textContent = "⏹"; // Stop icon
  } else {
    stopAudio();
    isPlaying = false;
    playBtn.textContent = "🎤 Play"; // Mic icon
  }
});

// Stop Audio function
function stopAudio() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
}

// Show More
showMoreBtn.addEventListener("click", loadPosts);

// Read More click handler
postsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more")) {
    let index = e.target.getAttribute("data-index");
    let parent = e.target.closest(".post");
    openPost(index, parent);
  }
});

// Initial load
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
