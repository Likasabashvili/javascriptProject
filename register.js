console.log("📝 register.js loaded");

const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("📝 Registration form submitted");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  console.log(
    `Input: name="${name}", email="${email}", password="${password}"`,
  );

  if (!name || !email || !password) {
    console.warn("⚠️ Some fields are empty");
    Swal.fire({
      title: "შეავსე ყველა ველი",
      icon: "warning",
    });
    return;
  }

  const user = { name, email, password };
  console.log("✓ User object created:", user);

  localStorage.setItem("user", JSON.stringify(user));
  console.log("✓ User saved to localStorage under key: 'user'");

  Swal.fire({
    title: "რეგისტრაცია წარმატებულია",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    console.log("🔄 Redirecting to login.html");
    window.location.href = "login.html";
  });
});
