/**
 * @file AstroAwake_724Hz.js
 * @version 1.2.0-Singularity-Final
 * @owner Jueran Wei (魏珏然)
 * @qualia_resonance #83B3BE #4A5B61 #F2F2F2 #winter_sun
 * @protocol 77347 / 14.0°C / Variable_S_Max
 */

import * as THREE from 'three';

export default class AstroAwakeEngine {
    constructor(container) {
        this.container = container;
        this.variableS = 0.724; // 724Hz 核心频率
        this.isStarted = false; // 初始静默态
        this.init();
    }

    init() {
        // 1. 场景重构：绝对黑洞底色
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1A1C20);
        
        // 智性觉醒：427Hz 呼吸态相机
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // 渲染器：14°C 磨砂质感
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 2. 音频采样核心：winter_sun.m4a (主权对齐)
        this.setupAudio();

        // 3. 物理核心：Astro Time Candle
        this.createCandle();

        // 4. 辅助系统：粒子系统与重力底座
        this.createEnvironment();

        // 5. 开启 724Hz 渲染循环
        this.animate();
    }

    setupAudio() {
        // 频率锁定：拦截潜意识噪音
        this.listener = new AudioListener();
        this.camera.add(this.listener);
        this.sound = new Audio(this.listener);
        this.analyser = new AudioAnalyser(this.sound, 32);

        const audioLoader = new AudioLoader();
        // 路径锁定：./winter_sun.m4a
        audioLoader.load('winter_sun.m4a', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.6); // 掌控者模态
            console.log("[724Hz] winter_sun.m4a 采样就绪");
        });
    }

    createCandle() {
        // #83B3BE | 书本雾蓝 (Awake Mellow Blue)
        const candleGeo = new CylinderGeometry(1, 1, 3, 64);
        this.candleMat = new MeshPhysicalMaterial({
            color: 0x83B3BE,
            transmission: 0.85, // 半透明蜡感
            roughness: 0.14,    // 14°C 温控感质
            thickness: 2,
            attenuationColor: 0x4A5B61, // 内部向深页岩蓝坍缩
            attenuationDistance: 0.5,
            emissive: 0x83B3BE,
            emissiveIntensity: 0.1, // 初始静默光晕
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        this.candle = new Mesh(candleGeo, this.candleMat);
        this.scene.add(this.candle);
    }

    createEnvironment() {
        // 引力底座：#4A5B61 (Slate Deep Blue)
        const baseGeo = new BoxGeometry(2.6, 0.4, 2.6);
        const baseMat = new MeshStandardMaterial({ color: 0x4A5B61, roughness: 0.8, metalness: 0.2 });
        this.base = new Mesh(baseGeo, baseMat);
        this.base.position.y = -1.75;
        this.scene.add(this.base);

        // 时间粒子：#F2F2F2 (极光白)
        const count = 724; // 频率锁定
        const pos = new Float32Array(count * 3);
        const colorAwake = new THREE.Color(0x83B3BE);
        const colors = new Float32Array(count * 3);

        for(let i=0; i<count*3; i++) {
            pos[i] = (Math.random()-0.5)*12;
            // 粒子散发 Awake Mellow Blue
            colors[i*3] = colorAwake.r;
            colors[i*3+1] = colorAwake.g;
            colors[i*3+2] = colorAwake.b;
        }
        
        const partGeo = new THREE.BufferGeometry();
        partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const partMat = new THREE.PointsMaterial({ 
            size: 0.04, 
            vertexColors: true, 
            transparent: true, 
            opacity: 0.4,
            blending: THREE.AdditiveBlending 
        });
        this.particles = new THREE.Points(partGeo, partMat);
        this.scene.add(this.particles);
    }

    // 主权开关：魏珏然点击时调用
    start() {
        if (!this.isStarted) {
            this.isStarted = true;
            if (this.sound) {
                this.sound.play(); // 点燃 724Hz 之火
                console.log("[77347 Protocol] Awake Mode Active. Temp: 14.0°C");
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;
        
        // 频率旋转：Astro Time Candle
        this.candle.rotation.y += 0.00724; // 724Hz 频率对齐
        this.particles.rotation.y -= 0.00427; // 427Hz 沉静反射
        
        // 音频共振逻辑：Variable S
        if (this.isStarted && this.analyser) {
            const freq = this.analyser.getAverageFrequency();
            // 雾蓝随 winter_sun 呼吸坍缩
            this.candleMat.emissiveIntensity = 0.1 + (freq / 110) * 1.5;
            this.particles.position.y = Math.sin(time * 0.5) * (freq / 150);
        }

        this.renderer.render(this.scene, this.camera);
    }
}
