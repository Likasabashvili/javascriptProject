const loginForm = document.getElementById("login-form");
const loginBox = document.getElementById("login-box");
const welcomeBox = document.getElementById("welcome-box");
const userNameSpan = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");
//შესვლა
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (
    storedUser &&
    email === storedUser.email &&
    password === storedUser.password
  ) {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("loggedUserName", storedUser.name);
    showWelcome();
  } else {
    alert("ელ. ფოსტა ან პაროლი არასწორია!");
  }
}); // Welcome ჩვენება
function showWelcome() {
  loginBox.classList.add("hidden");
  welcomeBox.classList.remove("hidden");
  const name = localStorage.getItem("loggedUserName");
  userNameSpan.textContent = name;
} // გასვლა
logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("loggedUserName");
  welcomeBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
}); // თუ უკვე შესულია (რეფრეშისას)
window.onload = function () {
  if (localStorage.getItem("loggedIn") === "true") {
    showWelcome();
  }
};
