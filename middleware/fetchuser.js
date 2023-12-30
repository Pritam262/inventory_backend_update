const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.jwtSecretKey

const fetchuser=(req,res,next)=>{
    //Get the user from the jwt token to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authenticate using a valid token"})
    }
    try {
        const data = jwt.verify(token,jwtSecretKey)
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error:"Please authenticate using a valid token"})
    }
  
}
module.exports = fetchuser;