import React from 'react';
import Logo from './Logo';

const OnboardingCard: React.FC = () => {
  const handleStart = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Masuk ke Dashboard...');
  };

  return (
    <div className="
      relative 
      w-full 
      max-w-[800px] 
      p-10 
      text-center 
      rounded-3xl 
      bg-brand-bg/70 
      backdrop-blur-md 
      border border-brand-cyan/20 
      shadow-[0_0_50px_rgba(0,0,0,0.8)] 
      animate-float-up
    ">
      {/* Logo Container */}
      <div className="
        w-[150px] 
        h-[150px] 
        mx-auto 
        mb-5 
        relative 
        flex 
        justify-center 
        items-center
        bg-white/5
        animate-pulse-glow
      "
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
        }}
      >
        <div className="w-[90%] h-[90%] p-2">
          <Logo />
        </div>
      </div>

      {/* Typography */}
      <h1 className="
        text-4xl 
        md:text-5xl 
        mb-3 
        font-bold 
        text-transparent 
        bg-clip-text
        bg-gradient-to-r from-brand-cyan to-brand-blue
        uppercase 
        tracking-widest 
        drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]
      ">
        C-SYSTEM
      </h1>

      <p className="
        text-lg 
        md:text-xl 
        text-brand-text 
        mb-8 
        leading-relaxed
      ">
        Sistem Integrasi Panahan.<br />
        Menghubungkan ekosistem, meningkatkan performa.
      </p>

      {/* Action Button */}
      <a
        href="#"
        onClick={handleStart}
        className="
          inline-block 
          px-12 
          py-4 
          text-xl 
          font-bold 
          text-brand-bg 
          bg-gradient-to-r from-brand-cyan to-brand-blue
          rounded-full 
          shadow-[0_0_20px_rgba(34,211,238,0.4)]
          transition-all 
          duration-300 
          ease-out 
          hover:-translate-y-1 
          hover:scale-105 
          hover:shadow-[0_0_35px_rgba(34,211,238,0.6)]
          border border-brand-cyan/50
        "
      >
        MULAI SEKARANG
      </a>
    </div>
  );
};

export default OnboardingCard;