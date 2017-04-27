var express = require('express');
var router = express.Router();
const crypto = require('crypto');
// const jssdk = require('libs/jssdk.js');

/* GET home page. */
router.get('/wechat/hello', function (req, res, next) {
    jssdk.getSignPackage(req.url, function (err, signpackage) {
        if (err) {
            return next()
        }
        //ejs template
        res.render('index',
            {
                signpackage: signpackage
            }
        )

    })
});
const token = 'ewireiwwersdfzmxjsidifgigi';

const middleware = function (req, res, next) {
    const {signature, timestamp, nonce, echostr} = req.query;
    if (!signature, !timestamp, !nonce, !echostr) {
        return res.send('无效的请求!');
    }
    ;

    if (req.method === "POST") {
        console.log('Post : ', {body: req.body, query: req.query})
    }
    if (req.method === "GET") {
        console.log('GET: ', {get: req.body})
        if (!echostr) {
            return res.send('无效请求!')
        }
    }
    /*1)  将token、timestamp、nonce三个参数进行字典序排序*/
    const params = [token, timestamp, nonce];
    params.sort();
    /*2）将三个参数字符串拼接成一个字符串进行sha1加密*/
    const hash = crypto.createHash('sha1');
    const sign = hash.update(params.join('')).digest('hex');
    /*3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信*/
    if (signature === sign) {
        if (req.method === "GET") {
            res.send(echostr ? echostr : 'invalid request! ')
        } else {

        }
    }
}
router.get('/api/wechat', middleware);
router.post('/api/wechat', middleware);
module.exports = router;

