// Get elements
const diagram = document.querySelector('.dots-diagram');
const diagramWrapper = document.querySelector('.diagram-wrapper');
const labels = document.querySelectorAll('.label');

// Animation parameters
const rotationSpeed = 0.0003; // Radians per millisecond (slow rotation)
const baseRadius = 230; // Base distance of labels from center
const repulsionRadius = 200; // SVG radius to stay away from
const repulsionStrength = 30; // How far labels push away when close
let startTime = Date.now();

// Initial positions for labels (in radians)
const labelPositions = [
    0,          // composição (top)
    0.9,        // produção musical
    1.8,        // masterização
    2.7,        // experience design
    3.6,        // mixagem
    4.5,        // tratamento de áudio
    5.4         // sound design
];

function calculateRepulsion(angle) {
    // Calculate how close we are to the SVG edge
    const distanceToEdge = Math.abs(Math.sin(angle) * repulsionRadius);
    const repulsion = Math.max(0, repulsionStrength * (1 - (distanceToEdge / repulsionRadius)));
    return baseRadius + repulsion;
}

function positionLabels(rotation) {
    const wrapperRect = diagramWrapper.getBoundingClientRect();
    const centerX = wrapperRect.width / 2;
    const centerY = wrapperRect.height / 2;

    labels.forEach((label, index) => {
        const angle = labelPositions[index] + rotation;
        const currentRadius = calculateRepulsion(angle);
        
        const x = centerX + currentRadius * Math.cos(angle);
        const y = centerY + currentRadius * Math.sin(angle);
        
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        
        // Smooth transition for repulsion
        label.style.transition = 'all 0.3s ease-out';
    });
}

// Initialize wobble effect
async function initWobble() {
    const svgs = document.querySelectorAll('.dots-diagram');
    if (svgs.length === 0) return;

    const svg = svgs[0];
    const filterId = 'wobble-filter';
    
    // Create defs if it doesn't exist
    let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create filter element
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    // Create turbulence
    const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
    turbulence.setAttribute('id', 'wobble-turbulence');
    turbulence.setAttribute('type', 'fractalNoise');
    turbulence.setAttribute('baseFrequency', '0.0008');
    turbulence.setAttribute('numOctaves', '100');
    turbulence.setAttribute('seed', '0');

    // Create displacement map
    const displacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    displacementMap.setAttribute('in', 'SourceGraphic');
    displacementMap.setAttribute('in2', 'turbulence');
    displacementMap.setAttribute('scale', '3');
    displacementMap.setAttribute('xChannelSelector', 'R');
    displacementMap.setAttribute('yChannelSelector', 'G');

    // Assemble filter
    filter.appendChild(turbulence);
    filter.appendChild(displacementMap);
    defs.appendChild(filter);
    
    svg.appendChild(defs);
    svg.style.filter = `url(#${filterId})`;
}

function animate() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    // Counter-clockwise rotation
    const rotation = -elapsed * rotationSpeed;
    diagram.style.transform = `rotate(${rotation}rad)`;
    positionLabels(rotation);

    // Animate wobble
    const turbulence = document.getElementById('wobble-turbulence');
    if (turbulence) {
        const seed = Math.sin(elapsed * 0.001) * 1000; // Wobble speed
        turbulence.setAttribute('seed', seed.toString()); // Wobble speed
    }

    requestAnimationFrame(animate);
}

// Start animation when page is ready
window.addEventListener('load', async () => {
    // First initialize the wobble effect
    await initWobble();
    // Then start the animation
    animate();
});

// Re-calculate positions on window resize
window.addEventListener('resize', () => {
    // Animation continues automatically with updated positions
});