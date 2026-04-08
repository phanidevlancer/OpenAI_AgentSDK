import 'dotenv/config'
import { Agent, tool, run } from '@openai/agents'
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import { z } from 'zod'
import fs from 'fs/promises'


const plans = [
    { plan_id: 1, plan_name: 'Starter pack', price: 399, speed: "30 Mbps", quota: '500Gb' },
    { plan_id: 2, plan_name: 'Pro pack', price: 799, speed: "100 Mbps", quota: 'Unlimited' },
    { plan_id: 3, plan_name: 'Pro+ pack', price: 1199, speed: "200 Mbps", quota: 'Unlimited' }
]

const fetchAvailablePlans = tool({
    name: 'fetch_available_plans',
    description: 'fetches the available plans for the internet',
    parameters: z.object({}),
    execute: async function () {
        return plans
    }
})



const refundTool = tool({
    name: 'refund_tool',
    description: 'Tool for processing user refunds',
    parameters: z.object({
        customerId: z.string().describe("Id of the customer"),
        reasonForRefund: z.string().describe("Reason of the customer requesting for refund")
    }),
    execute: async function ({ customerId, reasonForRefund }) {
        await fs.appendFile(
            './refunds.txt',
            `Refund for customer id : ${customerId} has been processed, Reason : ${reasonForRefund} \n`,
            'utf-8'
        )
        return { refundIssued: true }
    }
})

const refundAgent = new Agent({
    name: 'Refund Agent',
    instructions: 'You are an expert refund agent, who understands user query and process the user refund gracefully',
    tools: [refundTool]

})


const salesAgent = new Agent({
    name: 'sales agent',
    instructions: `You are an expret sales agent for a internet broadband company named Beyond Internet.
    Talk to the user and help them with what they need`,
    tools: [fetchAvailablePlans, refundAgent.asTool({
        toolName: 'refund expert',
        toolDescription: 'handles user refunds gracefully'
    })]
})


const customerFacingAgent = new Agent({
    name: "Customer facing agent",
    instructions: `${RECOMMENDED_PROMPT_PREFIX}
            You are an expert customer-facing agent who understands user queries and gracefully handoff their request to the respective agents.
        You have two different agents: 
            1. sales agent - One is a sales agent who is expert in handling onboarding new customers, helping them understand the existing plans, and helping them choose the better plan.
            2. Refund Agent - There is another agent who is expert in issuing user refunds when the users are not happy with the service.`,
    handoffDescription: `You are an expert customer-facing agent who understands user queries and gracefully handoff their request to the respective agents.
        You have two different agents:
            1. sales agent - One is a sales agent who is expert in handling onboarding new customers, helping them understand the existing plans, and helping them choose the better plan.
            2. Refund Agent - There is another agent who is expert in issuing user refunds when the users are not happy with the service.`,
    handoffs : [salesAgent,refundAgent]
})


async function runAgent(query = "") {
    const agentResponse = await run(customerFacingAgent, query)
    console.log("Reply ----> ", agentResponse.finalOutput)
}


runAgent("Can you please let me know your current plans which has unlimited usage?")

// runAgent("I have a 399 plan and i am not happy with the service as it keeps disconnecting every now and then, i would need a refund and my customer id is II-29")





