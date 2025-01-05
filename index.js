import OpenAI from 'openai';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import readline from 'readline';

import bcrypt from 'bcrypt';


import { MongoClient } from 'mongodb';
import { ServerApiVersion } from 'mongodb';
const uri = `mongodb+srv://quin10b:Cooldudes12$@cluster0.413gp0l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const databaseAndCollection = {db: "LoginCredentials", collection:"LoginCollection"};



//allows retrieval of APIKey from .env file
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'template'));

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname));


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const userInfo = {
  name: '',
  graduationDate: '',
  education: '',
  experience: '',
  skills: ''
};

const resumePrompts = [
  "What is your full name?",
  "When did you/will you graduate?",
  "What is your educational background?",
  "What is your work experience?",
  "What are your key skills?"
];

let currentPromptIndex = 0;


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


app.get("/", (req, res) => { 
  res.render("index1");
});


app.post("/", async (req,res) => {
    const {messages} = req.body
    console.log(messages)

    const userResponse = messages[messages.length - 1].content;
    // Store the response in the appropriate field
    switch(currentPromptIndex) {
        case 0:
            userInfo.name = userResponse;
            break;
        case 1:
            userInfo.graduationDate = userResponse;
            break;
        case 2:
            userInfo.education = userResponse;
            break;
        case 3:
            userInfo.experience = userResponse;
            break;
        case 4:
            userInfo.skills = userResponse;
            break;
    }
    let aiResponse;
    if (currentPromptIndex < resumePrompts.length - 1) {
        // If we haven't asked all questions, get the next prompt
        currentPromptIndex++;
        aiResponse = resumePrompts[currentPromptIndex];
    } else {
        // All information collected, generate resume
        aiResponse = `Thank you! I'll now create your resume using this information:
        Name: ${userInfo.name}
        Graduation Date: ${userInfo.graduationDate}
        Education: ${userInfo.education}
        Experience: ${userInfo.experience}
        Skills: ${userInfo.skills}
        
        Let me generate a professional resume format for you...`;
        
        // Here you could add logic to generate the actual resume
        // Reset the prompt index for the next user
        currentPromptIndex = 0;
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        
        messages: [
          {
            "role": "system",
            "content": "You are ResumeGenie, a helpful assistant to help create resumes"
        },
        ...messages,
        {
            "role": "assistant",
            "content": aiResponse
        }
        ],
      });


    res.json({
        completion: completion.choices[0].message
    })

});

app.post("/createAccount", (req, res) => { 
  
  const login = {
      email: req.body.email,
      password: req.body.password
  }
  addAccount(client, databaseAndCollection, login);
  res.render('index1');
});


app.post('/login', async (req, res) => {
  // await client.connect()
  // let filter = {email: req.body.email};
  // const user = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
  // await client.close();

  // if (user) {
  //   const result = req.body.password === user.password;
  //   if (result) {
  //     res.render("indexx");
  //   } else {
  //     res.status(400).json({ error: "password doesn't match" });
  //   }
  // }
  // else{
  //   res.status(400).json({ error: "User doesn't exist" });
  // }

  res.render('indexx');
});



async function addAccount(client, databaseAndCollection, login) {
  await client.connect();
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(login);
  await client.close();
}

app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
  // Initialize by setting the first prompt
  currentPromptIndex = 0;
});
    
