import React from 'react';
import { StyleSheet, Text, View, Vibration, Alert, TextInput, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as MediaLibrary from 'expo-media-library';
import * as FaceDetector from 'expo-face-detector';
import { Camera } from 'expo-camera';
import base64ToArrayBuffer from 'base64-arraybuffer';
import prompt from 'react-native-prompt-android';
import {decode as atob, encode as btoa} from 'base-64'
import axios from 'axios';
import b64 from './components/Basesixfour';

const key = '23fdf44e6c2940efbea2f9df0bb39d11';
const loc = 'centralindia.api.cognitive.microsoft.com'; 

const base_instance_options = {
  baseURL: `https://${loc}/face/v1.0`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': key
  }
};

class Inputs extends React.Component {
  state = {
     enrollmentId: '',
     professorIdentifier: '',
     showApp: false
  }
  handleEnrollmentId = (text) => {
     this.setState({ enrollmentId: text })
  }
  handleProfessorIdentifier = (text) => {
     this.setState({ professorIdentifier: text })
  }
  submitDetails = async (details) => {
    const data = details;
    const options = {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`
      },
      body: JSON.stringify(data)
    }
    fetch('http://localhost:3000',options)
      .then(resp => {
        if(resp == 'ok') {
          Alert.alert('Attendance Successfully marked', 'Please Exit the app now');
        }
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Attendance Successfully marked', 'Please Exit the app now');
       // Alert.alert('Something went wrong', 'Please try again from the beginning',[{ text: 'OK', onPress: () => this.setState({showApp: true}) }],{ cancelable: false });
      })
  }  
  login = (enrollmentId, professorIdentifier) => {
    // alert('email: ' + email + ' password: ' + pass)
      const details = {
        'teacherID' : professorIdentifier,
        'studentID' : enrollmentId
      }
      this.submitDetails(details);
  }
  render() {
    const { showApp } = this.state;
    if(showApp) return <App/>
     return (
        <View style = {styles.container1}>
           <TextInput style = {styles.input}
             // underlineColorAndroid = "transparent"
              placeholder = "Enter your enrollment number"
              placeholderTextColor = "#7a42f4"
              autoCapitalize = "none"
              onChangeText = {this.handleEnrollmentId}/>
           
           <TextInput style = {styles.input}
              //underlineColorAndroid = "transparent"
              placeholder = "Enter the id provided by prof."
              placeholderTextColor = "#7a42f4"
              autoCapitalize = "none"
              onChangeText = {this.handleProfessorIdentifier}/>
           
           <TouchableOpacity
              style = {styles.submitButton}
              onPress = {
                 () => this.login(this.state.enrollmentId, this.state.professorIdentifier)
              }>
              <Text style = {styles.submitButtonText}> Submit </Text>
           </TouchableOpacity>
        </View>
     )
  }
}

export default class App extends React.Component {
  state = {
      hasCameraPermission: null,
      hasCameraRollPermissions: null,
      faces : [],
      faceDetecting: true,
      //showsPrompt: false,
      enrollid: null,
      askDetails: false
    }
    async componentWillMount() {
       const { status } = await Permissions.askAsync(Permissions.CAMERA);
       const { cameraRollStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
       this.setState({
         hasCameraPermission:status === 'granted',
         hasCameraRollPermissions:cameraRollStatus === 'granted'
        });
    }

    renderFaces = () => 
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>

    //promptUser = () => this.setState({showsPrompt: true})

    renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    );
  }

  askDetails = () => {
    //Alert.alert("wow you reached this stage aaryan.")
    this.setState({askDetails:true})
  }

  handleFacesDetected = async ({ faces }) => {
    if(faces.length > 0){
      console.log('Face detected by camera! (local)');
      this.detectFaces(false);
      this.setState({ faces });
      this.takePicture();
    }
  };

  takePicture = async () => {
    this.setState({
      pictureTaken: true,
    });
    if (this.camera) {
     // this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
     this.camera.takePictureAsync({ quality: 0.3, base64: true, onPictureSaved: this.onPictureSaved });
  }
}

  onPictureSaved = async (data) => {
    // const asset = await MediaLibrary.createAssetAsync(data.uri);
    // console.log('asset', asset);
    // MediaLibrary.createAlbumAsync('MyFace', asset)
    //   .then(() => {
    //     //this.detectFaces(true);
    //     Vibration.vibrate();
    //   })
    //   .catch(error => {
    //     // this.detectFaces(true);
    //     // Vibration.vibrate();
    //     console.log(error);
    //     Alert.alert(error);
    //   });
    console.log('Inside onPictureSaved');
    // console.log(decodedData)
    // const selfie_ab = base64ToArrayBuffer.decode(data); 
    function _base64ToArrayBuffer(data) {
      var binary_string = b64.atob(data.base64);
     // console.log(binary_string)
      var len = binary_string.length;
      var bytes = new Uint8Array(new ArrayBuffer(len));
      for (var i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes;
    }
    var selfie_ab;
    try {
     selfie_ab = _base64ToArrayBuffer(data);
  } catch (e) {
    Alert.alert("error","There was some error please try again.",[{ text: 'OK', onPress: () =>{
      this.detectFaces(true);
      this.setState({
        faces: []
      })} }],{ cancelable: false });
    console.log(e);
      //Alert.alert(err)
      
  }
     //console.log(/*'data = ',*/ selfie_ab /*,' About to be sent to face api'*/)
      if(selfie_ab && selfie_ab.length)
     {
       try {
      const facedetect_instance_options = { ...base_instance_options };
      facedetect_instance_options.headers['Content-Type'] = 'application/octet-stream';
      //const facedetect_instance = axios.create(facedetect_instance_options);
      //console.log(facedetect_instance_options)
      const facedetect_res = await axios.post(
        `/detect?returnFaceId=true&detectionModel=detection_02`,
        selfie_ab,
        facedetect_instance_options
      );

      console.log("face detect res: ", facedetect_res.data);

      if (facedetect_res.data.length) {

        const findsimilars_instance_options = { ...base_instance_options };
        findsimilars_instance_options.headers['Content-Type'] = 'application/json';
        //const findsimilars_instance = axios.create(findsimilars_instance_options);
        const findsimilars_res = await axios.post(
          `/findsimilars`,
          {
            faceId: facedetect_res.data[0].faceId,
            faceListId: 'sample1',
            maxNumOfCandidatesReturned: 2,
            mode: 'matchPerson'
          },
          findsimilars_instance_options
        );

        console.log("find similars res: ", findsimilars_res.data);

        if (findsimilars_res.data.length) {

          //Alert.alert("Found match!", "You've successfully attended!");
          console.log('face actually detected')
          this.askDetails();

        } else {
          Alert.alert("No match found", "Sorry, you are not registered. Please ask your professor to add your face in the database");
          console.log('face not recognised in so many faces in face api')
          //this.askDetails();
        }

      } else {
        Alert.alert("error", "Retake photo in bright light",[{ text: 'OK', onPress: () => {
        this.detectFaces(true);
        this.setState({
          faces: []
        })  
        } }],{ cancelable: false });
        
      }

     } catch (err) {
      console.log(err);
      //Alert.alert(err)
      this.detectFaces(true);
      this.setState({
        faces: []
      })
    }
  } else {
    Alert.alert('could not convert pic into array buffer',[{ text: 'OK', onPress: () => {this.detectFaces(true);
      this.setState({
        faces: []
      })} }],{ cancelable: false })
    
  }
  }

  detectFaces = (doDetect) => {
    this.setState({
      faceDetecting: doDetect,
    });
  }

  render() {
    const { hasCameraPermission, faces, faceDetecting, askDetails } = this.state;
    
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else if(askDetails == true) {
      return <Inputs/>
    } else {
      return (
        <View style={styles.container}>
          <Camera
             style={styles.camera}
             type={'front'}
             onFacesDetected={faceDetecting ? this.handleFacesDetected : undefined}
             faceDetectorSettings={{
               mode: FaceDetector.Constants.Mode.accurate,
               detectLandmarks: FaceDetector.Constants.Mode.none,
               runClassifications: FaceDetector.Constants.Classifications.all
             }}
             ref={ref => { this.camera = ref }}>
              <View style={styles.topBar}>
                <Text style={styles.textcolor}>x: {this.state.faces.length ? this.state.faces[0].bounds.origin.x.toFixed(0) : 0}</Text>
                <Text style={styles.textcolor}>y: {this.state.faces.length ? this.state.faces[0].bounds.origin.y.toFixed(0) : 0}</Text>
              </View>
              <View style={styles.bottomBar}>
                <Text style={styles.textcolor}>Heigth: {this.state.faces.length ? this.state.faces[0].bounds.size.height.toFixed(0) : 0}</Text>
                <Text style={styles.textcolor}>width: {this.state.faces.length ? this.state.faces[0].bounds.size.width.toFixed(0) : 0}</Text>
              </View>
              <View>
                <Text style={{ color: '#FFF' }}>{`Faces in view: ${faces.length}`}</Text>
                </View>
             </Camera>
             { faceDetecting && this.state.faces.length ? this.renderFaces() : undefined}
           
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  container1: {
    paddingTop: 23
 },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight+1,
  },
  bottomBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  face: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 1,
    position: 'absolute',
    borderColor: '#808000',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  faceText: {
    color: '#32CD32',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  textcolor:{
    color: '#ffffcc',
  },
  input: {
    margin: 15,
    height: 40,
    borderColor: '#7a42f4',
    borderWidth: 1
 },
 submitButton: {
    backgroundColor: '#7a42f4',
    padding: 10,
    margin: 15,
    height: 40,
 },
 submitButtonText:{
    color: 'white'
 }
});