// parse for the user in local storage
const user = JSON.parse(localStorage.getItem("loggedUser"));

if (!user) {
    window.location.href = "../../pages/static-html/register.html";
    alert("Please Log In to view profile");
}

// call for the user id and compare to database
// get the user id
// include viewing other profiles
const userId = user.userId;

// Ensures that if its someone elses profile, wont let them edit it
if (userId != user.userId) {
    document.getElementById("editBtn").style.display = "none";

}
async function loadProfile() {

    const response = await fetch(`http://localhost:3000/users/${userId}`);
    const userData = await response.json();

    console.log("User from database:", userData);

    // populate profile header
    document.getElementById("username").textContent = userData.username;
    document.getElementById("fullname").textContent = userData.profile.fullname;
    document.getElementById("userquote").textContent = `"${userData.profile.quote}"`;

    // profile picture
    document.getElementById("profilepic").src = userData.profile.photo;

    // stats
    document.getElementById("total-posts").textContent = userData.posts;
    document.getElementById("total-replies").textContent = userData.replies;

    // join date
    const joinDate = new Date(userData.createdAt);
    document.getElementById("join-date").textContent = joinDate.toLocaleDateString();

    // about me
    document.getElementById("aboutMe").textContent = userData.profile.about;

    // activity list
    const list = document.getElementById("activitylist");
    list.innerHTML = "";

    userData.activity.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>Posted:</strong> ${item}`;
        list.appendChild(li);
    });

}

loadProfile();