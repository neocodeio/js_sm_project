// elements
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks"); // ul.nav-links
const authBtns = document.getElementById("authBtns"); // div.logo-btns

// function to move auth buttons into navLinks (mobile) or back (desktop)
function adaptNavbar() {
  const width = window.innerWidth;
  if (width <= 768) {
    // move auth buttons into navLinks if not already moved
    if (navLinks && !navLinks.classList.contains("mobile")) {
      // mark as mobile menu
      navLinks.classList.add("mobile");
      // clone auth buttons inside navLinks for mobile display
      // remove duplicates first if any
      const existingMobileAuth = navLinks.querySelector(".mobile-auth");
      if (!existingMobileAuth) {
        const mobileAuthWrap = document.createElement("div");
        mobileAuthWrap.className = "mobile-auth";
        // clone children of authBtns (Login / Register anchors)
        const clones = Array.from((authBtns && authBtns.children) || []).map(
          (node) => node.cloneNode(true)
        );
        clones.forEach((c) => {
          // ensure style appropriate for mobile
          c.classList.add("auth-btn");
          mobileAuthWrap.appendChild(c);
        });
        // append a divider (optional)
        const divider = document.createElement("hr");
        divider.style.border = "none";
        divider.style.height = "1px";
        divider.style.background = "#eee";
        divider.style.margin = "6px 0";
        navLinks.appendChild(divider);
        navLinks.appendChild(mobileAuthWrap);
      }
      // hide the desktop authBtns (already hidden by CSS, but keep safe)
      if (authBtns) authBtns.style.display = "none";
    }
  } else {
    // desktop: remove mobile markers and mobile-auth clones
    if (navLinks && navLinks.classList.contains("mobile")) {
      navLinks.classList.remove("mobile", "open");
      // remove mobile-auth and divider
      const mobileAuth = navLinks.querySelector(".mobile-auth");
      const divider = navLinks.querySelector("hr");
      if (mobileAuth) mobileAuth.remove();
      if (divider) divider.remove();
      if (authBtns) authBtns.style.display = "flex";
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  }
}

// toggle menu open/close
function toggleMenu() {
  if (!navLinks || !hamburger) return;
  const isOpen = navLinks.classList.contains("open");
  if (isOpen) {
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  } else {
    navLinks.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
  }
}

// events
if (hamburger) hamburger.addEventListener("click", toggleMenu);
window.addEventListener("resize", adaptNavbar);

// init on load
document.addEventListener("DOMContentLoaded", () => {
  adaptNavbar();
  // optional: close menu if click outside
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (
      navLinks &&
      hamburger &&
      !navLinks.contains(target) &&
      !hamburger.contains(target) &&
      navLinks.classList.contains("open")
    ) {
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
});


//Login
var modal = document.getElementById("myModal");
// Get the button that opens the modal
var loginBtn = document.getElementById("loginBtn");

// Get the <span> element that closes the login modal (by class)
var span = document.getElementsByClassName("closeLogin");

// When the user clicks the button, open the modal
if (loginBtn && modal) {
  loginBtn.onclick = function () {
    modal.style.display = "block";
  };
}

// When the user clicks on <span> (x), close the modal
if (span && modal) {
  span.onclick = function () {
    modal.style.display = "none";
  };
}


//register
var reModal = document.getElementById("reModal");
// Get the button that opens the modal
var registerBtn = document.getElementById("registerBtn");

// Get the <span> element that closes the register modal (by id) - renamed to avoid clash
var closeBtn = document.getElementById("closeRegister");

// When the user clicks the button, open the register modal
if (registerBtn && reModal) {
  registerBtn.onclick = function () {
    reModal.style.display = "block";
  };
}

// When the user clicks on <span> (x) in register modal, close the modal
if (closeBtn && reModal) {
  closeBtn.onclick = function () {
    reModal.style.display = "none";
  };
}

// Combine window.onclick handling for both modals (was duplicated)
window.onclick = function (event) {
  if (event.target == modal && modal) {
    modal.style.display = "none";
  }
  if (event.target == reModal && reModal) {
    reModal.style.display = "none";
  }
};

const API_URL = "https://tarmeezacademy.com/api/v1";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");
console.log("Post id: ", id);

function getPost() {
  axios.get(`${API_URL}/posts/${id}`)
  .then((response) => {
  const post = response.data.data;  
  const comments = post.comments;
  const author = post.author;
  
  document.getElementById("username-span").innerHTML = author.username+"@";
  
  let postTitle = "";
  if (post.title != null) {
    postTitle = post.title;
    }
  
  let commentsContent = ``;
  for(comment of comments){
    commentsContent += `
    <div style="background-color: white; padding: 1px;" id="comments">
    <div style="justify-content: flex-end; float: right; padding: 15px; margin: 10px;">
      <img src="${comment.author.profile_image}" alt="" style="border-radius: 100px; width: 30px; height: 30px; vertical-align: middle; margin-left: 5px;">
      <b style="vertical-align: middle;">${comment.author.username}</b>
    </div><br>
    <!-- comments body -->
      <div style="margin-top: 25px; padding: 15px; text-align: left;">
      ${comment.body}
      </div>
    <!--// comments body //-->
    </div>
    `;
  }
    
  const postContent = `
    <div class="post-container">
      <div id="posts">
        <div class="square">
          <div class="card-header">
            <img src="${post.image}" alt="cover" onerror="this.src='profile-pics/No_image_available_500_x_500.svg.png'">
            <h6>${post.created_at}</h6>
          </div>

          <div class="user-info">
            <img src="${author.profile_image}" alt="user avatar" class="avatar">
            <h3>${author.username}@</h3>
          </div>

          <div class="h1">${postTitle}</div>
          <p>
            ${post.body}
          </p>

          <div class="lowerPart">
            <div class="meta-left">
              <svg class="comment-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
                <path d="M15.2141 5.98239L16.6158 4.58063C17.39 3.80646 18.6452 3.80646 19.4194 4.58063C20.1935 5.3548 20.1935 6.60998 19.4194 7.38415L18.0176 8.78591M15.2141 5.98239L6.98023 14.2163C5.93493 15.2616 5.41226 15.7842 5.05637 16.4211C4.70047 17.058 4.3424 18.5619 4 20C5.43809 19.6576 6.94199 19.2995 7.57889 18.9436C8.21579 18.5877 8.73844 18.0651 9.78375 17.0198L18.0176 8.78591M15.2141 5.98239L18.0176 8.78591" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M11 20H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
              </svg>
              <span class="comment-text">(${post.comments_count}) Comments</span>
            </div>
          </div>

          <div id="comments">
          <h2 style="text-align: right; margin-right: 20px; font-size: 20px; margin-top: 10px;">التعليقات:</h2>
          ${commentsContent}
          </div>

        <!-- Add Comment -->
        <div id="add-comment-div" style="padding: 10px;">
        <input style="width: 90%; border-radius: 8px; border: none; padding: 5px;" id="comment-input" type="text" placeholder="اكتب تعليقك هنا..." />
        <button type="button" style="border-radius: 12px; border: none; padding: 3px; font-size: 20px; background: #7857ff; color: white; margin: 10px; width: 80%;" onclick="createCommentClicked()">ارسل</button>
        </div>
        <!--// Add Comment //-->
        </div>
      </div>
    </div>
  `;
    
  document.getElementById("post").innerHTML = postContent;
  })
  .catch((error) => {
  alert(error);
});
}
getPost()

function createCommentClicked() {
  let commentBody = document.getElementById("comment-input").value;
  let params = {
    "body": commentBody
  }
  let token = localStorage.getItem("SM_Token");
  let url = `${API_URL}/posts/${id}/comments`

  axios
    .post(url, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      alert("تم ارسال التعليق")
      getPost();
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// Login
  function loginBtnClicked() {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;

    const params = {
      username: username,
      password: password,
    };

    axios
      .post(`${API_URL}/login`, params)
      .then((response) => {
        console.log(response); // print in console
        console.log("Token Received", response.data.token); // print token in console

        const token = response.data.token; // save the token
        localStorage.setItem("SM_Token", token); // storage it
        localStorage.setItem("currentUser", JSON.stringify(response.data.user)); // storage the user info
        // After Login
        if (token != null) {
          if (modal) modal.style.display = "none";
          showToast();
          setupUI();
        }
      })
      .catch((error) => {
        alert(error);
      });
    console.log(`Username: ${username}, Password: ${password}`);
  }

  // Login Toast
  function showToast() {
    var x = document.getElementById("snackbar");
    if (!x) return;
    x.className = "show";
    setTimeout(function () {
      x.className = x.className.replace("show", "");
    }, 3000);
}
  
function getCurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem("currentUser");
  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }
  return user;
}

// Logout
function logout() {
  localStorage.removeItem("SM_Token");
  localStorage.removeItem("currentUser");
  alert(`User Logout Successfully`);
  setupUI();
}

// Export functions to global scope in case HTML uses onclick attributes
window.loginBtnClicked = loginBtnClicked;
window.logout = logout;
setupUI();

// Register
function registerBtnClicked() {
  const nickname = document.getElementById("nickNameInput").value;
  const username = document.getElementById("usernameInputRegister").value;
  const password = document.getElementById("passwordInputRegister").value;
  const profileImage = document.getElementById("register-image-input").files[0];

  let formData = new FormData();
  formData.append("name", nickname);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("image", profileImage);

  const headers = {
    "Content-Type": "multipart/form-data",
  };

  axios
    .post(`${API_URL}/register`, formData, {
      headers: headers,
    })
    .then((response) => {
      const token = response.data.token; // <- خطوتان: أخذنا التوكن من الرد ووضعناه في متغير
      localStorage.setItem("SM_Token", token); // خزن التوكن
      localStorage.setItem("currentUser", JSON.stringify(response.data.user)); // خزن بيانات المستخدم

      if (token != null) {
        if (reModal) reModal.style.display = "none";
        showRegisterToast();
        alert(
          "حياك, تم انشاء حسابك في فيديور \n حدث الصفحة علشان تقدر تكمل التصفح."
        );
        // setupUI();
      } else {
        alert("Registration succeeded but token not received.");
      }
    })
    .catch((error) => {
      const msg =
        error.response?.data?.message || error.message || "Registration failed";
      alert(msg);
    });

  console.log(nickname, username, password);
}

// Register Toast
function showRegisterToast() {
  var x = document.getElementById("registerSnackbar");
  if (!x) return;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

  function setupUI() {
    const token = localStorage.getItem("SM_Token");
    const loggedDiv = document.getElementById("authBtns");
    const logoutDiv = document.getElementById("logout-div");
    const navUsername = document.getElementById("nav-username");

    if (!loggedDiv || !logoutDiv) return;

    if (token == null) {
      // not logged in
      loggedDiv.style.visibility = "visible";
      logoutDiv.style.setProperty("display", "none", "important");
    } else {
      // logged in
      loggedDiv.style.setProperty("display", "none", "important");
      logoutDiv.style.visibility = "visible";

      const user = getCurrentUser();
      document.getElementById("nav-username").innerHTML = `${user.username}@`;
      document.getElementById("nav-user-image").src = user.profile_image;
    }
  }

  setupUI();