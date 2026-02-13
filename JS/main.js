const API_URL = "https://tarmeezacademy.com/api/v1";

// DOM Elements
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const loginModal = document.getElementById("myModal");
const registerModal = document.getElementById("reModal");
const postModal = document.getElementById("postModal");
const addBtn = document.getElementById("add-btn");

// --- Modal Logic ---
function setupModals() {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const closeLogin = document.querySelector(".closeLogin");
    const closeRegister = document.getElementById("closeRegister");
    const closePost = document.getElementById("closePost");

    if (loginBtn) loginBtn.onclick = () => loginModal.style.display = "block";
    if (registerBtn) registerBtn.onclick = () => registerModal.style.display = "block";
    if (addBtn) addBtn.onclick = () => postModal.style.display = "block";

    [closeLogin, closeRegister, closePost].forEach(btn => {
        if (btn) btn.onclick = () => {
            loginModal.style.display = "none";
            registerModal.style.display = "none";
            if (postModal) postModal.style.display = "none";
        };
    });

    window.onclick = (e) => {
        if (e.target == loginModal) loginModal.style.display = "none";
        if (e.target == registerModal) registerModal.style.display = "none";
        if (e.target == postModal) postModal.style.display = "none";
    };
}

// --- Navigation Logic ---
function setupNav() {
    if (hamburger) {
        hamburger.onclick = () => {
            const isOpen = navLinks.classList.toggle("open");
            hamburger.innerHTML = isOpen ? "&#x2715;" : "&#x9776;"; // ✕ vs ☰
        };
    }
}

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
        if (addBtn) addBtn.style.display = "flex";

        const user = getCurrentUser();
        if (navUsername) navUsername.innerText = user.username + "@";
        if (navUserImage) navUserImage.src = user.profile_image || "profile-pics/default-avatar.png";
    } else {
        if (guestItems) guestItems.style.display = "flex";
        if (loggedItems) loggedItems.style.display = "none";
        if (addBtn) addBtn.style.display = "none";
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
}

function logout() {
    localStorage.removeItem("SM_Token");
    localStorage.removeItem("currentUser");
    setupUI();
    window.location.reload();
}

// --- API Logic ---
let currentPage = 1;
let lastPage = 1;

function getPosts(reload = true, page = 1) {
    const postsContainer = document.getElementById("posts");
    if (!postsContainer) return;

    axios.get(`${API_URL}/posts?limit=5&page=${page}`)
        .then(response => {
            const posts = response.data.data;
            lastPage = response.data.meta.last_page;

            if (reload) postsContainer.innerHTML = "";

            posts.forEach(post => {
                let imageHeader = "";
                if (post.image && typeof post.image === "string" && post.image !== "") {
                    imageHeader = `
                        <div class="card-header">
                            <img src="${post.image}" alt="cover">
                            <h6>${post.created_at}</h6>
                        </div>
                    `;
                }

                const postHtml = `
                    <div class="square" onclick="postClicked(${post.id})" style="cursor: pointer; margin-bottom: 30px;">
                        ${imageHeader}
                        <div class="user-info">
                            <img src="${post.author.profile_image}" alt="avatar" class="avatar" onerror="this.src='profile-pics/default-avatar.png'">
                            <h3>${post.author.username}</h3>
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
                        </div>
                    </div>
                `;
                postsContainer.innerHTML += postHtml;
            });
        })
        .catch(error => console.error("Error fetching posts:", error));
}

function postClicked(id) {
    window.location.href = `postDetails.html?postId=${id}`;
}

function loginBtnClicked() {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;

    axios.post(`${API_URL}/login`, { username, password })
        .then(response => {
            localStorage.setItem("SM_Token", response.data.token);
            localStorage.setItem("currentUser", JSON.stringify(response.data.user));
            loginModal.style.display = "none";
            showToast("snackbar");
            setupUI();
            setTimeout(() => window.location.reload(), 1000);
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
            registerModal.style.display = "none";
            showToast("registerSnackbar");
            setupUI();
            setTimeout(() => window.location.reload(), 1000);
        })
        .catch(err => alert(err.response?.data?.message || err.message));
}

function createNewPostClicked() {
    const title = document.getElementById("post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0];
    const token = localStorage.getItem("SM_Token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (image) formData.append("image", image);

    axios.post(`${API_URL}/posts`, formData, {
        headers: { "authorization": `Bearer ${token}` }
    })
        .then(() => {
            postModal.style.display = "none";
            alert("تم النشر بنجاح!");
            getPosts();
        })
        .catch(err => alert(err.response?.data?.message || err.message));
}

function showToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
}

// Infinite Scroll
window.onscroll = () => {
    const end = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100;
    if (end && currentPage < lastPage) {
        currentPage++;
        getPosts(false, currentPage);
    }
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    setupModals();
    setupNav();
    setupUI();
    getPosts();
});

window.loginBtnClicked = loginBtnClicked;
window.registerBtnClicked = registerBtnClicked;
window.createNewPostClicked = createNewPostClicked;
window.logout = logout;
window.postClicked = postClicked;
window.getCurrentUser = getCurrentUser;
window.API_URL = API_URL;