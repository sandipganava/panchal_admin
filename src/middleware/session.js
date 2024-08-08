var session = async (req, res, next) => {
    sess = req.session;
    sess.redirectUrl = req.originalUrl
    if (!(sess.userdetails)) {
        res.redirect('/')
    } else {
        next();
    }
}
module.exports = session;