import OpenAI from 'openai';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import readline from 'readline';
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join("/Users/qtipschool/Desktop/QuinBOT", "template"));


//allows retrieval of APIKey from .env file
dotenv.config();


const openai = new OpenAI({
    
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });



app.use(bodyParser.json());
app.use(cors());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//shuts down the server when stop is entered
rl.setPrompt('Type "stop" to exit: ');

rl.on('line', (input) => {
  if (input.trim().toLowerCase() === 'stop') {
    console.log('Exiting...');
    rl.close();
    process.exit(0);
  } 
  else {
    console.log(`You entered: ${input}`);
    rl.prompt();
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname)));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}
  
app.get("/", (request, response) => { 
  response.render("index");
});

app.post("/",async (req,res) => {

    const {messages} = req.body
    console.log(messages)
    
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        
        messages: [
            {"role": "system", "content": "You are QuinBOT, a helpful assistant to help create resumes"},
            ...messages
            
            //{role: "user", content: `${message}`}
        ],
      });

    res.json({
        completion: completion.choices[0].message
    })

});

console.log(openai.apiKey)
process.stdout.write(`Web server running at http://localhost:${port}\n`);
app.listen(port)
    
