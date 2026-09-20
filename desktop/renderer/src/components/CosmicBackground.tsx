import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface Planet {
  x: number;
  y: number;
  size: number;
  color: string;
  rotationSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize stars
    const initStars = () => {
      const colors = ['#ffffff', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];
      starsRef.current = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    // Initialize shooting stars
    const initShootingStars = () => {
      shootingStarsRef.current = Array.from({ length: 3 }, () => ({
        x: 0,
        y: 0,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 10 + 10,
        angle: Math.random() * Math.PI / 4 + Math.PI / 6,
        opacity: 0,
        active: false
      }));
    };

    // Initialize planets
    const initPlanets = () => {
      const planetColors = ['#8b5cf6', '#06b6d4', '#ec4899'];
      planetsRef.current = Array.from({ length: 3 }, (_, i) => ({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 20 + 15,
        color: planetColors[i],
        rotationSpeed: Math.random() * 0.02 + 0.01,
        orbitRadius: Math.random() * 200 + 150,
        orbitSpeed: Math.random() * 0.005 + 0.002,
        angle: (i * Math.PI * 2) / 3
      }));
    };

    initStars();
    initShootingStars();
    initPlanets();

    // Draw stars
    const drawStars = () => {
      starsRef.current.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.fill();

        // Add glow effect for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 2
          );
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = star.opacity * 0.3;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };

    // Update stars
    const updateStars = () => {
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        // Twinkle effect
        star.opacity = Math.sin(Date.now() * 0.001 * star.speed) * 0.3 + 0.7;
      });
    };

    // Draw shooting stars
    const drawShootingStars = () => {
      shootingStarsRef.current.forEach(star => {
        if (!star.active) return;

        const endX = star.x - Math.cos(star.angle) * star.length;
        const endY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    };

    // Update shooting stars
    const updateShootingStars = () => {
      shootingStarsRef.current.forEach(star => {
        if (star.active) {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.02;

          if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
            star.active = false;
          }
        } else if (Math.random() < 0.001) {
          // Randomly activate shooting star
          star.x = Math.random() * canvas.width * 0.5;
          star.y = Math.random() * canvas.height * 0.3;
          star.opacity = 1;
          star.active = true;
        }
      });
    };

    // Draw planets
    const drawPlanets = () => {
      planetsRef.current.forEach(planet => {
        const x = planet.x + Math.cos(planet.angle) * planet.orbitRadius;
        const y = planet.y + Math.sin(planet.angle) * planet.orbitRadius;

        // Draw orbit path
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw planet
        const gradient = ctx.createRadialGradient(
          x - planet.size / 3, y - planet.size / 3, 0,
          x, y, planet.size
        );
        gradient.addColorStop(0, planet.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

        ctx.beginPath();
        ctx.arc(x, y, planet.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glow
        ctx.beginPath();
        ctx.arc(x, y, planet.size * 1.5, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(x, y, planet.size, x, y, planet.size * 1.5);
        glowGradient.addColorStop(0, planet.color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };

    // Update planets
    const updatePlanets = () => {
      planetsRef.current.forEach(planet => {
        planet.angle += planet.orbitSpeed;
      });
    };

    // Draw nebula
    const drawNebula = () => {
      const time = Date.now() * 0.0001;
      
      // Purple nebula
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.3, 0,
        canvas.width * 0.2, canvas.height * 0.3, 300
      );
      gradient1.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan nebula
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.7, 0,
        canvas.width * 0.8, canvas.height * 0.7, 300
      );
      gradient2.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pink nebula
      const gradient3 = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, 0,
        canvas.width * 0.5, canvas.height * 0.5, 400
      );
      gradient3.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
      gradient3.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawNebula();
      drawStars();
      updateStars();
      
      drawShootingStars();
      updateShootingStars();
      
      drawPlanets();
      updatePlanets();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
