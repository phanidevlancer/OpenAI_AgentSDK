import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents'
import { z } from 'zod'



const executeSQL = tool({
    name: 'execute_sql',
    description: 'this executes the sql query',
    parameters: z.object({
        sql: z.string().describe('this is a executable sql query')
    }),
    execute: async function ({ sql }) {
        console.log("Executing the sql query : ", sql)
        return 'done'
    }
})

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
    tools: [executeSQL]
})

async function runAgent(query = '') {
    const result = await run(sqlAgent, query,{
        conversationId : "conv_69d7292ffeb481959737960db4abbbf20f46d9f416f28c29" // all the messages are stored in this coversion id, so agent will be able to revert the past message and can be used as history
    })
    console.log("Agent response ----> ", result.finalOutput)
}


runAgent("Hi my name is Phanindra").then((result) => {
    runAgent("get me all the users with my name")
})

