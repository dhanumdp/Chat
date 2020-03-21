//const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const client = require('socket.io').listen(4000).sockets;


//db connection

mongoose.connect('mongodb://localhost:27017/Chat', { useUnifiedTopology: true ,   useNewUrlParser: true  }, (err,db)=>{
    if(err)
    {
        console.log(err);
    }
    else
    {
      
      //connect to socket io
        client.on('connection', ()=>{
            var chat = mongoose.connection.db.collection('Chats');
            //create function to send status

            sendStatus = (s)=>{
                    socket.emit('Stautus ',s);
            }

            //get chats from collection
            chat.find().limit(100).sort({_id : 1}).toArray((err,result)=>{
                if(err)
                    console.log(err)
                else
            {
                socket.emit('output ', result);
            }
            }); 

            //handle input events

            socket.on('input',(data)=>{
                let name = data.name;
                let message = data.message;

                //check for name and message
                if(name == '' || message == '')
                  {
                    //send error status    
                    sendStatus('Please enter a name and message');
                     }
                     else
                    {
                        //insert message
                        chat.insert({name : name, message : message}, ()=>{
                            client.emit('output', [data]);

                            //send status object
                            sendStatus({
                                message : 'Message Sent',
                                clear : true
                            });
                        })
                    }
            });

            //handle clear

            socket.on('clear', (data)=>{
                //remove all chats from collection

                chat.remove({}, ()=>{
                    //emit cleared 
                    socket.emit('cleared');
                });
            })

        })
        console.log('Db Connected');
    }
})

