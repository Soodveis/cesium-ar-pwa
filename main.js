import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  Viewer,
  Ion,
  IonImageryProvider,
  EllipsoidTerrainProvider,
  KmlDataSource,
  IonResource,
  Color
} from "cesium";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWU5YWQ4Yy04MWJhLTRiMjEtODlhYy1hMzBmMThjZGFlY2YiLCJpZCI6Mjg0NzkyLCJpYXQiOjE3NDMyNDk4OTR9.XYyDBN_rm1I7n7X6iOIYvNpuCOLf9pkRh2b-Hg0XMyU";

async function initializeCesium() {
  setTimeout(() => {
    viewer.scene.requestRender();
  }, 2000);
  const viewer = new Viewer("cesiumContainer", {
    terrainProvider: new EllipsoidTerrainProvider(),
    imageryProvider: await IonImageryProvider.fromAssetId(2),
    shouldAnimate: true,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    timeline: false,
    animation: false,
  });

  viewer.scene.globe.enableLighting = true;
  viewer.scene.backgroundColor = Color.BLACK;

  try {
    const resource = await IonResource.fromAssetId(3264517);
    const kml = await KmlDataSource.load(resource);
    viewer.dataSources.add(kml);
    viewer.flyTo(kml, {
    duration: 3
  });
  } catch (error) {
    console.error("Ошибка загрузки KML:", error);
  }

  const arButton = document.getElementById("enterAR");
  if (!arButton) return;

  let isARActive = false;
  let xrSession = null;

  arButton.addEventListener("click", async () => {
    if (!isARActive) {
      if (!navigator.xr) {
        alert("WebXR не поддерживается этим браузером/устройством.");
        return;
      }

      const supported = await navigator.xr.isSessionSupported("immersive-ar");
      if (!supported) {
        alert("Ваше устройство не поддерживает WebXR AR.");
        return;
      }

      try {
        xrSession = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["local", "hit-test"],
        });

        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.zIndex = 1000;
        document.body.appendChild(canvas);

        const gl = canvas.getContext("webgl", { xrCompatible: true });
        await xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });

        const refSpace = await xrSession.requestReferenceSpace("local");

        const onXRFrame = (time, frame) => {
          xrSession.requestAnimationFrame(onXRFrame);
        };

        xrSession.requestAnimationFrame(onXRFrame);
        isARActive = true;
        arButton.textContent = "Выйти из AR";
      } catch (e) {
        console.error("Ошибка при запуске AR:", e);
      }
    } else {
      if (xrSession) {
        await xrSession.end();
        xrSession = null;
      }
      isARActive = false;
      arButton.textContent = "Перейти в AR";
    }
  });
}

initializeCesium();
