// HeroSection.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

gsap.registerPlugin(ScrollTrigger);

export const Component = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const scrollProgressRef = useRef(null);
  const menuRef = useRef(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const cameraVelocity = useRef({ x: 0, y: 0, z: 0 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;

  const threeRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null
  });

  // Initialize Three.js
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;

      // Scene setup
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      // Camera
      refs.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;

      // Renderer
      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      // Post-processing
      refs.composer = new EffectComposer(refs.renderer);
      const renderPass = new RenderPass(refs.scene, refs.camera);
      refs.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,
        0.4,
        0.85
      );
      refs.composer.addPass(bloomPass);

      // Create scene elements
      createStarField();
      createNebula();
      createMountains();
      createAtmosphere();
      getLocation();

      // Start animation
      animate();

      // Mark as ready after Three.js is initialized
      setIsReady(true);
    };

    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;

      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Color variation
          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) {
            color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          } else if (colorChoice < 0.9) {
            color.setHSL(0.08, 0.5, 0.8);
          } else {
            color.setHSL(0.6, 0.5, 0.8);
          }

          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;

            void main() {
              vColor = color;
              vec3 pos = position;

              // Slow rotation based on depth
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;

            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;

              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x0033ff) },
          color2: { value: new THREE.Color(0xff0066) },
          opacity: { value: 0.3 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);

            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      nebula.rotation.x = 0;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const { current: refs } = threeRefs;

      const layers = [
        { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
        { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
        { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
        { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 }
      ];

      layers.forEach((layer, index) => {
        const points = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y = Math.sin(i * 0.1) * layer.height +
                   Math.sin(i * 0.05) * layer.height * 0.5 +
                   Math.random() * layer.height * 0.2 - 100;
          points.push(new THREE.Vector2(x, y));
        }

        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    const createAtmosphere = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;

          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;

            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;

            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
    };

    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Update stars
      refs.stars.forEach((starField, _i) => {
        if (starField.material.uniforms) {
          starField.material.uniforms.time.value = time;
        }
      });

      // Update nebula
      if (refs.nebula && refs.nebula.material.uniforms) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      // Smooth camera movement with easing
      if (refs.camera && refs.targetCameraX !== undefined) {
        const smoothingFactor = 0.05;

        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * smoothingFactor;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * smoothingFactor;

        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;

        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      // Parallax mountains with subtle animation
      refs.mountains.forEach((mountain, i) => {
        const parallaxFactor = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * parallaxFactor;
        mountain.position.y = 50 + (Math.cos(time * 0.15) * 1 * parallaxFactor);
      });

      if (refs.composer) {
        refs.composer.render();
      }
    };

    initThree();

    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      const { current: refs } = threeRefs;

      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }

      window.removeEventListener('resize', handleResize);

      refs.stars.forEach(starField => {
        starField.geometry.dispose();
        starField.material.dispose();
      });

      refs.mountains.forEach(mountain => {
        mountain.geometry.dispose();
        mountain.material.dispose();
      });

      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        refs.nebula.material.dispose();
      }

      if (refs.renderer) {
        refs.renderer.dispose();
      }
    };
  }, []);

  const getLocation = () => {
    const { current: refs } = threeRefs;
    const locations: number[] = [];
    refs.mountains.forEach((mountain: THREE.Mesh, i: number) => {
      locations[i] = mountain.position.z;
    });
    refs.locations = locations;
  };

  // GSAP Animations - Run after component is ready
  useEffect(() => {
    if (!isReady) return;

    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], {
      visibility: 'visible'
    });

    const tl = gsap.timeline();

    if (menuRef.current) {
      tl.from(menuRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }

    if (titleRef.current) {
      const titleChars = titleRef.current.querySelectorAll('.title-char');
      tl.from(titleChars, {
        y: 200,
        opacity: 0,
        duration: 1.5,
        stagger: 0.05,
        ease: "power4.out"
      }, "-=0.5");
    }

    if (subtitleRef.current) {
      const subtitleLines = subtitleRef.current.querySelectorAll('.subtitle-line');
      tl.from(subtitleLines, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      }, "-=0.8");
    }

    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");
    }

    return () => {
      tl.kill();
    };
  }, [isReady]);

  // Holographic foil shimmer + 3D tilt + idle orbit
  useEffect(() => {
    if (!isReady) return;

    const titles = Array.from(
      document.querySelectorAll('.hero-title')
    ) as HTMLElement[];

    titles.forEach(el => {
      el.style.willChange = 'transform';
      el.style.transition = 'none';
    });

    // ── Idle orbit ───────────────────────────────────────────────────────
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const ORBIT_PERIOD = 30000;
    let orbitRaf = 0;
    let startTime = performance.now();
    let mouseActive = false; // true while mouse is on the page

    const orbitTick = (now: number) => {
      orbitRaf = requestAnimationFrame(orbitTick);
      if (mouseActive || isMobile) return; // mouse or mobile scroll drives gradient
      const t = ((now - startTime) % ORBIT_PERIOD) / ORBIT_PERIOD;
      const θ = t * Math.PI * 2;
      const hx = 50 + 38 * Math.cos(θ);
      const hy = 40 + 28 * Math.sin(θ);
      const angle = (θ * (180 / Math.PI) + 138) % 360;
      titles.forEach(el => {
        el.style.setProperty('--hangle', `${angle}deg`);
        el.style.setProperty('--hx', `${hx}%`);
        el.style.setProperty('--hy', `${hy}%`);
        el.style.setProperty('background-position', `${hx}% ${hy}%`);
      });
    };
    orbitRaf = requestAnimationFrame(orbitTick);

    // ── Global mouse tilt + gradient ─────────────────────────────────────
    // Tilt and shimmer respond to mouse anywhere on screen — no hover zones,
    // no enter/leave snapping. The whole viewport is the interaction surface.
    let globalRaf = 0;

    const onMove = (e: MouseEvent) => {
      mouseActive = true;
      cancelAnimationFrame(globalRaf);
      globalRaf = requestAnimationFrame(() => {
        const mx = e.clientX / window.innerWidth;   // 0..1
        const my = e.clientY / window.innerHeight;  // 0..1

        // Tilt: gentle screen-relative lean (±4° y, ±3° x)
        const ry =  (mx - 0.5) * 8;
        const rx = -(my - 0.5) * 6;

        // Gradient: specular follows mouse mapped across the title
        const hx = 20 + mx * 60; // 20%..80%
        const hy = 20 + my * 60;
        const angle = Math.atan2(my - 0.5, mx - 0.5) * (180 / Math.PI) + 138;

        titles.forEach(el => {
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          el.style.setProperty('--hangle', `${angle}deg`);
          el.style.setProperty('--hx', `${hx}%`);
          el.style.setProperty('--hy', `${hy}%`);
          el.style.setProperty('background-position', `${hx}% ${hy}%`);
        });
      });
    };

    const onLeaveWindow = () => {
      mouseActive = false;
      // Sync orbit to current gradient position so it continues seamlessly
      const hxVal = parseFloat(titles[0]?.style.getPropertyValue('--hx')) || 50;
      const hyVal = parseFloat(titles[0]?.style.getPropertyValue('--hy')) || 40;
      const θ = Math.atan2((hyVal - 40) / 28, (hxVal - 50) / 38);
      const t = ((θ / (Math.PI * 2)) + 1) % 1;
      startTime = performance.now() - t * ORBIT_PERIOD;

      // Ease tilt back to flat
      titles.forEach(el => {
        el.style.transition = 'transform 1.2s cubic-bezier(0.23,1,0.32,1)';
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      });
      // Remove transition after ease completes so mouse tracking is instant again
      setTimeout(() => titles.forEach(el => { el.style.transition = 'none'; }), 1250);
    };

    // ── Mobile scroll tilt ────────────────────────────────────────────────
    let mobileRaf = 0;
    if (isMobile) {
      let tiltX = 0;
      const mobileTick = () => {
        mobileRaf = requestAnimationFrame(mobileTick);
        // Map scroll position within the hero (0..innerHeight) to tilt angle.
        // Top = +3.5° (lean forward), mid = 0°, bottom = -3.5° (lean back).
        // Mirrors how desktop maps mouse Y position to the same ±3.5° range.
        const norm = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
        const target = (0.5 - norm) * 7;
        tiltX += (target - tiltX) * 0.1; // smooth follow, holds at scroll position
        titles.forEach(el => {
          el.style.transition = 'none';
          el.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(3)}deg)`;
        });
      };
      mobileRaf = requestAnimationFrame(mobileTick);
    } else {
      window.addEventListener('mousemove', onMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', onLeaveWindow);
    }

    return () => {
      cancelAnimationFrame(orbitRaf);
      cancelAnimationFrame(globalRaf);
      cancelAnimationFrame(mobileRaf);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow);
    };
  }, [isReady]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      // Hero container is exactly 300vh — calculate progress only within it
      const heroHeight = windowHeight * 3;
      const maxScroll = heroHeight - windowHeight;
      const progress = Math.min(scrollY / maxScroll, 1);

      // Smoothly fade canvas out in last 15% of hero, hide fully after
      const canvas = document.querySelector('.hero-canvas') as HTMLElement;
      if (canvas) {
        if (scrollY > heroHeight) {
          canvas.style.opacity = '0';
        } else {
          canvas.style.opacity = '1';
        }
      }

      setScrollProgress(progress);
      const newSection = Math.floor(progress * totalSections);
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;

      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;

      const cameraPositions = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 }
      ];

      const currentPos = cameraPositions[newSection] || cameraPositions[0];
      const nextPos = cameraPositions[newSection + 1] || currentPos;

      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;

      refs.mountains.forEach((mountain: THREE.Mesh, i: number) => {
        const speed = 1 + i * 0.9;
        const targetZ = mountain.userData.baseZ + scrollY * speed * 0.5;
        refs.nebula.position.z = (targetZ + progress * speed * 0.01) - 100;

        mountain.userData.targetZ = targetZ;
        if (progress > 0.7) {
          mountain.position.z = 600000;
        }
        if (progress < 0.7) {
          mountain.position.z = refs.locations[i];
        }
      });
      refs.nebula.position.z = refs.mountains[3].position.z;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  // Mobile: gradient shift on scroll + shine sweep on viewport entry
  useEffect(() => {
    if (!isReady) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    const titles = Array.from(
      document.querySelectorAll('.hero-title')
    ) as HTMLElement[];
    let rafId = 0;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        titles.forEach((el, i) => {
          const hx = 50 + 35 * Math.sin(scrollY * 0.004 + i * 2.1);
          const hy = 40 + 28 * Math.cos(scrollY * 0.003 + i * 1.7);
          const angle = (scrollY * 0.08 + i * 120) % 360;
          el.style.setProperty('--hx', `${hx}%`);
          el.style.setProperty('--hy', `${hy}%`);
          el.style.setProperty('--hangle', `${angle}deg`);
          el.style.setProperty('background-position', `${hx}% ${hy}%`);
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isReady]);

  return (
    <div ref={containerRef} className="hero-container cosmos-style">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Side menu */}
      <div ref={menuRef} className="side-menu" style={{ visibility: 'hidden' }}>
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="vertical-text">LUXURY</div>
      </div>

      {/* Main content */}
      <div className="hero-content cosmos-content">
        <h1 ref={titleRef} className="hero-title stacked-title">
          <span className="title-line">TROPICAL</span>
          <span className="title-line">LUXURIES</span>
        </h1>

        <div ref={subtitleRef} className="hero-subtitle cosmos-subtitle">
          <p className="subtitle-line">Connecting entrepreneurs around the world.</p>
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div ref={scrollProgressRef} className="scroll-progress" style={{ visibility: 'hidden' }}>
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <div className="section-counter">
          {String(currentSection).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
        </div>
      </div>

      {/* Additional sections for scrolling */}
      <div className="scroll-sections">
       {[...Array(2)].map((_, i) => {
          const titles: Record<number, string> = {
            0: 'ESCAPE',
            1: 'PRESENTS',
            2: 'THE GOLDEN CIRCUIT'
          };

          const subtitles: Record<number, { line1: string; line2: string }> = {
            0: {
              line1: 'Connecting entrepreneurs around the world.',
              line2: ''
            },
            1: {
              line1: "A world most people don't know exists.",
              line2: ''
            },
            2: {
              line1: "Built for the ones who know",
              line2: "they're meant for more."
            }
          };

          return (
            <section key={i} className="content-section">
              <h1 className="hero-title">
                {titles[i+1] || 'DEFAULT'}
              </h1>

              <div className="hero-subtitle cosmos-subtitle">
                <p className="subtitle-line">{subtitles[i+1].line1}</p>
                {subtitles[i+1].line2 && (
                  <p className="subtitle-line">{subtitles[i+1].line2}</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
