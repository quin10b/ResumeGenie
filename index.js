import OpenAI from 'openai';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

//allows retrieval of APIKey from .env file
dotenv.config();

const openai = new OpenAI({
    
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post("/",async (req,res) => {

    const {message} = req.body
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        
        messages: [
            {"role": "system", "content": "You are QuinBOT"},
            {role: "user", content: `${message}`}],
      });

    res.json({
        completion: completion.choices[0].message
    })


});

app.listen(port,()=>{
    console.log(`Example app listening at http://localhost:${port}`);
});
