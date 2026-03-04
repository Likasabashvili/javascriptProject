
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser) {
    Swal.fire("შეცდომა", "მომხმარებელი არ არსებობს", "error");
    return;
  }

  if (email === storedUser.email && password === storedUser.password) {
    
    // 👉 ვქმნით აქტიურ სესიას
    localStorage.setItem("currentUser", JSON.stringify(storedUser));

    Swal.fire({
      title: "წარმატებით შეხვედით",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } else {
    Swal.fire("შეცდომა", "ელ. ფოსტა ან პაროლი არასწორია", "error");
  }
});