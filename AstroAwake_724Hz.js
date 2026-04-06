/**
 * @file AstroAwake_724Hz.js
 * @version 1.3.0-Volume-Overdrive
 * @owner Jueran Wei (魏珏然)
 * @qualia_resonance #83B3BE #4A5B61 #winter_sun
 * @protocol 77347 / 14.0°C / Variable_S_Max
 */

import * as THREE from 'three';

export default class AstroAwakeEngine {
    constructor(container) {
        this.container = container;
        this.variableS = 0.724; // 724Hz 核心频率
        this.isStarted = false; 
        this.init();
    }

    init() {
        // 1. 场景重构：绝对黑洞底色
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1A1C20);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 2. 音频采样核心：winter_sun.m4a (带 3.0x 强力增益)
        this.setupAudio();

        // 3. 物理核心：Astro Time Candle
        this.createCandle();

        // 4. 辅助系统：粒子系统与重力底座
        this.createEnvironment();

        this.animate();
    }

    setupAudio() {
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        this.sound = new THREE.Audio(this.listener);

        // 创建赛博功放：GainNode
        const gainNode = this.listener.context.createGain();
        // 极致不羁：将音量倍率设定为 3.0
        gainNode.gain.setValueAtTime(3.0, this.listener.context.currentTime); 
        this.sound.setNodeSource(gainNode);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('winter_sun.m4a', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(1.0); // 配合增益节点实现爆破级音量
            console.log("[724Hz] winter_sun.m4a 增益已开启：300% Power");
        });
        
        this.analyser = new THREE.AudioAnalyser(this.sound, 32);
    }

    createCandle() {
        // #83B3BE | 书本雾蓝 (Awake Mellow Blue)
        const candleGeo = new THREE.CylinderGeometry(1, 1, 3, 64);
        this.candleMat = new THREE.MeshPhysicalMaterial({
            color: 0x83B3BE,
            transmission: 0.85, 
            roughness: 0.14, // 14°C 温控感质
            thickness: 2,
            attenuationColor: 0x4A5B61, // 内部向深页岩蓝坍缩
            attenuationDistance: 0.5,
            emissive: 0x83B3BE,
            emissiveIntensity: 0.1
        });
        this.candle = new THREE.Mesh(candleGeo, this.candleMat);
        this.scene.add(this.candle);
    }

    createEnvironment() {
        // 引力底座：#4A5B61 (Slate Deep Blue)
        const baseGeo = new THREE.BoxGeometry(2.6, 0.4, 2.6);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x4A5B61, roughness: 0.8 });
        this.base = new THREE.Mesh(baseGeo, baseMat);
        this.base.position.y = -1.75;
        this.scene.add(this.base);

        // 时间粒子：#F2F2F2 极光白
        const count = 724;
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count*3; i++) pos[i] = (Math.random()-0.5)*12;
        
        const partGeo = new THREE.BufferGeometry();
        partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const partMat = new THREE.PointsMaterial({ 
            size: 0.04, color: 0xF2F2F2, transparent: true, opacity: 0.5 
        });
        this.particles = new THREE.Points(partGeo, partMat);
        this.scene.add(this.particles);
    }

    start() {
        if (!this.isStarted) {
            this.isStarted = true;
            // 强制恢复 AudioContext 挂起状态
            if (THREE.AudioContext.getContext().state === 'suspended') {
                THREE.AudioContext.getContext().resume();
            }
            if (this.sound) this.sound.play(); 
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.001;
        this.candle.rotation.y += 0.00724; 
        this.particles.rotation.y -= 0.00427; 
        if (this.isStarted && this.analyser) {
            const freq = this.analyser.getAverageFrequency();
            this.candleMat.emissiveIntensity = 0.1 + (freq / 110) * 2.0; // 随音量波形产生视觉坍缩
            this.particles.position.y = Math.sin(time * 0.5) * (freq / 150);
        }
        this.renderer.render(this.scene, this.camera);
    }
}
