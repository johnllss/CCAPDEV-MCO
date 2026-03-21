// parse for the user in local storage
// to be replaced later with cookies
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {
    alert("Please Log In to view profile");
    window.location.href = "/register";
}

// get the user's id from the url
const params = new URLSearchParams(window.location.search);
const profileId = params.get("id");

// choose who is going to be loaded
const finalUserId = profileId ? profileId : loggedUser.userId;

//checks 
console.log("Viewing profile ID:", finalUserId);
console.log("Logged-in user ID:", loggedUser.userId);

// remove the edit button here
if (finalUserId !== loggedUser.userId) {
    const editBtn = document.getElementById("editBtn");
    if (editBtn) editBtn.style.display = "none";
}

async function loadProfile() {
    try {
        const response = await fetch(`http://localhost:3000/users/${finalUserId}`);
        const userData = await response.json();

        console.log("User from database:", userData);

        // populate the profile header
        document.getElementById("username").textContent = userData.username || "";
        document.getElementById("fullname").textContent = userData.profile?.fullname || "";

        document.getElementById("userquote").textContent =
            userData.profile?.quote ? `"${userData.profile.quote}"` : "";

        // profile picture
        document.getElementById("profilepic").src =
            userData.profile?.photo || "/images/default-pfp.png";

        // user stats
        document.getElementById("total-posts").textContent = userData.posts ?? 0;
        document.getElementById("total-replies").textContent = userData.replies ?? 0;

        // join date
        const joinDate = new Date(userData.createdAt);
        document.getElementById("join-date").textContent =
            isNaN(joinDate) ? "" : joinDate.toLocaleDateString();

        // user about me
        document.getElementById("aboutMe").textContent =
            userData.profile?.about || "";

        // their activity list
        const list = document.getElementById("activitylist");
        list.innerHTML = "";

        const activity = userData.activity && userData.activity.length > 0
            ? userData.activity
            : [
                { text: "Why is my duck meowing?", time: "1m ago" },
                { text: "Why does my duck have cat ears?", time: "5m ago" },
                { text: "My duck got cursed by a witch", time: "2 days ago" },
                { text: "Is it normal for ducks to bark?", time: "1 week ago" }
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

    } catch (err) {
        console.error("Failed to load profile:", err);
    }
}

// MAKE SURE THIS IS THERE if no it wont work
loadProfile();