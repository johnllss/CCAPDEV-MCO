const user = JSON.parse(localStorage.getItem("loggedUser"));

if (!user) {
    window.location.href = "/pages/static-html/register.html";
    alert("Please Log In to view profile");
}

// get the user info
document.getElementById("username").textContent = user.username;
document.getElementById("fullname").textContent = user.fullname;
document.getElementById("userquote").textContent = `"${user.quote}"`;
document.getElementById("aboutMe").textContent = user.about;

// get the user's statistics
document.getElementById("total-posts").textContent = user.posts;
document.getElementById("total-replies").textContent = user.replies;
document.getElementById("join-date").textContent = user.dday;

// get dp
document.getElementById("profilepic").src = user.photo;

// get their activity

//unsure of how to implement this
const list = document.getElementById("activitylist");
list.innerHTML = "";

user.activity.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Posted:</strong> ${item}`;
    list.appendChild(li);
});
