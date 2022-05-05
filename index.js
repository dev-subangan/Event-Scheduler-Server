const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const fetch = require("node-fetch");

const app = express();
require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());

const googleClientId = "195137529227-a9femedfikklgba08dloanp1uvu55qjj.apps.googleusercontent.com";
const googleClientSecret = "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";
const redirectUri = "http://localhost:8080/handleGoogleRedirect";

const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri
);

app.post("/generateAuthLink", cors(), (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
        prompt: "consent",
    });
    res.send({ url });
});

app.get("/handleGoogleRedirect", async (req, res) => {
    oauth2Client.getToken(req.query.code, (err, tokens) => {
        if (err) {
            throw new Error(err.message);
        }
        res.redirect(
            `http://localhost:3000?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`
        );
    });
});

app.post("/getToken", async (req, res) => {
    try {
        const request = await fetch(
            "https://www.googleapis.com/oauth2/v4/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client_id: googleClientId,
                    client_secret: googleClientSecret,
                    refresh_token: req.body.refreshToken,
                    grant_type: "refresh_token",
                }),
            }
        );

        const data = await request.json();

        res.json({ accessToken: data.access_token });

    } catch (error) {
        res.json({ error: error.message });
    }
});

app.listen(8080, () => console.log("server running on port 8080"));