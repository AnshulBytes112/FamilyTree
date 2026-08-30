'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, buttonVariants } from '@/components/ui/button';
import { Check, Copy, MessageCircle, Mail, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InviteClientLayoutProps {
  inviteCode: string | null;
  members: { id: string; name: string; status: string }[];
  familyName: string;
  familyId: string;
}

export function InviteClientLayout({ inviteCode, members, familyName }: InviteClientLayoutProps) {
  const t = useTranslations('invite');
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  useEffect(() => {
    if (inviteCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInviteUrl(`${window.location.origin}/join/${inviteCode}`);
    }
  }, [inviteCode]);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareText = `Join the ${familyName} family tree!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: inviteUrl
        });
      } catch (err) {
        console.error('Failed to share natively', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Invite Link Card */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">{t('linkSection.label', { defaultMessage: 'Invite Link' })}</h2>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
            <div className="flex-1 overflow-x-auto whitespace-nowrap pl-3 text-[15px] text-slate-600 outline-none scrollbar-hide">
              {inviteUrl || t('linkSection.generating', { defaultMessage: 'Generating...' })}
            </div>
            <Button 
              onClick={handleCopy}
              className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 rounded-md px-5 h-[38px] transition-colors"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  {t('linkSection.copied', { defaultMessage: 'Copied' })}
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2 hidden sm:inline-block" />
                  {t('linkSection.copy', { defaultMessage: 'Copy Link' })}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share via Card */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">{t('shareSection.label', { defaultMessage: 'Share via' })}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + inviteUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline' }), "h-11 px-4 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200")}
            >
              <MessageCircle size={18} className="mr-2 text-emerald-600" />
              WhatsApp
            </a>
            
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline' }), "h-11 px-4 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200")}
            >
              Facebook
            </a>

            <a 
              href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(inviteUrl)}`}
              className={cn(buttonVariants({ variant: 'outline' }), "h-11 px-4 border-slate-200 hover:bg-slate-50")}
            >
              <Mail size={18} className="mr-2 text-slate-600" />
              Email
            </a>

            <Button variant="outline" className="h-11 px-4 border-slate-200 hover:bg-slate-50" onClick={handleNativeShare}>
              <MoreHorizontal size={18} className="mr-2 text-slate-600" />
              More
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-[1.2]">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 h-full">
          <h2 className="text-base font-bold text-slate-900 mb-6">{t('membersSection.label', { defaultMessage: 'Invited Members' })}</h2>
          
          {members.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">{t('noMembersJoined', { defaultMessage: 'No members have joined yet.' })}</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-900 text-[15px]">{member.name}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                    {t('membersSection.joined', { defaultMessage: 'Joined' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
