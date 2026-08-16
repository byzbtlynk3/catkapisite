import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AUTH_PHONES = [
  '05441373321',
  '05352194789'
];

export default function AdminSecurityModal({ isOpen, onClose }: Props) {
  const [selectedPhone, setSelectedPhone] = useState<string>(AUTH_PHONES[0]);
  const [status, setStatus] = useState<string>('');
  const [code, setCode] = useState('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!isOpen) return null;

  const masked = (ph: string) => `${ph.slice(0,4)} *** ** ${ph.slice(-2)}`;

  const sendOtp = async () => {
    setStatus('Gönderiliyor...');
    try {
      const res = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ phone: selectedPhone })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Gönderilemedi');
      setStatus('Doğrulama kodu gönderildi.');
    } catch (e:any) {
      setStatus(e.message || 'Hata oluştu');
    }
  };

  const verifyOtp = async () => {
    setStatus('Doğrulanıyor...');
    try {
      const res = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ phone: selectedPhone, code })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Doğrulama başarısız');
      setOtpToken(j.otpToken);
      setStatus('Doğrulandı. Artık yeni şifre belirleyebilirsiniz.');
    } catch (e:any) {
      setStatus(e.message || 'Hata');
    }
  };

  const changePassword = async () => {
    if (!otpToken) {
      setStatus('Önce kodu doğrulayın.');
      return;
    }
    if (!newPass || newPass !== confirmPass) {
      setStatus('Yeni şifreler eşleşmiyor.');
      return;
    }
    setStatus('Kaydediliyor...');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: 'admin', newPassword: newPass, otpToken })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Kaydetme başarısız');
      setStatus('Şifre başarıyla değiştirildi.');
    } catch (e:any) {
      setStatus(e.message || 'Hata');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg bg-[#141414] border border-stone-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Güvenlik / Şifre Değiştir</h3>
          <button onClick={onClose} className="text-stone-400">Kapat</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-400">Doğrulama Kodu Gönderilecek Yetkili Numara</label>
            <div className="mt-2 space-y-2">
              {AUTH_PHONES.map(ph => (
                <label key={ph} className="flex items-center gap-2">
                  <input type="radio" name="phone" checked={selectedPhone===ph} onChange={() => setSelectedPhone(ph)} />
                  <span className="text-sm">{masked(ph)}</span>
                </label>
              ))}
            </div>
            <button onClick={sendOtp} className="mt-3 px-3 py-2 bg-amber-500 rounded">Kod Gönder</button>
          </div>

          <div>
            <label className="text-xs text-stone-400">Gelen 6 haneli kod</label>
            <input value={code} onChange={(e)=>setCode(e.target.value)} className="w-full mt-2 p-2 bg-[#111] rounded" />
            <div className="mt-2 flex gap-2">
              <button onClick={verifyOtp} className="px-3 py-2 bg-emerald-600 rounded">Doğrula</button>
              <button onClick={sendOtp} className="px-3 py-2 bg-stone-800 rounded">Tekrar Gönder</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-400">Yeni Şifre</label>
            <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} className="w-full mt-2 p-2 bg-[#111] rounded" />
            <label className="text-xs text-stone-400 mt-2">Yeni Şifre (Tekrar)</label>
            <input type="password" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} className="w-full mt-2 p-2 bg-[#111] rounded" />
            <div className="mt-3 flex gap-2">
              <button onClick={changePassword} className="px-3 py-2 bg-amber-500 rounded">Şifreyi Değiştir</button>
              <button onClick={onClose} className="px-3 py-2 bg-stone-800 rounded">İptal</button>
            </div>
          </div>

          {status && <div className="mt-2 text-sm text-stone-200">{status}</div>}
        </div>
      </div>
    </div>
  );
}
