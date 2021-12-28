module.exports = {
    msg: function (req, res, next) {
        document.write("Hello")
       setTimeout(() => {
           return next()
       }, 3000);
    }
}
 