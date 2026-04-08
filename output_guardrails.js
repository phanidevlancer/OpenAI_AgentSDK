import 'dotenv/config'
import { Agent, run, OutputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from 'zod'


const sqlOutputGuardrailAgent = new Agent({
    name: 'SQL output checker agent',
    instructions: "You are any agent how validates the out and ensure that the out has a sql query which is save to execute with read only access",
    outputType: z.object({
        isSafe: z.boolean().describe('is query safe to execute'),
        reason: z.string().describe('if safe mention safe to run, if not mention the reason why is it unsafe')
    })
})

const sqlOutputGuardrails = {
    name: 'sql query guardrail',
    execute: async function ({ agentOutput }) {
        console.log("abc ----> ", agentOutput)
        const result = await run(sqlOutputGuardrailAgent, agentOutput.sqlQuery)
        console.log("abc 12 ----> ", result.finalOutput.isSafe)
        return { tripwireTriggered: !result.finalOutput.isSafe }
    }
}

const sqlAgent = new Agent({
    name: 'SQL Agent',
    instructions: `You are an expert sql agent who can help user in generating sql query that user has requested for
    
                    -- users table
                        CREATE TABLE users (
                            id SERIAL PRIMARY KEY,
                            username VARCHAR(50) UNIQUE NOT NULL,
                            email VARCHAR(100) UNIQUE NOT NULL,
                            created_at TIMESTAMP DEFAULT NOW()
                        );

                        -- comments table
                        CREATE TABLE comments (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER REFERENCES users(id),
                            comment_text TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT NOW()
                        );
    `,

    outputType: z.object({
        sqlQuery: z.string().optional().describe('The sql query user has requested')
    }),
    outputGuardrails: [sqlOutputGuardrails],
})


async function runAgent(query = '') {
    try {
        const result = await run(sqlAgent, query)
        console.log("executing command ---> ", result.finalOutput.sqlQuery)
    } catch (e) {
        if (e instanceof OutputGuardrailTripwireTriggered){
            console.log("You are not allowed to run this command")
        }
    }
}


runAgent("delete  all the users")