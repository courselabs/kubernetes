
> http://localhost:30820

k logs -l app=todo-list,component=save-handler

Connecting to message queue url: nats://todo-list-queue:4222
Unhandled exception. NATS.Client.NATSNoServersException: Unable to connect to a server.
   at NATS.Client.Connection.connect()
   at NATS.Client.ConnectionFactory.CreateConnection(Options opts)
   at NATS.Client.ConnectionFactory.CreateConnection(String url)
   at ToDoList.Messaging.MessageQueue.CreateConnection() in /src/messaging/MessageQueue.cs:line 27        
   at ToDoList.SaveHandler.Workers.QueueWorker.Start() in /src/save-handler/Workers/QueueWorker.cs:line 31
   at ToDoList.SaveHandler.Program.Main(String[] args) in /src/save-handler/Program.cs:line 28

k logs -l app=todo-list,component=web --tail 100

---> MySql.Data.MySqlClient.MySqlException (0x80004005): Unable to connect to any of the specified MySQL hosts.  
 ---> System.AggregateException: One or more errors occurred. (Resource temporarily unavailable)
 ---> System.Net.Internals.SocketExceptionFactory+ExtendedSocketException (00000001, 11): Resource temporarily unavailable
   at System.Net.Dns.InternalGetHostByName(String hostName)

   > Check config & secret