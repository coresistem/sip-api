import React, { useRef, useEffect } from 'react';

const COLORS = {
    cyan: '#22D3EE',
    sky: '#0EA5E9',
    blue: '#2563EB',
    darkBlue: '#1E40AF',
    darkGrey: '#334155',
    gold: '#FBBF24',
    white: '#FFFFFF',
};

// Helper to parse hex to [r,g,b]
const hexToRgbVals = (hex: string): [number, number, number] => {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        // eslint-disable-next-line no-bitwise
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    }
    return [0, 0, 0];
};

const formatRgba = (rgb: [number, number, number], alpha: number) => {
    return `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${alpha})`;
};

interface BackgroundCanvasProps {
    progress?: number;
}

const ComplexBackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ progress = 0 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef(progress);

    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let particles: HexParticle[] = [];
        let animationFrameId: number;

        const mouse = { x: -9999, y: -9999 };

        class HexParticle {
            x: number;
            y: number;

            // Physics properties
            originX: number; // Where it wants to be
            originY: number;
            vx: number; // Velocity X
            vy: number; // Velocity Y
            friction: number;
            ease: number;

            size: number;
            baseColorHex: string;
            baseRgb: [number, number, number];
            opacity: number;
            pulseSpeed: number;
            rotation: number;
            rotationSpeed: number;

            constructor() {
                this.originX = Math.random() * width;
                this.originY = Math.random() * height;
                this.x = this.originX;
                this.y = this.originY;

                this.vx = 0;
                this.vy = 0;
                this.friction = 0.90; // How fast it slows down after being pushed
                this.ease = 0.05; // How fast it returns home

                this.size = Math.random() * 30 + 10;

                const baseColors = [COLORS.cyan, COLORS.sky, COLORS.blue, COLORS.darkBlue, COLORS.darkGrey];
                this.baseColorHex = baseColors[Math.floor(Math.random() * baseColors.length)];
                this.baseRgb = hexToRgbVals(this.baseColorHex);

                this.opacity = Math.random() * 0.5;
                this.pulseSpeed = Math.random() * 0.01 + 0.002;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.01;
            }

            update(width: number, height: number, isInfected: boolean, mouseX: number, mouseY: number) {
                // 1. Natural Drift / Orbit
                if (isInfected) {
                    this.rotation += this.rotationSpeed * 4;
                } else {
                    this.rotation += this.rotationSpeed;
                }

                this.opacity += this.pulseSpeed;
                if (this.opacity > 0.6 || this.opacity < 0.1) this.pulseSpeed *= -1;

                // 2. MOUSE INTERACTION (The Toy)
                // Calculate distance from mouse
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDistance = 150; // Radius of repulsion

                if (distance < forceDistance) {
                    // Calculate repulsion angle
                    const angle = Math.atan2(dy, dx);
                    const force = -((forceDistance - distance) / forceDistance) * 4; // Strength of push

                    // Apply velocity
                    const pushX = Math.cos(angle) * force;
                    const pushY = Math.sin(angle) * force;

                    this.vx += pushX;
                    this.vy += pushY;
                }

                // 3. Physics Integrations
                // Move back towards origin
                this.vx += (this.originX - this.x) * this.ease;
                this.vy += (this.originY - this.y) * this.ease;

                // Apply friction
                this.vx *= this.friction;
                this.vy *= this.friction;

                // Update position
                this.x += this.vx;
                this.y += this.vy;
            }

            draw(context: CanvasRenderingContext2D, isInfected: boolean, isWaveFront: boolean, time: number) {
                context.save();
                context.translate(this.x, this.y);
                context.rotate(this.rotation);

                context.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = 2 * Math.PI / 6 * i;
                    let currentSize = this.size;
                    if (isWaveFront) currentSize *= 1.4;
                    else if (isInfected) currentSize *= 1.05;

                    const x_i = currentSize * Math.cos(angle);
                    const y_i = currentSize * Math.sin(angle);
                    if (i === 0) context.moveTo(x_i, y_i);
                    else context.lineTo(x_i, y_i);
                }
                context.closePath();

                if (isWaveFront) {
                    context.shadowBlur = 30;
                    context.shadowColor = '#FEF08A';
                    context.fillStyle = '#FEF9C3';
                    context.fill();
                } else if (isInfected) {
                    // ELEGANT GRADIENT - Light Yellow to Gold
                    const grad = context.createLinearGradient(-this.size, -this.size, this.size, this.size);
                    grad.addColorStop(0, '#FEF08A');
                    grad.addColorStop(0.5, '#FBBF24');
                    grad.addColorStop(1, '#D97706');

                    // PULSING NEON EFFECT (Glow Only)
                    const pulsePhase = (time * 0.003) + (this.x * 0.005) + (this.y * 0.005);
                    const pulse = (Math.sin(pulsePhase) + 1) / 2;

                    context.shadowBlur = 20 + (pulse * 25);
                    context.shadowColor = '#F59E0B';

                    context.fillStyle = grad;
                    context.fill();
                    // No stroke
                } else {
                    const displayRgb = this.baseRgb;
                    context.fillStyle = formatRgba(displayRgb, this.opacity);
                    context.fill();
                    context.strokeStyle = formatRgba(displayRgb, 0.3);
                    context.lineWidth = 1;
                    context.stroke();
                }
                context.restore();
            }
        }

        const init = () => {
            particles = [];
            const numberOfParticles = (width * height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new HexParticle());
            }
        };

        const getIntersectionT = (p1: HexParticle, p2: HexParticle, cx: number, cy: number, r: number) => {
            const fx = p1.x - cx;
            const fy = p1.y - cy;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            const A = dx * dx + dy * dy;
            const B = 2 * (fx * dx + fy * dy);
            const C = (fx * fx + fy * fy) - r * r;

            const discriminant = B * B - 4 * A * C;
            if (discriminant < 0) return 0;

            const t = (-B + Math.sqrt(discriminant)) / (2 * A);
            return Math.min(Math.max(t, 0), 1);
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            const pVal = progressRef.current;
            const t = Math.min(Math.max(pVal / 100, 0), 1);

            const cx = width / 2;
            const cy = height / 2;
            const maxDist = Math.sqrt(cx * cx + cy * cy);

            const currentRadius = t * maxDist * 1.2;
            const now = Date.now();

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Determine state
                const distToCenter = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
                const isInfected = distToCenter < currentRadius;

                // Pass Mouse coords to update for physics
                p.update(width, height, isInfected, mouse.x, mouse.y);

                const isWaveFront = isInfected && (distToCenter > currentRadius - 50);

                p.draw(ctx, isInfected, isWaveFront, now);

                // Draw Network Lines
                for (let j = i; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Lines stretch when repelled, so increase threshold slightly
                    if (distance < 130) {
                        const distToCenter2 = Math.sqrt((p2.x - cx) ** 2 + (p2.y - cy) ** 2);
                        const isInfected2 = distToCenter2 < currentRadius;

                        const phase = (now / 400) + (i * 0.1);
                        const pulse = (Math.sin(phase) + 1) / 2;

                        const mr = 251 + (3 * pulse);
                        const mg = 191 + (58 * pulse);
                        const mb = 36 + (159 * pulse);
                        const midColor = `rgb(${Math.round(mr)}, ${Math.round(mg)}, ${Math.round(mb)})`;

                        const gradient = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                        gradient.addColorStop(0, '#FBBF24');
                        gradient.addColorStop(0.5, midColor);
                        gradient.addColorStop(1, '#FBBF24');

                        ctx.strokeStyle = gradient;
                        ctx.beginPath();

                        if (isInfected && isInfected2) {
                            ctx.globalAlpha = Math.min(1, 1.2 - (distance / 130));
                            ctx.lineWidth = 1.5;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        } else if (!isInfected && !isInfected2) {
                            ctx.globalAlpha = (1 - (distance / 130)) * 0.15;
                            ctx.lineWidth = 0.5;
                            ctx.strokeStyle = '#94A3B8'; // Slate-400
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        } else {
                            const inner = isInfected ? p : p2;
                            const outer = isInfected ? p2 : p;

                            const intersectT = getIntersectionT(inner, outer, cx, cy, currentRadius);
                            const ix = inner.x + (outer.x - inner.x) * intersectT;
                            const iy = inner.y + (outer.y - inner.y) * intersectT;

                            // Active part
                            ctx.globalAlpha = 1;
                            ctx.lineWidth = 1.5;
                            ctx.strokeStyle = '#FBBF24';
                            ctx.beginPath();
                            ctx.moveTo(inner.x, inner.y);
                            ctx.lineTo(ix, iy);
                            ctx.stroke();

                            // Inactive part
                            ctx.globalAlpha = 0.2;
                            ctx.lineWidth = 0.5;
                            ctx.strokeStyle = '#94A3B8';
                            ctx.beginPath();
                            ctx.moveTo(ix, iy);
                            ctx.lineTo(outer.x, outer.y);
                            ctx.stroke();

                            // Spark head
                            ctx.globalAlpha = 1;
                            ctx.fillStyle = '#FEF08A';
                            ctx.beginPath();
                            ctx.arc(ix, iy, 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1.0;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        handleResize();
        animate();

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />;
};

export default ComplexBackgroundCanvas;
