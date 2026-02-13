const API_URL = "https://tarmeezacademy.com/api/v1";

// DOM Elements
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const loginModal = document.getElementById("myModal");
const registerModal = document.getElementById("reModal");
const postModal = document.getElementById("postModal");
const editPostModal = document.getElementById("editPostModal");
const deleteModal = document.getElementById("deleteModal");
const addBtn = document.getElementById("add-btn");

// --- Modal Logic ---
function setupModals() {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const closeLogin = document.querySelector(".closeLogin");
    const closeRegister = document.getElementById("closeRegister");
    const closePost = document.getElementById("closePost");
    const closeEditPost = document.getElementById("closeEditPost");

    if (loginBtn) loginBtn.onclick = () => loginModal.style.display = "block";
    if (registerBtn) registerBtn.onclick = () => registerModal.style.display = "block";
    if (addBtn) addBtn.onclick = () => postModal.style.display = "block";

    [closeLogin, closeRegister, closePost, closeEditPost].forEach(btn => {
        if (btn) btn.onclick = () => {
            loginModal.style.display = "none";
            registerModal.style.display = "none";
            if (postModal) postModal.style.display = "none";
            if (editPostModal) editPostModal.style.display = "none";
            if (deleteModal) deleteModal.style.display = "none";
        };
    });

    window.onclick = (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.style.display = "none";
        }
    };
}

// --- Navigation Logic ---
function setupNav() {
    if (hamburger) {
        hamburger.onclick = () => {
            const isOpen = navLinks.classList.toggle("open");
            hamburger.innerHTML = isOpen ? "&#x2715;" : "&#x9776;";
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
        if (navUsername) navUsername.innerText = user.username;
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

// --- Skeleton Loaders ---
function showSkeletons(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
            <div class="square skeleton-card" style="margin-bottom: 30px;">
                <div class="card-header skeleton skeleton-image"></div>
                <div class="user-info">
                    <div class="skeleton-avatar skeleton"></div>
                    <div class="skeleton-text skeleton" style="width: 100px;"></div>
                </div>
                <div class="skeleton-title skeleton" style="margin: 0 16px 12px;"></div>
                <div class="skeleton-text skeleton" style="margin: 0 16px 16px; width: 90%;"></div>
            </div>
        `;
    }
    container.innerHTML += html;
}

function hideSkeletons() {
    const skeletons = document.querySelectorAll(".skeleton-card");
    skeletons.forEach(s => s.remove());
}

// --- API Logic ---
let currentPage = 1;
let lastPage = 1;
let isLoading = false;

function getPosts(reload = true, page = 1) {
    const postsContainer = document.getElementById("posts");
    if (!postsContainer) return;

    if (isLoading) return;
    isLoading = true;

    if (reload) {
        postsContainer.innerHTML = "";
        showSkeletons("posts", 3);
    } else {
        showSkeletons("posts", 2);
    }

    axios.get(`${API_URL}/posts?limit=5&page=${page}`)
        .then(response => {
            hideSkeletons();
            const posts = response.data.data;
            lastPage = response.data.meta.last_page;
            const currentUser = getCurrentUser();

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

                // Edit/Delete actions
                let actionButtons = "";
                if (currentUser && post.author.id == currentUser.id) {
                    actionButtons = `
                        <div class="post-actions">
                            <button class="action-btn" onclick="editPostClicked(event, ${JSON.stringify(post).replace(/"/g, '&quot;')})">✎</button>
                            <button class="action-btn delete" onclick="deletePostClicked(event, ${post.id})">🗑</button>
                        </div>
                    `;
                }

                // Likes logic (local storage mock)
                const likedPosts = JSON.parse(localStorage.getItem("liked_posts")) || [];
                const isLiked = likedPosts.includes(post.id);

                const postHtml = `
                    <div class="square" onclick="postClicked(${post.id})" style="cursor: pointer; margin-bottom: 30px;">
                        ${actionButtons}
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
                            <div class="like-btn ${isLiked ? 'active' : ''}" onclick="toggleLike(event, ${post.id})">
                                <span>${isLiked ? '❤️' : '♡'}</span>
                                <span>${isLiked ? 'أعجبني' : 'إعجاب'}</span>
                            </div>
                        </div>
                    </div>
                `;
                postsContainer.innerHTML += postHtml;
            });
        })
        .finally(() => {
            isLoading = false;
            hideSkeletons();
        });
}

// --- Like Logic ---
function toggleLike(event, postId) {
    if (event) event.stopPropagation();
    const token = localStorage.getItem("SM_Token");
    if (!token) {
        alert("يرجى تسجيل الدخول أولاً");
        return;
    }

    let likedPosts = JSON.parse(localStorage.getItem("liked_posts")) || [];
    if (likedPosts.includes(postId)) {
        likedPosts = likedPosts.filter(id => id !== postId);
    } else {
        likedPosts.push(postId);
    }
    localStorage.setItem("liked_posts", JSON.stringify(likedPosts));

    // Smooth UI Update without full reload if possible
    const btn = event.currentTarget;
    const isLiked = likedPosts.includes(postId);
    btn.classList.toggle("active", isLiked);
    btn.innerHTML = `<span>${isLiked ? '❤️' : '♡'}</span><span>${isLiked ? 'أعجبني' : 'إعجاب'}</span>`;
}

// --- Edit/Delete Logic ---
function editPostClicked(event, post) {
    event.stopPropagation();
    document.getElementById("edit-post-id-input").value = post.id;
    document.getElementById("edit-post-title-input").value = post.title || "";
    document.getElementById("edit-post-body-input").value = post.body;
    editPostModal.style.display = "block";
}

function updatePostClicked() {
    const id = document.getElementById("edit-post-id-input").value;
    const title = document.getElementById("edit-post-title-input").value;
    const body = document.getElementById("edit-post-body-input").value;
    const image = document.getElementById("edit-post-image-input").files[0];
    const token = localStorage.getItem("SM_Token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (image) formData.append("_method", "put"); // Some APIs need this for images + PUT
    if (image) formData.append("image", image);

    // If no image, we can use standard PUT, but FormData usually works fine
    const headers = { "authorization": `Bearer ${token}` };

    // Using axios with method override if necessary
    const url = `${API_URL}/posts/${id}`;

    // The specific API might require PUT or a POST with _method=put for files
    axios.post(url, formData, { headers })
        .then(() => {
            editPostModal.style.display = "none";
            getPosts();
        })
        .catch(err => alert(err.response?.data?.message || err.message));
}

function deletePostClicked(event, id) {
    event.stopPropagation();
    document.getElementById("delete-post-id-input").value = id;
    deleteModal.style.display = "block";
}

function confirmDeletePost() {
    const id = document.getElementById("delete-post-id-input").value;
    const token = localStorage.getItem("SM_Token");

    axios.delete(`${API_URL}/posts/${id}`, {
        headers: { "authorization": `Bearer ${token}` }
    })
        .then(() => {
            deleteModal.style.display = "none";
            getPosts();
        })
        .catch(err => alert(err.response?.data?.message || err.message));
}

function postClicked(id) {
    window.location.href = `postDetails.html?postId=${id}`;
}

// Auth Handlers
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
        headers: { authorization: `Bearer ${token}` }
    }).then(() => {
        postModal.style.display = "none";
        // Refresh home feed if it exists
        if (document.getElementById("posts")) {
            getPosts(true, 1);
        }
        // Refresh profile feed if it exists
        if (window.getUserPosts) {
            const user = getCurrentUser();
            window.getUserPosts(user.id);
            if (window.refreshProfileInfo) window.refreshProfileInfo();
        }

        // Reset inputs
        document.getElementById("post-title-input").value = "";
        document.getElementById("post-body-input").value = "";
        document.getElementById("post-image-input").value = "";

    }).catch(err => alert(err.response?.data?.message || err.message));
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    setupModals();
    setupNav();
    setupUI();
    getPosts();
});

// Exports
window.loginBtnClicked = loginBtnClicked;
window.registerBtnClicked = registerBtnClicked;
window.createNewPostClicked = createNewPostClicked;
window.updatePostClicked = updatePostClicked;
window.confirmDeletePost = confirmDeletePost;
window.editPostClicked = editPostClicked;
window.deletePostClicked = deletePostClicked;
window.toggleLike = toggleLike;
window.logout = logout;
window.postClicked = postClicked;
window.getCurrentUser = getCurrentUser;
window.API_URL = API_URL;