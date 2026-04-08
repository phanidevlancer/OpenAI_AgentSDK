import 'dotenv/config'
import axios from 'axios'
import {Agent, run , tool} from '@openai/agents'
import {z} from 'zod'


const WeatherTool = tool({
    name : 'get_weather',
    description : 'use this to fetch the latest weather updates',
    parameters : z.object({
        city : z.string().describe("name of the city")
    }),
    async execute({city}) {
        //
        const response = await axios.get(`https://wttr.in/${city}?format=%C+%t`);
        console.log("response from axios is : ",response.data)
        return response.data
    }
})

const agent = new Agent({
    name : 'Weather Agent',
    instructions : 'You are an expert weather assistant',
    tools : [WeatherTool]
})


const main = async (query = '') => {
    const result = await run(agent,query)
    console.log("Agent's Response : ",result.finalOutput)
}

main("What is the weather condition in Delhi and hyderabad?")
