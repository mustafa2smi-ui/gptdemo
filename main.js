const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("playBtn"); // Floating mic button

let posts = ["post1.html", "post2.html", "post3.html"]; // add more posts
let currentIndex = 0;
const PAGE_SIZE = 3;

let selectedPostContent = ""; // current open post ka content
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

        let preview = data.substring(0, 150) + "...";

        div.innerHTML = `
          <h2>Post ${i+1}</h2>
          <p class="content">${preview}</p>
          <span class="read-more" data-index="${i}">Read More</span>
        `;
        postsList.appendChild(div);
      });
  }
  currentIndex = nextIndex;
  if (currentIndex >= posts.length) {
    showMoreBtn.style.display = "none";
  }
}

// Expand full post
function openPost(index, element) {
  fetch(posts[index])
    .then(res => res.text())
    .then(data => {
      // reset previous active
      document.querySelectorAll(".post").forEach(p => {
        p.classList.remove("active");
        let content = p.querySelector(".content");
        let readMore = p.querySelector(".read-more");
        if (readMore) readMore.style.display = "inline";
        if (content && content.textContent.length > 200) {
          content.innerHTML = content.textContent.substring(0, 150) + "...";
        }
      });

      element.querySelector(".content").innerHTML = data;
      element.querySelector(".read-more").style.display = "none";
      element.classList.add("active");

      selectedPostContent = data; // 👈 Save for floating player
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    playBtn.textContent = "🎤"; // Mic icon
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
