import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getIdentifier } from "config/form";
const DropLayout = (props) => (
  <div
    style={{
      height: "40vh",
      textAlign: "center",
      paddingTop: 100,
    }}
  >
    {props.children}
  </div>
);

const ImageDropzone = (props) => {
  const hasFiles = props.selectedFiles.length !== 0;
  const onDrop = useCallback((acceptedFiles) => {
    Promise.all(
      acceptedFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Date.now(),
              src: e.target.result,
              type: file.type,
              name: file.name,
              file: {
                originalname: file.name,
                size: file.size,
                mimetype: file.type,
              },
            });
          };
          reader.readAsDataURL(file);
        }).catch((err) => {});
      })
    ).then((files) => {
      props.setSelectedFiles([
        {
          document: { identifier: getIdentifier() },
          attachments: files,
        },
      ]);
    });
  }, []); //eslint-disable-line react-hooks/exhaustive-deps
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // accept: "image/jpeg, image/png, image/jpg,",
    ...(hasFiles ? { noClick: true, noKeyboard: true } : {}),
  });
  return (
    <div
      {...getRootProps()}
      style={{
        border: "dashed 1px #ccc",
        background: "white",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <DropLayout>
          <h4>Drop here</h4>
        </DropLayout>
      ) : hasFiles ? null : (
        <DropLayout>
          <h5>Drag 'n' drop some files here, or click to select files</h5>
          <img src="img/upload.svg" alt="upload image" width="100" height="100" className="align-center" />
        </DropLayout>
      )}
      {props.children}
    </div>
  );
};

export default ImageDropzone;
