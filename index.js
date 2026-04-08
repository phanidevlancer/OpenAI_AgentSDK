import {Agent, run} from '@openai/agents'
import 'dotenv/config'


const location = "US"

const helloAgent = new Agent({
    name : "Hello Agent",
    instructions : function () {
        if(location == 'india') {
            return "Greet Namaste with user name"
        }else {
           return "Greet Hey bro with user name"
        }
    }
})


run(helloAgent, "Hello, I am Phanindra").then((result) => {
    console.log("Result is ",result.finalOutput)
})

