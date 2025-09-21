const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");

let posts = ["post1.html", "post2.html"]; // add more postX.html
let currentIndex = 0;
const PAGE_SIZE = 3;

let speech = null;
let currentOpenPost = null;

// Load posts preview
function loadPosts() {
  let nextIndex = Math.min(currentIndex + PAGE_SIZE, posts.length);
  for (let i = currentIndex; i < nextIndex; i++) {
    fetch(posts[i])
      .then(res => res.text())
      .then(data => {
        let div = document.createElement("div");
        div.className = "post";

        // Get first 200 chars for preview
        let preview = data.substring(0, 200) + "...";

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
      element.querySelector(".content").innerHTML = data;
      element.querySelector(".read-more").style.display = "none";
      currentOpenPost = data;
    });
}

// Audio Play
playBtn.addEventListener("click", () => {
  if (!currentOpenPost) {
    alert("First open a post which you want to listen");
    return;
  }
  stopAudio();
  speech = new SpeechSynthesisUtterance(currentOpenPost);
  speechSynthesis.speak(speech);
});

// Audio Stop
stopBtn.addEventListener("click", stopAudio);
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
