'use strict';

const bod = require('body-parser');
const request = require('request');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = '1de343cf28864fa0aa613f8b41202864';


  async function blobFace(username){
return new Promise(function(resolve, reject) {
  // Request parameters.
  const params = {
      'returnFaceId': 'true',
      'returnFaceLandmarks': 'false'
  };
  const uriBase = 'https://enterprise.cognitiveservices.azure.com//face/v1.0/detect';

  const imageUrl =
      `https://enterpriseface.blob.core.windows.net/faces/${username}.jpg`;

  const options = {
      uri: uriBase,
      qs: params,
      body: '{"url": ' + '"' + imageUrl + '"}',
      headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key' : subscriptionKey
      }
  };
  let faceId1 = "";

  request.post(options, (error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
    console.log('FACE1\n');
    console.log(jsonResponse);
    const a = JSON.parse(body);
    faceId1=a[0].faceId;
    console.log("ffff" + faceId1);
    resolve(faceId1);
  })
});
}
function checkFace(face){


return new Promise(function(resolve, reject) {
  var f = face.replace('data:image/jpeg;base64,','');
  let buffer = Buffer.from(f, 'base64');

  // Request parameters.
  const params = {
      'returnFaceId': 'true',
      'returnFaceLandmarks': 'false'
  };
  const uriBase = 'https://enterprise.cognitiveservices.azure.com//face/v1.0/detect';
  const imageUrl2 =
      'https://enterpriseface.blob.core.windows.net/faces/test.jpg';
  const options2 = {
      uri: uriBase,
      qs: params,
      body: buffer,
      headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key' : subscriptionKey
      }
  };
  let faceId2 ="";

  request.post(options2, (error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
    console.log('FACE2\n');
    console.log(jsonResponse);
    const a = JSON.parse(body);
    faceId2=a[0].faceId;
    resolve(faceId2);
  })

  });
}
  async function verify(faceArray){
return new Promise(function(resolve, reject) {

    console.log(faceArray + " asdasd")
  const uriBaseVerify = 'https://enterprise.cognitiveservices.azure.com/face/v1.0/verify';

  console.log("sda"+faceArray[0]+ faceArray[1])
      const options3 = {
          uri: uriBaseVerify,
          body: `{"faceId1": "${faceArray[0]}","faceId2": "${faceArray[1]}"}`,
          headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key' : subscriptionKey
          }
      };
      let identical = false;


      request.post(options3, (error, response, body) => {
        if (error) {
          console.log('Error: ', error);
          return;
        }
        let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
        const a = JSON.parse(body);
        console.log('CERIFY\n');
        console.log(a);
        if(a.isIdentical == true){
          console.log("IS IDENTICAL");
          identical = true;
          resolve(identical)
          console.log("identical ="+ identical);
        }
      })
      console.log("identical ="+ identical);
      resolve( identical);
})
  }

  var data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAA..kJggg==';



async function contain(username, face){

  return Promise.all([blobFace(username), checkFace(face)])
  .then(function(values){
   return verify(values);
  })


}

module.exports = contain;
