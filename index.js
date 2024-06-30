const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.text({ type: 'application/xml' }));

const testUsername = process.env.TEST_USERNAME;
const testPassword = process.env.TEST_PASSWORD;
const testHotelCode = process.env.TEST_HOTEL_CODE;

app.post('/api/reservation', (req, res) => {
  const xml = req.body;

  xml2js.parseString(xml, (err, result) => {
    if (err) {
      console.error('Invalid XML', err);
      return res.status(500).send('<OTA_HotelResNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" Version="1.0" TimeStamp="2022-08-01T09:30:47+08:00"><Errors><Error Type="6" Code="497">Invalid XML</Error></Errors></OTA_HotelResNotifRS>');
    }

    const { Envelope } = result['soap-env:Envelope'];
    const { Username, Password } = Envelope[0]['soap-env:Header'][0]['wsse:Security'][0]['wsse:UsernameToken'][0];
    const hotelCode = Envelope[0]['soap-env:Body'][0]['OTA_HotelResNotifRQ'][0]['HotelReservations'][0]['HotelReservation'][0]['UniqueID'][0]['_'];

    if (Username[0] !== testUsername || Password[0] !== testPassword) {
      return res.status(401).send('<OTA_HotelResNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" Version="1.0" TimeStamp="2022-08-01T09:30:47+08:00"><Errors><Error Type="6" Code="497">Invalid Username and/or Password</Error></Errors></OTA_HotelResNotifRS>');
    }

    if (hotelCode !== testHotelCode) {
      return res.status(400).send('<OTA_HotelResNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" Version="1.0" TimeStamp="2022-08-01T09:30:47+08:00"><Errors><Error Type="6" Code="400">Invalid Hotel Code</Error></Errors></OTA_HotelResNotifRS>');
    }

    console.log('Received OTA_HotelResNotifRQ:', result);
    res.send('<OTA_HotelResNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" Version="1.0" TimeStamp="2022-08-01T09:30:47+08:00"><Success/></OTA_HotelResNotifRS>');
  });
});

app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
