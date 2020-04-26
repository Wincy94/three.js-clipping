import { Scene, PerspectiveCamera, WebGLRenderer, AxesHelper, AmbientLight, DirectionalLight, Vector3, MOUSE, Group, BufferGeometry, BufferAttribute, MeshLambertMaterial, DoubleSide, Mesh, EdgesGeometry, LineSegments, LineBasicMaterial, Object3D } from 'three';
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
        this.load().then((obj: any) => {
            this.clip = new Clip(obj, this.scene, this.camera, this.renderer, this.controls);
            this.clip.open();
        });
    }

    /**(4)初始化照相机 */
    initCamera() {
        this.camera.position.set(0, 1500, 1000);
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
        return new Promise((resolve) => {
            axios.request({ url: 'assets/geo.json' }).then((res) => {
                const group = new Group();
                const lutColor = new Lut('rainbow', 512);
                lutColor.setMin(0);
                lutColor.setMax(4);
                const gridList = res.data.GridList;
                gridList.forEach((item: any) => {
                    const geometry = new BufferGeometry();

                    // 指定立方体的八个顶点的 xyz
                    const vertices = new Float32Array(24);
                    let i = 0;
                    item.GridPoints.forEach(function (point: any) {
                        vertices[i * 3] = point.x;
                        vertices[(i * 3) + 1] = point.y;
                        vertices[(i * 3) + 2] = point.z;
                        i++;
                    });
                    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

                    // 复用三角片的顶点
                    const indexes = new Uint16Array([
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
                    geometry.index = new BufferAttribute(indexes, 1);

                    // 设定颜色
                    const ZValue = item.GridPropertys[0].PropertyValue;
                    const facecolor = lutColor.getColor(ZValue);
                    const material = new MeshLambertMaterial({
                        color: facecolor,
                        side: DoubleSide
                    });

                    // 添加该立方体
                    const mesh = new Mesh(geometry, material);
                    const edges = new EdgesGeometry(geometry, 10);
                    const line = new LineSegments(edges, new LineBasicMaterial({ color: 0xffffff, opacity: 0.3 }));
                    group.add(line);
                    group.add(mesh);
                });
                this.scene.add(group);
                resolve(group);
            });
        });
    }

}