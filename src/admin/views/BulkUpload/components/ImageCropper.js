import React from "react";
import { Button, Card, CardHeader, CardBody, CardFooter, Row, Col } from "reactstrap";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";

class ImageCropper extends React.Component {
  state = {
    imageElement: React.createRef(),
    image: this.props.image,
    cropper: {},
  };

  onSubmit = () => {
    const finalImage = this.state.imgDes; //eslint-disable-line
    this.props.onCrop({
      ...this.state.image,
      src: finalImage,
    });
  };

  componentDidMount() {
    console.log(this.state.imageElement);
    const cropper = new Cropper(this.state.imageElement.current, {
      zoomable: true,
      scalable: true,
      aspectRatio: NaN,
      crop: () => {
        const canvas = cropper.getCroppedCanvas();
        this.setState({ imgDes: canvas.toDataURL() });
      },
    });
    this.setState({
      cropper,
      image: this.props.image,
    });
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <Row>
            <Col>Card title</Col>
            <Col>
              <Button className="float-right" onClick={this.props.onCancel} size="sm" color="danger">
                <i className="fa fa-remove" />
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <Row>
            <Col>
              <img className="img-fluid" ref={this.state.imageElement} src={this.state.image.src} alt="source" />
            </Col>
            <Col>
              <img className="img-fluid" src={this.state.imgDes} alt="Destination" />
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="w-100 text-center">
          <Button onClick={this.props.onCancel} className="float-left m-2" size="sm" color="warning">
            Cancel
          </Button>
          <Button onClick={() => this.state.cropper.crop()} className="m-2" size="sm" color="info">
            <i className="text-white fa fa-crop" />
          </Button>
          <Button onClick={() => this.state.cropper.rotate(-90)} className="m-2" size="sm" color="info">
            <i className="text-white fa fa-rotate-left" />
          </Button>
          <Button onClick={() => this.state.cropper.rotate(90)} className="m-2" size="sm" color="info">
            <i className="text-white fa fa-rotate-right" />
          </Button>
          <Button onClick={this.onSubmit} className="float-right m-2" size="sm" color="success">
            Complete
          </Button>
        </CardFooter>
      </Card>
    );
  }
}

export default ImageCropper;
