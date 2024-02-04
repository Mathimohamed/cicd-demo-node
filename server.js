const express = require('express')

const app = express()




app.get('/', (req, res) => {
    res.json({
    
        message: "hello welcome to tiruchirapalli !!"
    })
})

app.listen(3001, () => {
    console.log('server running on port 3000')
})