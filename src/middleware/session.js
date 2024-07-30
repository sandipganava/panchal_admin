var session = async (req, res, next) => {
    
    sess = req.session;
   
    sess.redirectUrl = req.originalUrl
    console.log("sess.redirectUrl", sess.redirectUrl)
    if (!(sess.userdetails)) {
        res.redirect('/')
    } else {
        next();
    }
}
module.exports = session;