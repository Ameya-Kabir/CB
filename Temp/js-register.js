const form = document.querySelector("form");

form.addEventListener("submit", () => {
  const register = {
    username: username.value,
    email: email.value,
    password: password.value,
  };
  fetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(register),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status == "error") {
        success.display = "none";
        error.style.display = "block";
        error.innertext = data.error;
      } else {
        error.style.display = "none";
        success.style.display = "block";
        success.innertext = data.success;
      }
    });
});
