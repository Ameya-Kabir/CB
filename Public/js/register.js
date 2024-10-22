const form = document.querySelector("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const error = document.getElementById("error");
const success = document.getElementById("success");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission

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
      if (data.status === "error") {
        success.style.display = "none"; // Ensure success is hidden
        error.style.display = "block"; // Show error
        error.innerText = data.error; // Correctly use innerText
      } else {
        error.style.display = "none"; // Ensure error is hidden
        success.style.display = "block"; // Show success
        success.innerText = data.success; // Correctly use innerText
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      error.style.display = "block";
      error.innerText = "An unexpected error occurred.";
    });
});
