if(process.env.NODE_ENV === 'production'){
    module.exports ={mongoURI: 'mongodb://Brad:Password_1@ds145412.mlab.com:45412/ideawrite'}
} else {
    module.exports={mongoURI: 'mongodb://localhost:27017/ideawrite-dev'}
}