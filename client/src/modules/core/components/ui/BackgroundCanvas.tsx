import React, { useRef, useEffect } from 'react';
import { COLORS, hexToRgbA } from './constants';
import { useBackgroundEffect } from '../../contexts/BackgroundEffectContext';

const BackgroundCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { wave } = useBackgroundEffect();
    const waveRef = useRef(wave);

    useEffect(() => {
        waveRef.current = wave;
    }, [wave]);

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
            vx: number;
            vy: number;
            size: number;
            baseColor: string;
            highlightColor: string;
            opacity: number;
            pulseSpeed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 30 + 10;

                // Base colors (Blue/Cyan Theme)
                const baseColors = [COLORS.cyan, COLORS.sky, COLORS.blue, COLORS.darkBlue, COLORS.darkGrey];
                this.baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];

                // Highlight colors (Gold/Amber Theme)
                const highlightColors = [COLORS.gold, COLORS.amber];
                this.highlightColor = highlightColors[Math.floor(Math.random() * highlightColors.length)];

                this.opacity = Math.random() * 0.5;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
            }

            draw(context: CanvasRenderingContext2D, isHighlighted: boolean) {
                const colorToUse = isHighlighted ? this.highlightColor : this.baseColor;

                context.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = 2 * Math.PI / 6 * i;
                    const x_i = this.x + this.size * Math.cos(angle);
                    const y_i = this.y + this.size * Math.sin(angle);
                    if (i === 0) context.moveTo(x_i, y_i);
                    else context.lineTo(x_i, y_i);
                }
                context.closePath();
                context.fillStyle = hexToRgbA(colorToUse, this.opacity);
                context.fill();

                context.strokeStyle = hexToRgbA(colorToUse, 0.2);
                context.stroke();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                this.opacity += this.pulseSpeed;
                if (this.opacity > 0.6 || this.opacity < 0.1) this.pulseSpeed *= -1;
            }
        }

        const init = () => {
            particles = [];
            const numberOfParticles = (width * height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new HexParticle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const currentWave = waveRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();

                // Check distance to mouse to determine if highlighted
                let isHighlighted = false;
                if (mouse.x !== -9999) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 180) {
                        isHighlighted = true;
                    }
                }

                p.draw(ctx, isHighlighted);

                // Network Lines (Particle to Particle)
                for (let j = i; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        // Check if either particle is gold (highlighted by wave)
                        const isGold = p.highlightColor === COLORS.gold || p2.highlightColor === COLORS.gold;

                        if (isGold && currentWave.active) {
                            ctx.strokeStyle = `rgba(244, 179, 21, ${1 - distance / 100})`; // Gold line
                        } else {
                            ctx.strokeStyle = `rgba(37, 99, 235, ${1 - distance / 100})`; // Blue
                        }

                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Interaction Lines (Particle to Mouse)
                if (mouse.x !== -9999) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 180) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(244, 179, 21, ${1 - distance / 180})`; // Gold
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                // WAVE EFFECT INTERACTION
                if (currentWave.active) {
                    const timeElapsed = Date.now() - currentWave.startTime;

                    // Calculate exact distance to the furthest corner from the click source
                    const distToTL = Math.hypot(0 - currentWave.x, 0 - currentWave.y);
                    const distToTR = Math.hypot(width - currentWave.x, 0 - currentWave.y);
                    const distToBL = Math.hypot(0 - currentWave.x, height - currentWave.y);
                    const distToBR = Math.hypot(width - currentWave.x, height - currentWave.y);
                    const requiredDist = Math.max(distToTL, distToTR, distToBL, distToBR);

                    // Speed: reached requiredDist in exactly 3000ms
                    const waveRadius = (Math.min(timeElapsed, 3000) / 3000) * requiredDist;

                    const dx = p.x - currentWave.x;
                    const dy = p.y - currentWave.y;
                    const distToSource = Math.sqrt(dx * dx + dy * dy);

                    // If particle is touched by the expanding wave
                    if (Math.abs(distToSource - waveRadius) < 50) {
                        p.highlightColor = COLORS.gold; // Permanently turn gold for this session
                        p.baseColor = COLORS.gold;
                        // Do NOT force opacity to 1, let it pulse naturally
                        // p.opacity = 1;

                        // Draw line from source to particle
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(244, 179, 21, ${1 - Math.abs(distToSource - waveRadius) / 50})`;
                        ctx.lineWidth = 2;
                        ctx.moveTo(currentWave.x, currentWave.y);
                        ctx.lineTo(p.x, p.y);
                        ctx.stroke();
                    }

                    // If wave has passed, keep it gold but fade slightly
                    if (distToSource < waveRadius) {
                        p.baseColor = COLORS.gold;
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
        }

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

    return <canvas ref={canvasRef} className="block w-full h-full" />;
};

export default BackgroundCanvas;
