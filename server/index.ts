import express, { Application } from "express";
import http, { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import cors from "cors";

class SocketServer {
    private app: Application;
    private httpServer: Server;
    private io: IOServer;
    private readonly port: number = 3000;

    constructor(port?: number) {
        this.port = port || Number(process.env.PORT) || 3000;
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new IOServer(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.app.use(cors());
        this.configureRouter();
        this.configureSocketEvents();
    }

    private configureSocketEvents(): void {
        this.io.on("connection", (socket: Socket) => {
            console.log("Подключение клиента:", socket.id);

            socket.emit('server-message', `Добро пожаловать! Ваш ID: ${socket.id}`);
            console.log("Отправлено приветствие клиенту:", socket.id);

            socket.broadcast.emit('server-message', 'Пользователь подключился');
            console.log("Уведомление о подключении отправлено всем");

            socket.on("client-message", (message: string) => {
                console.log("Сообщение от", socket.id + ":", message);

                socket.emit("server-message", `Вы: ${message}`);
                console.log("Эхо отправлено отправителю:", socket.id);

                socket.broadcast.emit("server-message", `Пользователь ${socket.id}: ${message}`);
                console.log("Сообщение отправлено всем остальным от", socket.id);
            });

            socket.on("disconnect", () => {
                console.log("Отключение клиента:", socket.id);
                
                socket.broadcast.emit('server-message', 'Пользователь отключился');
                console.log("Уведомление об отключении отправлено всем");
            });
        });
    }

    private configureRouter(): void {
        this.app.get("/", (req, res) => res.send("Server is running"));
    }

    public start(){
        this.httpServer.listen(
        this.port,
        () => console.log(`Listening at :${this.port}`))
    }
}

new SocketServer(3000).start();