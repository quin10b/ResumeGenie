 //message history. Holds all the history of the chat
        let messages = []
        
        const chatlog = document.getElementById('chat-log');
        const userInput = document.getElementById('userInput');
        const form = document.querySelector('form');

        //prints the input
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            const userInputText = userInput.value;

            const newMessage = {"role": "user", "content": `${userInputText}`}
            messages.push(newMessage);

            userInput.value = '';

            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add('message--sent');
            
            messageElement.innerHTML= `<div class = "message__input">You: ${userInputText}</div><br>`;
            chatlog.appendChild(messageElement);
            chatlog.scrollTop = chatlog.scrollHeight;
            
            fetch(`http://localhost:3000`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    //sends messages array to the server to get a response.
                    //sends an array rather than a single text because we want it to have history of previous chat logs 
                    messages
                })
            })

            .then(res => res.json())
            .then(data => {
                //pushes the response too so we can have a history of that too
                let aiResponse = {"role": "assistant", "content": `${data.completion.content}`}
                messages.push(aiResponse);
                
                //prints the output
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add('message--received');
                messageElement.innerHTML= `<div class = "message__output">QuinGPT: ${data.completion.content}</div><br>`;
                chatlog.appendChild(messageElement);
                chatlog.scrollTop = chatlog.scrollHeight;
            })
        })
