document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Simulation
    const loader = document.getElementById('loader');
    const progress = document.querySelector('.loader-progress');
    let loadValue = 0;

    const interval = setInterval(() => {
        loadValue += Math.random() * 15;
        if (loadValue > 100) loadValue = 100;

        if (progress) progress.style.width = `${loadValue}%`;

        if (loadValue === 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
                // Trigger Hero Animations after load
                triggerHeroAnimations();
            }, 500);
        }
    }, 200);

    // 2. Parallax Effect (optimized with requestAnimationFrame)
    const parallaxElements = document.querySelectorAll('.parallax');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });

    // 3. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.reveal-text, .reveal-image, .reveal-scale');
    animatedElements.forEach(el => observer.observe(el));

    // Helper: Trigger Hero animations immediately after load
    function triggerHeroAnimations() {
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
            const heroElements = heroSection.querySelectorAll('.reveal-text');
            heroElements.forEach(el => el.classList.add('active'));
        }
    }

    // 4. Smooth Scroll for "Scroll to Explore"
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const storySection = document.getElementById('story');
            if (storySection) storySection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 5. 3D Animation Setup (Three.js)
    if (typeof THREE !== 'undefined') {
        init3DAnimation();
    } else {
        console.warn('Three.js not loaded');
    }
});

function init3DAnimation() {
    // Inject CSS for Canvas
    const style = document.createElement('style');
    style.textContent = `
        #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
            background: radial-gradient(circle at center, #1b1b1b 0%, #000000 100%);
        }
        .hero-image { display: none !important; }
        .hero-section { background: transparent !important; }
        body { background-color: #000; }
    `;
    document.head.appendChild(style);

    const container = document.getElementById('canvas-container');
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OBJECTS
    // 1. Abstract Coffee Sphere (Liquid-like)
    const geometry = new THREE.IcosahedronGeometry(1.8, 10); // High detail for displacement
    const material = new THREE.MeshStandardMaterial({
        color: 0x4a3728, // Coffee brown
        roughness: 0.3,
        metalness: 0.4,
        flatShading: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 2. Floating Particles (Aroma/Steam)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xc69f7d, // Gold/Crema
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffaa00, 2, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0044ff, 1, 50); // Cool rim light
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Smooth rotation based on mouse
        sphere.rotation.y += 0.05 * (targetX - sphere.rotation.y);
        sphere.rotation.x += 0.05 * (targetY - sphere.rotation.x);

        // Constant idle rotation
        sphere.rotation.z += 0.002;

        // 1. Levitation Effect
        sphere.position.y = Math.sin(elapsedTime * 0.5) * 0.1;

        // 2. Organic Wobble (Liquid-like non-uniform scaling)
        sphere.scale.x = 1 + Math.sin(elapsedTime * 2.0) * 0.03;
        sphere.scale.y = 1 + Math.cos(elapsedTime * 2.2) * 0.03;
        sphere.scale.z = 1 + Math.sin(elapsedTime * 1.8) * 0.03;

        // 3. Dynamic Lighting (Orbiting light)
        pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 6;
        pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 6;

        // Particles rotation
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = -elapsedTime * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    // SCROLL INTERACTION (3D Zoom/Rotate)
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // Zoom out slightly on scroll
        camera.position.z = 5 + scrollY * 0.002;
        // Rotate sphere on scroll
        sphere.rotation.x += 0.01;
    });

    // RESIZE HANDLER
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ... existing code ...
// 1. Levitation Effect
sphere.position.y = Math.sin(elapsedTime * 0.5) * 0.1;

// 2. Organic Wobble (Liquid-like non-uniform scaling)
sphere.scale.x = 1 + Math.sin(elapsedTime * 2.0) * 0.03;
sphere.scale.y = 1 + Math.cos(elapsedTime * 2.2) * 0.03;
sphere.scale.z = 1 + Math.sin(elapsedTime * 1.8) * 0.03;

// 3. Dynamic Lighting (Orbiting light)
pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 6;
pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 6;
// ... existing code ...
// SCROLL INTERACTION (3D Zoom/Rotate)
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    // Zoom out slightly on scroll
    camera.position.z = 5 + scrollY * 0.002;
    // Rotate sphere on scroll
    sphere.rotation.x += 0.01;
});
// ... existing code ...