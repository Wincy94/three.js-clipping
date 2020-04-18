import { Scene, PerspectiveCamera, WebGLRenderer, AxesHelper, AmbientLight, DirectionalLight, Vector3, MOUSE, Group, BufferGeometry, BufferAttribute, MeshLambertMaterial, DoubleSide, Mesh, EdgesGeometry, LineSegments, LineBasicMaterial } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import { Lut } from './lut';
import { Clip } from './clip';

export class App {

    // (1)基本数据
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    private controls: OrbitControls;
    private clip: Clip | null = null; // 剖切

    /**(2)构造函数 */
    constructor() {
        const canvas = document.getElementById('canvasId') as HTMLCanvasElement;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
        this.renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.render();
    }

    /**(3)初始化场景 */
    initScene() {
        this.scene.add(new AxesHelper(100000));
        this.scene.add(new AmbientLight(0xffffff, 0.5));
        const directionLight = new DirectionalLight(0xffffff, 1);
        directionLight.position.set(200, 200, 200);
        this.scene.add(directionLight);
        this.load();
    }

    /**(4)初始化照相机 */
    initCamera() {
        this.camera.position.set(500, 900, 500);
        this.camera.lookAt(new Vector3(0, 0, 0));
    }

    /**(5)初始化渲染器 */
    initRenderer() {
        this.renderer.localClippingEnabled = true;
        this.renderer.autoClear = false;
        this.renderer.setClearColor(0xdedede);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', this.onWindowResize);
    }

    /**(6)初始化控制器 */
    initControls() {
        this.controls.mouseButtons = {
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE
        }
    }

    /**(7)渲染 */
    private render = () => {
        this.renderer.clear();
        if (this.clip?.isOpen) {
            this.clip.stencilTest();
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }

    /**(8)窗口大小改变时，更新画布大小 */
    private onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    // ---------------------模型相关--------------------------

    //(1)基本数据

    /**(2)加载模型 */
    load() {
        axios.request({ url: 'assets/geo.json' }).then((res) => {
            console.log(res);
            const gridList = res.data.GridList;
            const group = new Group();
            const lutColor = new Lut('rainbow', 512);
            lutColor.setMin(0);
            lutColor.setMax(4);
            gridList.forEach((item: any) => {
                var geometry = new BufferGeometry();
                var vertices = new Float32Array(24);
                var i = 0;

                item.GridPoints.forEach(function (point: any) {
                    vertices[i * 3] = point.x;
                    vertices[(i * 3) + 1] = point.y;
                    vertices[(i * 3) + 2] = point.z;
                    i++;
                });

                var indexes = new Uint16Array([
                    0, 1, 3,
                    2, 1, 3,
                    1, 0, 6,
                    5, 6, 0,
                    0, 3, 5,
                    4, 5, 3,
                    7, 4, 6,
                    5, 4, 6,
                    1, 2, 6,
                    7, 6, 2,
                    2, 3, 7,
                    4, 3, 7
                ]);

                var attribue = new BufferAttribute(vertices, 3);
                geometry.attributes.position = attribue;
                geometry.index = new BufferAttribute(indexes, 1);

                var ZValue = item.GridPropertys[0].PropertyValue;
                var facecolor = lutColor.getColor(ZValue);
                var material = new MeshLambertMaterial({
                    color: facecolor,
                    side: DoubleSide
                });

                var mesh = new Mesh(geometry, material);
                var edges = new EdgesGeometry(geometry, 10);
                var line = new LineSegments(edges, new LineBasicMaterial({ color: 0xffffff, opacity: 0.3 }));
                this.scene.add(line);
                group.add(mesh);
            });

            this.scene.add(group);
        });
    }


}