const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = { name, email, password };

  localStorage.setItem("user", JSON.stringify(user));

Swal.fire({
  title: "რეგისტრაცია წარმატებით დასრულდა!",
  text: "თქვენ წარმატებით დარეგისტრირდით.",
  icon: "success"
});

  form.reset();

  // ავტომატურად გადაყვანა login გვერდზე
  window.location.href = "login.html";
});
