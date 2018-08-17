'use strict';

var _bookModel = require('../models/bookModel');

var _bookModel2 = _interopRequireDefault(_bookModel);

var _userModel = require('../models/userModel');

var _userModel2 = _interopRequireDefault(_userModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
//-------------------------------Auth MiddleWare-------------------
exports.auth = function (req, res, next) {
    var token = req.header('x-access-token');
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            err.status = 401;
            err.message = 'No auth token provided';
            next(err);
        } else {
            next();
        }
    });
};

//-------------------sign up ----------------------------------

exports.signup = function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    var userData = {
        name: req.body.name,
        isSeller: req.body.isSeller,
        email: req.body.email,
        password: hashedPassword,
        address: req.body.address,
        pincode: req.body.pincode,
        contact: req.body.contact
    };

    _userModel2.default.create(userData).then(function (user) {
        // create a token
        var token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({
            auth: true,
            token: token
        });
    }).catch(function (err) {
        console.log(err);
        res.json({
            result: 'error'
        });
    });
};
//----------------Login ------------------------------------------
exports.login = function (req, res) {
    _userModel2.default.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('User not found');
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({
            auth: false,
            token: null
        });
        var token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: 86400
        });
        res.status(200).send({
            auth: true,
            token: token
        });
    });
};
//# sourceMappingURL=authController.js.map