import './App.css';
import React from 'react';
import { PageSizes, PDFDocument, degrees } from 'pdf-lib'
import EXIF from 'exif-js';
import { polyfill } from "mobile-drag-drop";

// optional import of scroll behaviour
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

// options are optional ;)
polyfill({
  // use this to make use of the scroll behaviour
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

window.addEventListener('touchmove', function () { });

const A4 = "A4", Letter = "US Letter", Fit = "Same as Image", Portrait = "Portrait", Landscape = "Landscape", None = "0", Small = "20", Big = "50";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      pageOrientation: Portrait,
      pageSize: A4,
      pageMargin: None,
      lastError: undefined,
      lastMime: undefined,
      forceShowOption: false,
      compressImages: false,
      imageQuality: 8,
      busy: false
    };
    this.fileInput = React.createRef();
  }
  render() {
    let pageWrapper = {
      height: "192px",
      width: "192px",
      border: "none",
      display: "flex",
      background: "var(--surface-card)",
      position: "relative"
    };

    let pageStyle = {
      margin: '0px',
      flex: "1",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center"
    };

    if (this.state.pageMargin === Small) {
      pageStyle.margin = "5px";
    } else if (this.state.pageMargin === Big) {
      pageStyle.margin = "10px";
    }

    if (this.state.pageSize !== Fit) {
      pageWrapper.width = Math.ceil(192 * this.getAspectRatio()) + 'px';
      pageWrapper.boxShadow = "5px 5px 5px rgb(200,200,200)";
    }

    const landing = (
      <div className="landing-page">
        <div style={{ padding: "40px", fontSize: "18px", textAlign: "center" }}>
          Convert JPEG or PNG to PDF â€” <strong>Safe, Secure, Local.</strong>
          <br />
          Your files never leave your device.
        </div>
        <button
          onClick={() => this.fileInput.current.click()}
          className="big-btn"
          style={{ marginTop: "20px", padding: "15px 30px", fontSize: "18px", cursor: "pointer" }}
        >
          Select Images
        </button>


















        <div
          className="dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('drag-over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
            let files = e.dataTransfer.files;
            this.readfiles(files);
          }}
          onClick={() => this.fileInput.current.click()}
        >
          <div>Drag &amp; Drop Images Here</div>
          <small>or click to select files</small>
        </div>
        <input
          type="file"
          multiple
          ref={this.fileInput}
          style={{ display: "none" }}
          onChange={(e) => this.readfiles(e.target.files)}
        />

      </div>


    );





















    const listView = (<div style={{ display: 'flex', flexWrap: 'wrap', flex: "1", justifyContent: "center" }} >
      {this.state.images.map((img, index) => (
        <div
          style={{ padding: "5px" }}
          key={img.id + ""}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', img.id);
            console.log("Drag start " + index);
          }}
          onDrop={(e) => {
            if (e.stopPropagation) {
              e.stopPropagation(); // stops the browser from redirecting.
            }
            let droppedId = e.dataTransfer.getData("text/plain");
            console.log("droppedId: " + droppedId);
            this.handleDrop(droppedId, img.id);
          }}
          onDragOver={(e) => {
            if (e.preventDefault) {
              e.preventDefault(); // stops the browser from redirecting.
            }
          }}
          onDragEnter={(e) => { e.preventDefault(); }}
        >
          <div style={{ ...pageWrapper }}
            onClick={
              (e) => {
                let imgArr1 = [...this.state.images];
                for (let x = 0; x < imgArr1.length; x++) {
                  imgArr1[x] = { ...imgArr1[x], selected: imgArr1[x].id === img.id };
                }
                this.setState({ images: [...imgArr1] });
                e.stopPropagation();
              }
            }
          >
            <div style={{
              display: img.selected ? "block" : "none", position: "absolute",
              right: "0px", top: "0px", padding: "5px", color: "rgb(180,180,180)"
            }} onClick={(e) => { e.stopPropagation(); this.deletePage(img.id); }} ><i className="fa fa-trash" aria-hidden="true"></i></div>
            <div style={{ ...pageStyle, backgroundImage: "url('" + img.imgDataUrl + "')" }}>
            </div>
          </div>
        </div>
      ))}
    </div>);

    const pageMarginSection = (<div>
      <div style={{ paddingBottom: "10px", fontSize: "16px", color: "var(--text-dim)", paddingTop: "20px" }}>Page margin</div>
      <div style={{ display: "flex" }}>
        <div style={{
          flex: "1", height: "50px", display: "flex", flexDirection: "column",
          justifyContent: "center", textAlign: "center",
          background: (this.state.pageMargin === None ? "var(--accent)" : "var(--option-unselected)"),
          color: (this.state.pageMargin === None ? "white" : "var(--text-main)"), padding: "5px"
        }} onClick={() => this.setState({ pageMargin: None })}>None</div>
        <div style={{
          flex: "1", height: "50px", display: "flex", flexDirection: "column",
          justifyContent: "center", textAlign: "center",
          background: (this.state.pageMargin === Small ? "var(--accent)" : "var(--option-unselected)"),
          color: (this.state.pageMargin === Small ? "white" : "var(--text-main)"), padding: "5px"
        }} onClick={() => this.setState({ pageMargin: Small })}>Small</div>
        <div style={{
          flex: "1", height: "50px", display: "flex", flexDirection: "column",
          justifyContent: "center", textAlign: "center",
          background: (this.state.pageMargin === Big ? "var(--accent)" : "var(--option-unselected)"),
          color: (this.state.pageMargin === Big ? "white" : "var(--text-main)"), padding: "5px"
        }} onClick={() => this.setState({ pageMargin: Big })}>Big</div>
      </div>
    </div>);

    const imageQualitySelector = (<div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>Image quality</div>
      <div style={{ display: "flex" }}>
        <div style={{ padding: "5px" }}>
          <button onClick={() => {
            if (this.state.imageQuality < 10) {
              this.setState({
                imageQuality: +this.state.imageQuality + 1
              });
            }
          }}>+</button>
        </div>
        <div style={{ padding: "5px" }}>
          <div>{this.state.imageQuality / 10}</div>
        </div>
        <div style={{ padding: "5px" }} >
          <button onClick={() => {
            if (this.state.imageQuality > 1) {
              this.setState({
                imageQuality: +this.state.imageQuality - 1
              });
            }
          }}>-</button>
        </div>
      </div>
    </div>);

    const optionStyle = {}
    if (this.state.forceShowOption) {
      optionStyle.display = "block"
    }

    const closeBtn = this.state.forceShowOption ? <span onClick={() => { this.setState({ forceShowOption: false }) }}>X</span> : <span></span>;

    const options = (
      <div className="options" style={optionStyle}>
        <div style={{ paddingBottom: "10px", fontSize: "20px", display: "flex", justifyContent: "space-between" }}>
          <span>Options</span>
          {closeBtn}
        </div>
        <div style={{ paddingBottom: "10px", fontSize: "16px", color: "var(--text-dim)", paddingTop: "10px" }}>Page orientation</div>
        <div style={{ display: "flex" }}>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (this.state.pageOrientation === Portrait ? "var(--accent)" : "var(--option-unselected)"),
            color: (this.state.pageOrientation === Portrait ? "white" : "var(--text-main)"), padding: "5px"
          }}
            onClick={() => this.setState({ pageOrientation: Portrait })}>Portrait</div>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (this.state.pageOrientation === Landscape ? "var(--accent)" : "var(--option-unselected)"),
            color: (this.state.pageOrientation === Landscape ? "white" : "var(--text-main)"), padding: "5px"
          }}
            onClick={() => this.setState({ pageOrientation: Landscape })}>Landscape</div>
        </div>
        <div style={{ paddingBottom: "10px", fontSize: "16px", color: "var(--text-dim)", paddingTop: "20px" }}>Page size</div>
        <div style={{ display: "flex" }}>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (this.state.pageSize === A4 ? "var(--accent)" : "var(--option-unselected)"),
            color: (this.state.pageSize === A4 ? "white" : "var(--text-main)"), padding: "5px"
          }} onClick={() => this.setState({ pageSize: A4 })}>A4</div>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (this.state.pageSize === Letter ? "var(--accent)" : "var(--option-unselected)"),
            color: (this.state.pageSize === Letter ? "white" : "var(--text-main)"), padding: "5px"
          }} onClick={() => this.setState({ pageSize: Letter })}>US Letter</div>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (this.state.pageSize === Fit ? "var(--accent)" : "var(--option-unselected)"),
            color: (this.state.pageSize === Fit ? "white" : "var(--text-main)"), padding: "5px"
          }} onClick={() => this.setState({ pageSize: Fit })}>Same as Image</div>
        </div>
        {this.state.pageSize !== Fit ? pageMarginSection : (<div></div>)}
        <div style={{ paddingBottom: "10px", fontSize: "16px", color: "var(--text-dim)", paddingTop: "20px" }}>Compression</div>
        <div style={{ display: "flex" }}>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (this.state.compressImages ? "var(--accent)" : "var(--option-unselected)"),
            color: (this.state.compressImages ? "white" : "var(--text-main)"), padding: "5px"
          }}
            onClick={() => this.setState({ compressImages: true })}>Compress Images</div>
          <div style={{
            flex: "1", height: "50px", display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
            background: (!this.state.compressImages ? "var(--accent)" : "var(--option-unselected)"),
            color: (!this.state.compressImages ? "white" : "var(--text-main)"), padding: "5px"
          }}
            onClick={() => this.setState({ compressImages: false })}>Don't Compress</div>
        </div>
        {this.state.compressImages ? imageQualitySelector : (<div></div>)}
      </div>
    );


    const actions = (
      <div className="actions-wrapper">
       

          <button onClick={() => {
            this.setState({
              forceShowOption: true
            });
          }} className="option-btn button">PDF Options</button>
       
        <button onClick={() => this.fileInput.current.click()} className="button">Add page</button>

        <button onClick={this.createPdf} className="button">Generate PDF</button>
      </div>
    );


    if (this.state.images.length < 1) {
      return <div>

        <input type="file" ref={this.fileInput} onChange={() => this.readfiles(this.fileInput.current.files)} multiple style={{ display: "none" }}></input>
        {landing}
      </div>
    }

    const busy = {};
    if (this.state.busy) {
      busy.display = "flex";
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden", flex: "1" }}>

        <div style={{ display: "flex", overflow: "hidden", flex: "1" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "100%", flex: "1", overflow: "auto", background: "var(--bg-mid)" }} onClick={this.clearSelection}>
            {listView}
            <div style={{ flex: "1" }}></div>
          </div>
          {options}
        </div>
        {actions}
        <input type="file" accept={"image/*"} ref={this.fileInput} onChange={() => this.readfiles(this.fileInput.current.files)} multiple style={{ display: "none" }} />
        <div className="busy" style={busy}>Generating PDF, Please wait...</div>
      </div>

    );

    // return (
    //   <div>
    //     <div>This app is not styled yet</div>
    //     <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    //       {this.state.images.map((img, index) => (
    //         <div style={{ display: 'flex', flexDirection: 'column' }}>
    //           <img src={img.imgDataUrl} alt="" style={{ width: "96px", height: "128px" }}></img>
    //           <div>{"Page " + (index + 1)}</div>
    //         </div>
    //       ))}
    //     </div>
    //     <div>
    //       <input type="file" ref={this.fileInput} onChange={this.readfiles} multiple></input>
    //       <button onClick={() => { this.setState({ images: [] }) }}>Clear</button>
    //       <button onClick={this.createPdf}>Generate PDF</button>
    //     </div>
    //     {this.state.lastError ?
    //       <div>
    //         <div>{this.state.lastError}</div>
    //         <div>{this.state.lastMime}</div>
    //       </div> : <div>{this.state.lastMime}</div>}
    //     <div>{this.state.lastMime}</div>
    //   </div>);
  }

  //https://labs.madisoft.it/javascript-image-compression-and-resizing/
  /* resizeImage = async (file, width, height) => {
    const blobURL = window.URL.createObjectURL(file);
    const img = new Image();
    img.src = blobURL;
    img.onload = function (ev) {
      window.URL.revokeObjectURL(blobURL); // release memory
      // Use the img
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
    };

  } */

  clearSelection = () => {
    let imgArr = [...this.state.images];
    imgArr.forEach(img => {
      img.selected = false;
    });
    this.setState({
      images: imgArr
    });
  }

  readfiles = async (fileList) => {
    console.log(fileList.length);
    let imgArr = [];
    for (let i = 0; i < fileList.length; i++) {
      console.log("Type: " + fileList[i].type);
      if (!(fileList[i].type === "image/png" || fileList[i].type === "image/x-png" || fileList[i].type === "image/jpeg")) {
        continue;
      }
      const imgDataUrl = window.URL.createObjectURL(fileList[i]);
      //let img = await this.loadImage(imgDataUrl);
      let uuid = this.uuidv4();
      console.log("uuid: " + uuid);
      imgArr.push({ id: uuid, imgDataUrl, file: fileList[i], /* width: img.width, height: img.height */selected: false });
    }
    this.setState((state) => ({
      images: [...state.images, ...imgArr]
    }));
  }

  loadImage = (objUrl) => {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (e) => {
        reject(e);
      };
      img.src = objUrl;
    });
  }

  readExif(blob) {
    EXIF.readFromBinaryFile(blob)
  }

  canvasToBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(resolve, "image/jpeg", quality);
      }
      catch (err) {
        reject(err);
      }
    });
  }



  fetchImage = async (dataURL, quality) => {
    if (!quality) {
      let res = await fetch(dataURL);
      let raw = await res.arrayBuffer();
      return {
        arrayBuffer: raw,
        mime: res.headers.get('content-type')
      }
    }
    else {
      let img = await this.loadImage(dataURL);
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let blob = await this.canvasToBlob(canvas, quality);
      let raw = await blob.arrayBuffer();
      return {
        arrayBuffer: raw,
        mime: "image/jpeg"
      };
    }
  }

  createPdf = async () => {
    let mime = "";
    try {
      this.setState({ busy: true });
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < this.state.images.length; i++) {

        let pageSize = this.getPageSize();

        // if (this.state.pageSize !== Fit) {
        //   const page = pdfDoc.addPage(pageSize);
        //   const dim = await pdfDoc.embedPng(await this.scaleImage(page.getWidth(), page.getHeight(), this.state.pageMargin, this.state.images[i].imgDataUrl));
        //   page.drawImage(dim, {
        //     x: page.getWidth() / 2 - dim.width / 2,
        //     y: page.getHeight() / 2 - dim.height / 2,
        //     width: dim.width,
        //     height: dim.height,
        //   });

        //   continue;
        // }

        // let loadedImage=await loadImage(this.state.images[i].imgDataUrl,{meta:true});
        // console.log("loaded image "+loadedImage);
        // console.log(loadedImage);

        let res = await this.fetchImage(this.state.images[i].imgDataUrl, this.state.compressImages ? this.state.imageQuality / 10 : undefined);
        let raw = await res.arrayBuffer;

        mime = res.mime;
        console.log(mime);

        let jpegOrientation = 1;

        if (mime === 'image/jpeg') {
          try {
            let jpegExif = EXIF.readFromBinaryFile(raw);
            if (jpegExif["Orientation"]) {
              jpegOrientation = jpegExif["Orientation"];
              console.log("jpegOrientation: " + jpegOrientation);
            }
          }
          catch (ex) { console.error(ex); }
        }
        //console.log(raw);
        const img = await (mime === 'image/jpeg' ? pdfDoc.embedJpg(raw) : pdfDoc.embedPng(raw));

        console.log("width: " + img.width + " height: " + img.height);

        if (this.state.pageSize === Fit) {
          pageSize = [img.width, img.height];
        } else {
          switch (jpegOrientation) {
            case 6:
            case 8:
              pageSize = [pageSize[1], pageSize[0]];
              break;
            default:
              // do nothing for other orientations
              break;
          }

        }
        const page = pdfDoc.addPage(pageSize);
        if (this.state.pageSize === Fit) {
          page.drawImage(img, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
          });
        } else {
          //page.setSize(pageSize[0], pageSize[1]);
          let scaleFactor = Math.min((page.getWidth() - this.state.pageMargin) / img.width, (page.getHeight() - this.state.pageMargin) / img.height);
          //let w = img.width * scaleFactor;
          //let h = img.height * scaleFactor;

          //page.setSize(img.width,img.height);
          console.log(img.width + " " + img.height);
          console.log(page.getWidth() + " " + page.getHeight());

          let dim = img.scale(scaleFactor);

          page.drawImage(img, {
            x: page.getWidth() / 2 - dim.width / 2,
            y: page.getHeight() / 2 - dim.height / 2,
            width: dim.width,
            height: dim.height,
          });
        }
        switch (jpegOrientation) {
          case 6:
            page.setRotation(degrees(90));
            break;
          case 3:
            page.setRotation(degrees(180));
            break;
          case 8:
            page.setRotation(degrees(270));
            break;
          default:
            // do nothing for other orientations
            break;
        }

      }
      const pdfBytes = await pdfDoc.save();
      let blob = new Blob([pdfBytes], { type: "application/pdf" });
      // let url = window.URL.createObjectURL(blob);
      // window.open(url);
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      var fileName = "file.pdf";
      link.download = fileName;
      link.click();
      this.setState({ busy: false });
    }
    catch (err) {
      console.error(err);
      this.setState({ lastError: err, lastMime: mime, busy: false });
    }
  }

  deletePage = id => {
    console.log("To delete: " + id);
    let arr = [...this.state.images];
    let indexPosition = -1;
    arr.forEach((img, index) => {
      if (img.id === id) {
        indexPosition = index;
      }
    });
    arr.splice(indexPosition, 1);
    this.setState({
      images: arr
    });
  }

  handleDrop = (droppedId, currentId) => {
    console.log("droppedId: " + droppedId + " currentId: " + currentId);
    let droppedIndex = -1;
    let arr = [...this.state.images];
    arr.forEach((img, index) => {
      if (img.id === droppedId) {
        droppedIndex = index;
      }
    });
    let droppedImage = arr.splice(droppedIndex, 1)[0];
    let currentIndex = -1;
    arr.forEach((img, index) => {
      if (img.id === currentId) {
        currentIndex = index;
      }
    });
    arr.splice(currentIndex, 0, droppedImage);
    console.log(arr);

    this.setState({
      images: arr
    });
  }

  getPageSize = () => {
    switch (this.state.pageSize) {
      case A4:
        if (this.state.pageOrientation === Portrait) {
          return PageSizes.A4;
        }
        else {
          let pageSize = [...PageSizes.A4];
          pageSize.reverse();
          return pageSize;
        }
      case Letter:
        if (this.state.pageOrientation === Portrait) {
          return PageSizes.Letter;
        }
        else {
          let pageSize = [...PageSizes.Letter];
          pageSize.reverse();
          return pageSize;
        }
      default:
        return undefined;
    }
  }

  getAspectRatio = () => {
    let pageSize = this.getPageSize();
    return pageSize[0] / pageSize[1];
  }

  // getPreviewImageSize = (pageWidth, pageHeight, imageWidth, imageHeight) => {
  //   let pageSize = this.getPageSize();
  //   let margin = this.state.pageMargin * pageHeight / pageSize[1];
  //   let scaleFactor = Math.min((pageWidth - margin) / img.width, (pageHeight - margin) / img.height);
  //   let w = imageWidth * scaleFactor;
  //   let h = imageHeight * scaleFactor;
  //   return [w, h];
  // }

  // getPreviewPageSize = () => {
  //   return {
  //     height: 192,
  //     width: 192 * this.getAspectRatio()
  //   };
  // }

  // getMaxImageSize=()=>{
  //   let maxWidth = -1;
  //   let maxHeight = -1;
  //   this.state.images.forEach(image => {
  //     if (image.width > maxWidth) maxWidth = image.width;
  //     if (image.height > maxWidth) maxHeight = image.height;
  //   });
  //   return {
  //     width: maxWidth,
  //     height: maxHeight
  //   };
  // }

  /* createPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    this.createPage(pdfDoc, 1);
  }

  createPage = (pdfDoc, index) => {
    this.embedImage(pdfDoc, index).then(() => {
      if (index > this.state.images.length) {
        pdfDoc.save().then((blob) => {
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          var fileName = "file.pdf";
          link.download = fileName;
          link.click();
        });
      }
      this.createPage(pdfDoc, index + 1);
    });
  }

  embedImage = async (pdfDoc, index) => {
    if (index > this.state.images.length) return;
    let raw = await (await fetch(this.state.images[index - 1])).blob();
    const img = await pdfDoc.embedJpg(raw);
    const page = pdfDoc.addPage();
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
    });
  } */

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.floor(Math.random() * 16);
      let v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

}

export default App;
