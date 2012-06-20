function NetworkEngine()
{
    this.connection=null;
    this.port=process.env.PORT;
    console.log(this.port);
}
NetworkEngine.prototype.connect=function()
{
    this.connection=require("socket.io").listen(27069);
}
NetworkEngine.prototype.load=function()
{
    this.connection.on('connection', 
        function(socket)
        {
            socket.emit('CONNECTION', {state:true});
            
            socket.on('ECHO', 
                function(data)
                {
                    socket.emit('ECHO', data);
                
                }
            );
            socket.on('update',
                function(data)
                {
                    socket.broadcast.emit('update', data);
                }
            );
        }
    );
    
}

function DataBase(name)
{
    this.data=new Array();
    this.name=name;
}
DataBase.prototype.store=function(key, data)
{
    this.data[key]=data;
}


var network=new NetworkEngine();
network.connect();
network.load();
