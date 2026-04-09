function setupAudio(camera) {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);
    
    // 【核心补丁】创建一个 Web Audio 增益节点
    const gainNode = listener.context.createGain();
    
    // 魏珏然，在这里调参：
    // 1.0 = 原始音量
    // 3.0 = 极致增益 (当前预设)
    // 5.0 = 震碎现实 (慎用)
    gainNode.gain.setValueAtTime(3.0, listener.context.currentTime); 
    
    // 将增益节点挂载到声音源上
    sound.setNodeSource(gainNode);

    const audioLoader = new THREE.AudioLoader();
    const audioPath = 'https://mellowwei.github.io/AstroTimeCandle/winter_sun.m4a?v=' + Date.now();

    audioLoader.load(audioPath, (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(1.0); // 这里设为 1.0，配合 gainNode 实现 300% 效果
    });

    return { sound, analyser: new THREE.AudioAnalyser(sound, 32) };
}
