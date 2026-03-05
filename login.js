console.log("🔐 login.js loaded");

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("🔐 Login form submitted");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  console.log(
    `Attempting login with: email="${email}", password="${password}"`,
  );

  const storedUser = JSON.parse(localStorage.getItem("user"));
  console.log("✓ Retrieved stored user from localStorage:", storedUser);

  if (!storedUser) {
    console.warn("❌ No user found in localStorage");
    Swal.fire("შეცდომა", "მომხმარებელი არ არსებობს", "error");
    return;
  }

  console.log(`Stored user: email="${storedUser.email}"`);
  console.log(`Checking credentials: ${email} === ${storedUser.email}`);

  if (email === storedUser.email && password === storedUser.password) {
    console.log("✓ Credentials match!");

    // 👉 Creating active session
    localStorage.setItem("currentUser", JSON.stringify(storedUser));
    console.log("✓ currentUser saved to localStorage:", storedUser);
    console.log("✓ User name:", storedUser.name);

    Swal.fire({
      title: "წარმატებით შეხვედით",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    setTimeout(() => {
      console.log("🔄 Redirecting to index.html");
      window.location.href = "index.html";
    }, 1500);
  } else {
    console.warn("❌ Credentials do not match");
    console.warn(`Email match: ${email === storedUser.email}`);
    console.warn(`Password match: ${password === storedUser.password}`);
    Swal.fire("შეცდომა", "ელ. ფოსტა ან პაროლი არასწორია", "error");
  }
});
