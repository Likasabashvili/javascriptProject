const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    Swal.fire({
      title: "შეავსე ყველა ველი",
      icon: "warning",
    });
    return;
  }

  const user = { name, email, password };

  localStorage.setItem("user", JSON.stringify(user));

  Swal.fire({
    title: "რეგისტრაცია წარმატებულია",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "login.html";
  });
});
