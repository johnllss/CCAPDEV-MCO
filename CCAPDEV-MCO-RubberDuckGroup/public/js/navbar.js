document.addEventListener("DOMContentLoaded", async () => {
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.getElementById("navbar-menu");
    const searchSection = document.getElementById("navbar-menu-search");
    const profileLink = document.getElementById("nav-profile-link");
    const profileImage = document.getElementById("nav-profile-image");
    const logBtn = document.getElementById("log-btn");

    const syncNavbarHeight = () => {
        if (!navbar) {
            return;
        }

        document.documentElement.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);
    };

    const setMobileMenuState = (isOpen) => {
        if (!navbar || !navToggle || !navMenu || !searchSection) {
            return;
        }

        navbar.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
        syncNavbarHeight();
    };

    if (navToggle && navMenu && searchSection) {
        navToggle.addEventListener("click", () => {
            setMobileMenuState(!navbar.classList.contains("is-open"));
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                setMobileMenuState(false);
            } else {
                syncNavbarHeight();
            }
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 768) {
                    setMobileMenuState(false);
                }
            });
        });
    }

    syncNavbarHeight();

    if (!profileLink || !profileImage || !logBtn) {
        return;
    }

    const buildLoginRedirect = (targetPath) => {
        const params = new URLSearchParams({
            notice: 'Please log in to continue.',
            noticeType: 'info',
            noticeTitle: 'Login required'
        });

        if (targetPath) {
            params.set('next', targetPath);
        }

        return `/login?${params.toString()}`;
    };

    let loggedUser = null;

    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            loggedUser = await res.json();
        }
    } catch (error) {
        loggedUser = null;
    }

    const userId = loggedUser?.userId;
    const photo = loggedUser?.profile?.photo || "/images/unknownperson.jpg";

    profileLink.href = userId ? `/profile?id=${userId}` : "/profile";
    profileImage.src = photo;

    //added toggle for hbs
    if (userId) {
        logBtn.textContent = "Logout";
        logBtn.href = "/logout";
    } else {
        logBtn.textContent = "Join us";
        logBtn.href = "/login";

        profileLink.addEventListener("click", async (event) => {
            event.preventDefault();
            await showAppPopup("Please log in to view your profile.", {
                type: "info",
                title: "Login required",
                duration: 1600
            });
            window.location.href = buildLoginRedirect("/profile");
        });
    }

    syncNavbarHeight();
});