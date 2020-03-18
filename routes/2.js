'use strict';

const bod = require('body-parser');
const request = require('request');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = '1de343cf28864fa0aa613f8b41202864';


   function blobFace(username){

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
    return faceId1;
  })

}
function checkFace(face){
  var f = face.replace('data:image/jpeg;base64,','');
  let buffer = new Buffer(f, 'base64');
  console.log(f)
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
    return faceId2;
  })


}
  function verify(faceArray){


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
        console.log('CERIFY\n');
        console.log(jsonResponse);
        if(jsonResponse.isIdentical == "true"){
          console.log("IS IDENTICAL");
          identical = true;
        }
      })

      return identical;
  }

  var data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAA..kJggg==';



async function contain(username, face){
  var match = false;
  const id1 = await blobFace(username);
  const id2 = await checkFace(face);
  match = verify([id1, id2]);



return match;
}

module.exports = contain;
