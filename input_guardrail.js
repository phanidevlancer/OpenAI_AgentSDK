import "dotenv/config"
import { Agent, run, tool,InputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from 'zod'
import { ca } from "zod/locales";



const mathsGuardrailAgent = new Agent({
    name: 'Math Guardrail agent',
    instructions: "You are an expert guardrail agent who will analyze and confirm if the question is related to maths or not. Be strict; even if a partial part of the question is maths and the other part is still not, it should not be considered a maths question. ",
    outputType: z.object({
        isMathsQuestion: z.boolean().describe("Confrim the question is related to maths or not"),
        reason: z.string().describe("reason if false, or empty if true")
    })
})


const mathsGuardrail = {
    name: 'maths homework guardrail',
    execute: async ({ input }) => {
        const response = await run(mathsGuardrailAgent, input)
        console.log("-------------> ", response.finalOutput)
        return {
            reason: response.finalOutput.reason,
            tripwireTriggered: !response.finalOutput.isMathsQuestion,
        };
    }
}

const mathsAgent = new Agent({
    name: "Maths Agent",
    instructions: "You are an expert maths agents who helps to slove any user maths query",
    inputGuardrails: [mathsGuardrail]
})


async function runAgent(query = '') {
    try {
        const result = await run(mathsAgent, query)
        console.log("Agent response : ", result.finalOutput)
    } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log("Guardrail tripped: not a valid maths-only question.");
    } else {
      console.error("Error:", e);
    }
  }
}

runAgent("what is 10 + 19 and who is elon musk?")