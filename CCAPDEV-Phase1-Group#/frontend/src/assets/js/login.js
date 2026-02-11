console.log("testing");

// manages the password viewer

let eyeicon = document.getElementById("eyeicon");
let password = document.getElementById("password");

eyeicon.onclick = function () {
    if (password.type == "password") {
        password.type = "text";
        eyeicon.src = "../../assets/images/eye-open.png";
    } else {
        password.type = "password";
        eyeicon.src = "../../assets/images/eye-close.png";
    }
}

//hard coded users first
const users = [
    {
        username: "donald",
        password: "1234",
        profile: {
            username: "donaldduck67",
            fullname: "Donald Duck",
            quote: "Wishing I was like Scrooge McDuck",
            about: "Full Quack developer for Mickey Studios",
            posts: 999,
            replies: 67,
            dday: "1-1-1000",
            photo: "../../assets/images/donald_profilepic.jpg",
            activity: [
                "Why is my duck meowing?",
                "Why does my duck have cat ears?",
                "Help my duck got cursed by a witch"
            ]

        }
    },

    {
        username: "thepirateking",
        password: "1111",
        profile: {
            username: "thepirateking",
            fullname: "Monkey D. Luffy",
            quote: "IM GOING TO BE THE KING OF THE PIRATES",
            about: "If you have meat please do give it me ples pls plsplspls",
            posts: 120,
            replies: 55,
            dday: "2024-01-01",
            photo: "../../assets/images/luffypfp.jpg",
            activity: [
                "What is the Gum-Gum Fruit",
                "How many grams of meat is in one kilogram of meat",
                "WHY I DONT WANT TO KNOW WHERE THE ONE PIECE IS"
            ]
        }
    },

    {
        username: "kanan01",
        password: "2222",
        profile: {
            username: "kanan01",
            fullname: "Kanan Matsuura",
            quote: "If youre going to do something, then do it seriously. Otherwise, youll just regret it later.",
            about: "Calm diver, loyal leader, quietly supportive, values commitment, ocean lover, steady strength.",
            posts: 78,
            replies: 22,
            dday: "2024-02-02",
            photo: "../../assets/images/kananpfp.jpg",
            activity: [
                "Where are some Morning free-dive practices near Uchiura Bay",
                "How can teach someone to dive in water?",
                "Stretching routines for better breath control",
            ]
        }
    },

    {
        username: "theoneeyedghoul",
        password: "3333",
        profile: {
            username: "theoneeyedghoul",
            fullname: "Kaneki Ken",
            quote: "Oshiete yo...",
            about: "Half human, half ghoul—still deciding which side deserves me.",
            posts: 12,
            replies: 5,
            dday: "2024-03-03",
            photo: "../../assets/images/kanekikenpfp.png",
            activity: [
                "Are ghouls actually bad?",
                "How to hide kagune from surgery",
                "Arima Kishou is a fraud. Prove me wrong"
            ]
        }
    },

    {
        username: "zoidberg",
        password: "4444",
        profile: {
            username: "zoidberg",
            fullname: "Dr. Johnathan Alfred Zoidberg",
            quote: "Are you going to eat that?",
            about: "Crustacean MD—still cheaper than your insurance, why not?",
            posts: 3,
            replies: 1,
            dday: "2024-04-04",
            photo: "../../assets/images/zoidbergpfp.png",
            activity: [
                "mhhmmhmmm food",
                "Google can you eat cement",
                "How to perform heart transpant?"
            ]
        }
    }
];

// manages the login logic. 


const form = document.getElementById("login-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const identifier = document.getElementById("loginName").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!identifier || !password) {
        alert("Fill all fields.");
        return;
    }

    const foundUser = users.find(
        u => u.username === identifier && u.password === password
    );

    if (!foundUser) {
        alert("Invalid credentials");
        return;
    }

    localStorage.setItem("loggedUser", JSON.stringify(foundUser.profile));

    window.location.href = "../../pages/static-html/index.html";
});

