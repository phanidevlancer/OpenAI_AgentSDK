import 'dotenv/config'
import { Agent,run, tool,RunContext } from '@openai/agents'
import {z} from 'zod'


interface MyContext {
    userId : string,
    userName : string
}

const getUserInfoTool = tool({
    name : 'get_user_info',
    description : 'get user details',
    parameters : z.object(),
    execute : async function ( _ , ctx? : RunContext<MyContext>) : Promise<string> {
        return `userid : ${ctx?.context.userId} username : ${ctx?.context.userName}`
    }

})

const CustomerSupportAgent = new Agent<MyContext>({
    name : 'Customer Support Agent',
    instructions : 'You are an expert customer support agent',
    tools : [getUserInfoTool]
})


//way1: passing context
// const CustomerSupportAgent = new Agent<MyContext>({
//     name : 'Customer Support Agent',
//     instructions : ({context}) => {
//         return `You are an expert customer support agent \n context: ${JSON.stringify(context)}`
//     }
// })


async function main(query : string, ctx : MyContext) {
    const result = await run(CustomerSupportAgent,query, {
        context : ctx
    })
    console.log("Result ", (await result).finalOutput)
}


main("What is my name & userid?",{
    userId : 'Phani2205',
    userName : 'Phanindra Durga'
})