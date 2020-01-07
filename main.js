// Määritelmät:

let paikka = null;

// API doc https://api.kirjastot.fi/v3-doc.html
const api = 'https://api.kirjastot.fi/v3/library?';

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

const punainenIkoni = L.divIcon({className: 'punainen-ikoni'});
const vihreaIkoni = L.divIcon({className: 'vihrea-ikoni'});

// Funktiot:

function success(pos) {
  paikka = pos.coords;

  console.log('Your current position is:');
  console.log(`Latitude : ${paikka.latitude}`);
  console.log(`Longitude: ${paikka.longitude}`);
  console.log(`More or less ${paikka.accuracy} meters.`);
  naytaKartta(paikka);
  lisaaMarker(paikka, 'Olet tässä', punainenIkoni);
  haeKirjastot(paikka);
}

function naytaKartta(crd) {
  map.setView([crd.latitude, crd.longitude], 11);
}

function lisaaMarker(crd, teksti, ikoni, kirjasto) {
  L.marker([crd.latitude, crd.longitude], {icon: ikoni}).
  addTo(map).
  bindPopup(teksti).
  openPopup().
  on('popupopen', function(popup) {
    console.log(kirjasto);
  });
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

function haeKirjastot(crd) {
  const parameters = `geo=${crd.latitude},${crd.longitude}&distance=5&distanceunit=km`;
  fetch(api + parameters).then(function(answer) {
    return answer.json();
  }).then(function(tulos) {
    console.log(tulos);
    const kirjastot = tulos.items;
    for (let i = 0; i < kirjastot.length; i++) {
      const teksti = kirjastot[i].name.fi + '<br>' + kirjastot[i].address.street.fi + '<br><a href="' + kirjastot[i].homepage.fi + '">Homepage</a>';
      const koordinaatit = {
        latitude: kirjastot[i].address.coordinates.lat,
        longitude: kirjastot[i].address.coordinates.lon,
      };
      lisaaMarker(koordinaatit, teksti, vihreaIkoni, kirjastot[i]);
    }
  });
}