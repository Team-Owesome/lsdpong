//Matchmaker Handler
function MatchMaker()
{
	this.rooms=new Array();
}

//Room class
function Room(conifg)
{
	this.roomID=conifg.roomID;
	this.players=new Array();
	this.maxConnections=config.macConnection;
}

//Player class
function Player(id, socket)
{
	this.id=id;
	this.socket=socket;
}