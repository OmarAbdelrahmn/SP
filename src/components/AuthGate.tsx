'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Clock } from 'lucide-react';

interface AuthGateProps {
  onUnlock: () => void;
  expiredReason?: string | null;
}

const CORRECT_PASSWORD = 'P@ssword1234';

export const AuthGate: React.FC<AuthGateProps> = ({ onUnlock, expiredReason }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus password input automatically on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password) {
      setError('يرجى إدخال كلمة المرور للمتابعة.');
      triggerShake();
      return;
    }

    if (password === CORRECT_PASSWORD) {
      setError(null);
      onUnlock();
    } else {
      setError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
      triggerShake();
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #060911 100%)',
        padding: '20px',
        overflow: 'hidden',
        fontFamily: "'Almarai', 'Tajawal', sans-serif",
      }}
    >
      {/* Background Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          top: '20%',
          left: '30%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0) 70%)',
          bottom: '15%',
          right: '25%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        className={isShaking ? 'shake-animation' : ''}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Lock Icon Emblem */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.4)',
            color: '#818cf8',
          }}
        >
          <Lock size={32} />
        </div>

        {/* Title & Description */}
        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          منظومة إصدار وتخصيص البطاقات
        </h1>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            marginBottom: '24px',
            lineHeight: 1.6,
          }}
        >
          يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم والطباعة.
          <br />
          <span style={{ fontSize: '0.78rem', color: '#818cf8' }}>
            تنتهي صلاحية الجلسة تلقائياً كل 15 دقيقة للأمان.
          </span>
        </p>

        {/* Expired / Error Alert */}
        {expiredReason && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#fde047',
              fontSize: '0.82rem',
              marginBottom: '18px',
              textAlign: 'right',
            }}
          >
            <Clock size={16} style={{ flexShrink: 0 }} />
            <span>{expiredReason}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginBottom: '18px',
              textAlign: 'right',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <div
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <KeyRound size={17} />
            </div>

            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="أدخل كلمة المرور..."
              style={{
                width: '100%',
                padding: '14px 44px 14px 44px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: error
                  ? '1px solid #ef4444'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                textAlign: 'right',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)';
            }}
          >
            <span>دخول وفتح المنظومة</span>
            <ArrowLeft size={17} />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.75rem',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>حماية مشفرة مع إغلاق تلقائي كل 15 دقيقة</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .shake-animation {
          animation: shake 0.45s ease-in-out;
        }
      `}</style>
    </div>
  );
};
