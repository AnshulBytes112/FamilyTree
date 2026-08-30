'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Mail, MoreHorizontal, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function InviteShareOptions({ inviteCode, familyId }: { inviteCode: string | null, familyId: string }) {
  const t = useTranslations('invite');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = inviteCode && origin ? `${origin}/join/${inviteCode}` : '';

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!inviteUrl) return;
    const text = encodeURIComponent(`Join our family tree on Our Family! Click here: ${inviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Mockup data for invited members
  const invitedMembers = [
    { name: "Rohit Sharma", status: t('membersSection.joined'), color: "text-emerald-700 bg-emerald-50 border-emerald-200", img: "R" },
    { name: "Priya Sharma", status: t('membersSection.pending'), color: "text-amber-700 bg-amber-50 border-amber-200", img: "P" },
    { name: "Karan Verma", status: t('membersSection.pending'), color: "text-amber-700 bg-amber-50 border-amber-200", img: "K" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      
      {/* Left Side: Share Options */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">{t('linkSection.label')}</label>
          <div className="flex w-full items-center gap-2">
            <Input 
              type="text" 
              readOnly 
              value={inviteUrl || t('linkSection.generating')} 
              className="h-10 bg-slate-50/50"
            />
            <Button 
              onClick={handleCopy} 
              disabled={!inviteUrl}
              className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
            >
              {copied ? t('linkSection.copied') : t('linkSection.copy')}
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">{t('shareSection.label')}</label>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="h-9 px-3 border-slate-200 hover:bg-slate-50 text-slate-600">
              <MessageCircle size={14} className="mr-2 text-[#25D366]" /> {t('shareSection.whatsapp')}
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3 border-slate-200 hover:bg-slate-50 text-slate-600">
              <Facebook size={14} className="mr-2 text-[#1877F2]" /> {t('shareSection.facebook')}
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3 border-slate-200 hover:bg-slate-50 text-slate-600">
              <Mail size={14} className="mr-2 text-slate-400" /> {t('shareSection.email')}
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3 border-slate-200 hover:bg-slate-50 text-slate-600">
              <MoreHorizontal size={14} className="mr-2 text-slate-400" /> {t('shareSection.more')}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side: Invited Members */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">{t('membersSection.label')}</label>
        <ul className="space-y-4">
          {invitedMembers.map((member, i) => (
            <li key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                  {member.img}
                </div>
                <span className="font-semibold text-sm text-slate-900">{member.name}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${member.color}`}>
                {member.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
