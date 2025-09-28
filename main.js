// =============================================================
// I. STRUCTURE: DOM References, Global Variables & Constants
// =============================================================

// --- A. DOM Elements ---
// HTML तत्वों के references
const postsList = document.getElementById("posts-list");
const showMoreBtn = document.getElementById("showMoreBtn");
const playBtn = document.getElementById("playBtn");

// --- B. Data & State Variables ---
// पोस्ट्स (posts) का array, इंडेक्स, और pagination (पृष्ठन) की जानकारी
let posts = [
    "post-1.html", "imagepost.html", "post27sep.html", "post26sep.html", 
    "post25sep.html", "postdatalink.html", "postlink.html", "post9.html", 
    "post1.html", "post2.html", "post3.html", "post4.html", "post5.html", 
    "post6.html"
];
let currentIndex = 0;
const PAGE_SIZE = 3;

// --- C. Audio/Speech Variables ---
// Text-to-Speech (TTS) की स्थिति को प्रबंधित करने वाले चर
let selectedPostContent = ""; // वर्तमान में खुले पोस्ट का पूरा पाठ
let currentSpeech = null;      // वर्तमान SpeechSynthesisUtterance object
let isPlaying = false;         // ऑडियो चल रहा है या नहीं


// =============================================================
// II. LOGIC: Post Management
// =============================================================

/**
 * पोस्ट्स के अगले सेट को load करता है और उन्हें postsList में जोड़ता है।
 */
function loadPosts() {
  let nextIndex = Math.min(currentIndex + PAGE_SIZE, posts.length);
  const postsToLoad = posts.slice(currentIndex, nextIndex);
  
  // सभी पोस्ट URLs के लिए fetch promises बनाता है
  const fetchPromises = postsToLoad.map(postUrl => fetch(postUrl).then(res => res.text()));

  // सभी fetches के पूरा होने का इंतजार करता है
  Promise.all(fetchPromises)
    .then(postContents => {
      postContents.forEach((data, i) => {
        let div = document.createElement("div");
        div.className = "post";
        
        // HTML से सिर्फ text निकालने के लिए temporary element का उपयोग
        let tempEl = document.createElement("div");
        tempEl.innerHTML = data;
        let plainText = tempEl.innerText.substring(0, 150) + "...";

        // HTML structure तैयार करना (Share button हटाया गया है)
        div.innerHTML = `
          <h2>Top Headline</h2> 
          <p class="content">${plainText}</p>
          <span class="read-more" data-index="${currentIndex + i}">Read More</span>
        `;
        
        postsList.appendChild(div);
      });
      
      // Index update करना और 'Show More' बटन छिपाना अगर सभी पोस्ट लोड हो गए हों
      currentIndex = nextIndex;
      if (currentIndex >= posts.length) showMoreBtn.style.display = "none";
    })
    .catch(error => console.error("Error loading posts:", error));
}

/**
 * 'Read More' पर क्लिक करने पर full post content को load और display करता है।
 * @param {number} index - posts array में पोस्ट का इंडेक्स।
 * @param {HTMLElement} element - पोस्ट कंटेनर element।
 */
function openPost(index, element) {
  fetch(posts[index])
    .then(res => res.text())
    .then(data => {
      // अन्य सभी पोस्ट्स को collapse करना
      document.querySelectorAll(".post").forEach(p => {
        p.classList.remove("active");
        let content = p.querySelector(".content");
        let readMore = p.querySelector(".read-more");
        if (readMore) readMore.style.display = "inline";
        // Note: full/preview text reset logic यहाँ जोड़ा जा सकता है अगर ज़रूरी हो
      });

      // HTML content को parse और filter करना
      let tempEl = document.createElement("div");
      tempEl.innerHTML = data;
      let allowedTags = ["P","H1","H2","H3","H4","H5","H6","IMG","UL","OL","LI"];
      let displayContent = document.createElement("div");
      
      // Allowed tags filtering logic
      tempEl.childNodes.forEach(node => {
        if (node.nodeType === 1 && allowedTags.includes(node.tagName)) {
          displayContent.appendChild(node.cloneNode(true));
        } else if (node.nodeType === 3 && node.textContent.trim() !== "") {
          let p = document.createElement("p");
          p.textContent = node.textContent;
          displayContent.appendChild(p);
        }
      });
      
      // full content display करना
      let contentEl = element.querySelector(".content");
      contentEl.innerHTML = "";
      contentEl.appendChild(displayContent);

      element.querySelector(".read-more").style.display = "none";
      element.classList.add("active");

      // Audio के लिए full text save करना
      selectedPostContent = tempEl.innerText;

      // अगर ऑडियो पहले से चल रहा है, तो नया पोस्ट पढ़ना शुरू करना
      if (isPlaying) {
        stopAudio();
        startReading(selectedPostContent);
      }
    });
}


// =============================================================
// III. LOGIC: Text-to-Speech (Audio)
// =============================================================

/**
 * दिए गए text को पढ़ना शुरू करता है।
 * @param {string} text - पढ़ने के लिए पाठ।
 */
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

/**
 * एक विशिष्ट element से शुरू करके post के बाकी content को पढ़ता है।
 * @param {HTMLElement} element - वह element जहाँ से पढ़ना शुरू करना है।
 */
function startReadingFromElement(element) {
  if (!("speechSynthesis" in window)) {
    alert("माफ़ करें, आपका डिवाइस ऑडियो सपोर्ट नहीं करता।");
    return;
  }
  if (!element) return;

  if (isPlaying) stopAudio();

  let text = "";
  let node = element;

  // वर्तमान element से शुरू करके उसके बाद के सभी siblings का text लेता है
  while (node && node.closest(".post")) { 
    text += node.innerText + "\n";
    node = node.nextElementSibling;
  }

  startReading(text);
}

/**
 * चल रहे ऑडियो को रोकता है।
 */
function stopAudio() {
  if (speechSynthesis.speaking) speechSynthesis.cancel();
  isPlaying = false;
  playBtn.textContent = "🎤 Play";
}


// =============================================================
// IV. LOGIC: Event Listeners
// =============================================================

// --- A. Floating Mic Button ---
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

// --- B. Show More Button ---
showMoreBtn.addEventListener("click", loadPosts);

// --- C. Post List Delegation (Read More, Audio Play) ---
postsList.addEventListener("click", (e) => {
  const target = e.target;
  
  // 1. 'Read More' पर क्लिक
  if (target.classList.contains("read-more")) {
    let index = target.getAttribute("data-index");
    let parent = target.closest(".post");
    openPost(index, parent);
  }

  // 2. H1-H6, P, LI पर क्लिक → वहां से पढ़ना शुरू करना
  let allowedTags = ["H1","H2","H3","H4","H5","H6","P","LI"];
  if (allowedTags.includes(target.tagName)) {
    // अगर डेटा-टेक्स्ट (data-text) है तो सिर्फ उसे पढ़ो (शॉर्ट टैप)
    if (target.dataset.text) {
      startReading(target.dataset.text);
      e.preventDefault(); 
    } else {
      // अगर data-text नहीं है, तो बाकी content पढ़ना शुरू करो
      startReadingFromElement(target);
    }
  }
});


// --- D. Post List Delegation (Long Press/Right Click for URL) ---
postsList.addEventListener("contextmenu", (e) => {
  const target = e.target;
  // अगर LI या H-टैग पर data-url है, तो right click पर URL खोलें
  if ((target.tagName === "LI" || target.tagName.startsWith("H")) && target.dataset.url) {
    e.preventDefault(); // Default context menu को रोकें
    window.open(target.dataset.url, "_blank"); // नए टैब में URL खोलें
  }
});


// =============================================================
// V. INITIALIZATION
// =============================================================

// --- A. Initial load ---
loadPosts();
