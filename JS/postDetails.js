const API_URL = "https://tarmeezacademy.com/api/v1";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("postId");

// DOM Elements
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const loginModal = document.getElementById("myModal");
const registerModal = document.getElementById("reModal");

// --- UI Logic ---
function setupUI() {
  const token = localStorage.getItem("SM_Token");
  const guestItems = document.getElementById("guest-nav-items");
  const loggedItems = document.getElementById("logged-nav-items");
  const navUsername = document.getElementById("nav-username");
  const navUserImage = document.getElementById("nav-user-image");

  if (token) {
    if (guestItems) guestItems.style.display = "none";
    if (loggedItems) loggedItems.style.display = "flex";

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (navUsername) navUsername.innerText = user.username;
    if (navUserImage) navUserImage.src = user.profile_image || "profile-pics/default-avatar.png";
  } else {
    if (guestItems) guestItems.style.display = "flex";
    if (loggedItems) loggedItems.style.display = "none";
  }
}

function setupNav() {
  if (hamburger) {
    hamburger.onclick = () => {
      const isOpen = navLinks.classList.toggle("open");
      hamburger.innerHTML = isOpen ? "&#x2715;" : "&#x9776;";
    };
  }
}

function logout() {
  localStorage.removeItem("SM_Token");
  localStorage.removeItem("currentUser");
  setupUI();
  window.location.reload();
}

// --- Skeleton Loaders ---
function showPostSkeleton() {
  const postContainer = document.getElementById("post");
  postContainer.innerHTML = `
        <div class="square skeleton-card">
            <div class="card-header skeleton skeleton-image"></div>
            <div class="user-info">
                <div class="skeleton-avatar skeleton"></div>
                <div class="skeleton-text skeleton" style="width: 120px;"></div>
            </div>
            <div class="skeleton-title skeleton" style="margin: 0 16px 12px;"></div>
            <div class="skeleton-text skeleton" style="margin: 0 16px 20px; width: 85%;"></div>
        </div>
    `;
}

// --- Post Logic ---
function getPost() {
  showPostSkeleton();
  axios.get(`${API_URL}/posts/${postId}`)
    .then(response => {
      const post = response.data.data;
      const author = post.author;
      const comments = post.comments;
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      document.getElementById("username-span").innerText = author.username;

      let commentsHtml = ``;
      if (comments.length === 0) {
        commentsHtml = `<div style="padding: 16px; color: var(--text-muted); text-align: center;">لا يوجد تعليقات بعد.</div>`;
      } else {
        comments.forEach(comment => {
          commentsHtml += `
                        <div class="comment-card">
                            <div class="comment-header">
                                <img src="${comment.author.profile_image || 'profile-pics/default-avatar.png'}" alt="avatar" class="comment-avatar">
                                <b style="color: var(--text-primary);">${comment.author.username}</b>
                            </div>
                            <div class="comment-body" style="padding-right: 32px;">
                                ${comment.body}
                            </div>
                        </div>
                    `;
        });
      }

      const token = localStorage.getItem("SM_Token");
      const addCommentSection = token ? `
                <div style="padding: 24px; border-top: 1px solid var(--border-subtle);">
                    <div class="inputs" style="flex-direction: row; align-items: center; gap: 12px; margin-top: 0;">
                        <input id="comment-input" type="text" placeholder="اكتب تعليقك هنا..." style="flex: 1; margin: 0;">
                        <button onclick="createCommentClicked()" style="margin: 0; padding: 10px 20px; width: auto;">إرسال</button>
                    </div>
                </div>
            ` : '';

      let imageHeader = "";
      if (post.image && typeof post.image === "string" && post.image !== "") {
        imageHeader = `<div class="card-header"><img src="${post.image}" alt="cover"><h6>${post.created_at}</h6></div>`;
      }

      const likedPosts = JSON.parse(localStorage.getItem("liked_posts")) || [];
      const isLiked = likedPosts.includes(post.id);

      const postContent = `
                <div class="square">
                    ${imageHeader}
                    <div class="user-info">
                        <img src="${author.profile_image || 'profile-pics/default-avatar.png'}" alt="avatar" class="avatar">
                        <h3>${author.username}</h3>
                    </div>
                    <div class="h1">${post.title || ""}</div>
                    <p>${post.body}</p>
                    
                    <div class="lowerPart">
                        <div class="meta-left">
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                               <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-12.7 8.19 8.19 0 0 1 4.9 1.5L21 3z"></path>
                           </svg>
                           <span>(${post.comments_count}) تعليق</span>
                        </div>
                        <div class="like-btn ${isLiked ? 'active' : ''}" onclick="toggleLike(event, ${post.id})">
                             <span>${isLiked ? '❤️' : '♡'}</span>
                             <span>${isLiked ? 'أعجبني' : 'إعجاب'}</span>
                        </div>
                    </div>

                    <div id="comments" style="border-top: 1px solid var(--border-subtle);">
                        <h2 style="font-size: 1.1rem; margin: 16px; margin-bottom: 8px;">التعليقات</h2>
                        ${commentsHtml}
                    </div>
                    
                    ${addCommentSection}
                </div>
            `;
      document.getElementById("post").innerHTML = postContent;
    })
    .catch(err => console.error(err));
}

function createCommentClicked() {
  const body = document.getElementById("comment-input").value;
  const token = localStorage.getItem("SM_Token");
  if (!body) return;

  axios.post(`${API_URL}/posts/${postId}/comments`, { body }, {
    headers: { authorization: `Bearer ${token}` }
  })
    .then(() => {
      getPost();
    })
    .catch(err => alert(err.response?.data?.message || err.message));
}

function toggleLike(event, pId) {
  if (event) event.stopPropagation();
  const token = localStorage.getItem("SM_Token");
  if (!token) {
    alert("يرجى تسجيل الدخول أولاً");
    return;
  }

  let likedPosts = JSON.parse(localStorage.getItem("liked_posts")) || [];
  if (likedPosts.includes(pId)) {
    likedPosts = likedPosts.filter(id => id !== pId);
  } else {
    likedPosts.push(pId);
  }
  localStorage.setItem("liked_posts", JSON.stringify(likedPosts));

  const btn = event.currentTarget;
  const isLiked = likedPosts.includes(pId);
  btn.classList.toggle("active", isLiked);
  btn.innerHTML = `<span>${isLiked ? '❤️' : '♡'}</span><span>${isLiked ? 'أعجبني' : 'إعجاب'}</span>`;
}

// Modals
function setupModals() {
  const closeLogin = document.querySelector(".closeLogin");
  const closeRegister = document.getElementById("closeRegister");

  [closeLogin, closeRegister].forEach(btn => {
    if (btn) btn.onclick = () => {
      loginModal.style.display = "none";
      registerModal.style.display = "none";
    };
  });

  window.onclick = (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  };
}

function loginBtnClicked() {
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;
  axios.post(`${API_URL}/login`, { username, password })
    .then(response => {
      localStorage.setItem("SM_Token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      location.reload();
    })
    .catch(err => alert(err.response?.data?.message || err.message));
}

function registerBtnClicked() {
  const name = document.getElementById("nickNameInput").value;
  const username = document.getElementById("usernameInputRegister").value;
  const password = document.getElementById("passwordInputRegister").value;
  const image = document.getElementById("register-image-input").files[0];
  const formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("password", password);
  if (image) formData.append("image", image);
  axios.post(`${API_URL}/register`, formData)
    .then(response => {
      localStorage.setItem("SM_Token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      location.reload();
    })
    .catch(err => alert(err.response?.data?.message || err.message));
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupUI();
  getPost();
  setupModals();
});

window.logout = logout;
window.createCommentClicked = createCommentClicked;
window.loginBtnClicked = loginBtnClicked;
window.registerBtnClicked = registerBtnClicked;
window.toggleLike = toggleLike;