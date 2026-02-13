const API_URL = "https://tarmeezacademy.com/api/v1";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("postId");

// DOM Elements
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const loginModal = document.getElementById("myModal");
const registerModal = document.getElementById("reModal");

// --- Nav & UI ---
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
    if (navUsername) navUsername.innerText = user.username + "@";
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

// --- Post Logic ---
function getPost() {
  axios.get(`${API_URL}/posts/${postId}`)
    .then(response => {
      const post = response.data.data;
      const author = post.author;
      const comments = post.comments;

      document.getElementById("username-span").innerText = author.username + "@";

      let commentsHtml = ``;
      comments.forEach(comment => {
        commentsHtml += `
                    <div class="comment-card">
                        <div class="comment-header">
                            <img src="${comment.author.profile_image}" alt="avatar" class="comment-avatar" onerror="this.src='profile-pics/default-avatar.png'">
                            <b style="color: var(--text-main);">${comment.author.username}</b>
                        </div>
                        <div class="comment-body">
                            ${comment.body}
                        </div>
                    </div>
                `;
      });

      const token = localStorage.getItem("SM_Token");
      const addCommentSection = token ? `
                <div style="padding: 24px; border-top: 1px solid var(--glass-border);">
                    <div class="inputs" style="flex-direction: row; align-items: center; gap: 12px;">
                        <input id="comment-input" type="text" placeholder="اكتب تعليقك هنا..." style="flex: 1;">
                        <button onclick="createCommentClicked()" style="margin: 0; padding: 12px 24px;">إرسال</button>
                    </div>
                </div>
            ` : '';

      let imageHeader = "";
      if (post.image && typeof post.image === "string" && post.image !== "") {
        imageHeader = `
                    <div class="card-header">
                        <img src="${post.image}" alt="cover">
                        <h6>${post.created_at}</h6>
                    </div>
                `;
      }

      const postContent = `
                <div class="square">
                    ${imageHeader}
                    <div class="user-info">
                        <img src="${author.profile_image}" alt="avatar" class="avatar" onerror="this.src='profile-pics/default-avatar.png'">
                        <h3>${author.username}</h3>
                    </div>
                    <div class="h1">${post.title || ""}</div>
                    <p>${post.body}</p>
                    
                    <div id="comments">
                        <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; margin-bottom: 16px;">التعليقات (${post.comments_count})</h2>
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

  axios.post(`${API_URL}/posts/${postId}/comments`, { body }, {
    headers: { authorization: `Bearer ${token}` }
  })
    .then(() => {
      getPost();
    })
    .catch(err => alert(err.response?.data?.message || err.message));
}

// --- Modals (Shared Logic) ---
function setupModals() {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const closeLogin = document.querySelector(".closeLogin");
  const closeRegister = document.getElementById("closeRegister");

  if (loginBtn) loginBtn.onclick = () => loginModal.style.display = "block";
  if (registerBtn) registerBtn.onclick = () => registerModal.style.display = "block";

  [closeLogin, closeRegister].forEach(btn => {
    if (btn) btn.onclick = () => {
      loginModal.style.display = "none";
      registerModal.style.display = "none";
    };
  });

  window.onclick = (e) => {
    if (e.target == loginModal) loginModal.style.display = "none";
    if (e.target == registerModal) registerModal.style.display = "none";
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