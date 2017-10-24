import React from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import uuid from 'uuid/v4';

import moment from 'moment';

import { connect } from 'react-redux';

import AWS from 'aws-sdk';
var albumBucketName = 'climbing-kd';
var bucketRegion = 'eu-west-1';
var IdentityPoolId = 'eu-west-1:ffdcc2f5-641f-4ee8-8270-b4a8f508f60a';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

class WallEditorComponent extends React.Component {

  createAlbum = (albumName) => {
    albumName = albumName.trim();
    if (!albumName) {
      return alert('Album names must contain at least one non-space character.');
    }
    if (albumName.indexOf('/') !== -1) {
      return alert('Album names cannot contain slashes.');
    }
    var albumKey = encodeURIComponent(albumName) + '/';
    s3.headObject({Key: albumKey}, function(err, data) {
      if (!err) {
        return alert('Album already exists.');
      }
      if (err.code !== 'NotFound') {
        return alert('There was an error creating your album: ' + err.message);
      }
      s3.putObject({Key: albumKey}, function(err, data) {
        if (err) {
          return alert('There was an error creating your album: ' + err.message);
        }
        alert('Successfully created album.');
      });
    });
  }

  createWall = (data) => {
    const body = new FormData();
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        body.append(key, data[key]);
      }
    }

    fetch('http://Karina-MacBookPro.local:3000/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${this.props.auth.token}`
      },
      body
    })
  }

  state = {
    name: '',
    path: '',
    difficulty: '',
    gym: '',
    image: '',
  }

  handleChanges = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleGymChange = (e, index, value) => {
    this.setState({
      "gym": value
    })
    console.log(value);
  }

  handleCategoryChange = (e, index, value) => {
    this.setState({
      "difficulty": value
    })
    console.log(value);
  }

  handleSubmit = (e) => {
    // this.createAlbum('walls');
    // console.log("state when we SET THE ROUTE", this.state);
    // if (!this.state.path) {
    //   this.state.path = 'http://www.planet-rock.com/wp-content/uploads/2017/08/MoonBoard.jpg'
    // }
    this.createWall({
      name: this.state.name,
      // path: this.state.path,
      difficulty: this.state.difficulty,
      gym: this.state.gym,
      date: moment(),
      image: this.state.image
    })
  }

  handlePath = (event) => {
    this.setState({
      image: event.target.files[0]
    })
    // let location;
    // var files = event.target.files;
    // if (!files.length) {
    //   return alert('Please choose a file to upload first.');
    // }
    // var file = files[0];
    // var fileName = uuid();
    // var albumPhotosKey = 'walls/';
    // var photoKey = albumPhotosKey + fileName;
    // console.log({
    //   photoKey,
    //   file,
    // });
    // s3.upload({
    //   Key: photoKey,
    //   Body: file,
    //   ACL: 'public-read'
    // }, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //     return console.error('There was an error uploading your photo: ', err.message);
    //   }
    //   console.log('Successfully uploaded photo.', data.Location, this.state);
    //   this.setState({
    //     "path": data.Location
    //   });
    // });
    // console.log("tets",this);
    // // this.setState({
    // //   "path": location
    // // })
  }

  render () {
    const styles = {
      button: {
        margin: 12,
        fontFamily: 'Audiowide'
      },
      exampleImageInput: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
      },
    };
    return (
      <div className="WallEditor">
        <div className="Title">
          <h2>
            Customize your route
          </h2>
        </div>
        <TextField
          hintText="Plastic tortilla"
          floatingLabelText="Choose route name"
          id="inputName"
          name="name"
          value={this.state.name}
          onChange={this.handleChanges}
        /><br />
        <RaisedButton
          label="Choose an Image"
          labelPosition="before"
          style={styles.button}
          containerElement="label"
        >
          <input
            id="files"
            type="file"
            ref="image"
            style={styles.exampleImageInput}
            onChange={this.handlePath}
          />
        </RaisedButton>
        <br />
        <SelectField
          floatingLabelText="Choose gym name"
          value={this.state.gym}
          onChange={this.handleGymChange}
          name="gym"
        >
          <MenuItem value={"Sharma Climbing BCN"} primaryText="Sharma Climbing BCN" />
          <MenuItem value={"Deu Dits"} primaryText="Deu Dits" />
          <MenuItem value={"Climbat La Foixarda"} primaryText="Climbat La Foixarda" />
        </SelectField> <br />
        <SelectField
          floatingLabelText="Choose Category"
          value={this.state.category}
          onChange={this.handleCategoryChange}
          name="category"
        >
          <MenuItem value={"6a"} primaryText="6a" />
          <MenuItem value={"7a"} primaryText="7a" />
          <MenuItem value={"8a"} primaryText="8a" />
        </SelectField> <br />
        <RaisedButton label="Set the route!" fullWidth={true} primary={true} onClick={this.handleSubmit} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

const mapDispatchToProps = (dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(WallEditorComponent);
