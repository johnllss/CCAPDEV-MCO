// parse for the user in local storage
// to be replaced later with cookies
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {
    alert("Please Log In to view profile");
    window.location.href = "/register";
}

// get the user's id from the url
const params = new URLSearchParams(window.location.search);
const requestedProfileId = params.get("id");

// choose who is going to be loaded
const finalUserId = requestedProfileId || loggedUser.userId;

//checks 
console.log("Viewing profile ID:", finalUserId);
console.log("Logged-in user ID:", loggedUser.userId);

const isOwnProfile = finalUserId === loggedUser.userId;
const ACTIVITY_POLL_INTERVAL_MS = 5000;
let activityPollId = null;
let isLoadingActivity = false;

function updateProfileEditingState() {
    const editBtn = document.getElementById("editBtn");

    if (!editBtn) {
        return;
    }

    if (isOwnProfile) {
        editBtn.style.display = "";
        editBtn.removeAttribute("aria-hidden");
        return;
    }

    editBtn.style.display = "none";
    editBtn.setAttribute("aria-hidden", "true");
    editBtn.removeAttribute("href");
}

updateProfileEditingState();

function redirectToSafeProfile() {
    const targetProfileHref = `/profile?id=${loggedUser.userId}`;

    if (window.location.pathname === "/profile" && window.location.search === `?id=${loggedUser.userId}`) {
        return;
    }

    window.location.replace(targetProfileHref);
}

// we want activity item to be the same format regardless of what type it is
function normalizeActivityItem(item) {
    if (!item) {
        return null;
    }

    if (typeof item === "string") {
        return {
            label: "Posted",
            text: item,
            time: "",
            link: ""
        };
    }

    const typeLabels = {
        post: "Posted",
        comment: "Commented",
        reply: "Replied",
        like: "Liked",
        view: "Viewed"
    };

    return {
        label: typeLabels[item.type] || "Activity",
        text: item.text || "",
        time: item.time || "",
        link: item.link || ""
    };
}

function renderActivity(activityItems) {
    const list = document.getElementById("activitylist");
    list.innerHTML = "";

    const normalizedItems = activityItems
        .map(normalizeActivityItem)
        .filter(item => item && item.text)
        .slice(0, 4);

    if (normalizedItems.length === 0) {
        const li = document.createElement("li");
        li.textContent = isOwnProfile ? "You have no activity yet." : "This user has no activity yet.";
        list.appendChild(li);
        return;
    }

    normalizedItems.forEach(item => {
        const shortText = item.text.length > 45
            ? item.text.substring(0, 45) + "..."
            : item.text;

        const li = document.createElement("li");
        const content = item.link
            ? document.createElement("a")
            : document.createElement("div");

        if (item.link) {
            content.href = item.link;
            content.className = "activity-link";
        }

        const label = document.createElement("strong");
        label.textContent = `${item.label}:`;

        const text = document.createElement("span");
        text.title = item.text;
        text.textContent = shortText;

        const time = document.createElement("span");
        time.className = "activity-date";
        time.textContent = item.time;

        content.appendChild(label);
        content.appendChild(document.createTextNode(" "));
        content.appendChild(text);
        content.appendChild(time);
        li.appendChild(content);

        list.appendChild(li);
    });
}

// for loadProfile() to prevent ugly quotes/about me
function hasRealProfileText(value) {
    if (typeof value !== "string") {
        return false;
    }

    return value.trim() !== "";
}

async function loadActivity() {
    if (isLoadingActivity) {
        return;
    }

    isLoadingActivity = true;

    try {
        const activityResponse = await fetch(`/activity/user/${finalUserId}`);
        if (activityResponse.ok) {
            const activityData = await activityResponse.json();
            renderActivity(Array.isArray(activityData) ? activityData : []);
        } else {
            console.warn("Failed to load activity feed:", activityResponse.status);
        }
    } catch (err) {
        console.error("Failed to load activity:", err);
    } finally {
        isLoadingActivity = false;
    }
}

function startActivityPolling() {
    if (activityPollId !== null) {
        clearInterval(activityPollId);
    }

    activityPollId = window.setInterval(loadActivity, ACTIVITY_POLL_INTERVAL_MS);
}

async function loadProfile() {
    try {
        const userResponse = await fetch(`/users/${finalUserId}`);

        if (!userResponse.ok) {
            if (!isOwnProfile && (userResponse.status === 400 || userResponse.status === 404)) {
                redirectToSafeProfile();
                return;
            }

            throw new Error(`Failed to load user profile (${userResponse.status})`);
        }

        const userData = await userResponse.json();

        console.log("User from database:", userData);

        // populate the profile header
        document.getElementById("username").textContent = userData.username || "";
        document.getElementById("fullname").textContent = userData.profile?.fullname || "";

        const quote = userData.profile?.quote;
        const about = userData.profile?.about;

        document.getElementById("userquote").textContent = hasRealProfileText(quote)
            ? `"${quote.trim()}"`
            : (isOwnProfile ? "You have not added a quote yet." : "This user has not added a quote yet.");

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
        document.getElementById("aboutMe").textContent = hasRealProfileText(about)
            ? about.trim()
            : (isOwnProfile ? "You have not added an About Me yet." : "This user has not added an About Me yet.");
        await loadActivity();
        startActivityPolling();

    } catch (err) {
        console.error("Failed to load profile:", err);
    }
}

window.addEventListener("beforeunload", () => {
    if (activityPollId !== null) {
        clearInterval(activityPollId);
    }
});

// MAKE SURE THIS IS THERE if no it wont work
loadProfile();
