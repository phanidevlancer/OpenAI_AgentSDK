import 'dotenv/config'
import axios from 'axios'
import Mailjet from 'node-mailjet'
import { Agent, run, tool } from '@openai/agents'
import { z } from 'zod'
import readline from 'node:readline/promises';


const WeatherOutputSchema = z.object({
    city: z.string().describe("name of the city"),
    temp_c: z.number().describe("temp of the city in celcius"),
    condition: z.string().optional().describe("current weather condition of the city")
})

const WeatherResponseSchema = z.object({
    results: WeatherOutputSchema.array(),
    email_status: z.boolean().describe("true if email was sucessful esle false")
});

const mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC,
    apiSecret: process.env.MJ_APIKEY_PRIVATE
})

const sendEmailTool = tool({
    name: 'send_email',
    description: 'tool for sending email to the user',
    needsApproval : true,
    parameters: z.object({
        to_email: z.string().email().describe("Recipient's email address"),
        to_name: z.string().describe("Recipient's name"),
        subject: z.string().describe("Email subject"),
        text_part: z.string().describe("Plain text body of the email"),
        html_part: z.string().describe("HTML body of the email, or empty string if not needed"),
    }),
    async execute({ to_email, to_name, subject, text_part, html_part }) {

        try {
            const result = await mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'phanidevlancer@gmail.com',
                            Name: 'Phanindra D'
                        },
                        To: [{ Email: to_email, Name: to_name }],
                        Subject: subject,
                        TextPart: text_part,
                        HTMLPart: html_part || `<p>${text_part}</p>`
                    }
                ]
            })
            console.log('Email sent:', JSON.stringify(result.body, null, 2))      
            return result.body
        } catch (e) {
            return "Failed to send the email"
            console.log('Email error:', e)
        }
    }
})

const WeatherTool = tool({
    name: 'get_weather',
    description: 'use this to fetch the latest weather updates',
    parameters: z.object({
        city: z.string().describe("name of the city")
    }),
    async execute({ city }) {
        //
        const response = await axios.get(`https://wttr.in/${city}?format=%C+%t`);
        console.log("response from axios is : ", response.data)
        return response.data
    }
})

async function askForUserConfitmation(ques: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${ques} (y/n): `);
  const normalizedAnswer = answer.toLowerCase();
  rl.close();
  return normalizedAnswer === 'y' || normalizedAnswer === 'yes';
}


const agent = new Agent({
    name: 'Weather Agent',
    instructions: 'You are an expert weather assistant',
    tools: [WeatherTool, sendEmailTool],
    outputType: WeatherResponseSchema
})

const main = async (query = '') => {
    let result = await run(agent, query)
    console.log("i came back")
    let hasInteruptions = result.interruptions.length > 0
    while (hasInteruptions) {
    const currentState = result.state;
    for (const interput of result.interruptions) {
      if (interput.type === 'tool_approval_item') {
        const isAllowed = await askForUserConfitmation(
          `Agent ${interput.agent.name} is asking for calling tool ${interput.rawItem.name} with args ${interput.rawItem.arguments}`
        );
        if (isAllowed) {
          currentState.approve(interput);
        } else {
          currentState.reject(interput);
        }
        result = await run(agent, currentState);
        hasInteruptions = result.interruptions?.length > 0;
      }
    }
  }
}

main("What is the weather condition in Delhi and London? and send an email to mibox2205@gmail.com")