function buildLoginRedirect(targetPath) {
    const params = new URLSearchParams({
        notice: 'Please log in to continue.',
        noticeType: 'info',
        noticeTitle: 'Login required'
    });

    if (targetPath) {
        params.set('next', targetPath);
    }

    return `/login?${params.toString()}`;
}

function requireAuthPage(req, res, next) {
    if (req.session?.userId) {
        return next();
    }

    return res.redirect(buildLoginRedirect(req.originalUrl));
}

function requireAuthApi(req, res, next) {
    if (req.session?.userId) {
        return next();
    }

    return res.status(401).json({ message: 'Please log in to continue.' });
}

module.exports = {
    buildLoginRedirect,
    requireAuthPage,
    requireAuthApi
};