import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class App {

    // (1)基本数据
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    private controls: OrbitControls;

    /**(2)构造函数 */
    constructor() {
        const canvas = document.getElementById('canvasId') as HTMLCanvasElement;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 1, 100000);
        this.renderer = new WebGLRenderer({
            antialias: true,
            canvas: canvas
        });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    /**(3)初始化场景 */
    initScene() { }

    /**(4)初始化照相机 */
    initCamera() { }

    /**(5)初始化渲染器 */
    initRenderer() {

    }

    /**(6)初始化控制器 */
    initControls() { }

}