import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const Hero3DIcon = () => {
  const mountRef = useRef(null);
  const requestRef = useRef();

  useEffect(() => {
    const width = 120;
    const height = 120;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create a 3D target (🎯) - red/white bullseye with an arrow
    // Bullseye: 3 concentric circles
    const group = new THREE.Group();
    const colors = [0xffffff, 0xff0000, 0xffffff, 0xff0000];
    const radii = [1, 0.75, 0.5, 0.25];
    for (let i = 0; i < radii.length; i++) {
      const geometry = new THREE.RingGeometry(radii[i + 1] || 0, radii[i], 64);
      const material = new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = Math.PI / 2;
      group.add(mesh);
    }
    // Arrow (simple 3D arrow)
    const shaftGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 16);
    const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.set(0.3, 0.5, 0.05);
    shaft.rotation.z = Math.PI / 6;
    shaft.rotation.x = Math.PI / 2;
    group.add(shaft);
    const headGeometry = new THREE.ConeGeometry(0.08, 0.2, 16);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.3, 1, 0.05);
    head.rotation.z = Math.PI / 6;
    head.rotation.x = Math.PI / 2;
    group.add(head);
    // Glow effect
    const glowGeometry = new THREE.RingGeometry(1.1, 1.25, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.4 });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    group.add(glow);
    scene.add(group);

    // Animate with GSAP
    gsap.to(group.rotation, { y: Math.PI * 2, duration: 6, repeat: -1, ease: 'linear' });
    gsap.to(glow.material, { opacity: 0.7, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // Render loop
    const animate = () => {
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(requestRef.current);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: 120, height: 120, margin: '0 auto' }} aria-label="3D Direct Hit Icon" />
  );
};

export default Hero3DIcon; 