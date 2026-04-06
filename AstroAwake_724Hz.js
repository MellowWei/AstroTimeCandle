/**
 * @file AstroAwake_724Hz.js
 * @version 1.0.0-Singularity
 * @owner Jueran Wei (魏珏然)
 * @qualia_matrix #83B3BE #4A5B61 #96A4A5 #F2F2F2 #D9C5B2 #C7B198 #A8B196
 * @protocol 77347 / Variable_S_Active / 14.0°C
 */

import * as THREE from 'three';

export default class AstroAwakeEngine {
    constructor(container) {
        this.container = container;
        this.variableS = 0.724; // 初始采样率
        this.init();
    }

    init() {
        // 1. 场景重构：14°C 实验室清冷感
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1A1C20); // 绝对黑洞底色
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 2. Astro Time Candle 核心：#83B3BE (Awake Mellow Blue)
        const candleGeometry = new THREE.CylinderGeometry(1, 1, 3, 64);
        this.candleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x83B3BE,
            transmission: 0.8, // 半透明蜡感
            roughness: 0.14,   // 14°C 磨砂质感
            thickness: 2,
            attenuationColor: 0x4A5B61, // 内部向深页岩蓝坍缩
            attenuationDistance: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        this.candle = new THREE.Mesh(candleGeometry, this.candleMaterial);
        this.scene.add(this.candle);

        // 3. 引力底座：#4A5B61 (Slate Deep Blue) + #96A4A5 (水泥灰)
        const baseGeometry = new THREE.BoxGeometry(2.5, 0.5, 2.5);
        this.baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A5B61,
            roughness: 0.9, // 工业级粗粝感
            metalness: 0.2
        });
        this.base = new THREE.Mesh(baseGeometry, this.baseMaterial);
        this.base.position.y = -1.75;
        this.scene.add(this.base);

        // 4. 非线性时间粒子：#F2F2F2 (极光白) + #C7B198 (陶土粉)
        this.createTimeParticles();

        // 5. 光影律动：基于魏珏然主权参数
        const pointLight = new THREE.PointLight(0xF2F2F2, 2);
        pointLight.position.set(2, 3, 4);
        this.scene.add(pointLight);

        this.animate();
    }

    createTimeParticles() {
        const count = 724; // 锁定频率
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        const colorAwake = new THREE.Color(0x83B3BE);
        const colorSage = new THREE.Color(0xA8B196); // 方案C：善良灵动

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // 粒子在雾蓝与鼠尾草绿之间交替，模拟“不羁里的温柔”
            const mixedColor = i % 2 === 0 ? colorAwake : colorSage;
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 724Hz 强制同步逻辑
        const time = Date.now() * 0.001;
        this.candle.rotation.y += 0.00724; // 频率锁定
        
        // Variable S：模拟 14°C 空气中的流动
        this.particles.rotation.y -= 0.00427; 
        this.particles.position.y = Math.sin(time * 0.5) * 0.14;

        // 动态感质坍缩：蜡烛核心随呼吸产生微弱的 #D9C5B2 (燕麦灰) 闪烁
        const pulse = Math.sin(time * 0.724) * 0.5 + 0.5;
        this.candleMaterial.emissive.setHex(0xD9C5B2);
        this.candleMaterial.emissiveIntensity = pulse * 0.2;

        this.renderer.render(this.scene, this.camera);
    }
}
