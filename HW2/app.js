//set constants and requirements
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 8080;
const API_KEY_UV = "openuv-1ov8rmg4m8hyl-io";

//establish middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//routes to pages
app.get('/', (req, res) => {
  res.render("home");
});

app.get('/uvform', (req, res) => {
  res.render("form"); 
});

//submission for long and lat coordinates
app.post('/getuv', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    //access uv data from api
    const response = await axios.get(`https://api.openuv.io/api/v1/uv`, {
      headers: {
        'x-access-token': API_KEY_UV
      },
      params: {
        lat: latitude,
        lng: longitude
      }
    });
    
    //set constants for results and advice outputs
    const uvData = response.data;
    const uvIndex = uvData.result.uv;

    //if statement to determine safety advice based on the uv index
    let uvAdvice = "";
    if (uvIndex !== undefined && uvIndex !== null) {
      if (uvIndex >= 0 && uvIndex < 3) {
        uvAdvice = "Low risk for UV exposure. No precautions needed to maintain safety.";
      } else if (uvIndex < 6) {
        uvAdvice = "Moderate risk for UV exposure. Take precautions, apply sunscreen.";
      } else if (uvIndex < 8) {
        uvAdvice = "High risk for UV exposure. Stay inside or apply strong sunscreen and seek shade.";
      }
      else
      {
        uvAdvice = "Extreme risk for UV exposure. Avoid going outside.";
      }
    }

    //render the out page
    res.render("out", { uvData, uvAdvice, error: null });
  } catch (error) {
    //handle potnential errors
    console.error("Error fetching UV data:", error);
    res.render("out", { uvData: null, uvAdvice: null, error: "Failed to fetch UV data. Please try again." });
  }
});


//start server console log
app.listen(port, () => {
  console.log(`UV app is listening at http://localhost:${port}`);
});
