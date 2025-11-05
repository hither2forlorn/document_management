// import React from "react";
// import { setWatermark, getWatermark } from "./api";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Form,
//   FormGroup,
//   CardFooter,
//   Label,
//   Input,
// } from "reactstrap";
// import { toast } from "react-toastify";
// import CustomCancel from "admin/components/CustomCancel";
// import CustomSubmit from "admin/components/CustomSubmit";

// export default class Watermark extends React.Component {
//   state = {
//     watermark: {},
//     isImage: false,
//   };

//   onChange = (event) => {
//     const watermark = this.state.watermark;
//     const name = event.target.name;
//     const value = event.target.value;
//     switch (name) {
//       case "isImage":
//         watermark[name] = Number(value);
//         break;
//       case "isActive":
//         watermark[name] = Number(value);

//         break;
//       case "image":
//         if (value) {
//           this.parseWatermark((image) => {
//             watermark[name] = image;
//           });
//         }
//         break;
//       case "colorTrans":
//         let color = Number(value).toString(16);
//         if (color.length === 1) {
//           color = "0" + color;
//         }
//         watermark.colorCode = watermark.colorCode.slice(0, 7) + color;
//         break;
//       default:
//         watermark[name] = value;
//         break;
//     }
//     this.setState(
//       {
//         watermark: watermark,
//         isImage: watermark.isImage,
//       },
//       () => {
//         try {
//           document.getElementById("watermark-image").src = new Buffer(
//             this.state.watermark.image
//           ).toString("binary");
//         } catch (err) {}
//       }
//     );
//   };

//   parseWatermark(callback) {
//     const element = document.getElementById("image");
//     if (element) {
//       var filesSelected = element.files;
//       if (filesSelected.length > 0) {
//         var fileToLoad = filesSelected[0];
//         var fileReader = new FileReader();
//         fileReader.onload = function (fileLoadedEvent) {
//           var image = fileLoadedEvent.target.result;
//           document.getElementById("watermark-image").src = new Buffer(
//             image
//           ).toString("binary");
//           callback(image);
//         };
//         fileReader.readAsDataURL(fileToLoad);
//       } else {
//         callback();
//       }
//     } else {
//       callback();
//     }
//   }

//   onSubmit = (event) => {
//     event.preventDefault();
//     setWatermark(this.state.watermark, (err, data) => {
//       if (err) return;
//       if (data.success) {
//         toast.success("Successful!");
//       } else {
//         toast.error("Error!");
//       }
//     });
//   };

//   componentDidMount() {
//     getWatermark((err, data) => {
//       if (err) return;
//       this.setState(
//         {
//           watermark: data.data,
//         },
//         () => {
//           try {
//             if (this.state.watermark.isImage) {
//               document.getElementById("watermark-image").src = new Buffer(
//                 this.state.watermark.image.data
//               ).toString("binary");
//             } else {
//               const color = "0x" + this.state.watermark.colorCode.slice(7, 9);
//               const value = parseInt(color);
//               document.getElementById("colorTrans").value = value;
//             }
//           } catch (err) {}
//         }
//       );
//     });
//   }

//   render() {
//     return (
//       <Card className="shadow" style={{ width: "40%" }}>
//         <CardHeader>
//           <i className="fa fa-adjust" />
//           Watermark
//         </CardHeader>

//         <Form onSubmit={this.onSubmit}>
//           <CardBody>
//             {/* <label className="col-md-4">Type</label>
//             <select
//               className="col-md-8"
//               name="isImage"
//               value={this.state.watermark.isImage}
//               onChange={this.onChange}
//             >
//               <option value="0">Text</option>
//               <option value="1">Image</option>
//             </select>

//             {this.state.watermark.isImage ? (
//               <div className="row">
//                 <label className="col-md-4">Image</label>
//                 <label className="col-md-8 watermark-image-container">
//                   <img
//                     id="watermark-image"
//                     className="watermark-image"
//                     alt="Watermark"
//                   />
//                   <i className="fa fa-upload btn-icon" />
//                   <input
//                     className="hide-input"
//                     id="image"
//                     name="image"
//                     type="file"
//                     accept=".jpg,.jpeg,.png"
//                     onChange={this.onChange}
//                   />
//                 </label>
//               </div>
//             ) : (
//               <div>
//                 <div className="row">
//                   <label className="col-md-4">Text</label>
//                   <input
//                     className="col-md-8"
//                     name="text"
//                     value={
//                       this.state.watermark.text ? this.state.watermark.text : ""
//                     }
//                     onChange={this.onChange}
//                   />
//                 </div>
//                 <div className="row">
//                   <label className="col-md-4">Color</label>
//                   <label className="col-md-8">
//                     <div
//                       style={{
//                         height: 40,
//                         width: 40,
//                         borderRadius: "50%",
//                         background: this.state.watermark.colorCode,
//                       }}
//                     />
//                     <input
//                       className="hide-input"
//                       type="color"
//                       name="colorCode"
//                       value={
//                         this.state.watermark.colorCode
//                           ? this.state.watermark.colorCode
//                           : ""
//                       }
//                       onChange={this.onChange}
//                     />
//                     <input
//                       id="colorTrans"
//                       name="colorTrans"
//                       type="range"
//                       min="00"
//                       max="255"
//                       step="5"
//                       onChange={this.onChange}
//                     />
//                   </label>
//                 </div>
//               </div>
//             )} */}
//             <FormGroup>
//               <Label>Active</Label>
//               <Input
//                 className="rounded"
//                 type="select"
//                 name="isActive"
//                 value={this.state.watermark.isActive ? "1" : "0"}
//                 onChange={this.onChange}
//               >
//                 <option value="1">Yes</option>
//                 <option value="0">No</option>
//               </Input>
//             </FormGroup>
//             <FormGroup>
//               <Label>Text</Label>
//               <Input
//                 className="rounded"
//                 name="text"
//                 value={
//                   this.state.watermark.text ? this.state.watermark.text : ""
//                 }
//                 onChange={this.onChange}
//               />
//             </FormGroup>
//             <FormGroup>
//               <Label>Image</Label>
//               <Input
//                 type="file"
//                 name="images"
//                 id="images"
//                 accept=".jpg,.jpeg,.png"
//                 onChange={this.onChange}
//               />
//             </FormGroup>
//             {/* <FormGroup>
//                             <label className="col-md-4">Color</label>
//                             <label className="col-md-8">
//                                 <div style={{ height: 40, width: 40, borderRadius: "50%", background: this.state.watermark.colorCode }} />
//                                 <input className="hide-input" type="color" name="colorCode" value={this.state.watermark.colorCode ? this.state.watermark.colorCode : ""} onChange={this.onChange} />
//                                 <input id="colorTrans" name="colorTrans" type="range" min="00" max="255" step="5" onChange={this.onChange} />
//                             </label>
//                         </FormGroup> */}
//           </CardBody>
//           <CardFooter className="d-flex justify-content-end">
//             <CustomCancel onClick={() => window.history.back()} />
//             {/* <Button type="submit" size="sm" color="success">
//               Submit
//             </Button> */}
//             <CustomSubmit />
//           </CardFooter>
//         </Form>
//       </Card>
//     );
//   }
// }
