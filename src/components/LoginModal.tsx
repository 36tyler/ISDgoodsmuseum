import React, { useState } from 'react';
import { X, Shield, User as UserIcon, Lock, Sparkles, CheckCircle2, Crown, Heart, Key } from 'lucide-react';
import { User, MemberId, UserRole } from '../types';
import { MEMBERS } from '../data/members';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
  defaultAdminTab?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onShowToast,
  defaultAdminTab = false,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'fan' | 'admin'>(defaultAdminTab ? 'admin' : 'fan');
  const [nickname, setNickname] = useState('');
  const [biasMember, setBiasMember] = useState<MemberId>('ine');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fan Collector Login
  const handleFanLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: `${nickname.trim()}@isegye.fan`,
      nickname: nickname.trim(),
      role: 'collector',
      biasMember: biasMember,
      joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      avatar: MEMBERS[biasMember].symbol,
    };

    onLogin(newUser);
    onShowToast(`🎉 환영합니다, ${newUser.nickname}님! 이세돌 도감 컬렉터로 로그인되었습니다.`, 'success');
    onClose();
  };

  // Administrator credentials are checked only by the server.
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const result = await response.json();
      if (!response.ok || result.user?.role !== 'admin') {
        setErrorMessage(result.error || '관리자 인증에 실패했습니다.');
        return;
      }
      setAdminPassword('');
      onLogin(result.user);
      onShowToast('관리자로 로그인되었습니다.', 'success');
      onClose();
    } catch {
      setErrorMessage('인증 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Quick 1-Click Demo Accounts
  const handleQuickFanLogin = (bias: MemberId) => {
    const mem = MEMBERS[bias];
    const demoUser: User = {
      id: `demo-${bias}`,
      email: `${mem.nameEn.toLowerCase()}love@isegye.fan`,
      nickname: `${mem.name}의 ${mem.fanClub} 1호`,
      role: 'collector',
      biasMember: bias,
      joinedDate: '2023.01.01',
      avatar: mem.symbol,
    };
    onLogin(demoUser);
    onShowToast(`🎉 [${mem.name}] 최애 컬렉터 계정으로 로그인되었습니다!`, 'heart');
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              🏛️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                도감 로그인 & 계정 전환
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                이파리 팬 계정 또는 관리자 권한 로그인
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors dark:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 m-5 mb-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('fan');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'fan'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>이파리 컬렉터 로그인</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>관리자 모드 인증</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {activeTab === 'fan' ? (
            /* FAN LOGIN FORM */
            <form onSubmit={handleFanLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  닉네임 (Nickname) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-300" />
                  <input
                    type="text"
                    required
                    placeholder="예: 왁물원비둘기, 고세구팬, 핑크주폭도"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-bias-member" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  나의 최애 멤버
                </label>
                <select
                  id="login-bias-member"
                  value={biasMember}
                  onChange={(e) => setBiasMember(e.target.value as MemberId)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                >
                  {Object.values(MEMBERS).filter(m => m.id !== 'group').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id === 'all' ? '🌿 전부!!' : `${m.symbol} ${m.name} (${m.fanClub})`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                도감 컬렉터로 시작하기
              </button>

              {/* 1-click Quick presets */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  ⚡ 빠른 1초 데모 계정 체험:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFanLogin('ine')}
                    className="p-1.5 text-[11px] rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors font-medium truncate"
                  >
                    🕊️ 아이네 팬
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFanLogin('gosegu')}
                    className="p-1.5 text-[11px] rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors font-medium truncate"
                  >
                    😸 고세구 팬
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFanLogin('jururu')}
                    className="p-1.5 text-[11px] rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 transition-colors font-medium truncate"
                  >
                    🦊 주르르 팬
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">관리자 전용 인증</strong>
                  관리자로 로그인하면 굿즈 추가/수정/삭제 및 테마 커스터마이징, 백업 권한이 완전히 부여됩니다.
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  관리자 계정
                </label>
                <input
                  type="text"
                  disabled
                  value="admin@isegye.idol"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-mono dark:text-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  관리자 비밀번호 (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-300" />
                  <input
                    type="password"
                    required
                    placeholder="비밀번호 입력"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="disabled:opacity-60 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isAuthenticating ? '인증 중…' : '관리자 권한 인증하기'}</span>
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
