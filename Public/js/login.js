const form = document.querySelector("form");
const error = document.getElementById("error");
const success = document.getElementById("success");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the default form submission

  const login = {
    email: document.getElementById("email").value, // Fetch input by ID
    password: document.getElementById("password").value,
  };

  fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(login),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "error") {
        success.style.display = "none"; // Ensure the success alert is hidden
        error.style.display = "block";
        error.innerText = data.error; // Correct capitalization of innerText
      } else {
        error.style.display = "none"; // Ensure the error alert is hidden
        success.style.display = "block";
        success.innerText = data.success; // Correct capitalization of innerText
      }
    });
});
