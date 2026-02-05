import express from "express"
import routerPasien from "./routes/pasien";
import routerReservasi from "./routes/reservasi";
import routerUser from "./routes/user";
import routerAuth from "./routes/auth";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = 8000;

app.use(express.json());
app.use(cookieParser())

app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true
    }
))

app.use(routerAuth);
app.use(routerPasien);
app.use(routerReservasi);
app.use(routerUser);

app.listen(port, ()=>{
    console.log(`Listening to http://localhost:${port}`);
})

