// Initialize GSAP and Three.js
console.log("App starting...");

// --- THREE.JS SCENE SETUP ---
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize for retina
    container.appendChild(renderer.domElement);

    // Create a "Coffee-like" Abstract Shape (TorusKnot representing steam/aroma)
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    // Use a custom shader or simple material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xd4a373, // Coffee/Gold
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
        wireframe: false
    });

    // Wireframe overlay for "Tech/Modern" feel
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);

    const torusKnot = new THREE.Mesh(geometry, material);
    torusKnot.add(wireframe);
    scene.add(torusKnot);

    // Particles (Steam/Aroma)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Random spread
        posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xfaedcd, // Light foam color
        transparent: true,
        opacity: 0.6
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);


    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    // Camera Position
    camera.position.z = 30;

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

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        const elapsedTime = clock.getElapsedTime();

        // Rotate Object
        torusKnot.rotation.y += 0.5 * (targetX - torusKnot.rotation.y) + 0.005;
        torusKnot.rotation.x += 0.5 * (targetY - torusKnot.rotation.x) + 0.005;
        torusKnot.position.y = Math.sin(elapsedTime) * 1; // Float effect

        // Animate particles
        particlesMesh.rotation.y = -elapsedTime * 0.1;
        particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 2; // subtle wave

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};

// --- GSAP ANIMATIONS ---
const initAnimations = () => {
    gsap.registerPlugin(ScrollTrigger);

    // Loader Animation
    const tl = gsap.timeline();

    // Hide loader
    // (CSS handles the fade out, but let's sync elements appearing)

    // Hero Elements Entry (start after loader)
    tl.to('.hero-content h1', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 2.5 })
        .to('.hero-content p', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6")
        .to('#cta-btn', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6");

    // Scroll Animations for Sections
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section.children, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });
    });

    // Parallax for About Image
    gsap.to('.mock-image', {
        scrollTrigger: {
            trigger: '#about',
            scrub: true
        },
        y: -50, // Parallax movement
        ease: 'none'
    });
};

// --- API INTEGRATION ---
const loadProducts = async () => {
    const container = document.getElementById('products-container');

    try {
        const response = await fetch('/api/products');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const products = await response.json();

        container.innerHTML = ''; // Clear loading

        products.forEach((product, index) => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            // Adding a stagger delay for entrance
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            // Reliable placeholder
            const imgUrl = `https://placehold.co/400x300/1a1a1a/d4a373?text=${product.name.replace(' ', '+')}`;

            card.innerHTML = `
                <div class="product-image" style="background: url('${imgUrl}') center/cover no-repeat; height: 200px; width: 100%;"></div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-desc">${product.description}</div>
                <div style="margin-top: auto;">
                    <button class="btn-primary" onclick="addToOrder('${product.name}', ${product.price})">Add to Order</button>
                </div>
            `;
            container.appendChild(card);

            // Animate in
            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: index * 0.1, // staggered
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%'
                }
            });
        });

    } catch (error) {
        console.error('Failed to fetch products:', error);

        // --- FALLBACK FOR DEMO if Backend is offline ---
        const container = document.getElementById('products-container');
        container.innerHTML = '';

        const fallbackProducts = [
            { id: 1, name: "Espresso Supreme", price: 4.50, description: "Rich and dark roast.", image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80" },
            { id: 2, name: "Latte Artistico", price: 5.00, description: "Creamy milk with a hint of vanilla.", image: "https://images.unsplash.com/photo-1595434091143-b375ced5fe5c?auto=format&fit=crop&w=500&q=80" },
            { id: 3, name: "Cold Brew", price: 5.50, description: "Smooth and refreshing.", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=80" }
        ];

        fallbackProducts.forEach((product, index) => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            const imgUrl = product.image;

            card.innerHTML = `
                <div class="product-image" style="background: url('${imgUrl}') center/cover no-repeat; height: 200px; width: 100%;"></div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price ? product.price.toFixed(2) : '5.00'}</div>
                <div class="product-desc">${product.description}</div>
                <div style="margin-top: auto;">
                    <button class="btn-primary" onclick="addToOrder('${product.name}', ${product.price})">Add (Demo)</button>
                </div>
            `;
            container.appendChild(card);

            // Simple fade in for fallback
            gsap.fromTo(card,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, delay: index * 0.2, ease: 'power2.out' }
            );
        });
    }
};

window.addToOrder = (name, price) => {
    // Simple alert or toast
    const btn = event.target;
    const originalText = btn.innerText;

    // Optimistic UI
    btn.innerText = "Added!";
    btn.style.backgroundColor = "#fff";
    btn.style.color = "#000";

    // Simulate Backend Call
    fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ name, price }], total: price })
    })
        .then(res => res.json())
        .then(data => {
            console.log("Order placed:", data);
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
                btn.style.color = "";
            }, 2000);
        })
        .catch(err => {
            console.log("Offline mode order");
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
                btn.style.color = "";
            }, 2000);
        });
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initAnimations();
    loadProducts();
});
