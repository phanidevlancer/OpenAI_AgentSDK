import 'dotenv/config'
import { OpenAI } from "openai";

const client = new OpenAI()

client.conversations.create({}).then((e) => {
    console.log("Conversation id : ",e)
})

//conv_69d7292ffeb481959737960db4abbbf20f46d9f416f28c29 - created by running this file