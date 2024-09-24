// login.js
var attempt = 3; // Variable to count number of attempts.

function showLoginPopup() {
  var loginPopup = document.getElementById("login-popup");
  var loginFormHtml = `
    <div id="login-form">
      <h2>Javascript Login Form Validation</h2>
      <form id="form_id" method="post" name="myform">
        <label>User Name :</label>
        <input type="text" name="username" id="username"/>
        <label>Password :</label>
        <input type="password" name="password" id="password"/>
        <input type="button" value="Login" id="submit" onclick="validate()"/>
      </form>
      <span><b class="note">Note : </b>Enter your username and password to login.</span>
    </div>
  `;
  loginPopup.innerHTML = loginFormHtml;
  loginPopup.style.display = "block";
}

function validate(){
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  
  // Query the database to fetch all users
  fetch('/users')
    .then(response => response.json())
    .then(users => {
      // Check if the entered username and password match any of the users
      var userFound = users.find(user => user.username === username && user.password === password);
      if (userFound) {
        alert("Login successfully");
        window.location = "success.html"; // Redirecting to other page.
        return false;
      } else {
        attempt --;// Decrementing by one.
        alert("You have left "+attempt+" attempt;");
        // Disabling fields after 3 attempts.
        if( attempt == 0){
          document.getElementById("username").disabled = true;
          document.getElementById("password").disabled = true;
          document.getElementById("submit").disabled = true;
          return false;
        }
      }
    })
    .catch(error => {
      console.error(error);
      alert("Error fetching users");
    });

}