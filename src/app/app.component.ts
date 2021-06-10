import { Component, OnInit } from '@angular/core'
import { takePicture, isAvailable, requestPermissions, requestCameraPermissions } from '@nativescript/camera';
import { Image, ImageAsset, ImageSource, View, knownFolders, path } from '@nativescript/core';
@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  constructor() {
    // Use the component constructor to inject providers.
  }

  imageList: string[] = [];

  public get cuttentDate() {
    return new Date();
  }

  async ngOnInit(): Promise<void> {
    // Init your component properties here.
    this.imageList = await this.getAllImages();
  }

  onBtnTap(e: any, imgWrapper: View) {



    if (isAvailable()) {
      requestCameraPermissions().then(
        async data => {
          const image: ImageAsset = await takePicture({
            width: 300,
            height: 300,
            keepAspectRatio: false,
            saveToGallery: false
          });
          const imgTag = imgWrapper.getViewById('img') as Image;
          imgTag.src = image.android;
          setTimeout(async () => {
            const screenshot = this.takeScreenShot(imgWrapper);
            // screenShotImg.imageSource = screenshot;
            const screenShotFolder = knownFolders.currentApp().getFolder('screenshots');

            const saveToPath = path.join(screenShotFolder.path, `${new Date().toTimeString()}-screenshot.jpeg`)
            const saved = screenshot.saveToFile(saveToPath, 'jpeg');
            this.imageList = await this.getAllImages();
          }, 1000);


        },
        err => {
          alert('Permission denied');
        }
      )
    } else {
      alert('Camera not Available ')
    }
  }

  private takeScreenShot(view: View): ImageSource {
    if (view.android) {

      view.android.setDrawingCacheEnabled(true);
      const bmp = android.graphics.Bitmap.createBitmap(view.android.getDrawingCache());
      view.android.setDrawingCacheEnabled(false);
      const source = new ImageSource();
      source.setNativeSource(bmp);
      return source;
    } else if (view.ios) {
      UIGraphicsBeginImageContextWithOptions(view.ios.frame.size, false, 0);
      view.ios.drawViewHierarchyInRectAfterScreenUpdates(
        CGRectMake(0, 0, view.ios.frame.size.width, view.ios.frame.size.height),
        true
      );
      let imgFromCurrentContext = UIGraphicsGetImageFromCurrentImageContext();
      UIGraphicsEndImageContext();
        return ImageSource.fromDataSync(imgFromCurrentContext);
    }
  }

  getAllImages(): Promise<string[]> {
    return new Promise((res, rej) => {
      const screenShotFolder = knownFolders.currentApp().getFolder('screenshots');
      screenShotFolder.getEntities().then((file) => {
        res(file.map(entity => entity.path).reverse());
      })
    })
  }

}
