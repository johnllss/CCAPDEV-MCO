// parse for the user in local storage
const user = JSON.parse(localStorage.getItem("loggedUser"));

if (!user) {
    window.location.href = "/register.html";
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

    const activity = userData.activity && userData.activity.length > 0
        ? userData.activity
        : [
            { text: "Why is my duck meowing?", time: "1m ago" },
            { text: "Why does my duck have cat ears and is this something I should worry about as a duck owner?", time: "5m ago" },
            { text: "Help my duck got cursed by a witch and now it only quacks backwards", time: "2 days ago" },
            { text: "Is it normal for a duck to bark at midnight when the moon is full?", time: "1 week ago" },
            { text: "Extra activity that should not appear", time: "2 weeks ago" }
        ];

    activity.slice(0, 4).forEach(item => {

        const fullText = typeof item === "string" ? item : item.text;
        const time = typeof item === "string" ? "" : item.time;

        const shortText = fullText.length > 45
            ? fullText.substring(0, 45) + "..."
            : fullText;

        const li = document.createElement("li");

        li.innerHTML = `
        <strong>Posted:</strong> 
        <span title="${fullText}">${shortText}</span>
        <span class="activity-date">${time}</span>
    `;

        list.appendChild(li);
    });

}

loadProfile();
